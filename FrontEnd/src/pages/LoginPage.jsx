import { useState } from 'react';
import FormField from '../components/FormField.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import ValoraLogo from '../components/ValoraLogo.jsx';
import { useAuth } from '../auth/index.js';
import { getLoginErrorMessage } from '../auth/authErrorMessages.js';
import { AppLink, navigate } from '../router/Router.jsx';
import { validateEmail } from '../utils/validation.js';

const INITIAL_VALUES = { email: '', password: '' };

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setFormError('');
  }

  function validate() {
    const nextErrors = {
      email: validateEmail(values.email),
      password: values.password ? '' : 'Password is required.',
    };

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    if (!validate()) return;

    try {
      await login(values.email.trim(), values.password);
      setValues((current) => ({ ...current, password: '' }));
      navigate('/app', { replace: true });
    } catch (error) {
      setValues((current) => ({ ...current, password: '' }));
      setFormError(getLoginErrorMessage(error));
    }
  }

  return (
    <main className="page-shell">
      <section className="auth-card form-card" aria-labelledby="login-title">
        <div className="card-sidebar">
          <ValoraLogo />
          <div className="sidebar-content">
            <h2 className="sidebar-heading">Get started<br />with VALORA</h2>
            <p className="sidebar-tagline">A private hub for property insight and community life.</p>
          </div>
        </div>

        <div className="card-form-panel">
          <div className="card-content form-content">
            <h1 id="login-title">Sign in</h1>
            <p className="lead">Secure access to your VALORA account.</p>

            <form className="auth-form" noValidate onSubmit={handleSubmit}>
              {formError && (
                <div className="form-message form-message-error" role="alert">
                  {formError}
                </div>
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


              <SubmitButton isLoading={isLoading} loadingLabel="Signing in…">
                Sign in
              </SubmitButton>
            </form>

            <p className="auth-switch">
              No account? <AppLink to="/register">Create one</AppLink>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
