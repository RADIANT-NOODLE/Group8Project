import ValoraLogo from '../components/ValoraLogo.jsx';
import { useAuth } from '../auth/index.js';
import { navigate } from '../router/Router.jsx';

const ROLE_LABELS = {
  resident: 'Resident',
  investor: 'Investor',
  estate_agent: 'Estate Agent',
  hoa_admin: 'HOA Admin',
};

function getInitials(user) {
  const names = [user?.first_name, user?.last_name].filter(Boolean);
  if (names.length) return names.map((name) => name[0]).join('').toUpperCase();
  return String(user?.full_name || user?.email || 'V')
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function AppHomePage() {
  const { user, logout, authMode } = useAuth();
  const isMockSession = authMode === 'mock';
  const displayName = user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ');
  const firstName = user.first_name || displayName.split(' ')[0] || 'there';
  const roleLabel = ROLE_LABELS[user.role] || user.role;

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className="page-shell app-shell">
      <section className="app-card" aria-labelledby="app-title">
        <header className="app-header">
          <ValoraLogo />
          <span className="session-badge">
            <span className="session-dot" aria-hidden="true" />
            {isMockSession ? 'Mock session' : 'API session'}
          </span>
        </header>

        <div className="app-content">
          <p className="eyebrow">Account overview</p>
          <h1 id="app-title">Welcome, {firstName}</h1>
          <p className="lead">Your VALORA frontend session is active.</p>

          <div className="user-summary" aria-label="Current user">
            <div className="user-avatar" aria-hidden="true">{getInitials(user)}</div>
            <div className="user-details">
              <strong>{displayName}</strong>
              <span>{user.email}</span>
            </div>
            <span className="role-badge">{roleLabel}</span>
          </div>

          <button className="button button-primary logout-button" type="button" onClick={handleLogout}>
            Log out
          </button>

          <p className="mock-session-note">
            {isMockSession
              ? 'This is a local mock session. Set VITE_USE_MOCK_AUTH=false when the backend auth API is ready.'
              : 'This session is connected to the configured VALORA authentication API.'}
          </p>
        </div>
      </section>
    </main>
  );
}
