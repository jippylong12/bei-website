import styles from './TeamMember.module.css';

export default function TeamMember({ name, role, image }) {
  const base = import.meta.env.BASE_URL;

  return (
    <div className={styles.card}>
      {image ? (
        <img
          src={`${base}images/${image}`}
          alt={name}
          className={styles.photo}
        />
      ) : (
        <div className={styles.avatar}>
          {name.split(' ').map(n => n[0]).join('')}
        </div>
      )}
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.role}>{role}</p>
    </div>
  );
}
