import { PAPER_COUNT } from './prototypeData';
import styles from './Prototype.module.css';

const STEPS = [
  {
    title: 'Search the papers',
    text: `Your question is matched against passages from the ${PAPER_COUNT} papers, both by meaning and by exact wording, so a specific figure or term is not missed.`,
  },
  {
    title: 'Rerank the passages',
    text: 'A second model reads the strongest candidates against the question and keeps the passages that bear on it.',
  },
  {
    title: 'Answer on our own GPU',
    text: 'An open-weight language model, running on our own GPU, writes the answer from those passages alone.',
  },
  {
    title: 'Cite the papers',
    text: 'Each claim carries a numbered citation to the paper it comes from. The papers are linked at their publishers, not hosted here.',
  },
];

export default function HowItWorks() {
  return (
    <section className={styles.section} aria-labelledby="prototype-how">
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle} id="prototype-how">
          How it works
        </h2>
      </div>
      <ol className={styles.steps}>
        {STEPS.map((step, i) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepText}>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className={styles.sectionNote}>
        Quick mode answers from the closest passages; Deep mode searches more widely and takes longer. When
        the papers do not cover a question, the answer says so rather than guessing.
      </p>
    </section>
  );
}
