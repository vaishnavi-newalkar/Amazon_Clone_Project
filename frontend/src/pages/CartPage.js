/**
 * CartPage - Shopping cart with item management and order summary
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import './CartPage.css';

export default function CartPage() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  const handleQty = async (itemId, qty) => {
    try { await updateItem(itemId, qty); }
    catch (err) { toast.error(err.response?.data?.detail || 'Update failed'); }
  };

  const handleRemove = async (itemId, name) => {
    try {
      await removeItem(itemId);
      toast.success(`Removed "${name.slice(0, 30)}…" from cart`);
    } catch { toast.error('Failed to remove item'); }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="cart-page container">
      <h1 className="cart-title">Shopping Cart</h1>

      {cart.items.length === 0 ? (
        <div className="cart-empty">
          <div className="empty-icon">🛒</div>
          <h2>Your Amazon Cart is empty</h2>
          <p>You have no items in your cart. To buy one or more items, click "Add to cart".</p>
          <Link to="/products" className="btn-primary" style={{ display: 'inline-block', padding: '10px 20px' }}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* ── Items list ──────────────────────────────────────────────── */}
          <div className="cart-items-box">
            <div className="cart-header-row">
              <span />
              <span className="header-price">Price</span>
            </div>

            {cart.items.map(item => (
              <div key={item.id} className="cart-item">
                <Link to={`/products/${item.product_id}`} className="item-img-wrap">
                  <img
                    src={item.product.images?.[0] || 'https://via.placeholder.com/120x120'}
                    alt={item.product.name}
                    onError={e => e.target.src = 'https://via.placeholder.com/120x120'}
                  />
                </Link>

                <div className="item-details">
                  <Link to={`/products/${item.product_id}`} className="item-name">
                    {item.product.name}
                  </Link>
                  {item.product.brand && (
                    <p className="item-brand">{item.product.brand}</p>
                  )}
                  <p className="item-stock-status">
                    {item.product.in_stock
                      ? <span style={{ color: 'var(--amazon-green)' }}>In Stock</span>
                      : <span style={{ color: 'var(--amazon-red)' }}>Out of Stock</span>}
                  </p>
                  <p className="item-prime">✓ Eligible for FREE Delivery</p>

                  {/* Quantity + Remove */}
                  <div className="item-actions">
                    <div className="qty-control">
                      <button
                        onClick={() => item.quantity > 1
                          ? handleQty(item.id, item.quantity - 1)
                          : handleRemove(item.id, item.product.name)
                        }
                      >
                        {item.quantity === 1 ? <FiTrash2 size={13} /> : <FiMinus size={13} />}
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button
                        onClick={() => handleQty(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        <FiPlus size={13} />
                      </button>
                    </div>
                    <span className="sep">|</span>
                    <button
                      className="item-delete"
                      onClick={() => handleRemove(item.id, item.product.name)}
                    >
                      Delete
                    </button>
                    <span className="sep">|</span>
                    <button className="item-save">Save for later</button>
                  </div>
                </div>

                <div className="item-price">
                  ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}

            <div className="cart-subtotal-row">
              Subtotal ({cart.item_count} item{cart.item_count !== 1 ? 's' : ''}):
              <strong> ₹{cart.subtotal.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* ── Order summary ────────────────────────────────────────────── */}
          <div className="order-summary">
            <div className="summary-secure">
              <FaShieldAlt color="green" />
              <span>Your order is secure</span>
            </div>
            <p className="summary-sub">
              Subtotal ({cart.item_count} item{cart.item_count !== 1 ? 's' : ''}):
            </p>
            <div className="summary-total">₹{cart.subtotal.toLocaleString('en-IN')}</div>

            {cart.shipping_cost > 0 ? (
              <p className="summary-shipping">
                + ₹{cart.shipping_cost} shipping
              </p>
            ) : (
              <p className="summary-free-ship">✓ Your order qualifies for FREE Delivery</p>
            )}

            <div className="summary-grand">
              <span>Total:</span>
              <strong>₹{cart.total.toLocaleString('en-IN')}</strong>
            </div>

            <button
              className="btn-checkout"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout ({cart.item_count} item{cart.item_count !== 1 ? 's' : ''})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
