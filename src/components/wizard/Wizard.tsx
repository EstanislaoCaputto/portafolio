import { useState } from 'react';
import type { Portfolio } from '../../data/types';
import { useI18n } from '../../i18n/I18nProvider';
import { ExperienceStep } from './steps/ExperienceStep';
import { IdentityStep } from './steps/IdentityStep';
import { ProjectsStep } from './steps/ProjectsStep';
import { ReviewStep } from './steps/ReviewStep';
import { SkillsStep } from './steps/SkillsStep';

const STEPS = [
  { id: 'identity', key: 'wizard.step.identity' },
  { id: 'projects', key: 'wizard.step.projects' },
  { id: 'skills', key: 'wizard.step.skills' },
  { id: 'experience', key: 'wizard.step.experience' },
  { id: 'review', key: 'wizard.step.review' },
] as const;

interface WizardProps {
  portfolio: Portfolio;
  onChange: (portfolio: Portfolio) => void;
  onReset: () => void;
}

export function Wizard({ portfolio, onChange, onReset }: WizardProps) {
  const { t } = useI18n();
  const [stepIndex, setStepIndex] = useState(0);

  const step = STEPS[stepIndex] ?? STEPS[0];
  const isLast = stepIndex === STEPS.length - 1;

  return (
    <section className="section wizard" aria-labelledby="wizard-title">
      <div className="container">
        <header className="wizard__head">
          <h1 id="wizard-title">{t('wizard.title')}</h1>
          <p className="muted">{t('wizard.lead')}</p>
          <p className="wizard__autosave">{t('wizard.autosave')}</p>
        </header>

        <ol className="stepper">
          {STEPS.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                className={index === stepIndex ? 'stepper__item is-active' : 'stepper__item'}
                aria-current={index === stepIndex ? 'step' : undefined}
                onClick={() => setStepIndex(index)}
              >
                <span className="stepper__index">{index + 1}</span>
                {t(item.key)}
              </button>
            </li>
          ))}
        </ol>

        <form
          className="wizard__form"
          onSubmit={(event) => {
            event.preventDefault();
            setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
          }}
        >
          {step.id === 'identity' ? (
            <IdentityStep portfolio={portfolio} onChange={onChange} />
          ) : null}

          {step.id === 'projects' ? (
            <ProjectsStep
              projects={portfolio.projects}
              onChange={(projects) => onChange({ ...portfolio, projects })}
            />
          ) : null}

          {step.id === 'skills' ? (
            <SkillsStep
              skills={portfolio.skills}
              onChange={(skills) => onChange({ ...portfolio, skills })}
            />
          ) : null}

          {step.id === 'experience' ? (
            <ExperienceStep
              experience={portfolio.experience}
              onChange={(experience) => onChange({ ...portfolio, experience })}
            />
          ) : null}

          {step.id === 'review' ? (
            <ReviewStep portfolio={portfolio} onChange={onChange} onReset={onReset} />
          ) : null}

          <div className="wizard__actions">
            <button
              type="button"
              className="button"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((index) => Math.max(index - 1, 0))}
            >
              {t('wizard.back')}
            </button>

            {isLast ? (
              <a className="button button--primary" href="#/">
                {t('wizard.finish')}
              </a>
            ) : (
              <button type="submit" className="button button--primary">
                {t('wizard.next')}
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
