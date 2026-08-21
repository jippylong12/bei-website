import { motion } from 'motion/react';
import Hero from '../../components/Hero/Hero';
import styles from './Conference.module.css';

const schedule = [
  {
    time: '8:00 AM – 8:45 AM',
    title: 'Breakfast & Opening Remarks',
  },
  {
    time: '8:45 AM – 9:45 AM',
    title: 'Education Talks: Session I',
    speakers:
      'Stan Reeves (Auburn) • Sarah Kreps (Cornell) • Josh Hendrickson (UMiss) • Troy Cross (Reed College) • Michael Jones (Cincinnati)',
  },
  {
    time: '10:00 AM – 11:00 AM',
    title: 'Research Talks: Session I',
    speakers:
      'Julie Moulard (LTU) • Christopher Daniels (Claremont) • Danilo Mascia (Leeds) • Ahmet Kurt (TAMU) • Enchuan Shao (Saskatchewan)',
  },
  {
    time: '11:15 AM – 12:15 PM',
    title: 'Education Talks: Session II',
    speakers:
      'Edil Medeiros (Brasilia) • Jens Ducree (Dublin) • Brian Buckles (UTA) • Dongning Guo (Northwestern) • Christian Kuemmerle (UCF)',
  },
  {
    time: '12:15 PM – 1:30 PM',
    title: 'Lunch & Fireside Chat',
    speakers: 'Phong Le (CEO of Strategy) • Charles Wang (HBS)',
  },
  {
    time: '1:30 PM – 2:30 PM',
    title: 'Research Talks: Session II',
    speakers:
      'Craig Warmke (NIU) • Paul Nylen (UW) • John Olson (UW) • Abdoulaye Ndiaye (NYU) • Yosef Bonaparte (UCD) • Alfred Lehar (Calgary)',
  },
  {
    time: '3:00 PM – 4:30 PM',
    title: 'Education Talks: Session III',
    speakers:
      'Matt Huberty (SMU) • Marc Pilkington • Peter Schmidt (RIT) • Valerio Poti (Dublin) • Ling Ren (Illinois Urbana) • John Dorrell (UT) • Kartik Prasanna (UMich)',
  },
];

export default function Conference() {
  const base = import.meta.env.BASE_URL;

  return (
    <>
      <Hero
        title="Annual Bitcoin Education Institute Conference 2026"
        subtitle="A formal gathering for Bitcoin educators, researchers, and interdisciplinary academic work, held July 31, 2026 at George Washington University's Elliott School of International Affairs in Washington, DC."
      >
        <motion.a
          href="#agenda"
          className={styles.registerButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          View the 2026 Agenda
        </motion.a>
      </Hero>

      <section className={styles.photoSection}>
        <div className="container">
          <motion.figure
            className={styles.photoFigure}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <img
              src={`${base}images/conference-2026.jpg`}
              alt="Group photo of attendees at the 2026 BEI Annual Conference in Washington, D.C."
              className={styles.photo}
            />
            <figcaption className={styles.photoCaption}>
              The 2026 BEI Annual Conference &mdash; Elliott School of
              International Affairs, George Washington University, July 31, 2026
            </figcaption>
          </motion.figure>
        </div>
      </section>

      <section className={styles.agendaSection} id="agenda">
        <div className="container">
          <motion.div
            className={styles.agendaHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h2 className={styles.agendaTitle}>2026 Program Agenda</h2>
              <p className={styles.agendaVenue}>
                Elliott School of International Affairs, George Washington
                University &mdash; July 31, 2026
              </p>
            </div>
            <motion.a
              href={`${base}docs/BEI-2026-Conference-Agenda.docx`}
              download
              className={styles.downloadButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Download the Full Agenda
            </motion.a>
          </motion.div>

          <motion.div
            className={styles.schedule}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {schedule.map((item) => (
              <div key={item.time} className={styles.scheduleRow}>
                <div className={styles.scheduleTime}>{item.time}</div>
                <div>
                  <div className={styles.scheduleTitle}>{item.title}</div>
                  {item.speakers && (
                    <div className={styles.scheduleSpeakers}>{item.speakers}</div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className={styles.infoSection}>
        <div className="container">
          <div className={styles.grid}>
            <motion.div
              className={styles.card}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className={styles.cardTitle}>Who Should Attend</h2>
              <p>
                Our conference brings together educators, researchers, and
                practitioners from across higher education to advance the
                rigorous, interdisciplinary study of Bitcoin.
              </p>
              <p>
                Faculty, graduate students, researchers, and Bitcoin-interested
                individuals across disciplines including economics, finance,
                computer science, law, energy, or policy.
              </p>
            </motion.div>
            <motion.div
              className={styles.card}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className={styles.cardTitle}>What to Expect</h2>
              <p>
                Keynote presentations from leading Bitcoin researchers and
                educators.
              </p>
              <p>
                Research presentations showcasing rigorous approaches to the
                academic study of Bitcoin.
              </p>
              <p>
                Networking with colleagues who are developing Bitcoin curricula
                nationwide.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
