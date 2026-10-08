import { useRef, useState } from 'react';
import AuthFrame from '../components/AuthFrame.jsx';
import FormField from '../components/FormField.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import { useAuth } from '../auth/index.js';
import { getLoginErrorMessage } from '../auth/authErrorMessages.js';
import { getLoginNotice, getSafeNextPath } from '../auth/navigation.js';
import { navigate } from '../router/Router.jsx';
import { validateEmail } from '../utils/validation.js';

const INITIAL_VALUES = { email: '', password: '' };

function validateLogin(values) {
  return {
    email: validateEmail(values.email),
    password: values.password ? '' : 'Password is required.',
  };
}

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const formMessageRef = useRef(null);
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const search = globalThis.window?.location?.search ?? '';
  const loginNotice = getLoginNotice(search);

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
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setFormError('');

    if (Object.values(nextErrors).some(Boolean)) {
      focusFirstInvalidField(nextErrors);
      return;
    }

    try {
      await login(values.email.trim().toLowerCase(), values.password);
      setValues((current) => ({ ...current, password: '' }));
      navigate(getSafeNextPath(search), { replace: true });
    } catch (error) {
      setValues((current) => ({ ...current, password: '' }));
      setFormError(getLoginErrorMessage(error));
      globalThis.setTimeout(() => formMessageRef.current?.focus(), 0);
    }
  }

  return (
    <AuthFrame
      variant="login"
      formId="login-form"
      eyebrow="ACCOUNT ACCESS"
      title="Welcome back."
      lead="Sign in to return to the property and community intelligence that matters to you."
      visualTitle="A clearer view of where you live."
      visualCopy="Return to one considered place for the local property and community detail that helps you stay informed."
      switchPrompt="New to VALORA?"
      switchLabel="Create an account"
      switchTo="/register"
    >
      <form id="login-form" className="auth-form login-form" noValidate onSubmit={handleSubmit} aria-labelledby="login-form-title">
        {loginNotice && (
          <p className="login-notice" role="status">
            {loginNotice}
          </p>
        )}

        {formError && (
          <p ref={formMessageRef} className="form-message form-message-error" role="alert" tabIndex={-1}>
            {formError}
          </p>
        )}

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
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />

        <SubmitButton isLoading={isLoading} loadingLabel="Signing you in…">
          Sign in securely
        </SubmitButton>
      </form>
    </AuthFrame>
  );
}
