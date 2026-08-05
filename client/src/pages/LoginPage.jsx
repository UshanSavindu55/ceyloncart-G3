import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const demoCredentials = [
  {
    email: 'ayesha@example.com',
    password: 'Ceylon1234!',
  },
  {
    email: 'kasun@example.com',
    password: 'SriLanka2026!',
  },
];

export default function LoginPage() {
  const { isAuthenticated, login, currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" replace state={{ message: `${currentUser.fullName} is already signed in.` }} />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentValues) => ({ ...currentValues, [name]: value }));
    setErrorMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    const destination = location.state?.from?.pathname || '/';
    navigate(destination, {
      replace: true,
      state: { message: `Welcome back, ${result.user.fullName}.` },
    });
  };

  return (
    <section className="page-container py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="card space-y-4">
          <span className="inline-flex rounded-full bg-tea-100 px-4 py-2 text-sm font-semibold text-tea-800">
            Sign in
          </span>
          <h1 className="heading-xl max-w-xl">Access your cart and saved session.</h1>
          <p className="body-copy max-w-2xl">
            This demo authenticates using the backend API and stores a session token in localStorage for returning users.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card-surface space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brown-500">What you can do</p>
              <p className="text-sm text-brown-700">Sign in, keep your session on refresh, and continue shopping.</p>
            </div>
            <div className="card-surface space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brown-500">Need an account?</p>
              <p className="text-sm text-brown-700">Create one instantly with the register page.</p>
            </div>
          </div>
        </div>

        <div className="card space-y-6">
          <div className="space-y-2">
            <h2 className="heading-lg">Login</h2>
            <p className="body-copy text-sm">Use one of the sample accounts below or any account you create.</p>
          </div>

          {errorMessage ? <div className="error-message">{errorMessage}</div> : null}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-brown-700">Email address</span>
              <input
                className="form-input"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-brown-700">Password</span>
              <input
                className="form-input"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </label>

            <button type="submit" className="primary-button w-full">
              Sign In
            </button>
          </form>
 

          <p className="text-sm text-brown-700">
            Need a new account?{' '}
            <Link to="/signup" className="font-semibold text-spice-700 underline decoration-spice-300 underline-offset-4">
              Create one here
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}