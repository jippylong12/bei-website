import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE } from '../../config/api';
import { clearMessages, loadMessages, saveMessages } from './storage';

// How many prior messages accompany each turn (the API caps at 12).
const HISTORY_LIMIT = 12;

let nextId = 1;
const makeId = () => `m${Date.now().toString(36)}-${nextId++}`;

/**
 * Reads one POST /api/chat response body as Server-Sent Events.
 * EventSource can't POST, so this is a small hand-rolled parser:
 * blocks are separated by \n\n; each block has `event:` and `data:` lines.
 */
async function readSse(body, onEvent) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep;
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      let event = 'message';
      const dataLines = [];
      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
      }
      if (!dataLines.length) continue;
      try {
        onEvent(event, JSON.parse(dataLines.join('\n')));
      } catch {
        // malformed frame — skip rather than kill the stream
      }
    }
  }
}

const FRIENDLY_NETWORK_ERROR =
  'The research chat could not be reached — it may be offline. Please try again later.';

export default function useChatStream() {
  const [messages, setMessages] = useState(loadMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!isStreaming) saveMessages(messages);
  }, [messages, isStreaming]);

  // abort an in-flight stream if the user navigates away from the page
  useEffect(() => () => abortRef.current?.abort(), []);

  const patchMessage = useCallback((id, patch) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...(typeof patch === 'function' ? patch(m) : patch) } : m))
    );
  }, []);

  const send = useCallback(
    async (text) => {
      const question = text.trim();
      if (!question || isStreaming) return;

      const history = messages
        .filter((m) => m.content)
        .slice(-HISTORY_LIMIT)
        .map((m) => ({ role: m.role, content: m.content }));

      const userMsg = { id: makeId(), role: 'user', content: question, status: 'done' };
      const assistantId = makeId();
      const assistantMsg = {
        id: assistantId,
        role: 'assistant',
        content: '',
        status: 'streaming',
        statusText: 'Connecting…',
        sources: [],
        citationsUsed: [],
        confidence: null,
        refused: false,
        warnings: [],
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`${API_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: question, history }),
          signal: controller.signal,
        });

        if (!res.ok) {
          let msg = FRIENDLY_NETWORK_ERROR;
          try {
            const err = await res.json();
            if (err?.message) msg = err.message;
          } catch {
            // non-JSON error body — keep the generic message
          }
          patchMessage(assistantId, { status: 'error', statusText: null, errorMessage: msg });
          return;
        }

        await readSse(res.body, (event, data) => {
          if (event === 'status') {
            patchMessage(assistantId, { statusText: data.message });
          } else if (event === 'sources') {
            patchMessage(assistantId, { sources: data.sources || [] });
          } else if (event === 'delta') {
            patchMessage(assistantId, (m) => ({
              content: m.content + (data.text || ''),
              statusText: null,
            }));
          } else if (event === 'followups') {
            patchMessage(assistantId, { followups: data.questions || [] });
          } else if (event === 'done') {
            patchMessage(assistantId, {
              status: 'done',
              statusText: null,
              turnId: data.turn_id || null,
              citationsUsed: data.citations_used || [],
              confidence: data.confidence,
              refused: !!data.refused,
              warnings: data.warnings || [],
            });
          } else if (event === 'error') {
            patchMessage(assistantId, {
              status: 'error',
              statusText: null,
              errorMessage: data.message || FRIENDLY_NETWORK_ERROR,
            });
          }
        });

        // stream ended without a done/error frame (connection dropped)
        patchMessage(assistantId, (m) =>
          m.status === 'streaming'
            ? { status: m.content ? 'stopped' : 'error', statusText: null, errorMessage: m.content ? undefined : FRIENDLY_NETWORK_ERROR }
            : {}
        );
      } catch (e) {
        if (e.name === 'AbortError') {
          patchMessage(assistantId, { status: 'stopped', statusText: null });
        } else {
          patchMessage(assistantId, (m) =>
            m.status === 'streaming'
              ? { status: 'error', statusText: null, errorMessage: FRIENDLY_NETWORK_ERROR }
              : {}
          );
        }
      } finally {
        abortRef.current = null;
        setIsStreaming(false);
      }
    },
    [messages, isStreaming, patchMessage]
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  // Record a 👍/👎 on an answer. Optimistically marks the message; the POST is
  // fire-and-forget (a failed feedback write must never disrupt the chat).
  const sendFeedback = useCallback(
    (id, rating) => {
      let turnId = null;
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          turnId = m.turnId;
          return { ...m, feedback: rating };
        })
      );
      if (!turnId) return;
      fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turn_id: turnId, rating }),
      }).catch(() => {});
    },
    []
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    clearMessages();
    setMessages([]);
  }, []);

  return { messages, isStreaming, send, stop, reset, sendFeedback };
}
