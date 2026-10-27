import { useState } from 'react';
import type { LocalizedText } from '../../data/types';
import { localeNames, locales } from '../../i18n';

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  type?: 'text' | 'email' | 'url' | 'tel';
  placeholder?: string;
  autoComplete?: string;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  hint,
  type = 'text',
  placeholder,
  autoComplete,
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="input"
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-describedby={hintId}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface TextAreaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  rows?: number;
}

export function TextAreaField({ id, label, value, onChange, hint, rows = 4 }: TextAreaFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        className="input input--area"
        rows={rows}
        value={value}
        aria-describedby={hintId}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface LocalizedFieldProps {
  id: string;
  label: string;
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  multiline?: boolean;
  hint?: string;
}

/** Dos campos (uno por idioma registrado) sobre el mismo `LocalizedText`. */
export function LocalizedField({
  id,
  label,
  value,
  onChange,
  multiline = false,
  hint,
}: LocalizedFieldProps) {
  return (
    <fieldset className="localized">
      <legend className="field__label">{label}</legend>
      {hint ? <p className="field__hint">{hint}</p> : null}
      <div className="localized__grid">
        {locales.map((code) => {
          const fieldId = `${id}-${code}`;
          const current = value[code] ?? '';
          const update = (next: string) => onChange({ ...value, [code]: next });

          return (
            <div className="field" key={code}>
              <label className="field__label field__label--sub" htmlFor={fieldId} lang={code}>
                {localeNames[code]}
              </label>
              {multiline ? (
                <textarea
                  id={fieldId}
                  className="input input--area"
                  rows={4}
                  lang={code}
                  value={current}
                  onChange={(event) => update(event.target.value)}
                />
              ) : (
                <input
                  id={fieldId}
                  className="input"
                  lang={code}
                  value={current}
                  onChange={(event) => update(event.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

interface TagsFieldProps {
  id: string;
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  hint?: string;
}

export function TagsField({ id, label, value, onChange, hint }: TagsFieldProps) {
  const [text, setText] = useState(() => value.join(', '));
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="input"
        value={text}
        aria-describedby={hintId}
        onChange={(event) => {
          setText(event.target.value);
          onChange(splitList(event.target.value));
        }}
      />
      {hint ? (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function YearField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const [text, setText] = useState(() => String(value));
  const currentYear = new Date().getFullYear();

  return (
    <div className="field field--narrow">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="input"
        type="number"
        inputMode="numeric"
        min={1950}
        max={currentYear + 1}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          const parsed = Number.parseInt(event.target.value, 10);
          if (Number.isFinite(parsed)) onChange(parsed);
        }}
        onBlur={() => {
          if (!text.trim()) setText(String(value));
        }}
      />
    </div>
  );
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

export function SelectField({ id, label, value, onChange, options }: SelectFieldProps) {
  return (
    <div className="field field--narrow">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
