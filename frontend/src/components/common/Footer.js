import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <Link to="/" className="footer-logo">amazon<span>.in</span></Link>
      </div>
      <div className="footer-mid container">
        <div className="footer-col">
          <h4>Get to Know Us</h4>
          <a href="#!">About Amazon</a>
          <a href="#!">Careers</a>
          <a href="#!">Press Releases</a>
          <a href="#!">Amazon Science</a>
        </div>
        <div className="footer-col">
          <h4>Connect with Us</h4>
          <a href="#!">Facebook</a>
          <a href="#!">Twitter</a>
          <a href="#!">Instagram</a>
        </div>
        <div className="footer-col">
          <h4>Make Money with Us</h4>
          <a href="#!">Sell on Amazon</a>
          <a href="#!">Advertise Your Products</a>
          <a href="#!">Become an Affiliate</a>
        </div>
        <div className="footer-col">
          <h4>Let Us Help You</h4>
          <Link to="/account">Your Account</Link>
          <Link to="/orders">Your Orders</Link>
          <a href="#!">Returns &amp; Replacements</a>
          <a href="#!">Help</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 Amazon Clone — Built for SDE Intern Assignment</p>
      </div>
    </footer>
  );
}
