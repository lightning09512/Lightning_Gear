const transporter = require('../config/mailer');
require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@nkgear.com';

// Common email header with NK Gear branding
const emailHeader = `
  <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #00d4ff; font-family: 'Segoe UI', Arial, sans-serif; margin: 0; font-size: 28px;">
      ⚡ NK Gear
    </h1>
    <p style="color: #8892b0; margin: 5px 0 0; font-size: 14px;">PC & Gaming Components</p>
  </div>
`;

const emailFooter = `
  <div style="background: #0a0a1a; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
    <p style="color: #666; font-size: 12px; margin: 0;">
      © ${new Date().getFullYear()} NK Gear. All rights reserved.<br>
      Email này được gửi tự động, vui lòng không trả lời.
    </p>
  </div>
`;

function wrapEmailBody(content) {
  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Arial, sans-serif; background: #1a1a2e;">
      ${emailHeader}
      <div style="background: #16213e; padding: 30px; color: #e6e6e6;">
        ${content}
      </div>
      ${emailFooter}
    </div>
  `;
}

/**
 * Send verification email after registration
 */
async function sendVerificationEmail(user, token) {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
  const html = wrapEmailBody(`
    <h2 style="color: #00d4ff; margin-top: 0;">Xác nhận tài khoản</h2>
    <p>Xin chào <strong>${user.username}</strong>,</p>
    <p>Cảm ơn bạn đã đăng ký tài khoản tại NK Gear. Vui lòng nhấn nút bên dưới để xác nhận email của bạn:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verifyUrl}" style="background: linear-gradient(135deg, #00d4ff, #7b2ff7); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
        Xác nhận Email
      </a>
    </div>
    <p style="color: #8892b0; font-size: 13px;">Link xác nhận sẽ hết hạn sau <strong>24 giờ</strong>.</p>
    <p style="color: #8892b0; font-size: 13px;">Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</p>
  `);

  await transporter.sendMail({
    from: `"NK Gear" <${EMAIL_FROM}>`,
    to: user.email,
    subject: 'NK Gear — Xác nhận tài khoản của bạn',
    html,
  });
}

/**
 * Send password reset email
 */
async function sendResetPasswordEmail(user, token) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  const html = wrapEmailBody(`
    <h2 style="color: #00d4ff; margin-top: 0;">Đặt lại mật khẩu</h2>
    <p>Xin chào <strong>${user.username}</strong>,</p>
    <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn nút bên dưới để tạo mật khẩu mới:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background: linear-gradient(135deg, #00d4ff, #7b2ff7); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
        Đặt lại mật khẩu
      </a>
    </div>
    <p style="color: #8892b0; font-size: 13px;">Link sẽ hết hạn sau <strong>15 phút</strong>.</p>
    <p style="color: #8892b0; font-size: 13px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
  `);

  await transporter.sendMail({
    from: `"NK Gear" <${EMAIL_FROM}>`,
    to: user.email,
    subject: 'NK Gear — Đặt lại mật khẩu',
    html,
  });
}

/**
 * Send order confirmation email
 */
async function sendOrderConfirmationEmail(user, order, items) {
  const itemRows = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #2a2a4a; color: #e6e6e6;">${item.Product ? item.Product.name : 'Sản phẩm'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #2a2a4a; color: #e6e6e6; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #2a2a4a; color: #00d4ff; text-align: right;">${formatVND(item.priceAtOrder)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #2a2a4a; color: #00d4ff; text-align: right;">${formatVND(item.priceAtOrder * item.quantity)}</td>
    </tr>
  `).join('');

  const shippingAddr = typeof order.shippingAddress === 'string'
    ? JSON.parse(order.shippingAddress)
    : order.shippingAddress;

  const html = wrapEmailBody(`
    <h2 style="color: #00d4ff; margin-top: 0;">Xác nhận đơn hàng #LG-${order.id}</h2>
    <p>Xin chào <strong>${user.username}</strong>,</p>
    <p>Đơn hàng của bạn đã được đặt thành công! Dưới đây là chi tiết:</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background: #0a0a1a;">
          <th style="padding: 12px; text-align: left; color: #00d4ff; border-bottom: 2px solid #00d4ff;">Sản phẩm</th>
          <th style="padding: 12px; text-align: center; color: #00d4ff; border-bottom: 2px solid #00d4ff;">SL</th>
          <th style="padding: 12px; text-align: right; color: #00d4ff; border-bottom: 2px solid #00d4ff;">Đơn giá</th>
          <th style="padding: 12px; text-align: right; color: #00d4ff; border-bottom: 2px solid #00d4ff;">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding: 12px; text-align: right; color: #ffd700; font-weight: bold; font-size: 16px;">Tổng cộng:</td>
          <td style="padding: 12px; text-align: right; color: #ffd700; font-weight: bold; font-size: 16px;">${formatVND(order.totalAmount)}</td>
        </tr>
      </tfoot>
    </table>

    <div style="background: #0a0a1a; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 5px 0; color: #8892b0;"><strong style="color: #e6e6e6;">Địa chỉ giao hàng:</strong> ${shippingAddr.fullName || ''}, ${shippingAddr.phone || ''}, ${shippingAddr.address || ''}</p>
      <p style="margin: 5px 0; color: #8892b0;"><strong style="color: #e6e6e6;">Thanh toán:</strong> ${order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}</p>
      ${order.note ? `<p style="margin: 5px 0; color: #8892b0;"><strong style="color: #e6e6e6;">Ghi chú:</strong> ${order.note}</p>` : ''}
    </div>

    <div style="text-align: center; margin: 25px 0;">
      <a href="${FRONTEND_URL}/orders" style="background: linear-gradient(135deg, #00d4ff, #7b2ff7); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
        Theo dõi đơn hàng
      </a>
    </div>
  `);

  await transporter.sendMail({
    from: `"NK Gear" <${EMAIL_FROM}>`,
    to: user.email,
    subject: `NK Gear — Xác nhận đơn hàng #LG-${order.id}`,
    html,
  });
}

/**
 * Send order status update email
 */
async function sendOrderStatusEmail(user, order) {
  const statusMap = {
    confirmed: { text: 'đã được xác nhận', color: '#00d4ff' },
    shipping: { text: 'đang được giao', color: '#ffd700' },
    delivered: { text: 'đã giao thành công', color: '#00ff88' },
    cancelled: { text: 'đã bị huỷ', color: '#ff4757' },
  };

  const statusInfo = statusMap[order.status] || { text: order.status, color: '#8892b0' };

  const html = wrapEmailBody(`
    <h2 style="color: #00d4ff; margin-top: 0;">Cập nhật đơn hàng #LG-${order.id}</h2>
    <p>Xin chào <strong>${user.username}</strong>,</p>
    <p>Đơn hàng <strong>#LG-${order.id}</strong> của bạn <span style="color: ${statusInfo.color}; font-weight: bold;">${statusInfo.text}</span>.</p>

    <div style="text-align: center; margin: 25px 0;">
      <a href="${FRONTEND_URL}/orders" style="background: linear-gradient(135deg, #00d4ff, #7b2ff7); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
        Xem chi tiết đơn hàng
      </a>
    </div>
  `);

  await transporter.sendMail({
    from: `"NK Gear" <${EMAIL_FROM}>`,
    to: user.email,
    subject: `NK Gear — Đơn hàng #LG-${order.id} ${statusInfo.text}`,
    html,
  });
}

/**
 * Format number as VND currency
 */
function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
};
