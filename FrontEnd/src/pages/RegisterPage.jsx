import { useRef, useState } from 'react';
import AuthFrame from '../components/AuthFrame.jsx';
import FormField from '../components/FormField.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import { useAuth } from '../auth/index.js';
import { getRegistrationErrorMessage } from '../auth/authErrorMessages.js';
import { VALORA_ROLE_OPTIONS } from '../config/roles.js';
import { navigate } from '../router/Router.jsx';
import {
  validateEmail,
  validateRegistrationPassword,
  validateRequired,
} from '../utils/validation.js';

const INITIAL_VALUES = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  role: '',
};

function validateRegistration(values) {
  return {
    first_name: validateRequired(values.first_name, 'First name'),
    last_name: validateRequired(values.last_name, 'Last name'),
    email: validateEmail(values.email),
    password: validateRegistrationPassword(values.password),
    role: values.role ? '' : 'Choose the role that best matches how you will use VALORA.',
  };
}

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const formMessageRef = useRef(null);
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setFormError('');
  }

  function focusFirstInvalidField(nextErrors) {
    const firstInvalidField = Object.keys(nextErrors).find((field) => nextErrors[field]);
    if (firstInvalidField) {
      globalThis.setTimeout(() => document.getElementById(firstInvalidField)?.focus(), 0);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateRegistration(values);
    setErrors(nextErrors);
    setFormError('');

    if (Object.values(nextErrors).some(Boolean)) {
      focusFirstInvalidField(nextErrors);
      return;
    }

    try {
      await register({
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        role: values.role,
      });
      setValues((current) => ({ ...current, password: '' }));
      navigate('/app', { replace: true });
    } catch (error) {
      setValues((current) => ({ ...current, password: '' }));
      setFormError(getRegistrationErrorMessage(error));
      globalThis.setTimeout(() => formMessageRef.current?.focus(), 0);
    }
  }

  const roleDescribedBy = errors.role ? 'role-error' : undefined;

  return (
    <AuthFrame
      variant="register"
      formId="register-form"
      eyebrow="CREATE YOUR ACCOUNT"
      title="Start your VALORA profile."
      lead="Share the essentials, choose your perspective, and continue to your personal VALORA space."
      visualEyebrow="A LOCAL PERSPECTIVE"
      visualTitle="Begin with a clearer point of view."
      visualCopy="Choose the role that reflects how you take part in your local property and community life today."
      switchPrompt="Already have an account?"
      switchLabel="Sign in"
      switchTo="/login"
    >
      <form id="register-form" className="auth-form registration-form" noValidate onSubmit={handleSubmit} aria-labelledby="register-form-title">
        {formError && (
          <p ref={formMessageRef} className="form-message form-message-error" role="alert" tabIndex={-1}>
            {formError}
          </p>
        )}

        <div className="form-row">
          <FormField
            id="first_name"
            label="First Name"
            value={values.first_name}
            onChange={updateField}
            error={errors.first_name}
            placeholder="Your name"
            autoComplete="given-name"
            required
          />
          <FormField
            id="last_name"
            label="Last Name"
            value={values.last_name}
            onChange={updateField}
            error={errors.last_name}
            placeholder="Surname"
            autoComplete="family-name"
            required
          />
        </div>

        <FormField
          id="email"
          label="Email"
          type="email"
          value={values.email}
          onChange={updateField}
          error={errors.email}
          placeholder="name@example.com"
          autoComplete="email"
          required
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          value={values.password}
          onChange={updateField}
          error={errors.password}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
        />

        <fieldset
          className="registration-role-fieldset"
          aria-describedby={roleDescribedBy}
          aria-invalid={Boolean(errors.role)}
          aria-required="true"
        >
          <legend>Your Role</legend>

          <div className="role-options role-options-detailed">
            {VALORA_ROLE_OPTIONS.map((role) => (
              <label key={role.value} htmlFor={role.value} className={`role-option role-option-detailed ${values.role === role.value ? 'option-selected' : ''}`}>
                <input
                  id={role.value}
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={values.role === role.value}
                  onChange={updateField}
                  aria-describedby={roleDescribedBy}
                />
                <span className="role-option-copy">
                  <strong>{role.label}</strong>
                </span>
              </label>
            ))}
          </div>

          {errors.role && (
            <span id="role-error" className="field-error" role="alert">
              {errors.role}
            </span>
          )}
        </fieldset>

        <SubmitButton isLoading={isLoading} loadingLabel="Creating your account…">
          Create your account
        </SubmitButton>
      </form>
    </AuthFrame>
  );
}
