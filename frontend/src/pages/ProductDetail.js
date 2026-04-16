/**
 * ProductDetail - Full product page with image carousel, specs, add to cart
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaStar, FaStarHalfAlt, FaRegStar, FaHeart, FaRegHeart, FaShieldAlt, FaTruck } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight, FiMinus, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { productsAPI } from '../services/api';
import { useCart }     from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth }     from '../context/AuthContext';
import './ProductDetail.css';

const StarRating = ({ rating, count }) => {
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (rating >= i + 1)   return <FaStar key={i} />;
    if (rating >= i + 0.5) return <FaStarHalfAlt key={i} />;
    return <FaRegStar key={i} />;
  });
  return (
    <div className="detail-rating">
      <span className="stars">{stars}</span>
      <span className="stars-count">{rating.toFixed(1)} ({count?.toLocaleString()} ratings)</span>
    </div>
  );
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart }     = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product,   setProduct]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [imgIndex,  setImgIndex]  = useState(0);
  const [quantity,  setQuantity]  = useState(1);
  const [adding,    setAdding]    = useState(false);

  useEffect(() => {
    setLoading(true);
    productsAPI.detail(id)
      .then(r => setProduct(r.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!product) return (
    <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
      <h2>Product not found</h2>
      <Link to="/products">← Back to products</Link>
    </div>
  );

  const images = product.images?.length ? product.images : ['https://placehold.co/500x500?text=No+Image'];
  const inWishlist = isInWishlist(product.id);
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.info('Please sign in'); navigate('/login'); return; }
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add to cart');
    } finally { setAdding(false); }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
      navigate('/checkout');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error');
    } finally { setAdding(false); }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.info('Please sign in'); return; }
    await toggleWishlist(product.id);
    toast.success(inWishlist ? 'Removed from wishlist' : 'Saved to wishlist ♥');
  };

  return (
    <div className="detail-page container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Home</Link> &rsaquo;
        <Link to="/products">Products</Link> &rsaquo;
        {product.category && (
          <><Link to={`/products?category_slug=${product.category.slug}`}>{product.category.name}</Link> &rsaquo;</>
        )}
        <span>{product.name.slice(0, 40)}…</span>
      </nav>

      <div className="detail-layout">
        {/* ── Image Column ──────────────────────────────────────────────── */}
        <div className="detail-images">
          {/* Thumbnails */}
          <div className="thumb-col">
            {images.map((img, i) => (
              <button
                key={i}
                className={`thumb ${i === imgIndex ? 'active' : ''}`}
                onClick={() => setImgIndex(i)}
              >
                <img src={img} alt={`${product.name} ${i + 1}`}
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/60x60?text=No+Image'; }} />
              </button>
            ))}
          </div>

          {/* Main image with carousel nav */}
          <div className="main-image-wrap">
            {images.length > 1 && (
              <button className="img-nav left" onClick={() => setImgIndex(i => Math.max(0, i - 1))}>
                <FiChevronLeft size={20} />
              </button>
            )}
            <img
              src={images[imgIndex]}
              alt={product.name}
              className="main-image"
              onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/500x500?text=No+Image'; }}
            />
            {images.length > 1 && (
              <button className="img-nav right" onClick={() => setImgIndex(i => Math.min(images.length - 1, i + 1))}>
                <FiChevronRight size={20} />
              </button>
            )}
            <div className="img-dots">
              {images.map((_, i) => (
                <button key={i} className={`img-dot ${i === imgIndex ? 'active' : ''}`} onClick={() => setImgIndex(i)} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Info Column ───────────────────────────────────────────────── */}
        <div className="detail-info">
          {product.brand && <p className="detail-brand">Brand: <Link to={`/products?search=${product.brand}`}>{product.brand}</Link></p>}
          <h1 className="detail-name">{product.name}</h1>

          <StarRating rating={product.rating} count={product.review_count} />

          <hr className="divider" />

          {/* Price block */}
          <div className="detail-price-block">
            <div className="detail-price">
              <span style={{ fontSize: 14, verticalAlign: 'super' }}>₹</span>
              <span className="price-big">{product.price?.toLocaleString('en-IN')}</span>
            </div>
            {product.original_price && (
              <div className="detail-mrp">
                M.R.P.: <s>₹{product.original_price?.toLocaleString('en-IN')}</s>
                {discount > 0 && <span className="detail-disc">  ({discount}% off)</span>}
              </div>
            )}
            <p style={{ color: '#007600', fontSize: 13, marginTop: 4 }}>Inclusive of all taxes</p>
          </div>

          <p className="tag-prime" style={{ fontSize: 13, margin: '8px 0' }}>✓ FREE Delivery by Amazon on orders over ₹499</p>

          <hr className="divider" />

          {/* Stock */}
          <div className="detail-stock">
            {product.in_stock
              ? <span style={{ color: '#007600', fontWeight: 600 }}>In Stock</span>
              : <span style={{ color: 'var(--amazon-red)', fontWeight: 600 }}>Currently unavailable</span>}
            {product.in_stock && product.stock <= 10 && (
              <span style={{ color: 'var(--amazon-red)', fontSize: 13 }}> — Only {product.stock} left!</span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="detail-desc">{product.description}</p>
          )}

          <hr className="divider" />

          {/* Quantity selector */}
          {product.in_stock && (
            <div className="qty-row">
              <span className="qty-label">Qty:</span>
              <div className="qty-control">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><FiMinus /></button>
                <span className="qty-val">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}><FiPlus /></button>
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="detail-ctas">
            <button
              className="btn-add-cart"
              onClick={handleAddToCart}
              disabled={!product.in_stock || adding}
            >
              {adding ? 'Adding…' : 'Add to Cart'}
            </button>
            <button
              className="btn-buy-now"
              onClick={handleBuyNow}
              disabled={!product.in_stock || adding}
            >
              Buy Now
            </button>
            <button className="btn-wishlist" onClick={handleWishlist}>
              {inWishlist ? <FaHeart color="#c45500" /> : <FaRegHeart />}
              {inWishlist ? 'Saved' : 'Save for later'}
            </button>
          </div>

          {/* Trust signals */}
          <div className="trust-badges">
            <div className="trust-item"><FaTruck /> <span>Free delivery above ₹499</span></div>
            <div className="trust-item"><FaShieldAlt /> <span>Secure transaction</span></div>
          </div>
        </div>

        {/* ── Specs Column ──────────────────────────────────────────────── */}
        <aside className="detail-specs">
          <div className="specs-box">
            <h3>Product Details</h3>
            <table className="specs-table">
              <tbody>
                {product.category && (
                  <tr><td>Category</td><td>{product.category.name}</td></tr>
                )}
                {Object.entries(product.specifications || {}).map(([k, v]) => (
                  <tr key={k}><td>{k}</td><td>{v}</td></tr>
                ))}
                <tr><td>Item model</td><td>#{product.id}</td></tr>
              </tbody>
            </table>
          </div>
        </aside>
      </div>
    </div>
  );
}
