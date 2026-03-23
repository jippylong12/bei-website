import styles from './Hero.module.css';

export default function Hero({ title, subtitle, backgroundImage, children }) {
  return (
    <section
      className={styles.hero}
      style={{
        backgroundImage: backgroundImage
          ? `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url(${backgroundImage})`
          : undefined,
      }}
    >
      <div className={`container ${styles.content}`}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children && <div className={styles.cta}>{children}</div>}
      </div>
    </section>
  );
}
