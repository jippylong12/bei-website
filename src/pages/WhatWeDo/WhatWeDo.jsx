import { Link } from 'react-router-dom';
import Hero from '../../components/Hero/Hero';
import Section from '../../components/Section/Section';
import styles from './WhatWeDo.module.css';

export default function WhatWeDo() {
  const base = import.meta.env.BASE_URL;

  return (
    <>
      <Hero title="What We Do" />

      <Section
        title="Integrate Bitcoin into Curriculum"
        image={`${base}images/whatwedo-1.jpg`}
        imageAlt="Bitcoin conference presentation"
      >
        <p>
          We support faculty across disciplines with ready-to-use materials that
          make it easy to bring Bitcoin into existing courses.
        </p>
        <ul>
          <li>Lecture materials and slides</li>
          <li>Case studies</li>
          <li>Homework exercises and exam questions</li>
          <li>Online lectures and videos</li>
        </ul>
      </Section>

      <Section
        title="Research & Conferences"
        image={`${base}images/whatwedo-2.jpg`}
        imageAlt="Academic conference"
        reverse
      >
        <p>
          We advance the academic study of Bitcoin through funded research and
          annual gatherings that bring scholars together.
        </p>
        <ul>
          <li>Research grants</li>
          <li>Annual academic conference</li>
          <li>Call for papers</li>
        </ul>
      </Section>

      <Section title="Student Engagement">
        <p>
          We provide students with the resources and connections they need to
          deepen their understanding of Bitcoin.
        </p>
        <ul>
          <li>Speaker access</li>
          <li>Reading lists</li>
          <li>Curriculum alignment</li>
        </ul>
      </Section>

      <section className={styles.ctaSection}>
        <div className="container">
          <h2 className={styles.ctaTitle}>Get in Touch</h2>
          <p className={styles.ctaText}>
            Interested in bringing Bitcoin into your classroom or institution?
          </p>
          <Link to="/contact" className={styles.ctaButton}>
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}
