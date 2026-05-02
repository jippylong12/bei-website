import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Hero from '../../components/Hero/Hero';
import AnimatedSection from '../../components/AnimatedSection/AnimatedSection';
import styles from './WhatWeDo.module.css';

export default function WhatWeDo() {
  const base = import.meta.env.BASE_URL;

  return (
    <>
      <Hero title="What We Do" />

      <AnimatedSection
        title="Integrate Bitcoin into Curriculum"
        image={`${base}images/whatwedo-curriculum-dinner.jpg`}
        imageAlt="Bitcoin educators gathered for dinner"
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
      </AnimatedSection>

      <AnimatedSection
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
      </AnimatedSection>

      <AnimatedSection title="Student Engagement">
        <p>
          We provide students with the resources and connections they need to
          deepen their understanding of Bitcoin.
        </p>
        <ul>
          <li>Speaker access</li>
          <li>Reading lists</li>
          <li>Curriculum alignment</li>
        </ul>
      </AnimatedSection>

      <section className={styles.ctaSection}>
        <div className="container">
          <motion.h2
            className={styles.ctaTitle}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Get in Touch
          </motion.h2>
          <motion.p
            className={styles.ctaText}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Interested in bringing Bitcoin into your classroom or institution?
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link to="/contact" className={styles.ctaButton}>
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
