import { useEffect, useMemo, useState } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All categories');

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

  const categories = useMemo(() => {
    return ['All categories', ...new Set(products.map((product) => product.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All categories' || product.category === selectedCategory;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [product.name, product.category, product.shortDescription, product.description]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [products, searchTerm, selectedCategory]);

  const hasActiveFilters = searchTerm.trim().length > 0 || selectedCategory !== 'All categories';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All categories');
  };

  return (
    <section className="page-container py-10 sm:py-14">
      <div className="space-y-8">
        {location.state?.message ? (
          <div className="error-message">{location.state.message}</div>
        ) : null}

        <div className="card space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full bg-tea-100 px-4 py-2 text-sm font-semibold text-tea-800">
              Sri Lankan e-commerce MVP
            </span>
            <span className="inline-flex rounded-full border border-cream-200 bg-white px-3 py-1 text-sm font-medium text-brown-700">
              Fresh picks from local makers
            </span>
          </div>
          <div className="space-y-4">
            <h1 className="heading-xl max-w-3xl">Locally made products from across Sri Lanka.</h1>
            <p className="body-copy max-w-2xl">
              Discover tea, spices, handicrafts, apparel, and personal care essentials from small local makers.
            </p>
          </div>
          <div className="grid gap-4 rounded-3xl bg-white/80 p-4 ring-1 ring-cream-200 sm:grid-cols-[minmax(0,1fr)_240px]">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-brown-700">Search products</span>
              <input
                className="form-input"
                type="search"
                placeholder="Search by name, category, or description"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-brown-700">Category</span>
              <select
                className="form-input"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
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

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-brown-600">
              <span>
                Showing {filteredProducts.length} of {products.length} products
              </span>
              {hasActiveFilters ? (
                <button className="secondary-button px-4 py-2 text-xs" onClick={clearFilters} type="button">
                  Clear filters
                </button>
              ) : null}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="card-surface space-y-3 text-center">
                <h2 className="heading-md">No products match your filters.</h2>
                <p className="body-copy text-sm">
                  Try a different search term or choose another category.
                </p>
                {hasActiveFilters ? (
                  <button className="secondary-button mx-auto" onClick={clearFilters} type="button">
                    Reset filters
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
              <article key={product.id} className="card-surface flex h-full flex-col overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-52 w-full rounded-2xl object-cover ring-1 ring-cream-100"
                />

                <div className="mt-5 flex flex-1 flex-col gap-4">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-brown-500">
                    <span>Featured</span>
                    <span>Local</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="inline-flex rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold text-brown-700">
                        {product.category}
                      </span>
                      <h2 className="heading-md mt-3">{product.name}</h2>
                    </div>
                    <div className="shrink-0 rounded-full bg-spice-100 px-3 py-1 text-sm font-semibold text-spice-700">
                      {formatLkr(product.price)}
                    </div>
                  </div>

                  <p className="body-copy text-sm leading-6">{product.shortDescription}</p>

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
        )}
      </div>
    </section>
  );
}