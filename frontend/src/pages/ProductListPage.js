/**
 * ProductListPage - Grid listing with search, category filter, sort
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import './ProductListPage.css';

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Avg. Customer Review' },
];

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [total,       setTotal]       = useState(0);
  const [pages,       setPages]       = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter state (read from URL)
  const search       = searchParams.get('search')        || '';
  const categorySlug = searchParams.get('category_slug') || '';
  const sortBy       = searchParams.get('sort_by')       || 'created_at';
  const page         = parseInt(searchParams.get('page') || '1');
  const minPrice     = searchParams.get('min_price')     || '';
  const maxPrice     = searchParams.get('max_price')     || '';

  const [priceMin, setPriceMin] = useState(minPrice);
  const [priceMax, setPriceMax] = useState(maxPrice);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 24, sort_by: sortBy };
      if (search)       params.search        = search;
      if (categorySlug) params.category_slug = categorySlug;
      if (minPrice)     params.min_price     = minPrice;
      if (maxPrice)     params.max_price     = maxPrice;

      const { data } = await productsAPI.list(params);
      setProducts(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  }, [search, categorySlug, sortBy, page, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { categoriesAPI.list().then(r => setCategories(r.data)); }, []);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page'); // reset to page 1 on filter change
    setSearchParams(next);
  };

  const applyPrice = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (priceMin) next.set('min_price', priceMin); else next.delete('min_price');
    if (priceMax) next.set('max_price', priceMax); else next.delete('max_price');
    next.delete('page');
    setSearchParams(next);
  };

  const clearFilters = () => {
    setPriceMin(''); setPriceMax('');
    setSearchParams({});
  };

  const activeFilters = [
    search       && { label: `"${search}"`,       key: 'search' },
    categorySlug && { label: categorySlug.replace('-', ' '), key: 'category_slug' },
    minPrice     && { label: `Min ₹${minPrice}`,  key: 'min_price' },
    maxPrice     && { label: `Max ₹${maxPrice}`,  key: 'max_price' },
  ].filter(Boolean);

  const Sidebar = () => (
    <aside className={`filter-sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h3>Filters</h3>
        {activeFilters.length > 0 && (
          <button className="clear-all" onClick={clearFilters}>Clear all</button>
        )}
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><FiX /></button>
      </div>

      {/* Category */}
      <div className="filter-group">
        <h4>Category</h4>
        <label className={`filter-option ${!categorySlug ? 'active' : ''}`}>
          <input type="radio" name="cat" checked={!categorySlug} onChange={() => updateParam('category_slug', '')} />
          All Categories
        </label>
        {categories.map(c => (
          <label key={c.id} className={`filter-option ${categorySlug === c.slug ? 'active' : ''}`}>
            <input
              type="radio" name="cat"
              checked={categorySlug === c.slug}
              onChange={() => updateParam('category_slug', c.slug)}
            />
            {c.name}
          </label>
        ))}
      </div>

      {/* Price */}
      <div className="filter-group">
        <h4>Price Range</h4>
        <form onSubmit={applyPrice} className="price-filter">
          <input
            type="number" placeholder="Min ₹"
            value={priceMin} onChange={e => setPriceMin(e.target.value)}
            min={0}
          />
          <span>to</span>
          <input
            type="number" placeholder="Max ₹"
            value={priceMax} onChange={e => setPriceMax(e.target.value)}
            min={0}
          />
          <button type="submit">Go</button>
        </form>
        {/* Quick ranges */}
        {[['Under ₹500', '', '500'], ['₹500–₹2000', '500', '2000'], ['₹2000–₹10000', '2000', '10000'], ['Above ₹10000', '10000', '']].map(([label, min, max]) => (
          <button
            key={label}
            className="price-quick"
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              if (min) next.set('min_price', min); else next.delete('min_price');
              if (max) next.set('max_price', max); else next.delete('max_price');
              next.delete('page');
              setSearchParams(next);
              setPriceMin(min); setPriceMax(max);
            }}
          >{label}</button>
        ))}
      </div>
    </aside>
  );

  return (
    <div className="product-list-page container">
      {/* Active filter pills */}
      {activeFilters.length > 0 && (
        <div className="active-filters">
          {activeFilters.map(f => (
            <span key={f.key} className="filter-pill">
              {f.label}
              <button onClick={() => updateParam(f.key, '')}><FiX size={10} /></button>
            </span>
          ))}
        </div>
      )}

      <div className="list-layout">
        <Sidebar />

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        <main className="list-main">
          {/* Toolbar */}
          <div className="list-toolbar">
            <div className="toolbar-left">
              <button className="filter-toggle" onClick={() => setSidebarOpen(true)}>
                <FiFilter /> Filters
              </button>
              <span className="result-count">
                {loading ? '...' : `${total.toLocaleString()} result${total !== 1 ? 's' : ''}`}
                {search && ` for "${search}"`}
              </span>
            </div>
            <select
              className="sort-select"
              value={sortBy}
              onChange={e => updateParam('sort_by', e.target.value)}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="spinner" />
          ) : products.length === 0 ? (
            <div className="empty-state">
              <h3>No results found</h3>
              <p>Try adjusting your filters or search terms</p>
              <button className="btn-primary" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={page <= 1}
                onClick={() => updateParam('page', String(page - 1))}
              >
                <FiChevronLeft /> Prev
              </button>

              {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                let p;
                if (pages <= 7) p = i + 1;
                else if (page <= 4) p = i + 1;
                else if (page >= pages - 3) p = pages - 6 + i;
                else p = page - 3 + i;
                return (
                  <button
                    key={p}
                    className={`page-btn ${p === page ? 'active' : ''}`}
                    onClick={() => updateParam('page', String(p))}
                  >{p}</button>
                );
              })}

              <button
                className="page-btn"
                disabled={page >= pages}
                onClick={() => updateParam('page', String(page + 1))}
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
