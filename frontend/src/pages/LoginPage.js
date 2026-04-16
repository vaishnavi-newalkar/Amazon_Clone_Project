/**
 * LoginPage - Amazon-style sign in form
 */
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from || '/';

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Enter your email';
    if (!form.password) e.password = 'Enter your password';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email: form.email, password: form.password });
      login(data.access_token, data.user);
      toast.success(`Welcome back, ${data.user.full_name.split(' ')[0]}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail;
      toast.error(msg || 'Sign in failed');
    } finally { setLoading(false); }
  };

  // Demo login helper
  const demoLogin = () => {
    setForm({ email: 'test@example.com', password: 'password123' });
  };

  return (
    <div className="auth-page">
      <Link to="/" className="auth-logo">amazon<span>.in</span></Link>
      <div className="auth-box">
        <h1>Sign in</h1>

        <div className="demo-hint" onClick={demoLogin}>
          🎯 Click to fill demo credentials
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email" value={form.email}
              onChange={e => set('email', e.target.value)}
              className={errors.email ? 'error' : ''}
              placeholder="name@example.com"
            />
            {errors.email && <span className="auth-error">{errors.email}</span>}
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password" value={form.password}
              onChange={e => set('password', e.target.value)}
              className={errors.password ? 'error' : ''}
              placeholder="At least 6 characters"
            />
            {errors.password && <span className="auth-error">{errors.password}</span>}
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-terms">
          By signing in you agree to Amazon Clone's{' '}
          <a href="#!">Conditions of Use</a> and <a href="#!">Privacy Notice</a>.
        </p>
      </div>

      <div className="auth-divider"><span>New to Amazon?</span></div>

      <div className="auth-box" style={{ background: '#fff' }}>
        <Link to="/signup">
          <button className="auth-create-btn">Create your Amazon account</button>
        </Link>
      </div>
    </div>
  );
}

/**
 * SignupPage - Create new account
 */
export function SignupPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [form,    setForm]    = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Enter your name';
    if (!form.email)            e.email     = 'Enter your email';
    if (form.password.length < 6) e.password = 'At least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await authAPI.signup({ email: form.email, full_name: form.full_name, password: form.password });
      login(data.access_token, data.user);
      toast.success('Account created! Welcome 🎉');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.detail;
      toast.error(msg || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <Link to="/" className="auth-logo">amazon<span>.in</span></Link>
      <div className="auth-box">
        <h1>Create account</h1>

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Your name',        key: 'full_name', type: 'text',     ph: 'First and last name' },
            { label: 'Email',            key: 'email',     type: 'email',    ph: 'name@example.com' },
            { label: 'Password',         key: 'password',  type: 'password', ph: 'At least 6 characters' },
            { label: 'Re-enter password',key: 'confirm',   type: 'password', ph: 'Re-enter your password' },
          ].map(({ label, key, type, ph }) => (
            <div key={key} className="auth-field">
              <label>{label}</label>
              <input type={type} value={form[key]} placeholder={ph}
                onChange={e => set(key, e.target.value)}
                className={errors[key] ? 'error' : ''} />
              {errors[key] && <span className="auth-error">{errors[key]}</span>}
            </div>
          ))}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Continue'}
          </button>
        </form>

        <p className="auth-terms">
          By creating an account you agree to Amazon Clone's{' '}
          <a href="#!">Conditions of Use</a> and <a href="#!">Privacy Notice</a>.
        </p>

        <div style={{ borderTop: '1px solid #ddd', marginTop: 16, paddingTop: 12, fontSize: 13 }}>
          Already have an account? <Link to="/login">Sign in →</Link>
        </div>
      </div>
    </div>
  );
}

// Default exports
export default LoginPage;
