/**
 * HomePage - Amazon-style hero, category cards, and featured products
 */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import './HomePage.css';

const HERO_SLIDES = [
  {
    bg: 'linear-gradient(135deg, #131921 0%, #232f3e 100%)',
    headline: 'Great Indian Festival',
    sub: 'Up to 80% off on Electronics, Fashion, Home & more',
    cta: 'Shop Now',
    link: '/products',
    img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop',
  },
  {
    bg: 'linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 100%)',
    headline: 'New Arrivals in Electronics',
    sub: 'Latest smartphones, laptops & accessories',
    cta: 'Explore Electronics',
    link: '/products?category_slug=electronics',
    img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&auto=format&fit=crop',
  },
  {
    bg: 'linear-gradient(135deg, #1a1a3e 0%, #2d2d7a 100%)',
    headline: 'Books for Every Reader',
    sub: 'Bestsellers, new releases, and more',
    cta: 'Browse Books',
    link: '/products?category_slug=books',
    img: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&auto=format&fit=crop',
  },
];

export default function HomePage() {
  const [featured,   setFeatured]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [slide,      setSlide]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([productsAPI.featured(12), categoriesAPI.list()])
      .then(([pRes, cRes]) => {
        const pData = pRes.data;
        const cData = cRes.data;
        setFeatured(Array.isArray(pData) ? pData : (pData?.products || []));
        setCategories(Array.isArray(cData) ? cData : (cData?.categories || []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Auto-rotate hero
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const CAT_ICONS = {
    'electronics':    '📱',
    'books':          '📚',
    'clothing':       '👗',
    'home-kitchen':   '🏠',
    'sports-fitness': '🏋️',
    'beauty-personal':'💄',
    'toys-games':     '🎮',
    'grocery':        '🛒',
  };

  return (
    <div className="home-page">

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <section className="hero" style={{ background: HERO_SLIDES[slide].bg }}>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-headline">{HERO_SLIDES[slide].headline}</h1>
            <p  className="hero-sub">{HERO_SLIDES[slide].sub}</p>
            <button className="hero-cta" onClick={() => navigate(HERO_SLIDES[slide].link)}>
              {HERO_SLIDES[slide].cta}
            </button>
          </div>
          <img
            src={HERO_SLIDES[slide].img}
            alt="hero"
            className="hero-img"
            onError={e => e.target.style.display = 'none'}
          />
        </div>
        <div className="hero-dots">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === slide ? 'active' : ''}`}
              onClick={() => setSlide(i)}
            />
          ))}
        </div>
      </section>

      <div className="container">

        {/* ── Category Grid ──────────────────────────────────────────────── */}
        <section className="section">
          <h2 className="section-title">Shop by Category</h2>
          <div className="cat-grid">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category_slug=${cat.slug}`}
                className="cat-card"
              >
                <span className="cat-emoji">{CAT_ICONS[cat.slug] || '🛍️'}</span>
                <span className="cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Featured Products ───────────────────────────────────────────── */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Top Deals of the Day</h2>
            <Link to="/products" className="see-all">See all deals →</Link>
          </div>
          {loading ? (
            <div className="spinner" />
          ) : (
            <div className="products-row">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

        {/* ── Deal Banner ─────────────────────────────────────────────────── */}
        <section className="deal-banner">
          <div className="deal-left">
            <span className="deal-tag">Limited Time Deal</span>
            <h3>Electronics Sale — Up to 40% Off</h3>
            <p>On phones, laptops, headphones and more</p>
            <Link to="/products?category_slug=electronics" className="btn-orange">
              Shop Electronics
            </Link>
          </div>
          <div className="deal-right">
            <img
              src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500&auto=format&fit=crop"
              alt="Electronics sale"
              onError={e => e.target.style.display = 'none'}
            />
          </div>
        </section>

        {/* ── Books + Home dual banner ────────────────────────────────────── */}
        <div className="dual-banner">
          <div className="dual-card" onClick={() => navigate('/products?category_slug=books')}>
            <h3>Bestselling Books</h3>
            <p>Discover your next favourite read</p>
            <span className="dual-cta">Shop Books →</span>
            <img
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop"
              alt="Books"
              onError={e => e.target.style.display = 'none'}
            />
          </div>
          <div className="dual-card" onClick={() => navigate('/products?category_slug=home-kitchen')}>
            <h3>Home &amp; Kitchen</h3>
            <p>Transform your living space</p>
            <span className="dual-cta">Shop Now →</span>
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&auto=format&fit=crop"
              alt="Home & Kitchen"
              onError={e => e.target.style.display = 'none'}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
