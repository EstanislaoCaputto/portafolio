import type { Project } from '../../../data/types';
import { localeNames, locales } from '../../../i18n';
import { useI18n } from '../../../i18n/I18nProvider';
import { uniqueId } from '../../../lib/slug';
import { LocalizedField, TagsField, TextField, YearField } from '../fields';

interface ProjectsStepProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

function highlightLines(project: Project, code: string): string {
  return project.highlights.map((item) => item[code] ?? '').join('\n');
}

function mergeHighlights(project: Project, code: string, text: string): Project['highlights'] {
  const lines = text.split('\n');
  const length = Math.max(lines.length, project.highlights.length);

  return Array.from({ length }, (_, index) => ({
    ...(project.highlights[index] ?? {}),
    [code]: lines[index] ?? '',
  })).filter((item) => Object.values(item).some((value) => value.trim() !== ''));
}

export function ProjectsStep({ projects, onChange }: ProjectsStepProps) {
  const { t } = useI18n();

  const update = (id: string, patch: Partial<Project>) => {
    onChange(projects.map((project) => (project.id === id ? { ...project, ...patch } : project)));
  };

  const addProject = () => {
    const id = uniqueId('proyecto', new Set(projects.map((project) => project.id)));

    onChange([
      ...projects,
      {
        id,
        name: '',
        summary: {},
        description: {},
        highlights: [],
        tech: [],
        year: new Date().getFullYear(),
        repoUrl: '',
        demoUrl: '',
        featured: false,
      },
    ]);
  };

  return (
    <div className="stack">
      {projects.length === 0 ? <p className="muted">{t('projects.form.empty')}</p> : null}

      {projects.map((project) => (
        <article className="editor-card" key={project.id}>
          <div className="editor-card__head">
            <h3>{project.name || t('projects.form.name')}</h3>
            <button
              type="button"
              className="button button--ghost button--small"
              onClick={() => onChange(projects.filter((item) => item.id !== project.id))}
            >
              {t('projects.form.remove')}
            </button>
          </div>

          <div className="form-grid">
            <TextField
              id={`project-${project.id}-name`}
              label={t('projects.form.name')}
              value={project.name}
              onChange={(value) => update(project.id, { name: value })}
            />
            <YearField
              id={`project-${project.id}-year`}
              label={t('projects.form.year')}
              value={project.year}
              onChange={(value) => update(project.id, { year: value })}
            />
          </div>

          <LocalizedField
            id={`project-${project.id}-summary`}
            label={t('projects.form.summary')}
            value={project.summary}
            onChange={(value) => update(project.id, { summary: value })}
          />

          <LocalizedField
            id={`project-${project.id}-description`}
            label={t('projects.form.description')}
            value={project.description}
            multiline
            onChange={(value) => update(project.id, { description: value })}
          />

          <div className="form-grid">
            <TextField
              id={`project-${project.id}-repo`}
              label={t('projects.form.repo')}
              type="url"
              value={project.repoUrl}
              onChange={(value) => update(project.id, { repoUrl: value })}
            />
            <TextField
              id={`project-${project.id}-demo`}
              label={t('projects.form.demo')}
              type="url"
              value={project.demoUrl}
              onChange={(value) => update(project.id, { demoUrl: value })}
            />
          </div>

          <TagsField
            id={`project-${project.id}-tech`}
            label={t('projects.form.tech')}
            hint={t('projects.form.techHint')}
            value={project.tech}
            onChange={(value) => update(project.id, { tech: value })}
          />

          <fieldset className="localized">
            <legend className="field__label">{t('projects.form.highlights')}</legend>
            <p className="field__hint">{t('projects.form.highlightsHint')}</p>
            <div className="localized__grid">
              {locales.map((code) => {
                const fieldId = `project-${project.id}-highlights-${code}`;

                return (
                  <div className="field" key={code}>
                    <label className="field__label field__label--sub" htmlFor={fieldId} lang={code}>
                      {localeNames[code]}
                    </label>
                    <textarea
                      id={fieldId}
                      className="input input--area"
                      rows={3}
                      lang={code}
                      value={highlightLines(project, code)}
                      onChange={(event) =>
                        update(project.id, {
                          highlights: mergeHighlights(project, code, event.target.value),
                        })
                      }
                    />
                  </div>
                );
              })}
            </div>
          </fieldset>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={project.featured}
              onChange={(event) => update(project.id, { featured: event.target.checked })}
            />
            {t('projects.form.featured')}
          </label>
        </article>
      ))}

      <button type="button" className="button" onClick={addProject}>
        + {t('projects.form.add')}
      </button>
    </div>
  );
}
