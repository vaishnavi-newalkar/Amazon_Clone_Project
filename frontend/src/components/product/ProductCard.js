/**
 * ProductCard - Amazon-style product listing card
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useCart }     from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth }     from '../../context/AuthContext';
import './ProductCard.css';

// Render 5-star rating
const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i)       stars.push(<FaStar key={i} />);
    else if (rating >= i - 0.5) stars.push(<FaStarHalfAlt key={i} />);
    else                   stars.push(<FaRegStar key={i} />);
  }
  return <span className="stars">{stars}</span>;
};

export default function ProductCard({ product }) {
  const { addToCart }     = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const inWishlist  = isInWishlist(product.id);
  const mainImage   = (product.images && product.images.length > 0) ? product.images[0] : 'https://placehold.co/300x300?text=No+Image';
  const discount    = product.discount_percent || (product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.info('Please sign in to add items to cart'); return; }
    try {
      await addToCart(product.id, 1);
      toast.success(`Added "${product.name.slice(0, 30)}..." to cart`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add to cart');
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.info('Please sign in to save items'); return; }
    try {
      await toggleWishlist(product.id);
      toast.success(inWishlist ? 'Removed from wishlist' : 'Saved to wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="card-link">
        {/* Discount badge */}
        {discount > 0 && (
          <span className="discount-badge">-{discount}%</span>
        )}

        {/* Wishlist button */}
        <button className="wishlist-btn" onClick={handleWishlist} title={inWishlist ? 'Remove from wishlist' : 'Save'}>
          {inWishlist ? <FaHeart color="#c45500" /> : <FaRegHeart />}
        </button>

        {/* Product Image */}
        <div className="card-image-wrap">
          <img
            src={mainImage}
            alt={product.name}
            className="card-image"
            loading="lazy"
            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/300x300?text=No+Image'; }}
          />
        </div>

        {/* Product Info */}
        <div className="card-body">
          <p className="card-name">{product.name}</p>

          {product.brand && <p className="card-brand">by {product.brand}</p>}

          {/* Rating */}
          <div className="card-rating">
            <StarRating rating={product.rating} />
            <span className="stars-count">({product.review_count?.toLocaleString()})</span>
          </div>

          {/* Price */}
          <div className="card-price">
            <span className="price-symbol">₹</span>
            <span className="price-main">{product.price?.toLocaleString('en-IN')}</span>
            {product.original_price && (
              <span className="price-original">
                M.R.P: <s>₹{product.original_price?.toLocaleString('en-IN')}</s>
              </span>
            )}
          </div>

          {/* Prime + shipping */}
          <p className="tag-prime">✓ FREE Delivery by Amazon</p>

          {/* Stock */}
          {!product.in_stock && (
            <p className="out-of-stock">Out of Stock</p>
          )}
        </div>
      </Link>

      {/* Add to cart (outside Link to prevent nested navigation) */}
      <button
        className="card-add-btn"
        onClick={handleAddToCart}
        disabled={!product.in_stock}
      >
        {product.in_stock ? 'Add to Cart' : 'Currently Unavailable'}
      </button>
    </div>
  );
}
