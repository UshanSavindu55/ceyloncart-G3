import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import Notification from '../components/Notification';

function formatLkr(amount) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [buttonLabel, setButtonLabel] = useState('Add to Cart');
  const [notice, setNotice] = useState('');
  const resetButtonTimer = useRef(null);

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      try {
        const item = await fetchProductById(id);
        if (active) {
          setProduct(item);
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError.message || 'Unable to load product.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    setError('');
    setQuantity(1);
    setButtonLabel('Add to Cart');
    setNotice('');
    loadProduct();

    return () => {
      active = false;
      window.clearTimeout(resetButtonTimer.current);
    };
  }, [id]);

  return (
    <section className="page-container py-10 sm:py-14">
      <div className="card space-y-6">
        {loading ? (
          <div className="card-surface text-brown-700">Loading product...</div>
        ) : error ? (
          <div className="space-y-4">
            <div className="error-message">{error}</div>
            <Link to="/" className="secondary-button">
              Back to Shop
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_1.1fr] lg:items-start">
            <img src={product.image} alt={product.name} className="w-full rounded-[1.75rem] object-cover" />
            <div className="space-y-5">
              <span className="inline-flex rounded-full bg-cream-100 px-3 py-1 text-sm font-semibold text-brown-700">
                {product.category}
              </span>
              <h1 className="heading-xl">{product.name}</h1>
              <div className="text-2xl font-semibold text-spice-700">{formatLkr(product.price)}</div>
              <p className="body-copy">{product.description}</p>
              <Notification message={notice} tone="success" autoDismissAfter={1400} onDismiss={() => setNotice('')} />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-brown-700">Quantity</span>
                  <div className="flex items-center rounded-full border border-brown-200 bg-white p-1 shadow-sm">
                    <button
                      type="button"
                      className="h-10 w-10 rounded-full text-lg font-semibold text-brown-700 transition hover:bg-cream-100"
                      onClick={() => setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1))}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="min-w-10 px-3 text-center text-sm font-semibold text-brown-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      className="h-10 w-10 rounded-full text-lg font-semibold text-brown-700 transition hover:bg-cream-100"
                      onClick={() => setQuantity((currentQuantity) => currentQuantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                      addToCart(product, quantity);
                      setButtonLabel('Added ✓');
                      setNotice(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart.`);
                      window.clearTimeout(resetButtonTimer.current);
                      resetButtonTimer.current = window.setTimeout(() => {
                        setButtonLabel('Add to Cart');
                        setNotice('');
                      }, 1000);
                    }}
                  >
                    {buttonLabel}
                  </button>
                <Link to="/" className="secondary-button">
                  Continue Shopping
                </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}