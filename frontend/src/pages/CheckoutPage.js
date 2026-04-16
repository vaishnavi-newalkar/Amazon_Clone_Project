/**
 * CheckoutPage - Shipping address + payment + order summary
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { ordersAPI } from '../services/api';
import { useCart }   from '../context/CartContext';
import { useAuth }   from '../context/AuthContext';
import { usePincodeValidator } from '../hooks/usePincodeValidator';
import './CheckoutPage.css';

const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

const PAYMENT_METHODS = [
  { value: 'COD',        label: 'Cash on Delivery' },
  { value: 'UPI',        label: 'UPI / PhonePe / GPay' },
  { value: 'CARD',       label: 'Credit / Debit Card' },
  { value: 'NETBANKING', label: 'Net Banking' },
];

const F = ({ label, name, type = 'text', required, children, half, form, set, errors }) => (
  <div className={`form-group ${half ? 'half' : ''}`}>
    <label className="form-label">{label}{required && <span className="req">*</span>}</label>
    {children || (
      <input
        className={`form-input ${errors[name] ? 'error' : ''}`}
        type={type}
        value={form[name]}
        onChange={e => set(name, e.target.value)}
        placeholder={label}
      />
    )}
    {errors[name] && <span className="form-error">{errors[name]}</span>}
  </div>
);

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();

  const [form, setForm] = useState({
    shipping_name:    user?.full_name    || '',
    shipping_phone:   user?.phone        || '',
    shipping_address: user?.address      || '',
    shipping_city:    user?.city         || '',
    shipping_state:   user?.state        || '',
    shipping_pincode: user?.pincode      || '',
    payment_method:   'COD',
  });
  const { pincodeStatus, pincodeInfo, validatePincode } = usePincodeValidator();

  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [step,       setStep]       = useState(1); // 1=address, 2=review

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const handlePincodeChange = (val) => {
    set('shipping_pincode', val);
    validatePincode(val, {
      onSuccess: ({ district, state }) => {
        // Auto-fill city if empty
        setForm(f => ({
          ...f,
          shipping_pincode: val,
          shipping_city:    f.shipping_city  || district,
          shipping_state:   f.shipping_state || state,
        }));
      }
    });
  };

  const validate = () => {
    const e = {};
    if (!form.shipping_name.trim())    e.shipping_name    = 'Full name is required';
    if (!/^\d{10}$/.test(form.shipping_phone))
                                        e.shipping_phone   = 'Enter a valid 10-digit mobile number';
    if (!form.shipping_address.trim()) e.shipping_address = 'Address is required';
    if (!form.shipping_city.trim())    e.shipping_city    = 'City is required';
    if (!form.shipping_state)          e.shipping_state   = 'Select a state';
    if (!/^\d{6}$/.test(form.shipping_pincode))
                                        e.shipping_pincode = 'Enter a valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { data: order } = await ordersAPI.place(form);
      await clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/order-confirm/${order.id}`);
    } catch (err) {
      const msg = err.response?.data?.detail;
      toast.error(Array.isArray(msg) ? msg[0]?.msg : (msg || 'Order failed. Please try again.'));
    } finally { setSubmitting(false); }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <h2>Your cart is empty</h2>
        <button className="btn-primary" onClick={() => navigate('/products')} style={{ marginTop: 12, padding: '10px 24px' }}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page container">
      {/* Header */}
      <div className="checkout-header">
        <h1 className="logo-text" style={{ fontSize: 28, color: '#131921' }}>amazon<span style={{ color: '#FF9900', fontSize: 14 }}>.in</span></h1>
        <div className="checkout-secure"><FaLock size={13} /> Secure Checkout</div>
      </div>

      <div className="checkout-layout">
        {/* ── Left: Address / Review ────────────────────────────────────── */}
        <div className="checkout-form-area">

          {/* Step 1: Address */}
          <div className={`checkout-section ${step === 1 ? '' : 'collapsed'}`}>
            <div className="section-head" onClick={() => setStep(1)}>
              <span className="step-num">1</span>
              <h2>Delivery Address</h2>
              {step !== 1 && <span className="change-btn">Change</span>}
            </div>

            {step === 1 && (
              <div className="form-body">
                <div className="form-row">
                  <F label="Full Name" name="shipping_name" required half form={form} set={set} errors={errors} />
                  <F label="Mobile Number" name="shipping_phone" type="tel" required half form={form} set={set} errors={errors} />
                </div>
                <F label="Address (House No, Street, Area)" name="shipping_address" required form={form} set={set} errors={errors}>
                  <textarea
                    className={`form-input ${errors.shipping_address ? 'error' : ''}`}
                    rows={3}
                    value={form.shipping_address}
                    onChange={e => set('shipping_address', e.target.value)}
                    placeholder="House number, street name, area, landmark"
                  />
                  {errors.shipping_address && <span className="form-error">{errors.shipping_address}</span>}
                </F>
                <div className="form-row">
                  <F label="City / District" name="shipping_city" required half form={form} set={set} errors={errors} />
                  <div className={`form-group half`}>
                    <label className="form-label">Pincode <span className="req">*</span></label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className={`form-input ${errors.shipping_pincode ? 'error' : pincodeStatus === 'valid' ? 'valid' : ''}`}
                        type="tel"
                        maxLength={6}
                        value={form.shipping_pincode}
                        onChange={e => handlePincodeChange(e.target.value)}
                        placeholder="6-digit pincode"
                      />
                      {pincodeStatus === 'loading' && <FaSpinner className="pincode-icon spinning" style={{ color: '#888' }} />}
                      {pincodeStatus === 'valid'   && <FaCheckCircle className="pincode-icon" style={{ color: '#2e7d32' }} />}
                      {pincodeStatus === 'invalid' && <FaTimesCircle className="pincode-icon" style={{ color: '#c62828' }} />}
                    </div>
                    {errors.shipping_pincode && <span className="form-error">{errors.shipping_pincode}</span>}
                    {pincodeStatus === 'valid'   && <span style={{ fontSize: 11, color: '#2e7d32' }}>✓ {pincodeInfo?.district}, {pincodeInfo?.state}</span>}
                    {pincodeStatus === 'invalid' && <span style={{ fontSize: 11, color: '#c62828' }}>✗ Invalid pincode — please check again</span>}
                  </div>
                </div>
                <F label="State" name="shipping_state" required form={form} set={set} errors={errors}>
                  <select
                    className={`form-input ${errors.shipping_state ? 'error' : ''}`}
                    value={form.shipping_state}
                    onChange={e => set('shipping_state', e.target.value)}
                  >
                    <option value="">Select State</option>
                    {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.shipping_state && <span className="form-error">{errors.shipping_state}</span>}
                </F>
                <button className="btn-continue" onClick={() => { if (validate()) setStep(2); }}>
                  Deliver to this address
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Payment & Review */}
          <div className={`checkout-section ${step === 2 ? '' : 'collapsed'}`}>
            <div className="section-head" onClick={() => step === 2 ? null : setStep(2)}>
              <span className="step-num">2</span>
              <h2>Payment Method</h2>
            </div>

            {step === 2 && (
              <div className="form-body">
                <div className="payment-options">
                  {PAYMENT_METHODS.map(pm => (
                    <label key={pm.value} className={`payment-opt ${form.payment_method === pm.value ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value={pm.value}
                        checked={form.payment_method === pm.value}
                        onChange={() => set('payment_method', pm.value)}
                      />
                      {pm.label}
                    </label>
                  ))}
                </div>

                {form.payment_method !== 'COD' && (
                  <div className="mock-payment-note">
                    ℹ️ Payment simulation — no real charge for this demo
                  </div>
                )}

                {/* Review items */}
                <h3 className="review-title">Review Order ({cart.item_count} items)</h3>
                {cart.items.map(item => (
                  <div key={item.id} className="review-item">
                    <img src={item.product.images?.[0] || 'https://via.placeholder.com/60'} alt={item.product.name}
                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/60x60?text=No+Image'; }} />
                    <div className="review-item-info">
                      <p className="review-item-name">{item.product.name}</p>
                      <p className="review-item-qty">Qty: {item.quantity}</p>
                    </div>
                    <span className="review-item-price">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}

                <button
                  className="btn-place-order"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                >
                  {submitting ? 'Placing Order…' : `Place Order — ₹${cart.total.toLocaleString('en-IN')}`}
                </button>
                <p className="order-note">By placing your order, you agree to our terms and conditions.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Summary ─────────────────────────────────────────────── */}
        <div className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="sum-row"><span>Items ({cart.item_count})</span><span>₹{cart.subtotal.toLocaleString('en-IN')}</span></div>
          <div className="sum-row"><span>Delivery</span><span style={{ color: 'green' }}>{cart.shipping_cost > 0 ? `₹${cart.shipping_cost}` : 'FREE'}</span></div>
          <div className="sum-row total-row"><span>Order Total</span><span>₹{cart.total.toLocaleString('en-IN')}</span></div>
          {cart.shipping_cost === 0 && (
            <p className="sum-free">Your order qualifies for FREE Delivery</p>
          )}
        </div>
      </div>
    </div>
  );
}
