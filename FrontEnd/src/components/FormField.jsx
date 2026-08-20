import { useState } from 'react';

function EyeIcon({ isVisible }) {
  if (isVisible) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 3l18 18" />
        <path d="M10.6 10.7a2.2 2.2 0 0 0 2.7 2.7" />
        <path d="M9.9 5.1A10.8 10.8 0 0 1 12 4.9c5.2 0 8.7 4.6 9.7 6.2a1.7 1.7 0 0 1 0 1.8 15.1 15.1 0 0 1-3.1 3.5" />
        <path d="M6.2 6.1a14.7 14.7 0 0 0-3.9 5 1.7 1.7 0 0 0 0 1.8C3.4 14.6 6.8 19.1 12 19.1c1.4 0 2.6-.3 3.7-.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.3 12c1-1.7 4.5-7.1 9.7-7.1s8.7 5.4 9.7 7.1c.3.6.3 1.2 0 1.8-1 1.7-4.5 7.1-9.7 7.1s-8.7-5.4-9.7-7.1a1.8 1.8 0 0 1 0-1.8Z" />
      <circle cx="12" cy="12.9" r="3.1" />
    </svg>
  );
}

export default function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  autoComplete,
  hint,
  required = false,
  passwordToggle = type === 'password',
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined;
  const isPasswordField = type === 'password' && passwordToggle;
  const inputType = isPasswordField && isPasswordVisible ? 'text' : type;

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {isPasswordField ? (
        <div className="password-control">
          <input
            id={id}
            name={id}
            type={inputType}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            autoComplete={autoComplete}
            required={required}
            aria-required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
          />
          <button
            className="password-toggle"
            type="button"
            onClick={() => setIsPasswordVisible((current) => !current)}
            aria-label={isPasswordVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            aria-pressed={isPasswordVisible}
            title={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            <EyeIcon isVisible={isPasswordVisible} />
          </button>
        </div>
      ) : (
        <input
          id={id}
          name={id}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
      )}
      {hint && (
        <span id={hintId} className="field-hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
