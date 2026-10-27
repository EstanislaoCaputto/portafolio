import type { Portfolio } from '../data/types';
import { useI18n } from '../i18n/I18nProvider';
import { safeEmail, safeUrl } from '../lib/url';
import { Contact } from './Contact';
import { Experience } from './Experience';
import { Hero } from './Hero';
import { ProjectGrid } from './ProjectGrid';
import { SectionHeader } from './SectionHeader';
import { Skills } from './Skills';

export function HomePage({ portfolio }: { portfolio: Portfolio }) {
  const { t } = useI18n();
  const { profile, projects, skills, experience } = portfolio;

  const hasContact = Boolean(
    safeEmail(profile.email) ||
    safeUrl(profile.links.github) ||
    safeUrl(profile.links.linkedin) ||
    safeUrl(profile.links.website),
  );

  return (
    <>
      <Hero profile={profile} showContactAction={hasContact} />

      <section id="proyectos" className="section" aria-labelledby="proyectos-title">
        <div className="container">
          <SectionHeader
            id="proyectos-title"
            title={t('projects.title')}
            lead={t('projects.lead')}
          />
          <ProjectGrid projects={projects} />
        </div>
      </section>

      {skills.length > 0 ? (
        <section id="habilidades" className="section" aria-labelledby="habilidades-title">
          <div className="container">
            <SectionHeader
              id="habilidades-title"
              title={t('skills.title')}
              lead={t('skills.lead')}
            />
            <Skills skills={skills} />
          </div>
        </section>
      ) : null}

      {experience.length > 0 ? (
        <section id="experiencia" className="section" aria-labelledby="experiencia-title">
          <div className="container">
            <SectionHeader
              id="experiencia-title"
              title={t('experience.title')}
              lead={t('experience.lead')}
            />
            <Experience items={experience} />
          </div>
        </section>
      ) : null}

      {hasContact ? (
        <section id="contacto" className="section" aria-labelledby="contacto-title">
          <div className="container">
            <SectionHeader
              id="contacto-title"
              title={t('contact.title')}
              lead={t('contact.lead')}
            />
            <Contact profile={profile} />
          </div>
        </section>
      ) : null}
    </>
  );
}
