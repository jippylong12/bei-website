import { motion } from 'motion/react';
import Hero from '../../components/Hero/Hero';
import AnimatedSection from '../../components/AnimatedSection/AnimatedSection';
import TeamMember from '../../components/TeamMember/TeamMember';
import { team } from '../../data/team';
import styles from './About.module.css';

export default function About() {
  const base = import.meta.env.BASE_URL;

  return (
    <>
      <Hero
        title="About Bitcoin Education Institute"
        subtitle="A nonprofit institution supporting Bitcoin teaching, research, and academic exchange."
      />

      <AnimatedSection
        image={`${base}images/about-1.jpg`}
        imageAlt="Student at the Cypherpunks exhibit"
      >
        <p>
          The Bitcoin Education Institute works to ensure Bitcoin is studied,
          taught, and understood at the highest levels of academic inquiry —
          shaping how future leaders, scholars, and builders engage with this
          interdisciplinary field.
        </p>
      </AnimatedSection>

      <AnimatedSection
        title="How BEI Works"
        image={`${base}images/about-2.jpg`}
        imageAlt="Bitcoin conference lecture on Bitcoin Script"
        reverse
      >
        <ul>
          <li>Supports academic Bitcoin instruction</li>
          <li>Funds and coordinates research</li>
          <li>Hosts conferences and convenings</li>
        </ul>
        <p>
          BEI is a Texas nonprofit corporation and a 501(c)(3) tax-exempt
          organization.
        </p>
      </AnimatedSection>

      <section className={styles.teamSection}>
        <div className="container">
          <motion.h2
            className={styles.teamTitle}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Our Team
          </motion.h2>
          <div className={styles.teamGrid}>
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <TeamMember {...member} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
