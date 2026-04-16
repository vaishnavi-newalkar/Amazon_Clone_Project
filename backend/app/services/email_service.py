"""
Email Notification Service
Sends order confirmation emails via SMTP
Falls back to console logging when SMTP is not configured
"""

import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_order_confirmation_email(
    to_email: str,
    user_name: str,
    order_id: int,
    order_total: float,
    items: List[dict],
    shipping_address: str,
):
    """
    Send an order confirmation email to the customer.
    
    Args:
        to_email: Recipient email address
        user_name: Customer's full name
        order_id: The unique order identifier
        order_total: Total amount charged
        items: List of ordered items [{name, quantity, price}]
        shipping_address: Full shipping address string
    """
    subject = f"Order Confirmation - Order #{order_id} | Amazon Clone"

    # Build item rows for email
    item_rows = "".join([
        f"""
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee">{item['name']}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">{item['quantity']}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹{item['price']:.2f}</td>
        </tr>
        """
        for item in items
    ])

    html_body = f"""
    <html>
    <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
      <div style="background:#131921;padding:16px;text-align:center">
        <h1 style="color:#FF9900;margin:0;font-size:28px">amazon</h1>
        <p style="color:#fff;margin:4px 0 0;font-size:12px">clone</p>
      </div>

      <div style="padding:24px">
        <h2 style="color:#007600">✓ Order Placed Successfully!</h2>
        <p>Dear {user_name},</p>
        <p>Thank you for your order. We're getting it ready to be shipped. 
           We'll notify you when it's on its way!</p>

        <div style="background:#f0f0f0;padding:12px 16px;border-radius:4px;margin:16px 0">
          <strong>Order ID:</strong> #{order_id}<br>
          <strong>Order Total:</strong> ₹{order_total:.2f}
        </div>

        <h3 style="border-bottom:2px solid #FF9900;padding-bottom:8px">Order Details</h3>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#f0f0f0">
              <th style="padding:8px;text-align:left">Product</th>
              <th style="padding:8px;text-align:center">Qty</th>
              <th style="padding:8px;text-align:right">Price</th>
            </tr>
          </thead>
          <tbody>{item_rows}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:8px;text-align:right;font-weight:bold">Total:</td>
              <td style="padding:8px;text-align:right;font-weight:bold;color:#B12704">₹{order_total:.2f}</td>
            </tr>
          </tfoot>
        </table>

        <h3 style="border-bottom:2px solid #FF9900;padding-bottom:8px">Shipping Address</h3>
        <p style="background:#f9f9f9;padding:12px;border-left:3px solid #FF9900">{shipping_address}</p>

        <p style="color:#888;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:16px">
          This is an automated email from Amazon Clone. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
    """

    # Try sending via SMTP, fallback to console log
    if settings.EMAIL_ENABLED and settings.SMTP_USER and settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.EMAIL_FROM
            msg["To"] = to_email
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.ehlo()
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAIL_FROM, [to_email], msg.as_string())

            logger.info(f"Order confirmation email sent to {to_email} for order #{order_id}")
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
    else:
        # Mock email - log to console (useful during development)
        logger.info(
            f"\n{'='*60}\n"
            f"[MOCK EMAIL] Order #{order_id} Confirmation\n"
            f"To: {to_email}\n"
            f"Customer: {user_name}\n"
            f"Total: ₹{order_total:.2f}\n"
            f"Items: {len(items)}\n"
            f"{'='*60}"
        )
