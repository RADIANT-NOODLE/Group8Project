import { AppLink } from '../router/Router.jsx';
import './AuthExperience.css';
import './AuthRefinements.css';

export default function AuthFrame({
  variant,
  eyebrow,
  title,
  lead,
  visualEyebrow,
  visualTitle,
  visualCopy,
  formId,
  children,
  switchPrompt,
  switchLabel,
  switchTo,
}) {
  return (
    <main className={`auth-experience auth-experience--${variant}`}>
      <a className="auth-skip-link" href={`#${formId}`}>Skip to account form</a>

      <div className="auth-experience-grid">
        <aside className="auth-visual-panel" aria-label="VALORA account access">
          <div className="auth-visual-content">
            <AppLink className="auth-brand-link auth-wordmark" to="/" aria-label="Return to VALORA home">
              VALORA
            </AppLink>

            <div className="auth-visual-copy">
              {visualEyebrow && <p className="auth-visual-eyebrow">{visualEyebrow}</p>}
              <h2>{visualTitle}</h2>
              <p>{visualCopy}</p>
            </div>
          </div>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-form-content">
            <AppLink className="auth-mobile-brand auth-wordmark" to="/" aria-label="Return to VALORA home">
              VALORA
            </AppLink>
            <AppLink className="auth-home-link" to="/">← Return to home</AppLink>

            <header className="auth-form-header">
              <p className="auth-eyebrow">{eyebrow}</p>
              <h1 id={`${formId}-title`}>{title}</h1>
              <p className="auth-lead">{lead}</p>
            </header>

            {children}

            <p className="auth-switch">
              {switchPrompt} <AppLink to={switchTo}>{switchLabel}</AppLink>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
