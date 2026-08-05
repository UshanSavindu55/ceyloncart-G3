import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Notification from '../components/Notification';

function formatLkr(amount) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function countDigits(value) {
  return (value.match(/\d/g) || []).length;
}

export default function CheckoutPage() {
  const { items, total, setLastOrder } = useCart();
  const [sandboxEnabled, setSandboxEnabled] = useSandboxSetting();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [errors, setErrors] = useState({});

  if (items.length === 0) {
    return <Navigate to="/" replace state={{ message: 'Your cart was empty, so we sent you back to the catalogue.' }} />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentValues) => ({ ...currentValues, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }));
  };

  const validate = () => {
    const nextErrors = {};

    Object.entries(formData).forEach(([fieldName, value]) => {
      if (!value.trim()) {
        nextErrors[fieldName] = 'This field is required.';
      }
    });

    if (formData.email.trim() && !isValidEmail(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (formData.phone.trim() && countDigits(formData.phone) < 8) {
      nextErrors.phone = 'Enter a valid phone number.';
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const customerDetails = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      postalCode: formData.postalCode.trim(),
    };

    window.sessionStorage.setItem('ceyloncart-customer-details', JSON.stringify(customerDetails));
    setLastOrder({
      customerDetails,
      cartTotal: total,
      itemCount: items.length,
      createdAt: new Date().toISOString(),
    });
    navigate('/payment');
  };

  return (
    <section className="page-container py-10 sm:py-14">
      <div className="space-y-8">
        <Notification message={location.state?.message} tone="warning" autoDismissAfter={3500} />

        <div className="card space-y-3">
          <h1 className="heading-xl">Checkout</h1>
          <p className="body-copy">Enter your delivery details to continue to payment.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_0.9fr] lg:items-start">
          <form className="card space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                ['fullName', 'Full name'],
                ['email', 'Email address'],
                ['phone', 'Phone number'],
                ['city', 'City'],
                ['postalCode', 'Postal code'],
              ].map(([name, label]) => (
                <label key={name} className="space-y-2 sm:col-span-1">
                  <span className="text-sm font-semibold text-brown-700">{label}</span>
                  <input
                    className="form-input"
                    type={name === 'email' ? 'email' : 'text'}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                  />
                  {errors[name] ? <p className="text-sm font-medium text-red-700">{errors[name]}</p> : null}
                </label>
              ))}
            </div>

            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-brown-700">Delivery address</span>
              <textarea
                className="form-input min-h-32"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={5}
              />
              {errors.address ? <p className="text-sm font-medium text-red-700">{errors.address}</p> : null}
            </label>

            <button type="submit" className="primary-button w-full sm:w-auto">
              Continue to Payment
            </button>
          </form>

          <aside className="card-surface space-y-4">
            <h2 className="heading-lg">Order summary</h2>
            <div className="space-y-3 border-y border-brown-200 py-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-brown-800">
                    {item.name} x {item.quantity}
                  </span>
                  <span className="font-semibold text-brown-900">{formatLkr(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-lg font-semibold text-spice-700">
              <span>Total</span>
              <span>{formatLkr(total)}</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={sandboxEnabled}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setSandboxEnabled(next);
                      try {
                        window.localStorage.setItem('ceyloncart-simulated-payment', String(next));
                      } catch (_) {}
                    }}
                  />
                  <span className="font-medium">Use simulated payments</span>
                </label>
                <span className="text-xs text-brown-600">{sandboxEnabled ? 'Sandbox' : 'Live (not configured)'}</span>
              </div>

              <Link to="/cart" className="secondary-button w-full">
                Review Cart
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

// local state initializer for sandbox toggle (keeps file-scope small)
function useSandboxSetting() {
  const [sandboxEnabled, setSandboxEnabled] = useState(() => {
    try {
      const raw = window.localStorage.getItem('ceyloncart-simulated-payment');
      return raw === null ? true : raw === 'true';
    } catch (_) {
      return true;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('ceyloncart-simulated-payment', String(sandboxEnabled));
    } catch (_) {}
  }, [sandboxEnabled]);

  return [sandboxEnabled, setSandboxEnabled];
}