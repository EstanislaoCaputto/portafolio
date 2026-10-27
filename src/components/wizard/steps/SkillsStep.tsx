import type { SkillGroup } from '../../../data/types';
import { useI18n } from '../../../i18n/I18nProvider';
import { uniqueId } from '../../../lib/slug';
import { LocalizedField, TagsField } from '../fields';

interface SkillsStepProps {
  skills: SkillGroup[];
  onChange: (skills: SkillGroup[]) => void;
}

export function SkillsStep({ skills, onChange }: SkillsStepProps) {
  const { t } = useI18n();

  const update = (id: string, patch: Partial<SkillGroup>) => {
    onChange(skills.map((group) => (group.id === id ? { ...group, ...patch } : group)));
  };

  const addGroup = () => {
    const id = uniqueId('habilidades', new Set(skills.map((group) => group.id)));
    onChange([...skills, { id, label: {}, items: [] }]);
  };

  return (
    <div className="stack">
      {skills.length === 0 ? <p className="muted">{t('skills.form.empty')}</p> : null}

      {skills.map((group) => (
        <article className="editor-card" key={group.id}>
          <div className="editor-card__head">
            <h3>{group.label.es || t('skills.form.label')}</h3>
            <button
              type="button"
              className="button button--ghost button--small"
              onClick={() => onChange(skills.filter((item) => item.id !== group.id))}
            >
              {t('skills.form.remove')}
            </button>
          </div>

          <LocalizedField
            id={`skill-${group.id}-label`}
            label={t('skills.form.label')}
            value={group.label}
            onChange={(value) => update(group.id, { label: value })}
          />

          <TagsField
            id={`skill-${group.id}-items`}
            label={t('skills.form.items')}
            hint={t('skills.form.itemsHint')}
            value={group.items}
            onChange={(value) => update(group.id, { items: value })}
          />
        </article>
      ))}

      <button type="button" className="button" onClick={addGroup}>
        + {t('skills.form.add')}
      </button>
    </div>
  );
}
