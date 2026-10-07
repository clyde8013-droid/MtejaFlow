import styles from './SuggestedPrompts.module.css';

const PROMPTS = [
  'How is my business doing?',
  'Which customers owe me money?',
  'Which quotations have not been answered?',
  'Who should I follow up with today?',
  'How much revenue did I make this month?',
];

export default function SuggestedPrompts({ onSelect }) {
  return (
    <div className={styles.wrap}>
      {PROMPTS.map((prompt) => (
        <button key={prompt} className={styles.chip} onClick={() => onSelect(prompt)}>
          {prompt}
        </button>
      ))}
    </div>
  );
}
