import ValoraLogo from '../components/ValoraLogo.jsx';
import { AppLink } from '../router/Router.jsx';

export default function AppHomePage() {
  return (
    <main className="page-shell app-shell">
      <section className="app-card" aria-labelledby="app-title">
        <header className="app-header">
          <ValoraLogo />
        </header>

        <div className="app-content">
          <h1 id="app-title">VALORA</h1>
          <p className="lead">Signed-in home. More screens land here later.</p>

          <nav className="card-actions" aria-label="Auth">
            <AppLink to="/login" className="button button-primary">
              Sign in
            </AppLink>
            <AppLink to="/register" className="text-link">
              Create account →
            </AppLink>
          </nav>
        </div>
      </section>
    </main>
  );
}
