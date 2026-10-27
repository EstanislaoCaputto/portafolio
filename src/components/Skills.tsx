import type { SkillGroup } from '../data/types';
import { useI18n } from '../i18n/I18nProvider';
import { pickLocalized } from '../lib/localized';

export function Skills({ skills }: { skills: SkillGroup[] }) {
  const { locale } = useI18n();

  if (skills.length === 0) return null;

  return (
    <div className="skills">
      {skills.map((group) => (
        <article key={group.id} className="skills__group">
          <h3 className="skills__label">{pickLocalized(group.label, locale)}</h3>
          <ul className="tag-list">
            {group.items.map((item, index) => (
              <li key={`${item}-${index}`} className="tag">
                {item}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
