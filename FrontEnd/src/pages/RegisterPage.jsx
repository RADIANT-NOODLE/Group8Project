import { useState } from 'react';
import FormField from '../components/FormField.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import ValoraLogo from '../components/ValoraLogo.jsx';
import { AppLink } from '../router/Router.jsx';
import {
  validateEmail,
  validateRegistrationPassword,
  validateRequired,
} from '../utils/validation.js';

const ROLES = [
  { value: 'resident', label: 'Resident' },
  { value: 'investor', label: 'Investor' },
  { value: 'estate_agent', label: 'Agent' },
  { value: 'hoa_admin', label: 'HOA' },
];

const INITIAL_VALUES = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  role: '',
};

export default function RegisterPage() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setMessage('');
  }

  function validate() {
    const nextErrors = {
      first_name: validateRequired(values.first_name, 'First name'),
      last_name: validateRequired(values.last_name, 'Last name'),
      email: validateEmail(values.email),
      password: validateRegistrationPassword(values.password),
      role: values.role ? '' : 'Select a role.',
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
    setValues((current) => ({
      ...current,
      first_name: current.first_name.trim(),
      last_name: current.last_name.trim(),
      email: current.email.trim().toLowerCase(),
    }));
    setMessage('Looks good. Auth API not connected yet.');
  }

  return (
    <main className="page-shell">
      <section className="auth-card form-card register-card" aria-labelledby="register-title">
        <div className="card-sidebar">
          <ValoraLogo />
          <div className="sidebar-content">
            <h2 className="sidebar-heading">Get started<br />with VALORA</h2>
            <p className="sidebar-tagline">A private hub for property insight and community life.</p>
          </div>
        </div>

        <div className="card-form-panel">
          <div className="card-content form-content">
            <h1 id="register-title">Create account</h1>
            <p className="lead">Secure access to your VALORA account.</p>

            <form className="auth-form" noValidate onSubmit={handleSubmit}>
              {message && (
                <div className="form-message form-message-success" role="status">
                  {message}
                </div>
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
                />

                <FormField
                  id="last_name"
                  label="Last Name"
                  value={values.last_name}
                  onChange={updateField}
                  error={errors.last_name}
                  placeholder="Surname"
                  autoComplete="family-name"
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
              />

              <fieldset
                className="role-fieldset"
                aria-describedby={errors.role ? 'role-error' : undefined}
              >
                <legend>Your Role</legend>
                <div className="role-options">
                  {ROLES.map((role) => (
                    <label
                      key={role.value}
                      className={`role-option ${values.role === role.value ? 'role-option-selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={values.role === role.value}
                        onChange={updateField}
                      />
                      <span>{role.label}</span>
                    </label>
                  ))}
                </div>
                {errors.role && (
                  <span id="role-error" className="field-error" role="alert">
                    {errors.role}
                  </span>
                )}
              </fieldset>

              <SubmitButton isLoading={isLoading} loadingLabel="Creating account…">
                Create account
              </SubmitButton>
            </form>

            <p className="auth-switch">
              Already have an account? <AppLink to="/login">Sign in</AppLink>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
