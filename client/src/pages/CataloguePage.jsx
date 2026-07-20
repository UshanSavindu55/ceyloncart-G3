import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchAllProducts } from '../services/api';

function formatLkr(amount) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CataloguePage() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const items = await fetchAllProducts();
      setProducts(items);
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <section className="page-container py-10 sm:py-14">
      <div className="space-y-8">
        {location.state?.message ? (
          <div className="error-message">{location.state.message}</div>
        ) : null}

        <div className="card space-y-5">
          <span className="inline-flex rounded-full bg-tea-100 px-4 py-2 text-sm font-semibold text-tea-800">
            Sri Lankan e-commerce MVP
          </span>
          <div className="space-y-4">
            <h1 className="heading-xl max-w-3xl">Locally made products from across Sri Lanka.</h1>
            <p className="body-copy max-w-2xl">
              Discover tea, spices, handicrafts, apparel, and personal care essentials from small local makers.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="card-surface text-brown-700">Loading products...</div>
        ) : error ? (
          <div className="space-y-4">
            <div className="error-message">{error}</div>
            <button className="secondary-button" onClick={loadProducts} type="button">
              Retry
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="card-surface flex h-full flex-col overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-52 w-full rounded-2xl object-cover"
                />

                <div className="mt-5 flex flex-1 flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold text-brown-700">
                        {product.category}
                      </span>
                      <h2 className="heading-md mt-3">{product.name}</h2>
                    </div>
                    <div className="shrink-0 rounded-full bg-spice-100 px-3 py-1 text-sm font-semibold text-spice-700">
                      {formatLkr(product.price)}
                    </div>
                  </div>

                  <p className="body-copy text-sm">{product.shortDescription}</p>

                  <div className="mt-auto">
                    <Link to={`/product/${product.id}`} className="primary-button w-full">
                      View Product
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}