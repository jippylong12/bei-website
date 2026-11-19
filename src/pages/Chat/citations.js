// Citation markers in an answer become markdown links (#src-N), which the
// answer's renderer (AssistantMessage) draws as numbered chips.
//
// The API's prompt asks the model to cite as "[Source N]" and lets it group
// citations; older answers use a bare "[N]". Each of these becomes one link per
// number:
//
//   [3]   [Source 3]   [Source 1, Source 2]   [Sources 2, 3]   [1, 2]   [1; 2]
//
// Text that is already a markdown link ("[1](https://...)") is left alone, and
// so is any bracket that is not a citation ("[note]"). Whether a number really
// names a source (and so gets a chip) is decided when it is drawn, against the
// answer's own source list: a bracketed year such as [2021] stays plain text.
const CITE_GROUP = /\[\s*(?:Sources?\s+)?\d+(?:\s*[,;]\s*(?:Sources?\s+)?\d+)*\s*\](?!\()/gi;

export function toCitationLinks(text) {
  return text.replace(CITE_GROUP, (group) =>
    (group.match(/\d+/g) || []).map((n) => `[${n}](#src-${n})`).join(''),
  );
}
