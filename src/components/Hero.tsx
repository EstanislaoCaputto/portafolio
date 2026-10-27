import type { Profile } from '../data/types';
import { useI18n } from '../i18n/I18nProvider';
import { pickLocalized } from '../lib/localized';
import { safeEmail, safeUrl } from '../lib/url';
import { Avatar } from './Avatar';
import { GitHubIcon, GlobeIcon, LinkedInIcon, MailIcon } from './icons';

interface HeroProps {
  profile: Profile;
  showContactAction?: boolean;
}

export function Hero({ profile, showContactAction = true }: HeroProps) {
  const { locale, t } = useI18n();

  const headline = pickLocalized(profile.headline, locale);
  const bio = pickLocalized(profile.bio, locale);
  const availability = pickLocalized(profile.availability, locale);
  const email = safeEmail(profile.email);

  const links = [
    { href: safeUrl(profile.links.github), label: t('links.github'), icon: GitHubIcon },
    { href: safeUrl(profile.links.linkedin), label: t('links.linkedin'), icon: LinkedInIcon },
    { href: safeUrl(profile.links.website), label: t('links.website'), icon: GlobeIcon },
  ].filter((link) => link.href !== '');

  const displayName = profile.name.trim() || t('app.title');

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero__inner">
        <div className="hero__content">
          {availability ? (
            <p className="pill pill--accent">
              <span className="pill__dot" aria-hidden="true" />
              {availability}
            </p>
          ) : null}

          <h1 id="hero-title" className="hero__title">
            {displayName}
          </h1>

          {headline ? <p className="hero__headline">{headline}</p> : null}
          {bio ? <p className="hero__bio">{bio}</p> : null}

          <div className="hero__actions">
            <a className="button button--primary" href="#/proyectos">
              {t('hero.viewProjects')}
            </a>
            {showContactAction ? (
              <a className="button" href="#/contacto">
                {t('hero.contact')}
              </a>
            ) : null}
          </div>

          <ul className="hero__links">
            {email ? (
              <li>
                <a href={`mailto:${email}`}>
                  <MailIcon />
                  {t('links.email')}
                </a>
              </li>
            ) : null}
            {links.map(({ href, label, icon: Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noreferrer noopener">
                  <Icon />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="hero__avatar">
          <Avatar
            name={displayName}
            src={profile.avatarUrl}
            alt={t('hero.avatarAlt', { name: displayName })}
            size="lg"
          />
        </div>
      </div>
    </section>
  );
}
