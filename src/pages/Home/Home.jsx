import { Link } from 'react-router-dom';
import Hero from '../../components/Hero/Hero';
import FocusCard from '../../components/FocusCard/FocusCard';
import Section from '../../components/Section/Section';
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
        backgroundImage={`${base}images/hero.png`}
      >
        <Link to="/what-we-do" className={styles.ctaButton}>
          Learn More
        </Link>
      </Hero>

      <section className={styles.focusSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>What BEI Does</h2>
          <div className={styles.grid}>
            {focusAreas.map((area) => (
              <FocusCard key={area.title} {...area} />
            ))}
          </div>
        </div>
      </section>

      <Section
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
        <Link to="/what-we-do" className={styles.ctaButton}>
          View Course Details
        </Link>
      </Section>

      <section className={styles.whySection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Why Bitcoin in Education?</h2>
          <p className={styles.whyText}>
            Bitcoin has reshaped finance, energy, and computing — yet remains
            underrepresented in education. BEI exists to close that gap, ensuring
            future leaders and scholars have the tools to engage with this
            transformative technology.
          </p>
        </div>
      </section>
    </>
  );
}
