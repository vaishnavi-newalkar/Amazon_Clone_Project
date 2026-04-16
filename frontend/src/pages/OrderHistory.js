/**
 * OrderHistory - List all past orders with cancel option
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaChevronDown, FaChevronUp, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { ordersAPI } from '../services/api';

const STATUS_COLOR = {
  confirmed:  { bg: '#e8f5e9', color: '#2e7d32' },
  processing: { bg: '#fff3e0', color: '#e65100' },
  shipped:    { bg: '#e3f2fd', color: '#1565c0' },
  delivered:  { bg: '#e8f5e9', color: '#1b5e20' },
  cancelled:  { bg: '#ffebee', color: '#c62828' },
  pending:    { bg: '#f5f5f5', color: '#555' },
};

const CANCELLABLE = ['confirmed', 'processing'];

const OrderTracker = ({ status }) => {
  if (status === 'cancelled') return null;
  
  const stages = ['confirmed', 'processing', 'shipped', 'delivered'];
  const currentIndex = stages.indexOf(status);
  
  return (
    <div style={{ padding: '20px 0', margin: '10px 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '27px', left: '10%', right: '10%', height: '4px', background: '#eee', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '27px', left: '10%', right: `${100 - ((currentIndex) / (stages.length - 1)) * 100}%`, height: '4px', background: '#2e7d32', zIndex: 1, transition: 'right 0.3s' }} />
      
      {stages.map((stage, i) => {
        const isCompleted = currentIndex >= i;
        const isCurrent = currentIndex === i;
        return (
          <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative', width: '25%' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: isCompleted ? '#2e7d32' : '#ddd', border: `3px solid ${isCurrent ? '#fff' : 'transparent'}`, boxShadow: isCurrent ? '0 0 0 2px #2e7d32' : 'none', marginBottom: 8, transition: 'all 0.3s' }} />
            <span style={{ fontSize: 11, fontWeight: isCurrent ? 700 : 500, color: isCompleted ? '#2e7d32' : '#888', textTransform: 'uppercase' }}>
              {stage}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function OrderHistory() {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [expanded,   setExpanded]   = useState({});
  const [cancelling, setCancelling] = useState({});

  useEffect(() => {
    ordersAPI.history().then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This cannot be undone.')) return;
    setCancelling(p => ({ ...p, [orderId]: true }));
    try {
      const res = await ordersAPI.cancel(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
      toast.success(`Order #${orderId} has been cancelled.`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to cancel order');
    } finally {
      setCancelling(p => ({ ...p, [orderId]: false }));
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="container" style={{ padding: '16px 0 40px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 400, marginBottom: 20 }}>Your Orders</h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 4, border: '1px solid #ddd' }}>
          <FaBoxOpen style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
          <h2>No orders yet</h2>
          <p style={{ color: '#666', marginBottom: 20 }}>You haven't placed any orders</p>
          <Link to="/products" className="btn-orange" style={{ padding: '10px 24px', display: 'inline-block' }}>Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => {
            const sc = STATUS_COLOR[order.status] || STATUS_COLOR.pending;
            const isOpen = expanded[order.id];
            const canCancel = CANCELLABLE.includes(order.status);
            return (
              <div key={order.id} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 4, overflow: 'hidden' }}>
                {/* Header row */}
                <div
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: '14px 20px', cursor: 'pointer', background: '#f5f5f5', alignItems: 'center' }}
                  onClick={() => toggle(order.id)}
                >
                  <div>
                    <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order placed</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Total</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>₹{order.total.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{
                      ...sc, fontSize: 12, fontWeight: 700,
                      padding: '3px 10px', borderRadius: 12, textTransform: 'capitalize'
                    }}>
                      {order.status}
                    </span>
                    <div style={{ fontSize: 12, color: '#555' }}>Order #{order.id}</div>
                    {isOpen ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
                  </div>
                </div>

                {/* Expanded details */}
                {isOpen && (
                  <div style={{ padding: '16px 20px' }}>
                    
                    {/* Visual Tracking Timeline */}
                    <OrderTracker status={order.status} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }}>
                      <div>
                        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Delivery Address</h4>
                        <p style={{ fontSize: 13 }}><strong>{order.shipping_name}</strong></p>
                        <p style={{ fontSize: 13, color: '#555' }}>{order.shipping_address}</p>
                        <p style={{ fontSize: 13, color: '#555' }}>{order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}</p>
                      </div>
                      <div>
                        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Payment</h4>
                        <p style={{ fontSize: 13 }}>{order.payment_method}</p>
                        <p style={{ fontSize: 13, color: '#555' }}>
                          Subtotal: ₹{order.subtotal.toLocaleString('en-IN')}<br />
                          Shipping: {order.shipping_cost > 0 ? `₹${order.shipping_cost}` : 'FREE'}<br />
                          <strong>Total: ₹{order.total.toLocaleString('en-IN')}</strong>
                        </p>
                      </div>
                    </div>

                    <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Items</h4>
                    {order.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #eee' }}>
                        {item.product_image && (
                          <img src={item.product_image} alt={item.product_name}
                            style={{ width: 56, height: 56, objectFit: 'contain' }}
                            onError={e => e.target.style.display = 'none'} />
                        )}
                        <div style={{ flex: 1 }}>
                          <Link to={`/products/${item.product_id}`} style={{ fontSize: 14, color: '#007185' }}>
                            {item.product_name}
                          </Link>
                          <p style={{ fontSize: 12, color: '#888' }}>Qty: {item.quantity}</p>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}

                    {/* Cancel Button */}
                    {canCancel && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <button
                          onClick={() => handleCancel(order.id)}
                          disabled={cancelling[order.id]}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '8px 18px', border: '1px solid #c62828',
                            borderRadius: 4, background: '#fff', color: '#c62828',
                            fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.15s',
                            opacity: cancelling[order.id] ? 0.7 : 1,
                          }}
                          onMouseOver={e => { if (!cancelling[order.id]) e.currentTarget.style.background = '#ffebee'; }}
                          onMouseOut={e => { e.currentTarget.style.background = '#fff'; }}
                        >
                          <FaTimesCircle />
                          {cancelling[order.id] ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                        <span style={{ fontSize: 12, color: '#888' }}>
                          Orders can only be cancelled while Confirmed or Processing.
                        </span>
                      </div>
                    )}

                    {order.status === 'cancelled' && (
                      <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #eee', fontSize: 13, color: '#c62828', fontWeight: 600 }}>
                        ✗ This order has been cancelled. Stock has been restored.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
