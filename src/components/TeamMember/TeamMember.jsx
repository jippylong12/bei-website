import styles from './TeamMember.module.css';

export default function TeamMember({ name, role }) {
  return (
    <div className={styles.card}>
      <div className={styles.avatar}>
        {name.split(' ').map(n => n[0]).join('')}
      </div>
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.role}>{role}</p>
    </div>
  );
}
