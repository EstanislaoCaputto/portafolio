import { useState } from 'react';
import type { Portfolio } from '../../../data/types';
import type { TranslationKey } from '../../../i18n/es';
import { useI18n } from '../../../i18n/I18nProvider';
import { GitHubImportError, importFromGitHub, type GitHubErrorCode } from '../../../lib/github';
import { hasLocalizedContent } from '../../../lib/localized';
import { LocalizedField, TextField } from '../fields';

const IMPORT_ERROR_KEYS = {
  'invalid-username': 'identity.import.invalid',
  'not-found': 'identity.import.notFound',
  'rate-limit': 'identity.import.rateLimit',
  network: 'identity.import.network',
  'bad-response': 'identity.import.network',
} as const satisfies Record<GitHubErrorCode, TranslationKey>;

type ImportStatus =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; count: number }
  | { kind: 'error'; messageKey: TranslationKey };

interface IdentityStepProps {
  portfolio: Portfolio;
  onChange: (portfolio: Portfolio) => void;
}

export function IdentityStep({ portfolio, onChange }: IdentityStepProps) {
  const { t } = useI18n();
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<ImportStatus>({ kind: 'idle' });

  const { profile } = portfolio;

  const updateProfile = (patch: Partial<typeof profile>) => {
    onChange({ ...portfolio, profile: { ...profile, ...patch } });
  };

  const runImport = async () => {
    setStatus({ kind: 'loading' });

    try {
      const result = await importFromGitHub(username);
      onChange({
        ...portfolio,
        profile: {
          ...profile,
          name: result.profile.name || profile.name,
          bio: hasLocalizedContent(result.profile.bio) ? result.profile.bio : profile.bio,
          location: result.profile.location || profile.location,
          avatarUrl: result.profile.avatarUrl || profile.avatarUrl,
          links: {
            ...profile.links,
            github: result.profile.github || profile.links.github,
            website: result.profile.website || profile.links.website,
          },
        },
        projects: result.projects,
      });
      setUsername(result.username);
      setStatus({ kind: 'success', count: result.projects.length });
    } catch (error) {
      const code: GitHubErrorCode = error instanceof GitHubImportError ? error.code : 'network';
      setStatus({ kind: 'error', messageKey: IMPORT_ERROR_KEYS[code] });
    }
  };

  return (
    <div className="stack">
      <fieldset className="editor-card">
        <legend>{t('identity.import.title')}</legend>
        <p className="field__hint">{t('identity.import.help')}</p>

        <div className="inline-form">
          <input
            className="input"
            type="text"
            value={username}
            placeholder={t('identity.import.placeholder')}
            aria-label={t('identity.import.placeholder')}
            onChange={(event) => setUsername(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                if (username.trim()) void runImport();
              }
            }}
          />
          <button
            type="button"
            className="button"
            disabled={status.kind === 'loading' || username.trim() === ''}
            onClick={() => void runImport()}
          >
            {status.kind === 'loading' ? t('identity.import.loading') : t('identity.import.action')}
          </button>
        </div>

        <p className="field__hint">{t('identity.import.replaces')}</p>

        {status.kind === 'success' ? (
          <p className="status status--ok" role="status">
            {t('identity.import.success', { count: status.count })}
          </p>
        ) : null}
        {status.kind === 'error' ? (
          <p className="status status--error" role="alert">
            {t(status.messageKey)}
          </p>
        ) : null}
      </fieldset>

      <div className="form-grid">
        <TextField
          id="identity-name"
          label={t('identity.name')}
          value={profile.name}
          autoComplete="name"
          onChange={(value) => updateProfile({ name: value })}
        />
        <TextField
          id="identity-location"
          label={t('identity.location')}
          value={profile.location}
          autoComplete="address-level2"
          onChange={(value) => updateProfile({ location: value })}
        />
      </div>

      <LocalizedField
        id="identity-headline"
        label={t('identity.headline')}
        hint={t('identity.headlineHint')}
        value={profile.headline}
        onChange={(value) => updateProfile({ headline: value })}
      />

      <LocalizedField
        id="identity-bio"
        label={t('identity.bio')}
        hint={t('identity.bioHint')}
        value={profile.bio}
        multiline
        onChange={(value) => updateProfile({ bio: value })}
      />

      <div className="form-grid">
        <TextField
          id="identity-email"
          label={t('identity.email')}
          type="email"
          value={profile.email}
          autoComplete="email"
          onChange={(value) => updateProfile({ email: value })}
        />
        <TextField
          id="identity-avatar"
          label={t('identity.avatarUrl')}
          hint={t('identity.avatarHint')}
          type="url"
          value={profile.avatarUrl}
          onChange={(value) => updateProfile({ avatarUrl: value })}
        />
      </div>

      <div className="form-grid">
        <TextField
          id="identity-github"
          label={t('identity.github')}
          type="url"
          value={profile.links.github}
          onChange={(value) => updateProfile({ links: { ...profile.links, github: value } })}
        />
        <TextField
          id="identity-linkedin"
          label={t('identity.linkedin')}
          type="url"
          value={profile.links.linkedin}
          onChange={(value) => updateProfile({ links: { ...profile.links, linkedin: value } })}
        />
      </div>

      <TextField
        id="identity-website"
        label={t('identity.website')}
        type="url"
        value={profile.links.website}
        onChange={(value) => updateProfile({ links: { ...profile.links, website: value } })}
      />

      <LocalizedField
        id="identity-availability"
        label={t('identity.availability')}
        value={profile.availability}
        onChange={(value) => updateProfile({ availability: value })}
      />
    </div>
  );
}
