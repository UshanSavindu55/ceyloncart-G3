import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const { isAuthenticated, register, currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
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

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const result = await register({
      fullName: formData.fullName,
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
      state: { message: `Welcome, ${result.user.fullName}. Your account is ready.` },
    });
  };

  return (
    <section className="page-container py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="card space-y-4">
          <span className="inline-flex rounded-full bg-spice-100 px-4 py-2 text-sm font-semibold text-spice-700">
            Create account
          </span>
          <h1 className="heading-xl max-w-xl">Register a new account in seconds.</h1>
  
        </div>

        <div className="card space-y-6">
          <div className="space-y-2">
            <h2 className="heading-lg">Register</h2>
            <p className="body-copy text-sm">Fill in your details to create a new local user object.</p>
          </div>

          {errorMessage ? <div className="error-message">{errorMessage}</div> : null}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-brown-700">Full name</span>
              <input
                className="form-input"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your full name"
              />
            </label>

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
                placeholder="Create a password"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-brown-700">Confirm password</span>
              <input
                className="form-input"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
              />
            </label>

            <button type="submit" className="primary-button w-full">
              Create Account
            </button>
          </form>

          <p className="text-sm text-brown-700">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-spice-700 underline decoration-spice-300 underline-offset-4">
              Sign in instead
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}