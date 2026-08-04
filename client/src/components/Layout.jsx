import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const navLinkClass = ({ isActive }) =>
  [
    'rounded-full px-4 py-2 text-sm font-semibold transition',
    isActive ? 'bg-brown-900 text-white shadow-sm' : 'text-brown-700 hover:bg-white/80 hover:text-brown-900',
  ].join(' ');

export default function Layout() {
  const { itemCount } = useCart();
  const { currentUser, isAuthenticated, logout } = useAuth();

  return (
    <div className="page-shell text-brown-900">
      <header className="border-b border-brown-200/70 bg-white/70 backdrop-blur">
        <div className="page-container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3 font-semibold text-brown-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-spice-500 text-sm font-bold text-white shadow-sm">
              CC
            </span>
            <span className="text-lg tracking-tight">CeylonCart</span>
          </Link>

          <nav className="flex items-center gap-2">
            <NavLink to="/" className={navLinkClass} end>
              Shop
            </NavLink>
            <NavLink to="/cart" className={navLinkClass}>
              <span className="inline-flex items-center gap-2">
                Cart
                {itemCount > 0 ? (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-spice-500 px-2 py-0.5 text-xs font-bold leading-none text-white shadow-sm">
                    {itemCount}
                  </span>
                ) : null}
              </span>
            </NavLink>
            {isAuthenticated ? (
              <>
                <span className="hidden rounded-full border border-tea-700/20 bg-white/80 px-4 py-2 text-sm font-medium text-brown-700 sm:inline-flex">
                  {currentUser.fullName}
                </span>
                <button type="button" className={navLinkClass({ isActive: false })} onClick={logout}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  Sign in
                </NavLink>
                <NavLink to="/signup" className={navLinkClass}>
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-brown-200/70 bg-white/70">
        <div className="page-container py-6 text-sm text-brown-600">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>Locally made Sri Lankan goods, curated for a simple MVP.</p>
            <p>Built with React, Tailwind CSS, and Express.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}