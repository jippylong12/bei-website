import Hero from '../../components/Hero/Hero';
import Section from '../../components/Section/Section';
import TeamMember from '../../components/TeamMember/TeamMember';
import { team } from '../../data/team';
import styles from './About.module.css';

export default function About() {
  const base = import.meta.env.BASE_URL;

  return (
    <>
      <Hero title="About Bitcoin Education Institute" />

      <Section
        image={`${base}images/about-1.jpg`}
        imageAlt="BEI event"
      >
        <p>
          The Bitcoin Education Institute works to ensure Bitcoin is studied,
          taught, and understood at the highest levels of academic inquiry —
          shaping how future leaders, scholars, and builders engage with this
          transformative technology.
        </p>
      </Section>

      <Section
        title="How BEI Works"
        image={`${base}images/about-2.jpg`}
        imageAlt="Bitcoin conference"
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
      </Section>

      <section className={styles.teamSection}>
        <div className="container">
          <h2 className={styles.teamTitle}>Our Team</h2>
          <div className={styles.teamGrid}>
            {team.map((member) => (
              <TeamMember key={member.name} {...member} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
