import type { ExperienceItem } from '../data/types';
import { useI18n } from '../i18n/I18nProvider';
import { pickLocalized } from '../lib/localized';

export function Experience({ items }: { items: ExperienceItem[] }) {
  const { locale, t } = useI18n();

  if (items.length === 0) return null;

  return (
    <ol className="timeline">
      {items.map((item) => {
        const role = pickLocalized(item.role, locale);
        const summary = pickLocalized(item.summary, locale);

        return (
          <li key={item.id} className="timeline__item">
            <div className="timeline__meta">
              <span className={item.kind === 'education' ? 'badge' : 'badge badge--accent'}>
                {t(item.kind === 'education' ? 'experience.education' : 'experience.work')}
              </span>
              {item.period ? <span className="timeline__period">{item.period}</span> : null}
            </div>

            <h3 className="timeline__role">{role || item.organization}</h3>
            {item.organization && role ? (
              <p className="timeline__org">{item.organization}</p>
            ) : null}
            {summary ? <p className="timeline__summary">{summary}</p> : null}
          </li>
        );
      })}
    </ol>
  );
}
