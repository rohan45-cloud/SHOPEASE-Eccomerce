const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    },
  });
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"ShopEase" <${process.env.EMAIL_USER}>`,
    to, subject, html,
  });
};

const orderConfirmEmail = (name, orderId, items, total) => `
<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#fff;">
  <h2 style="color:#7c3aed;">Order Confirmed! 🎉</h2>
  <p>Hi <strong>${name}</strong>, your order has been placed successfully.</p>
  <p><strong>Order ID:</strong> #${orderId}</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    ${items.map(i => `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${i.name} × ${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹${i.price * i.quantity}</td></tr>`).join("")}
    <tr><td style="padding:8px;font-weight:bold;">Total</td><td style="padding:8px;text-align:right;font-weight:bold;">₹${total}</td></tr>
  </table>
  <p style="color:#888;font-size:13px;">Thank you for shopping with ShopEase!</p>
</div>`;

module.exports = { generateToken, sendTokenResponse, sendEmail, orderConfirmEmail };
