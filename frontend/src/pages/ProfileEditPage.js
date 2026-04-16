/**
 * ProfileEditPage - Edit personal info + address
 */
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { usePincodeValidator } from '../hooks/usePincodeValidator';
import './AuthPages.css';

const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

export default function ProfileEditPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAddressMode = location.pathname.includes('/address');

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    password: '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const { pincodeStatus, pincodeInfo, validatePincode } = usePincodeValidator();

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const handlePincodeChange = (val) => {
    set('pincode', val);
    validatePincode(val, {
      onSuccess: ({ district, state }) => {
        setForm(f => ({
          ...f,
          pincode: val,
          city:  f.city  || district,
          state: f.state || state,
        }));
      }
    });
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Name is required';
    if (form.password && form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.phone && !/^\d{10}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit number';
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) e.pincode = 'Pincode must be 6 digits';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password; // Don't send empty password
      const res = await authAPI.update(payload);
      updateUser(res.data); // Update local auth state
      toast.success('Profile updated successfully!');
      navigate('/account');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box" style={{ maxWidth: 500 }}>
        {/* Breadcrumb */}
        <p style={{ fontSize: 13, marginBottom: 16, color: '#565959' }}>
          <Link to="/account">Your Account</Link> &rsaquo;{' '}
          {isAddressMode ? 'Your Addresses' : 'Login & Security'}
        </p>

        <h1 style={{ fontSize: 22, fontWeight: 400, marginBottom: 24 }}>
          {isAddressMode ? 'Edit Your Address' : 'Login & Security'}
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          {/* Show personal info when not in address mode */}
          {!isAddressMode && (
            <fieldset style={{ border: 'none', padding: 0, marginBottom: 24 }}>
              <legend style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: '#0f1111' }}>
                Personal Information
              </legend>

              <div className="form-group">
                <label className="form-label">Full Name <span className="req">*</span></label>
                <input className={`form-input ${errors.full_name ? 'error' : ''}`}
                  value={form.full_name} onChange={e => set('full_name', e.target.value)}
                  placeholder="Your full name" />
                {errors.full_name && <span className="form-error">{errors.full_name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={user?.email || ''} disabled
                  style={{ background: '#f3f3f3', color: '#888', cursor: 'not-allowed' }} />
                <span style={{ fontSize: 12, color: '#888' }}>Email cannot be changed</span>
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input className={`form-input ${errors.phone ? 'error' : ''}`}
                  value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="10-digit mobile number" type="tel" maxLength={10} />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">New Password <span style={{fontSize:12,color:'#888'}}>(leave blank to keep current)</span></label>
                <input className={`form-input ${errors.password ? 'error' : ''}`}
                  value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="New password (min 6 chars)" type="password" />
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>
            </fieldset>
          )}

          {/* Always show address section */}
          <fieldset style={{ border: 'none', padding: 0 }}>
            <legend style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: '#0f1111' }}>
              Default Shipping Address
            </legend>
            <p style={{ fontSize: 13, color: '#565959', marginBottom: 12 }}>
              This address will be pre-filled automatically during checkout!
            </p>

            <div className="form-group">
              <label className="form-label">Address (House No, Street, Area)</label>
              <textarea className="form-input" rows={3}
                value={form.address} onChange={e => set('address', e.target.value)}
                placeholder="House No, Street, Area, Landmark" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">City / District</label>
                <input className={`form-input ${errors.city ? 'error' : ''}`}
                  value={form.city} onChange={e => set('city', e.target.value)}
                  placeholder="City" />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className={`form-input ${errors.pincode ? 'error' : pincodeStatus === 'valid' ? 'valid' : ''}`}
                    value={form.pincode}
                    onChange={e => handlePincodeChange(e.target.value)}
                    placeholder="6-digit pincode" maxLength={6} />
                  {pincodeStatus === 'loading' && <FaSpinner className="pincode-icon spinning" style={{ color: '#888' }} />}
                  {pincodeStatus === 'valid'   && <FaCheckCircle className="pincode-icon" style={{ color: '#2e7d32' }} />}
                  {pincodeStatus === 'invalid' && <FaTimesCircle className="pincode-icon" style={{ color: '#c62828' }} />}
                </div>
                {errors.pincode && <span className="form-error">{errors.pincode}</span>}
                {pincodeStatus === 'valid'   && <span style={{ fontSize: 11, color: '#2e7d32' }}>✓ {pincodeInfo?.district}, {pincodeInfo?.state}</span>}
                {pincodeStatus === 'invalid' && <span style={{ fontSize: 11, color: '#c62828' }}>✗ Invalid pincode — please check again</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <select className="form-input" value={form.state} onChange={e => set('state', e.target.value)}>
                <option value="">Select State</option>
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </fieldset>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button type="submit" className="btn-primary" disabled={saving}
              style={{ flex: 1, padding: '10px', fontSize: 15 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link to="/account" className="btn-secondary"
              style={{ flex: 1, padding: '10px', fontSize: 15, textAlign: 'center', textDecoration: 'none' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
