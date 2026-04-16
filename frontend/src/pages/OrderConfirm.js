/**
 * OrderConfirm - Success page after placing order
 */
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaTruck, FaBoxOpen } from 'react-icons/fa';
import { ordersAPI } from '../services/api';
import './OrderConfirm.css';

export default function OrderConfirm() {
  const { id } = useParams();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.detail(id).then(r => setOrder(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" />;
  if (!order)  return <div className="container" style={{ padding: 40 }}><h2>Order not found</h2></div>;

  return (
    <div className="confirm-page container">
      <div className="confirm-box">
        <FaCheckCircle className="confirm-icon" />
        <h1>Order Placed Successfully!</h1>
        <p className="confirm-sub">
          Thank you for your order. You'll receive a confirmation email shortly.
        </p>

        <div className="order-id-box">
          <span>Order ID</span>
          <strong>#{order.id}</strong>
        </div>

        <div className="confirm-details">
          <div className="confirm-section">
            <h3><FaTruck /> Shipping to</h3>
            <p><strong>{order.shipping_name}</strong></p>
            <p>{order.shipping_address}</p>
            <p>{order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}</p>
            <p>📱 {order.shipping_phone}</p>
          </div>

          <div className="confirm-section">
            <h3><FaBoxOpen /> Order Items ({order.items.length})</h3>
            {order.items.map(item => (
              <div key={item.id} className="confirm-item">
                {item.product_image && (
                  <img src={item.product_image} alt={item.product_name}
                    onError={e => e.target.style.display='none'} />
                )}
                <div>
                  <p className="confirm-item-name">{item.product_name}</p>
                  <p className="confirm-item-meta">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                </div>
                <span className="confirm-item-total">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="confirm-totals">
            <div className="tot-row"><span>Subtotal</span><span>₹{order.subtotal.toLocaleString('en-IN')}</span></div>
            <div className="tot-row"><span>Shipping</span><span>{order.shipping_cost > 0 ? `₹${order.shipping_cost}` : 'FREE'}</span></div>
            <div className="tot-row grand"><span>Total</span><span>₹{order.total.toLocaleString('en-IN')}</span></div>
            <div className="tot-row"><span>Payment</span><span>{order.payment_method}</span></div>
          </div>
        </div>

        <div className="confirm-actions">
          <Link to="/orders" className="btn-primary" style={{ padding: '10px 24px', display: 'inline-block' }}>
            View All Orders
          </Link>
          <Link to="/products" className="btn-orange" style={{ padding: '10px 24px', display: 'inline-block' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
