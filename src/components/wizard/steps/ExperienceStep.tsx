import type { ExperienceItem } from '../../../data/types';
import { useI18n } from '../../../i18n/I18nProvider';
import { uniqueId } from '../../../lib/slug';
import { LocalizedField, SelectField, TextField } from '../fields';

interface ExperienceStepProps {
  experience: ExperienceItem[];
  onChange: (experience: ExperienceItem[]) => void;
}

export function ExperienceStep({ experience, onChange }: ExperienceStepProps) {
  const { t } = useI18n();

  const update = (id: string, patch: Partial<ExperienceItem>) => {
    onChange(experience.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addItem = () => {
    const id = uniqueId('experiencia', new Set(experience.map((item) => item.id)));
    onChange([
      ...experience,
      { id, kind: 'work', role: {}, organization: '', period: '', summary: {} },
    ]);
  };

  return (
    <div className="stack">
      {experience.length === 0 ? <p className="muted">{t('experience.form.empty')}</p> : null}

      {experience.map((item) => (
        <article className="editor-card" key={item.id}>
          <div className="editor-card__head">
            <h3>{item.role.es || t('experience.form.role')}</h3>
            <button
              type="button"
              className="button button--ghost button--small"
              onClick={() => onChange(experience.filter((entry) => entry.id !== item.id))}
            >
              {t('experience.form.remove')}
            </button>
          </div>

          <SelectField
            id={`experience-${item.id}-kind`}
            label={t('experience.form.kind')}
            value={item.kind}
            options={[
              { value: 'work', label: t('experience.work') },
              { value: 'education', label: t('experience.education') },
            ]}
            onChange={(value) =>
              update(item.id, { kind: value === 'education' ? 'education' : 'work' })
            }
          />

          <LocalizedField
            id={`experience-${item.id}-role`}
            label={t('experience.form.role')}
            value={item.role}
            onChange={(value) => update(item.id, { role: value })}
          />

          <div className="form-grid">
            <TextField
              id={`experience-${item.id}-organization`}
              label={t('experience.form.organization')}
              value={item.organization}
              onChange={(value) => update(item.id, { organization: value })}
            />
            <TextField
              id={`experience-${item.id}-period`}
              label={t('experience.form.period')}
              hint={t('experience.form.periodHint')}
              value={item.period}
              onChange={(value) => update(item.id, { period: value })}
            />
          </div>

          <LocalizedField
            id={`experience-${item.id}-summary`}
            label={t('experience.form.summary')}
            value={item.summary}
            multiline
            onChange={(value) => update(item.id, { summary: value })}
          />
        </article>
      ))}

      <button type="button" className="button" onClick={addItem}>
        + {t('experience.form.add')}
      </button>
    </div>
  );
}
