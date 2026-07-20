import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="page-container py-10 sm:py-14">
      <div className="card space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-spice-600">404</p>
        <h1 className="heading-lg">Page not found</h1>
        <p className="body-copy">The page you requested does not exist.</p>
        <div className="flex justify-center">
          <Link to="/" className="primary-button">
            Return Home
          </Link>
        </div>
      </div>
    </section>
  );
}