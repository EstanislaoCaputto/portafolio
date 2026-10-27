import type { Profile } from '../data/types';
import { useI18n } from '../i18n/I18nProvider';
import { safeEmail, safeUrl } from '../lib/url';
import { useCopy } from '../lib/useCopy';
import { GitHubIcon, GlobeIcon, LinkedInIcon, MailIcon } from './icons';

export function Contact({ profile }: { profile: Profile }) {
  const { t } = useI18n();
  const { copied, copy } = useCopy();
  const email = safeEmail(profile.email);

  const links = [
    { href: safeUrl(profile.links.github), label: t('links.github'), icon: GitHubIcon },
    { href: safeUrl(profile.links.linkedin), label: t('links.linkedin'), icon: LinkedInIcon },
    { href: safeUrl(profile.links.website), label: t('links.website'), icon: GlobeIcon },
  ].filter((link) => link.href !== '');

  if (!email && links.length === 0) return null;

  return (
    <div className="contact">
      {email ? (
        <div className="contact__card">
          <p className="contact__mail">{email}</p>
          <div className="contact__actions">
            <a className="button button--primary" href={`mailto:${email}`}>
              <MailIcon />
              {t('contact.mail')}
            </a>
            <button type="button" className="button" onClick={() => void copy(email)}>
              {copied ? t('contact.copied') : t('contact.copy')}
            </button>
            <span className="sr-only" role="status">
              {copied ? t('contact.copied') : ''}
            </span>
          </div>
        </div>
      ) : null}

      {links.length > 0 ? (
        <ul className="contact__links">
          {links.map(({ href, label, icon: Icon }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noreferrer noopener">
                <Icon />
                {label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
