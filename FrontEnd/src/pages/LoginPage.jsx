import { useState } from 'react';
import FormField from '../components/FormField.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import ValoraLogo from '../components/ValoraLogo.jsx';
import { AppLink } from '../router/Router.jsx';
import { validateEmail } from '../utils/validation.js';

const INITIAL_VALUES = { email: '', password: '', remember_me: false };

export default function LoginPage() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setMessage('');
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
    setMessage('');

    if (!validate()) return;

    // Client validation only — API wiring comes later
    setIsLoading(true);
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    setIsLoading(false);
    setMessage('Looks good. Auth API not connected yet.');
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
              {message && (
                <div className="form-message form-message-success" role="status">
                  {message}
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
              />

              <div className="form-extras">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    name="remember_me"
                    checked={values.remember_me}
                    onChange={updateField}
                  />
                  <span>Remember me</span>
                </label>
                <AppLink to="/login" className="forgot-link">
                  Forgot password?
                </AppLink>
              </div>

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
