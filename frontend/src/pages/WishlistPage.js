/**
 * WishlistPage - Display saved items
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useWishlist } from '../context/WishlistContext';
import { useCart }     from '../context/CartContext';
import ProductCard     from '../components/product/ProductCard';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveAllToCart = async () => {
    try {
      await Promise.all(wishlist.map(item => addToCart(item.product_id, 1)));
      toast.success('All items added to cart!');
    } catch {
      toast.error('Some items could not be added');
    }
  };

  return (
    <div className="container" style={{ padding: '16px 0 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 400 }}>
          <FaHeart style={{ color: '#c45500', marginRight: 8, verticalAlign: 'middle' }} />
          Your Wishlist ({wishlist.length})
        </h1>
        {wishlist.length > 0 && (
          <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={handleMoveAllToCart}>
            Add All to Cart
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 4, border: '1px solid #ddd' }}>
          <FaHeart style={{ fontSize: 48, color: '#ddd', marginBottom: 16 }} />
          <h2>Your wishlist is empty</h2>
          <p style={{ color: '#666', marginBottom: 20 }}>Save items you like by clicking the heart icon on product cards</p>
          <Link to="/products" className="btn-orange" style={{ padding: '10px 24px', display: 'inline-block' }}>
            Discover Products
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {wishlist.map(item => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
}
