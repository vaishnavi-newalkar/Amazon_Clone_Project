/**
 * Navbar - Amazon-style top navigation with search, cart, and user menus
 */
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiMapPin, FiMenu, FiX } from 'react-icons/fi';
import { FaUser, FaHeart, FaBoxOpen, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { categoriesAPI } from '../../services/api';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cart } = useCart();
  const navigate  = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery]     = useState(searchParams.get('search') || '');
  const [categories,  setCategories]      = useState([]);
  const [selectedCat, setSelectedCat]     = useState('all');
  const [showUserMenu, setShowUserMenu]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    categoriesAPI.list().then(r => setCategories(r.data)).catch(() => {});
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const params = new URLSearchParams();
    params.set('search', searchQuery.trim());
    if (selectedCat !== 'all') params.set('category_slug', selectedCat);
    navigate(`/products?${params}`);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div className="navbar-top">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-text">amazon</span>
          <span className="logo-dot">.in</span>
        </Link>

        {/* Delivery Location */}
        <div className="navbar-location">
          <FiMapPin size={16} />
          <div>
            <span className="location-label">Deliver to</span>
            <span className="location-value">India</span>
          </div>
        </div>

        {/* Search Bar */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <select
            className="search-category"
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
          >
            <option value="all">All</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <input
            type="text"
            className="search-input"
            placeholder="Search Amazon.in"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn" aria-label="Search">
            <FiSearch size={20} />
          </button>
        </form>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Account */}
          <div
            className="nav-item account-menu"
            ref={userMenuRef}
            onClick={() => isAuthenticated ? setShowUserMenu(p => !p) : navigate('/login')}
          >
            <span className="nav-label">
              {isAuthenticated ? `Hello, ${user?.full_name?.split(' ')[0]}` : 'Hello, sign in'}
            </span>
            <span className="nav-main">Account &amp; Lists ▾</span>

            {showUserMenu && isAuthenticated && (
              <div className="user-dropdown">
                <Link to="/account" onClick={() => setShowUserMenu(false)}>
                  <FaUser /> Your Account
                </Link>
                <Link to="/orders" onClick={() => setShowUserMenu(false)}>
                  <FaBoxOpen /> Your Orders
                </Link>
                <Link to="/wishlist" onClick={() => setShowUserMenu(false)}>
                  <FaHeart /> Wishlist
                </Link>
                <button onClick={handleLogout}>
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Orders */}
          <Link to={isAuthenticated ? "/orders" : "/login"} className="nav-item">
            <span className="nav-label">Returns</span>
            <span className="nav-main">&amp; Orders</span>
          </Link>

          {/* Wishlist */}
          <Link to={isAuthenticated ? "/wishlist" : "/login"} className="nav-item nav-wishlist">
            <FaHeart size={22} />
          </Link>

          {/* Cart */}
          <Link to="/cart" className="nav-item nav-cart">
            <div className="cart-icon-wrap">
              <FiShoppingCart size={28} />
              <span className="cart-count">{cart.item_count || 0}</span>
            </div>
            <span className="nav-main">Cart</span>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(p => !p)}>
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* ── Category Nav Bar ──────────────────────────────────────────────── */}
      <nav className="navbar-cats">
        <div className="cats-inner">
          <Link to="/products" className="cat-link">All Products</Link>
          {categories.slice(0, 8).map(c => (
            <Link
              key={c.id}
              to={`/products?category_slug=${c.slug}`}
              className="cat-link"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Mobile Menu ───────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <form className="mobile-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit"><FiSearch /></button>
          </form>
          <div className="mobile-links">
            {isAuthenticated ? (
              <>
                <Link to="/account"  onClick={() => setMobileMenuOpen(false)}>Your Account</Link>
                <Link to="/orders"   onClick={() => setMobileMenuOpen(false)}>Orders</Link>
                <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>Wishlist</Link>
                <Link to="/cart"     onClick={() => setMobileMenuOpen(false)}>Cart ({cart.item_count})</Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login"  onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Create Account</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
