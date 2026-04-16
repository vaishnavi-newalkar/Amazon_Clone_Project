/**
 * AccountPage - Amazon-style "Your Account" hub
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaBoxOpen, FaLock, FaMapMarkerAlt, FaHeart,
  FaHeadset, FaUserCircle
} from 'react-icons/fa';
import './AccountPage.css';

const ACCOUNT_CARDS = [
  {
    icon: <FaBoxOpen size={40} color="#FF9900" />,
    title: 'Your Orders',
    desc: 'Track, return, or buy items again',
    to: '/orders',
  },
  {
    icon: <FaLock size={40} color="#FF9900" />,
    title: 'Login & Security',
    desc: 'Edit name, password and mobile number',
    to: '/account/profile',
  },
  {
    icon: <FaMapMarkerAlt size={40} color="#FF9900" />,
    title: 'Your Addresses',
    desc: 'Edit addresses for orders and gifts',
    to: '/account/address',
  },
  {
    icon: <FaHeart size={40} color="#FF9900" />,
    title: 'Your Wishlist',
    desc: 'View and manage your saved items',
    to: '/wishlist',
  },
  {
    icon: <FaUserCircle size={40} color="#FF9900" />,
    title: 'Profile',
    desc: 'View and update your profile details',
    to: '/account/profile',
  },
  {
    icon: <FaHeadset size={40} color="#FF9900" />,
    title: 'Help',
    desc: 'Browse self-service options, help articles',
    to: '/',
  },
];

export default function AccountPage() {
  const { user } = useAuth();

  return (
    <div className="account-page container">
      <h1 className="account-heading">Your Account</h1>
      {user && (
        <p className="account-welcome">
          Hello, <strong>{user.full_name}</strong>! ({user.email})
        </p>
      )}
      <div className="account-grid">
        {ACCOUNT_CARDS.map(card => (
          <Link key={card.title} to={card.to} className="account-card">
            <div className="account-card-icon">{card.icon}</div>
            <div className="account-card-body">
              <h2 className="account-card-title">{card.title}</h2>
              <p className="account-card-desc">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
