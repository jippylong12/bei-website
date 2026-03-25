import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Hero from '../../components/Hero/Hero';
import AnimatedFocusCard from '../../components/AnimatedFocusCard/AnimatedFocusCard';
import AnimatedSection from '../../components/AnimatedSection/AnimatedSection';
import styles from './Home.module.css';

const focusAreas = [
  {
    title: 'Course Development',
    description:
      'We develop Bitcoin-focused course materials, case studies, and curricula that integrate seamlessly into existing academic programs.',
  },
  {
    title: 'Faculty Support',
    description:
      'We provide educators with lecture materials, slides, homework exercises, exam questions, and online resources to teach Bitcoin effectively.',
  },
  {
    title: 'Student Engagement',
    description:
      'We connect students with speaker access, reading lists, and curriculum-aligned resources to deepen their understanding of Bitcoin.',
  },
  {
    title: 'Research & Conferences',
    description:
      'We fund research grants, host an annual academic conference, and issue calls for papers to advance Bitcoin scholarship.',
  },
];

export default function Home() {
  const base = import.meta.env.BASE_URL;

  return (
    <>
      <Hero
        title="Bitcoin Education Institute"
        subtitle="Advancing the Teaching and Research of Bitcoin"
        backgroundImage={`${base}images/event.jpg`}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link to="/what-we-do" className={styles.ctaButton}>
            Learn More
          </Link>
        </motion.div>
      </Hero>

      <section className={styles.focusSection}>
        <div className="container">
          <motion.h2
            className={styles.sectionTitle}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            What BEI Does
          </motion.h2>
          <div className={styles.grid}>
            {focusAreas.map((area, i) => (
              <AnimatedFocusCard key={area.title} {...area} index={i} />
            ))}
          </div>
        </div>
      </section>

      <AnimatedSection
        title="Curriculum Integration"
        image={`${base}images/course.jpg`}
        imageAlt="Bitcoin education classroom"
      >
        <p>
          Bitcoin is inherently interdisciplinary — spanning computing, economics,
          finance, law, energy, and public policy. Yet most academic institutions
          lack dedicated Bitcoin coursework.
        </p>
        <p>
          Our goal is to help faculty integrate Bitcoin into courses they are
          already teaching, making it accessible across departments and
          disciplines.
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          <Link to="/what-we-do" className={styles.ctaButton}>
            View Course Details
          </Link>
        </motion.div>
      </AnimatedSection>

      <section className={styles.whySection}>
        <div className="container">
          <motion.h2
            className={styles.sectionTitle}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Why Bitcoin in Education?
          </motion.h2>
          <motion.p
            className={styles.whyText}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            Bitcoin has reshaped finance, energy, and computing — yet remains
            underrepresented in education. BEI exists to close that gap, ensuring
            future leaders and scholars have the tools to engage with this
            transformative technology.
          </motion.p>
        </div>
      </section>
    </>
  );
}
