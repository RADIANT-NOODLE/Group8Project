import ValoraLogo from '../components/ValoraLogo.jsx';
import { useAuth } from '../auth/index.js';
import { navigate } from '../router/Router.jsx';

function getFirstName(user) {
  const fullName = String(
    user?.full_name || [user?.first_name, user?.last_name].filter(Boolean).join(' '),
  ).trim();

  return user?.first_name || fullName.split(/\s+/)[0] || 'there';
}

export default function AppHomePage() {
  const { user, logout } = useAuth();
  const firstName = getFirstName(user);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className="page-shell app-shell">
      <section className="app-card app-dashboard" aria-labelledby="dashboard-title">
        <header className="app-header">
          <ValoraLogo />
          <button className="dashboard-logout" type="button" onClick={handleLogout}>
            Log out
          </button>
        </header>

        <div className="app-content dashboard-content">
          <p className="eyebrow">Dashboard</p>
          <h1 id="dashboard-title">Welcome, {firstName}</h1>
        </div>
      </section>
    </main>
  );
}
