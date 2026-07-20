import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Notification from '../components/Notification';

function formatLkr(amount) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CartPage() {
  const { items, total, itemCount, removeFromCart, updateQuantity } = useCart();

  const increment = (item) => updateQuantity(item.id, item.quantity + 1);
  const decrement = (item) => updateQuantity(item.id, Math.max(1, item.quantity - 1));

  if (items.length === 0) {
    return (
      <section className="page-container py-10 sm:py-14">
        <div className="card space-y-4 text-center">
          <Notification message="Your cart is empty." tone="info" />
          <h1 className="heading-lg">Your cart is empty</h1>
          <p className="body-copy">Browse the catalogue to add Sri Lankan products to your order.</p>
          <div className="flex justify-center">
            <Link to="/" className="primary-button">
              Back to Catalogue
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-container py-10 sm:py-14">
      <div className="space-y-8">
        <div className="card space-y-3">
          <h1 className="heading-xl">Shopping Cart</h1>
          <p className="body-copy">
            {itemCount} item{itemCount === 1 ? '' : 's'} in your cart.
          </p>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="card-surface">
              <div className="grid gap-5 lg:grid-cols-[120px_minmax(0,1fr)_auto] lg:items-center">
                <img src={item.image} alt={item.name} className="h-28 w-28 rounded-2xl object-cover" />

                <div className="space-y-2">
                  <h2 className="heading-md">{item.name}</h2>
                  <p className="text-sm text-brown-600">Unit price: {formatLkr(item.price)}</p>
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-sm font-semibold text-brown-700">Qty</span>
                    <div className="flex items-center rounded-full border border-brown-200 bg-white p-1 shadow-sm">
                      <button
                        type="button"
                        className="h-9 w-9 rounded-full text-lg font-semibold text-brown-700 transition hover:bg-cream-100"
                        onClick={() => decrement(item)}
                        aria-label={`Decrease quantity for ${item.name}`}
                      >
                        -
                      </button>
                      <span className="min-w-10 px-3 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        className="h-9 w-9 rounded-full text-lg font-semibold text-brown-700 transition hover:bg-cream-100"
                        onClick={() => increment(item)}
                        aria-label={`Increase quantity for ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <div className="text-lg font-semibold text-spice-700">
                    {formatLkr(item.price * item.quantity)}
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="card space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brown-500">Order Total</p>
              <h2 className="heading-lg mt-2">{formatLkr(total)}</h2>
            </div>
            <p className="body-copy">{itemCount} total item{itemCount === 1 ? '' : 's'}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/" className="secondary-button">
              Continue Shopping
            </Link>
            <Link to="/checkout" className="primary-button">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}