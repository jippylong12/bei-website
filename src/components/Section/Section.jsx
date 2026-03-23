import styles from './Section.module.css';

export default function Section({ title, children, image, imageAlt, reverse, id }) {
  return (
    <section className={styles.section} id={id}>
      <div className={`container ${styles.inner} ${reverse ? styles.reverse : ''}`}>
        {image && (
          <div className={styles.imageWrap}>
            <img src={image} alt={imageAlt || ''} className={styles.image} />
          </div>
        )}
        <div className={styles.content}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {children}
        </div>
      </div>
    </section>
  );
}
