import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { createOrder, simulatePayment } from '../services/api';
import { useCart } from '../context/CartContext';
import Notification from '../components/Notification';

function formatLkr(amount) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function readCheckoutDetails() {
  try {
    const storedDetails = window.sessionStorage.getItem('ceyloncart-customer-details');
    return storedDetails ? JSON.parse(storedDetails) : null;
  } catch {
    return null;
  }
}

export default function PaymentPage() {
  const { items, total, clearCart, setLastOrder } = useCart();
  const navigate = useNavigate();
  const checkoutDetails = useMemo(() => readCheckoutDetails(), []);
  const [formData, setFormData] = useState({
    cardholderName: checkoutDetails?.fullName || '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState('info');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sandboxEnabled] = useState(() => {
    try {
      const raw = window.localStorage.getItem('ceyloncart-simulated-payment');
      return raw === null ? true : raw === 'true';
    } catch (_) {
      return true;
    }
  });
  const hideStatusTimer = useRef(null);

  useEffect(() => {
    if (!checkoutDetails) {
      navigate('/checkout', {
        replace: true,
        state: { message: 'Checkout details are missing. Please enter them again.' },
      });
    }
  }, [checkoutDetails, navigate]);

  useEffect(() => () => window.clearTimeout(hideStatusTimer.current), []);

  if (!checkoutDetails) {
    return null;
  }

  if (items.length === 0) {
    return <Navigate to="/" replace state={{ message: 'Your cart is empty. Please add products before paying.' }} />;
  }

  const setTransientStatus = (message, tone = 'info', duration = 2500) => {
    setStatusMessage(message);
    setStatusTone(tone);
    window.clearTimeout(hideStatusTimer.current);
    hideStatusTimer.current = window.setTimeout(() => setStatusMessage(''), duration);
  };

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

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsProcessing(true);
    setTransientStatus('Processing...', 'info', 2000);

    const paymentResult = await simulatePayment({
      cardNumber: formData.cardNumber,
      cardholderName: formData.cardholderName,
      expiryDate: formData.expiryDate,
      cvv: formData.cvv,
    }).catch((error) => ({ success: false, message: error.message }));

    if (!paymentResult.success) {
      setIsProcessing(false);
      setTransientStatus(paymentResult.message || 'Payment failed.', 'error', 3500);
      return;
    }

    const orderResponse = await createOrder({
      customer: checkoutDetails,
      items,
      total,
      paymentStatus: 'paid',
    }).catch((error) => ({ success: false, message: error.message }));

    if (!orderResponse || !orderResponse.orderId) {
      setIsProcessing(false);
      setTransientStatus(orderResponse?.message || 'API request failed.', 'error', 3500);
      return;
    }

    setLastOrder(orderResponse);
    clearCart();
    window.sessionStorage.removeItem('ceyloncart-customer-details');
    setIsProcessing(false);
    navigate('/confirmation');
  };

  return (
    <section className="page-container py-10 sm:py-14">
      <div className="space-y-8">
        <div className="card space-y-3">
          <h1 className="heading-xl">Payment</h1>
          <p className="body-copy">Complete the fictional payment form to place your order.</p>
        </div>

        <Notification message={statusMessage} tone={statusTone} autoDismissAfter={statusTone === 'error' ? 3500 : 2000} onDismiss={() => setStatusMessage('')} />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_0.95fr] lg:items-start">
          <form className="card space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="rounded-2xl border border-spice-200 bg-spice-50 px-4 py-3 text-sm text-brown-800 flex items-center justify-between">
              This is a fictional payment form. Do not enter a real card.
              <span className="ml-3 inline-flex items-center rounded-full bg-cream-200 px-2 py-0.5 text-xs font-semibold text-brown-800">
                {sandboxEnabled ? 'Sandbox' : 'Live (not configured)'}
              </span>
            </div>

            <div className="rounded-2xl border border-tea-200 bg-tea-50 px-4 py-3 text-sm text-brown-800 space-y-2">
              <p className="font-semibold">Test cards</p>
              <p>4242 4242 4242 4242 returns payment success.</p>
              <p>4000 0000 0000 0002 returns payment failure.</p>
              <p>Any other number returns payment failure.</p>
            </div>

            <div className="grid gap-5">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-brown-700">Order total</span>
                <input className="form-input bg-cream-50" value={formatLkr(total)} readOnly />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-brown-700">Cardholder name</span>
                <input className="form-input" name="cardholderName" value={formData.cardholderName} onChange={handleChange} />
                {errors.cardholderName ? <p className="text-sm font-medium text-red-700">{errors.cardholderName}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-brown-700">Card number</span>
                <input className="form-input" name="cardNumber" value={formData.cardNumber} onChange={handleChange} inputMode="numeric" placeholder="4242 4242 4242 4242" />
                {errors.cardNumber ? <p className="text-sm font-medium text-red-700">{errors.cardNumber}</p> : null}
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-brown-700">Expiry date</span>
                  <input className="form-input" name="expiryDate" value={formData.expiryDate} onChange={handleChange} placeholder="MM/YY" />
                  {errors.expiryDate ? <p className="text-sm font-medium text-red-700">{errors.expiryDate}</p> : null}
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-brown-700">CVV</span>
                  <input className="form-input" name="cvv" value={formData.cvv} onChange={handleChange} inputMode="numeric" placeholder="123" />
                  {errors.cvv ? <p className="text-sm font-medium text-red-700">{errors.cvv}</p> : null}
                </label>
              </div>
            </div>

            <button
              type="submit"
              className={`primary-button w-full sm:w-auto ${isProcessing ? 'opacity-80 cursor-wait' : ''}`}
              disabled={isProcessing}
              aria-busy={isProcessing}
            >
              {isProcessing ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                'Pay Now'
              )}
            </button>
          </form>

          <aside className="card-surface space-y-4">
            <h2 className="heading-lg">Checkout details</h2>
            <div className="space-y-3 border-y border-brown-200 py-4 text-sm text-brown-700">
              <p><span className="font-semibold text-brown-900">Name:</span> {checkoutDetails.fullName}</p>
              <p><span className="font-semibold text-brown-900">Email:</span> {checkoutDetails.email}</p>
              <p><span className="font-semibold text-brown-900">Phone:</span> {checkoutDetails.phone}</p>
              <p><span className="font-semibold text-brown-900">Address:</span> {checkoutDetails.address}</p>
              <p><span className="font-semibold text-brown-900">City:</span> {checkoutDetails.city}</p>
              <p><span className="font-semibold text-brown-900">Postal code:</span> {checkoutDetails.postalCode}</p>
            </div>
            <Link to="/checkout" className="secondary-button w-full">
              Back to Checkout
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}