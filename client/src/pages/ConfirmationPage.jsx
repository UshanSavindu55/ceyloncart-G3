import { Link, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import Notification from '../components/Notification';

function formatLkr(amount) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat('en-LK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateValue));
}

export default function ConfirmationPage() {
  const { lastOrder } = useCart();
  const [copyMessage, setCopyMessage] = useState('');

  if (!lastOrder) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="page-container py-10 sm:py-14">
      <div className="space-y-8">
        <div className="card space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-tea-700">Order complete</p>
          <h1 className="heading-xl">Thanks for your order.</h1>
          <p className="body-copy">Your payment was processed successfully and your order has been recorded.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_0.9fr] lg:items-start">
          <div className="card space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brown-500">Order ID</p>
                  <div className="mt-2 flex items-center gap-3">
                    <p className="font-semibold text-brown-900">{lastOrder.orderId}</p>
                    <button
                      type="button"
                      className="secondary-button px-2 py-1 text-sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(String(lastOrder.orderId));
                          setCopyMessage('Order ID copied to clipboard');
                          window.setTimeout(() => setCopyMessage(''), 2500);
                        } catch (err) {
                          setCopyMessage('Unable to copy order ID');
                          window.setTimeout(() => setCopyMessage(''), 2500);
                        }
                      }}
                    >
                      Copy
                    </button>
                  </div>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brown-500">Order Date</p>
                <p className="mt-2 font-semibold text-brown-900">{formatDate(lastOrder.date)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brown-500">Customer</p>
                <p className="mt-2 font-semibold text-brown-900">{lastOrder.customer.fullName}</p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brown-500">Phone</p>
                <p className="mt-2 font-semibold text-brown-900">{lastOrder.customer.phone}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brown-500">Delivery Address</p>
              <p className="mt-2 body-copy">
                {lastOrder.customer.address}, {lastOrder.customer.city}, {lastOrder.customer.postalCode}
              </p>
            </div>

            <div className="space-y-3 border-y border-brown-200 py-4">
              {lastOrder.items.map((item) => (
                <div key={item.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-brown-900">{item.name}</p>
                    <p className="text-sm text-brown-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-spice-700">{formatLkr(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-lg font-semibold text-spice-700">
              <span>Final Total</span>
              <span>{formatLkr(lastOrder.total)}</span>
            </div>
          </div>

          <Notification message={copyMessage} tone="success" onDismiss={() => setCopyMessage('')} autoDismissAfter={2500} />

          <aside className="card-surface space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-tea-700">Success</p>
            <p className="body-copy">
              Your CeylonCart order is confirmed. You can return to the shop and continue browsing.
            </p>
            <Link to="/" className="primary-button w-full">
              Return to Shop
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}