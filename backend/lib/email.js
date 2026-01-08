// utils/emailService.js
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'TravelGo <noreply@travelgo.com>',
  support: {
    email: 'phong@triennguyen.com',
    phone: '0868156027',
  },
  brand: {
    name: 'TravelGo',
    tagline: 'Khám phá thế giới cùng chúng tôi',
    logoEmoji: '🌍',
  },
  modes: {
    LOG: new Set(['log', 'console', 'dev', 'development']),
  },
};

// ============================================================================
// MODERN EMAIL STYLES
// ============================================================================
const EMAIL_STYLES = `
  :root {
    --primary: #6366f1;
    --primary-dark: #4f46e5;
    --success: #10b981;
    --success-dark: #059669;
    --danger: #ef4444;
    --danger-dark: #dc2626;
    --warning: #f59e0b;
    --info: #3b82f6;
    --gray-50: #f9fafb;
    --gray-100: #f3f4f6;
    --gray-200: #e5e7eb;
    --gray-600: #4b5563;
    --gray-700: #374151;
    --gray-900: #111827;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: var(--gray-900);
    background: var(--gray-100);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .email-container {
    max-width: 640px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .email-header {
    position: relative;
    padding: 60px 40px;
    text-align: center;
    color: #ffffff;
    overflow: hidden;
  }

  .email-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, var(--gradient-from) 0%, var(--gradient-to) 100%);
    opacity: 0.95;
  }

  .email-header::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 40px;
    background: #ffffff;
    border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  }

  .header-content {
    position: relative;
    z-index: 1;
  }

  .header-icon {
    font-size: 64px;
    margin-bottom: 20px;
    display: block;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  .header-title {
    font-size: 32px;
    font-weight: 800;
    margin: 0 0 12px;
    letter-spacing: -0.02em;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  }

  .header-subtitle {
    font-size: 16px;
    opacity: 0.95;
    font-weight: 500;
  }

  .email-body {
    padding: 50px 40px;
  }

  .greeting {
    font-size: 26px;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: 20px;
  }

  .text-content {
    font-size: 16px;
    color: var(--gray-600);
    line-height: 1.8;
    margin: 16px 0;
  }

  .card {
    background: var(--gray-50);
    border-radius: 16px;
    padding: 28px;
    margin: 28px 0;
    border: 1px solid var(--gray-200);
  }

  .card-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0 0 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .info-grid {
    display: grid;
    gap: 16px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid var(--gray-200);
  }

  .info-row:last-child {
    border-bottom: none;
  }

  .info-label {
    font-weight: 600;
    color: var(--gray-700);
    font-size: 15px;
  }

  .info-value {
    font-weight: 600;
    color: var(--gray-900);
    text-align: right;
    font-size: 15px;
  }

  .highlight-card {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 2px solid var(--warning);
    border-radius: 16px;
    padding: 32px;
    margin: 32px 0;
  }

  .highlight-row {
    display: flex;
    justify-content: space-between;
    padding: 14px 0;
    font-size: 17px;
  }

  .highlight-row.total {
    border-top: 3px solid var(--warning);
    margin-top: 20px;
    padding-top: 24px;
    font-size: 28px;
    font-weight: 800;
  }

  .highlight-label {
    color: #92400e;
    font-weight: 600;
  }

  .highlight-value {
    color: #78350f;
    font-weight: 700;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 10px 20px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.02em;
  }

  .badge-success {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    color: #065f46;
    border: 2px solid var(--success);
  }

  .badge-warning {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    color: #92400e;
    border: 2px solid var(--warning);
  }

  .badge-info {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #1e40af;
    border: 2px solid var(--info);
  }

  .badge-danger {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    color: #991b1b;
    border: 2px solid var(--danger);
  }

  .alert {
    border-radius: 12px;
    padding: 20px;
    margin: 24px 0;
    border-left: 4px solid;
  }

  .alert-info {
    background: #eff6ff;
    border-color: var(--info);
    color: #1e40af;
  }

  .alert-warning {
    background: #fef3c7;
    border-color: var(--warning);
    color: #92400e;
  }

  .alert-danger {
    background: #fee2e2;
    border-color: var(--danger);
    color: #991b1b;
  }

  .alert-title {
    font-weight: 700;
    font-size: 16px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .alert-list {
    margin: 12px 0 0;
    padding-left: 24px;
  }

  .alert-list li {
    margin: 8px 0;
    line-height: 1.6;
  }

  .button-wrapper {
    text-align: center;
    margin: 36px 0;
  }

  .button {
    display: inline-block;
    padding: 16px 40px;
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 12px;
    font-weight: 700;
    font-size: 16px;
    letter-spacing: 0.02em;
    transition: all 0.3s ease;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .button-primary {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  }

  .button-success {
    background: linear-gradient(135deg, var(--success) 0%, var(--success-dark) 100%);
  }

  .button-danger {
    background: linear-gradient(135deg, var(--danger) 0%, var(--danger-dark) 100%);
  }

  .divider {
    margin: 32px 0;
    padding-top: 32px;
    border-top: 2px solid var(--gray-200);
  }

  .feature-list {
    list-style: none;
    padding: 0;
    margin: 24px 0;
  }

  .feature-item {
    padding: 16px 20px;
    margin: 12px 0;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-radius: 12px;
    border-left: 4px solid var(--info);
    font-size: 15px;
    color: var(--gray-700);
    transition: transform 0.2s ease;
  }

  .code-box {
    background: var(--gray-50);
    border: 2px solid var(--gray-200);
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    color: var(--gray-900);
    word-break: break-all;
    line-height: 1.6;
  }

  .email-footer {
    background: var(--gray-50);
    padding: 40px;
    text-align: center;
    border-top: 2px solid var(--gray-200);
  }

  .footer-brand {
    font-size: 18px;
    font-weight: 800;
    color: var(--gray-900);
    margin-bottom: 8px;
  }

  .footer-text {
    font-size: 14px;
    color: var(--gray-600);
    margin: 8px 0;
    line-height: 1.6;
  }

  .footer-copyright {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 20px;
  }

  @media only screen and (max-width: 640px) {
    .email-container {
      border-radius: 0;
      margin: 0;
    }
    .email-header {
      padding: 40px 24px;
    }
    .header-title {
      font-size: 26px;
    }
    .email-body {
      padding: 32px 24px;
    }
    .greeting {
      font-size: 22px;
    }
    .button {
      display: block;
      width: 100%;
    }
  }
`;

// ============================================================================
// EMAIL SERVICE CLASS
// ============================================================================
class EmailService {
  constructor() {
    this.transporter = null;
    this.isInitialized = false;
    this.mode = this.determineMode();
  }

  determineMode() {
    const mode = (process.env.EMAIL_MODE || '').toLowerCase();
    if (EMAIL_CONFIG.modes.LOG.has(mode)) return 'log';
    if (process.env.NODE_ENV === 'production') return 'production';
    return 'development';
  }

  async initialize() {
    if (this.isInitialized) return this.transporter;

    try {
      if (this.mode === 'log') {
        this.transporter = this.createLogTransporter();
        console.log('📧 Email Service: Log mode active');
        this.isInitialized = true;
        return this.transporter;
      }

      const smtpConfig = this.resolveSMTPConfig();
      if (smtpConfig) {
        this.transporter = await this.createSMTPTransporter(smtpConfig);
        console.log(`✅ Email Service: SMTP ready (${smtpConfig.host})`);
        this.isInitialized = true;
        return this.transporter;
      }

      const oauth2Config = this.resolveOAuth2Config();
      if (oauth2Config) {
        this.transporter = await this.createOAuth2Transporter(oauth2Config);
        console.log('✅ Email Service: OAuth2 ready');
        this.isInitialized = true;
        return this.transporter;
      }

      if (this.mode === 'production') {
        throw new Error('Email service not configured for production');
      }

      console.warn('⚠️  No email config found, using log mode');
      this.transporter = this.createLogTransporter();
      this.isInitialized = true;
      return this.transporter;

    } catch (error) {
      console.error('❌ Email Service init failed:', error.message);
      
      if (this.mode === 'production') throw error;

      console.warn('⚠️  Fallback to log mode');
      this.transporter = this.createLogTransporter();
      this.isInitialized = true;
      return this.transporter;
    }
  }

  resolveSMTPConfig() {
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    if (!host || !user || !pass) return null;

    return {
      host: host.trim(),
      port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10),
      secure: this.parseBoolean(process.env.SMTP_SECURE || process.env.EMAIL_SECURE),
      user: user.trim(),
      pass: pass.replace(/\s+/g, ''),
    };
  }

  resolveOAuth2Config() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const user = process.env.GMAIL_USER;

    if (!clientId || !clientSecret || !refreshToken || !user) return null;
    return { clientId, clientSecret, refreshToken, user };
  }

  async createSMTPTransporter(config) {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
      tls: { rejectUnauthorized: false },
    });
    await transporter.verify();
    return transporter;
  }

  async createOAuth2Transporter(config) {
    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({ refresh_token: config.refreshToken });
    const accessToken = await oauth2Client.getAccessToken();

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: config.user,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        refreshToken: config.refreshToken,
        accessToken: accessToken.token,
      },
    });
  }

  createLogTransporter() {
    return {
      name: 'log-transporter',
      version: '2.0.0',
      sendMail: async (options) => {
        console.log('\n' + '═'.repeat(60));
        console.log('📧 EMAIL LOG (Development Mode)');
        console.log('═'.repeat(60));
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`From: ${options.from}`);
        console.log('─'.repeat(60));
        if (options.text) console.log(`Text:\n${options.text.substring(0, 200)}...`);
        if (options.html) console.log(`HTML:\n${options.html.substring(0, 300)}...`);
        console.log('═'.repeat(60) + '\n');

        return {
          accepted: Array.isArray(options.to) ? options.to : [options.to],
          rejected: [],
          messageId: `dev-${Date.now()}@localhost`,
          response: 'LOG_MODE',
        };
      },
    };
  }

  parseBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.trim().toLowerCase() === 'true';
    return Boolean(value);
  }

  htmlToText(html) {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  createBaseLayout(content, gradientColors) {
    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${EMAIL_CONFIG.brand.name}</title>
        <style>
          ${EMAIL_STYLES}
          .email-header {
            --gradient-from: ${gradientColors.from};
            --gradient-to: ${gradientColors.to};
          }
        </style>
      </head>
      <body>
        <div style="padding: 20px; background: var(--gray-100);">
          <div class="email-container">
            ${content}
            <div class="email-footer">
              <div class="footer-brand">${EMAIL_CONFIG.brand.name}</div>
              <div class="footer-text">${EMAIL_CONFIG.brand.tagline}</div>
              <div class="footer-text">
                Cần hỗ trợ? Liên hệ ${EMAIL_CONFIG.support.email} hoặc ${EMAIL_CONFIG.support.phone}
              </div>
              <div class="footer-copyright">
                © ${new Date().getFullYear()} ${EMAIL_CONFIG.brand.name}. All rights reserved.<br>
                Email tự động, vui lòng không trả lời.
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatDateTime(date) {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async send(options) {
    try {
      if (!this.isInitialized) await this.initialize();

      const { to, subject, html, text } = options;

      if (!to || !subject) {
        throw new Error('Email "to" and "subject" are required');
      }

      const mailOptions = {
        from: EMAIL_CONFIG.from,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        text: text || this.htmlToText(html),
        headers: {
          'X-Mailer': `${EMAIL_CONFIG.brand.name} Email Service`,
          'X-Priority': '3',
        },
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}: ${subject}`);

      return {
        success: true,
        messageId: result.messageId,
        response: result.response,
      };

    } catch (error) {
      console.error(`❌ Email send failed:`, error.message);
      if (this.mode === 'production') throw error;
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // EMAIL TEMPLATES
  // ============================================================================

  async sendWelcome(user) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    
    const content = `
      <div class="email-header">
        <div class="header-content">
          <span class="header-icon">🎉</span>
          <h1 class="header-title">Chào mừng đến với ${EMAIL_CONFIG.brand.name}!</h1>
          <p class="header-subtitle">Hành trình khám phá bắt đầu từ đây</p>
        </div>
      </div>
      
      <div class="email-body">
        <h2 class="greeting">Xin chào ${user.name || 'Bạn'}! 👋</h2>
        
        <p class="text-content">
          Cảm ơn bạn đã tham gia cộng đồng ${EMAIL_CONFIG.brand.name}. Chúng tôi rất vui mừng được đồng hành cùng bạn trong những chuyến du lịch tuyệt vời!
        </p>

        <div class="card">
          <h3 class="card-title">✨ Những điều bạn có thể làm</h3>
          <ul class="feature-list">
            <li class="feature-item">🗺️ Khám phá hàng ngàn điểm đến hấp dẫn trên toàn thế giới</li>
            <li class="feature-item">🎫 Đặt tour và dịch vụ du lịch dễ dàng chỉ với vài cú click</li>
            <li class="feature-item">⭐ Xem đánh giá và chia sẻ trải nghiệm của bạn</li>
            <li class="feature-item">🎁 Nhận ưu đãi và khuyến mãi độc quyền</li>
          </ul>
        </div>

        <div class="button-wrapper">
          <a href="${frontendUrl}" class="button button-primary">Bắt đầu khám phá ngay</a>
        </div>
      </div>
    `;

    const html = this.createBaseLayout(content, { from: '#6366f1', to: '#4f46e5' });
    
    return this.send({
      to: user.email,
      subject: `Chào mừng bạn đến với ${EMAIL_CONFIG.brand.name}! 🎉`,
      html,
    });
  }

  async sendPasswordReset(user, resetToken) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    const expiryMinutes = 5;
    
    const content = `
      <div class="email-header">
        <div class="header-content">
          <span class="header-icon">🔐</span>
          <h1 class="header-title">Yêu cầu đặt lại mật khẩu</h1>
          <p class="header-subtitle">Chúng tôi sẵn sàng giúp bạn lấy lại quyền truy cập</p>
        </div>
      </div>
      
      <div class="email-body">
        <h2 class="greeting">Xin chào ${user.name || 'Bạn'} 👋</h2>
        
        <p class="text-content">
          Chúng tôi vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${user.email}</strong> tại ${EMAIL_CONFIG.brand.name}.
        </p>

        <p class="text-content">
          Đừng lo lắng! Chỉ cần nhấn vào nút bên dưới và làm theo hướng dẫn để tạo mật khẩu mới an toàn cho tài khoản của bạn:
        </p>

        <div class="button-wrapper">
          <a href="${resetUrl}" class="button button-danger" style="font-size: 18px; padding: 20px 50px; text-transform: uppercase; letter-spacing: 1px;">
            🔑 Đặt lại mật khẩu ngay
          </a>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <p class="text-content" style="color: var(--gray-600); font-size: 14px; margin-bottom: 16px;">
            Hoặc copy & paste đường dẫn sau vào trình duyệt của bạn:
          </p>
          <div class="code-box" style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); font-size: 13px; word-break: break-all;">
            ${resetUrl}
          </div>
        </div>

        <div class="alert alert-warning" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left-width: 6px;">
          <div class="alert-title" style="font-size: 18px;">⏰ Link có hiệu lực trong ${expiryMinutes} phút</div>
          <p style="margin-top: 12px; line-height: 1.8;">
            Để bảo mật tài khoản, link đặt lại mật khẩu này sẽ <strong>tự động hết hạn sau ${expiryMinutes} phút</strong>. 
            Nếu bạn cần nhiều thời gian hơn, bạn có thể yêu cầu link mới bất cứ lúc nào.
          </p>
        </div>

        <div class="card" style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border: 2px solid var(--danger);">
          <h3 class="card-title" style="color: #991b1b; font-size: 20px;">🛡️ Bảo mật tài khoản của bạn</h3>
          <ul style="list-style: none; padding: 0; margin: 16px 0 0;">
            <li style="padding: 12px 0; border-bottom: 1px solid rgba(220, 38, 38, 0.2); color: #7f1d1d; font-size: 15px;">
              <strong style="color: #991b1b;">✓</strong> Không bao giờ chia sẻ link này với bất kỳ ai, kể cả nhân viên ${EMAIL_CONFIG.brand.name}
            </li>
            <li style="padding: 12px 0; border-bottom: 1px solid rgba(220, 38, 38, 0.2); color: #7f1d1d; font-size: 15px;">
              <strong style="color: #991b1b;">✓</strong> Chỉ nhấn vào link nếu bạn thực sự yêu cầu đặt lại mật khẩu
            </li>
            <li style="padding: 12px 0; color: #7f1d1d; font-size: 15px;">
              <strong style="color: #991b1b;">✓</strong> Nếu bạn không yêu cầu, có thể ai đó đang cố truy cập tài khoản của bạn
            </li>
          </ul>
        </div>

        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 16px; padding: 28px; margin: 32px 0; border: 2px solid var(--info); text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">🤔</div>
          <h3 style="font-size: 22px; font-weight: 800; color: #1e40af; margin: 0 0 12px;">Bạn không yêu cầu đặt lại mật khẩu?</h3>
          <p style="color: #1e3a8a; font-size: 16px; line-height: 1.8; margin: 0;">
            Đừng lo lắng! Tài khoản của bạn vẫn an toàn và không có thay đổi nào được thực hiện. 
            Bạn có thể <strong>bỏ qua email này</strong> hoặc liên hệ với chúng tôi ngay nếu có bất kỳ lo ngại nào.
          </p>
        </div>

        <div class="divider"></div>

        <div style="text-align: center;">
          <p class="text-content" style="font-size: 15px; color: var(--gray-700);">
            Cần hỗ trợ thêm? Chúng tôi luôn sẵn sàng!
          </p>
          <div style="margin-top: 16px;">
            <a href="mailto:${EMAIL_CONFIG.support.email}" style="display: inline-block; margin: 8px 12px; color: var(--primary); text-decoration: none; font-weight: 700; font-size: 15px;">
              📧 ${EMAIL_CONFIG.support.email}
            </a>
            <a href="tel:${EMAIL_CONFIG.support.phone}" style="display: inline-block; margin: 8px 12px; color: var(--primary); text-decoration: none; font-weight: 700; font-size: 15px;">
              📞 ${EMAIL_CONFIG.support.phone}
            </a>
          </div>
        </div>
      </div>
    `;

    const html = this.createBaseLayout(content, { 
      from: '#dc2626', 
      to: '#991b1b' 
    });
    
    return this.send({
      to: user.email,
      subject: `🔐 Yêu cầu đặt lại mật khẩu - ${EMAIL_CONFIG.brand.name}`,
      html,
    });
  }

  async sendBookingConfirmation(booking, user, destination) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    
    const content = `
      <div class="email-header">
        <div class="header-content">
          <span class="header-icon">✅</span>
          <h1 class="header-title">Đặt tour thành công!</h1>
          <p class="header-subtitle">Cảm ơn bạn đã tin tưởng ${EMAIL_CONFIG.brand.name}</p>
        </div>
      </div>
      
      <div class="email-body">
        <h2 class="greeting">Xin chào ${user.name || 'Bạn'}!</h2>
        
        <p class="text-content">
          Cảm ơn bạn đã đặt tour với ${EMAIL_CONFIG.brand.name}. Chúng tôi đã nhận được yêu cầu của bạn và đang xử lý.
        </p>

        <div class="card">
          <h3 class="card-title">📋 Thông tin đặt tour</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Mã đặt tour</span>
              <span class="info-value">#${booking.id}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Điểm đến</span>
              <span class="info-value">${destination?.name || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Số lượng khách</span>
              <span class="info-value">${booking.guests || 1} người</span>
            </div>
            ${booking.from ? `
            <div class="info-row">
              <span class="info-label">Ngày bắt đầu</span>
              <span class="info-value">${this.formatDate(booking.from)}</span>
            </div>
            ` : ''}
            ${booking.to ? `
            <div class="info-row">
              <span class="info-label">Ngày kết thúc</span>
              <span class="info-value">${this.formatDate(booking.to)}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="info-label">Tổng tiền</span>
              <span class="info-value" style="color: var(--success); font-size: 18px;">
                ${this.formatCurrency(booking.totalAmount)}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Trạng thái</span>
              <span class="info-value">
                <span class="badge ${booking.status === 'CONFIRMED' ? 'badge-success' : 'badge-warning'}">
                  ${booking.status === 'CONFIRMED' ? 'Đã xác nhận' : 'Đang chờ xử lý'}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div class="alert alert-info">
          <div class="alert-title">ℹ️ Thông tin quan trọng</div>
          <p>Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận chi tiết chuyến đi.</p>
        </div>

        <div class="button-wrapper">
          <a href="${frontendUrl}/account/bookings" class="button button-success">Xem chi tiết đặt tour</a>
        </div>
      </div>
    `;

    const html = this.createBaseLayout(content, { from: '#10b981', to: '#059669' });
    
    return this.send({
      to: user.email,
      subject: `Xác nhận đặt tour - ${destination?.name || 'Tour của bạn'}`,
      html,
    });
  }

  async sendBookingStatusUpdate(booking, user, destination, newStatus) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    
    const statusConfig = {
      PENDING: { label: 'Đang chờ xử lý', badge: 'badge-warning', icon: '⏳' },
      CONFIRMED: { label: 'Đã xác nhận', badge: 'badge-success', icon: '✅' },
      COMPLETED: { label: 'Hoàn thành', badge: 'badge-info', icon: '🎉' },
      CANCELLED: { label: 'Đã hủy', badge: 'badge-danger', icon: '❌' },
    };
    
    const status = statusConfig[newStatus] || statusConfig.PENDING;
    
    const content = `
      <div class="email-header">
        <div class="header-content">
          <span class="header-icon">${status.icon}</span>
          <h1 class="header-title">Cập nhật đặt tour</h1>
          <p class="header-subtitle">Thông tin mới về đặt tour của bạn</p>
        </div>
      </div>
      
      <div class="email-body">
        <h2 class="greeting">Xin chào ${user.name || 'Bạn'}!</h2>
        
        <p class="text-content">
          Trạng thái đặt tour của bạn đã được cập nhật:
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <span class="badge ${status.badge}" style="font-size: 16px; padding: 12px 28px;">
            ${status.label}
          </span>
        </div>

        <div class="card">
          <h3 class="card-title">📋 Chi tiết đặt tour</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Mã đặt tour</span>
              <span class="info-value">#${booking.id}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Điểm đến</span>
              <span class="info-value">${destination?.name || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Số lượng khách</span>
              <span class="info-value">${booking.guests || 1} người</span>
            </div>
            <div class="info-row">
              <span class="info-label">Tổng tiền</span>
              <span class="info-value">${this.formatCurrency(booking.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div class="button-wrapper">
          <a href="${frontendUrl}/account/bookings" class="button button-primary">Xem chi tiết đặt tour</a>
        </div>
      </div>
    `;

    const html = this.createBaseLayout(content, { from: '#3b82f6', to: '#2563eb' });
    
    return this.send({
      to: user.email,
      subject: `Cập nhật trạng thái đặt tour - ${destination?.name || 'Tour của bạn'}`,
      html,
    });
  }

  async sendPaymentReceipt(payment, booking, user, destination) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    
    const providerLabels = {
      STRIPE: 'Stripe',
      VNPAY: 'VNPay',
      MOMO: 'MoMo',
      BANK_TRANSFER: 'Chuyển khoản ngân hàng',
      COD: 'Thanh toán khi nhận hàng',
    };
    
    const content = `
      <div class="email-header">
        <div class="header-content">
          <span class="header-icon">💳</span>
          <h1 class="header-title">Thanh toán thành công!</h1>
          <p class="header-subtitle">Cảm ơn bạn đã sử dụng dịch vụ</p>
        </div>
      </div>
      
      <div class="email-body">
        <div style="text-align: center; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 28px; border-radius: 16px; margin: 0 0 32px; border: 2px solid var(--success);">
          <div style="font-size: 14px; color: #065f46; text-transform: uppercase; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 8px;">
            Mã biên lai
          </div>
          <div style="font-size: 32px; font-weight: 900; color: #059669; letter-spacing: -0.02em;">
            #PAY-${payment.id}
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">💰 Thông tin thanh toán</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Ngày thanh toán</span>
              <span class="info-value">${this.formatDateTime(payment.createdAt)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phương thức</span>
              <span class="info-value">${providerLabels[payment.provider] || payment.provider}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Trạng thái</span>
              <span class="info-value">
                <span class="badge badge-success">Đã thanh toán</span>
              </span>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">📋 Thông tin đặt tour</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Mã đặt tour</span>
              <span class="info-value">#${booking.id}</span>
            </div>
            ${booking.code ? `
            <div class="info-row">
              <span class="info-label">Mã booking</span>
              <span class="info-value">${booking.code}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="info-label">Điểm đến</span>
              <span class="info-value">${destination?.name || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Số lượng khách</span>
              <span class="info-value">${booking.guests || 1} người</span>
            </div>
            ${booking.from ? `
            <div class="info-row">
              <span class="info-label">Ngày bắt đầu</span>
              <span class="info-value">${this.formatDate(booking.from)}</span>
            </div>
            ` : ''}
            ${booking.to ? `
            <div class="info-row">
              <span class="info-label">Ngày kết thúc</span>
              <span class="info-value">${this.formatDate(booking.to)}</span>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="highlight-card">
          <div class="highlight-row">
            <span class="highlight-label">Tổng tiền tour</span>
            <span class="highlight-value">${this.formatCurrency(booking.totalAmount)}</span>
          </div>
          <div class="highlight-row">
            <span class="highlight-label">Giảm giá</span>
            <span class="highlight-value">0 ₫</span>
          </div>
          <div class="highlight-row">
            <span class="highlight-label">Phí dịch vụ</span>
            <span class="highlight-value">0 ₫</span>
          </div>
          <div class="highlight-row total">
            <span class="highlight-label">Tổng thanh toán</span>
            <span class="highlight-value">${this.formatCurrency(payment.amount || booking.totalAmount)}</span>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">👤 Thông tin khách hàng</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Họ tên</span>
              <span class="info-value">${user.name || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">${user.email}</span>
            </div>
          </div>
        </div>

        <div class="alert alert-info">
          <div class="alert-title">📌 Lưu ý</div>
          <p>Biên lai này là bằng chứng hợp lệ cho giao dịch thanh toán của bạn. Vui lòng lưu lại email này để tham khảo sau này.</p>
        </div>

        <div class="button-wrapper">
          <a href="${frontendUrl}/account/bookings" class="button button-success">Xem chi tiết đặt tour</a>
        </div>
      </div>
    `;

    const html = this.createBaseLayout(content, { from: '#10b981', to: '#059669' });
    
    return this.send({
      to: user.email,
      subject: `Biên lai thanh toán - Mã đặt tour #${booking.id}`,
      html,
    });
  }

  async sendLoginNotification(user) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    
    const content = `
      <div class="email-header">
        <div class="header-content">
          <span class="header-icon">🔐</span>
          <h1 class="header-title">Đăng nhập thành công</h1>
          <p class="header-subtitle">Thông báo bảo mật tài khoản</p>
        </div>
      </div>
      
      <div class="email-body">
        <h2 class="greeting">Xin chào ${user.name || 'Bạn'}!</h2>
        
        <p class="text-content">
          Chúng tôi thông báo rằng tài khoản ${EMAIL_CONFIG.brand.name} của bạn vừa được đăng nhập thành công.
        </p>

        <div class="alert alert-info">
          <div class="alert-title">📅 Thời gian đăng nhập</div>
          <p style="font-size: 18px; font-weight: 700; margin-top: 8px;">
            ${this.formatDateTime(new Date())}
          </p>
        </div>

        <div class="button-wrapper">
          <a href="${frontendUrl}" class="button button-primary">Truy cập ${EMAIL_CONFIG.brand.name}</a>
        </div>

        <div class="alert alert-warning">
          <div class="alert-title">🔒 Bảo mật tài khoản</div>
          <ul class="alert-list">
            <li>Nếu bạn không thực hiện đăng nhập này, vui lòng đổi mật khẩu ngay lập tức</li>
            <li>Kiểm tra các thiết bị đã đăng nhập vào tài khoản của bạn</li>
            <li>Không chia sẻ thông tin đăng nhập với bất kỳ ai</li>
          </ul>
        </div>
      </div>
    `;

    const html = this.createBaseLayout(content, { from: '#3b82f6', to: '#2563eb' });
    
    return this.send({
      to: user.email,
      subject: 'Thông báo đăng nhập vào TravelGo',
      html,
    });
  }

  async sendVerification(user, verificationUrl) {
    const content = `
      <div class="email-header">
        <div class="header-content">
          <span class="header-icon">✉️</span>
          <h1 class="header-title">Xác thực email</h1>
          <p class="header-subtitle">Kích hoạt tài khoản của bạn</p>
        </div>
      </div>
      
      <div class="email-body">
        <h2 class="greeting">Xin chào ${user.name || 'Bạn'}!</h2>
        
        <p class="text-content">
          Cảm ơn bạn đã đăng ký tài khoản tại ${EMAIL_CONFIG.brand.name}. Để hoàn tất đăng ký, vui lòng xác thực địa chỉ email của bạn bằng cách nhấn vào nút bên dưới:
        </p>

        <div class="button-wrapper">
          <a href="${verificationUrl}" class="button button-primary">Xác thực email ngay</a>
        </div>

        <p class="text-content" style="text-align: center; font-size: 14px;">
          Hoặc copy đường dẫn sau vào trình duyệt:
        </p>
        <div class="code-box">${verificationUrl}</div>

        <div class="alert alert-warning">
          <div class="alert-title">⚠️ Lưu ý quan trọng</div>
          <ul class="alert-list">
            <li>Link này chỉ có hiệu lực trong 24 giờ</li>
            <li>Nếu bạn không đăng ký tài khoản này, hãy bỏ qua email này</li>
            <li>Không chia sẻ link này với bất kỳ ai để bảo vệ tài khoản</li>
          </ul>
        </div>
      </div>
    `;

    const html = this.createBaseLayout(content, { from: '#6366f1', to: '#4f46e5' });
    
    return this.send({
      to: user.email,
      subject: `Xác thực email - ${EMAIL_CONFIG.brand.name}`,
      html,
    });
  }

  async sendBookingReminder(booking, user, destination) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const bookingDate = booking.from || booking.date;
    const daysUntil = bookingDate ? Math.ceil((new Date(bookingDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
    
    const content = `
      <div class="email-header">
        <div class="header-content">
          <span class="header-icon">📅</span>
          <h1 class="header-title">Nhắc lịch du lịch</h1>
          <p class="header-subtitle">Chuyến đi của bạn sắp đến</p>
        </div>
      </div>
      
      <div class="email-body">
        <h2 class="greeting">Xin chào ${user.name || 'Bạn'}!</h2>
        
        <p class="text-content">
          Chúng tôi muốn nhắc nhở bạn về chuyến du lịch sắp tới của bạn${daysUntil !== null ? ` (còn ${daysUntil} ngày)` : ''}:
        </p>

        <div class="card">
          <h3 class="card-title">📋 Thông tin chuyến đi</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Mã đặt tour</span>
              <span class="info-value">${booking.code || `#${booking.id}`}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Điểm đến</span>
              <span class="info-value">${destination?.name || 'N/A'}</span>
            </div>
            ${bookingDate ? `
            <div class="info-row">
              <span class="info-label">Ngày khởi hành</span>
              <span class="info-value">${this.formatDate(bookingDate)}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="info-label">Số lượng khách</span>
              <span class="info-value">${booking.guests || booking.participants || 1} người</span>
            </div>
          </div>
        </div>

        <div class="alert alert-info">
          <div class="alert-title">📌 Lưu ý trước khi đi</div>
          <ul class="alert-list">
            <li>Kiểm tra lại giấy tờ tùy thân (CMND/CCCD/Passport)</li>
            <li>Chuẩn bị hành lý phù hợp với thời tiết</li>
            <li>Đến điểm tập trung đúng giờ</li>
            <li>Liên hệ hotline nếu có thắc mắc: ${EMAIL_CONFIG.support.phone}</li>
          </ul>
        </div>

        <div class="button-wrapper">
          <a href="${frontendUrl}/account/bookings" class="button button-primary">Xem chi tiết đặt tour</a>
        </div>
      </div>
    `;

    const html = this.createBaseLayout(content, { from: '#3b82f6', to: '#2563eb' });
    
    return this.send({
      to: user.email,
      subject: `Nhắc lịch du lịch - ${destination?.name || 'Tour của bạn'}`,
      html,
    });
  }

  async sendPaymentReminder(booking, user, destination) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    
    const content = `
      <div class="email-header">
        <div class="header-content">
          <span class="header-icon">💳</span>
          <h1 class="header-title">Nhắc thanh toán</h1>
          <p class="header-subtitle">Hoàn tất thanh toán để giữ chỗ</p>
        </div>
      </div>
      
      <div class="email-body">
        <h2 class="greeting">Xin chào ${user.name || 'Bạn'}!</h2>
        
        <p class="text-content">
          Chúng tôi nhận thấy bạn chưa hoàn tất thanh toán cho đặt tour của mình. Vui lòng thanh toán sớm để đảm bảo chỗ của bạn được giữ.
        </p>

        <div class="card">
          <h3 class="card-title">💰 Thông tin thanh toán</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Mã đặt tour</span>
              <span class="info-value">${booking.code || `#${booking.id}`}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Điểm đến</span>
              <span class="info-value">${destination?.name || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Số tiền cần thanh toán</span>
              <span class="info-value" style="color: var(--danger); font-size: 18px;">
                ${this.formatCurrency(booking.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        <div class="alert alert-warning">
          <div class="alert-title">⚠️ Lưu ý quan trọng</div>
          <ul class="alert-list">
            <li>Vui lòng thanh toán trong vòng 24 giờ để giữ chỗ</li>
            <li>Sau thời hạn này, đặt tour có thể bị hủy tự động</li>
            <li>Nếu đã thanh toán, vui lòng bỏ qua email này</li>
          </ul>
        </div>

        <div class="button-wrapper">
          <a href="${frontendUrl}/account/bookings" class="button button-danger">Thanh toán ngay</a>
        </div>
      </div>
    `;

    const html = this.createBaseLayout(content, { from: '#ef4444', to: '#dc2626' });
    
    return this.send({
      to: user.email,
      subject: `Nhắc thanh toán - Đặt tour ${destination?.name || ''}`,
      html,
    });
  }

  async sendItineraryPDF(booking, user, destination, itineraryPdfUrl) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    
    const content = `
      <div class="email-header">
        <div class="header-content">
          <span class="header-icon">📄</span>
          <h1 class="header-title">Lịch trình du lịch</h1>
          <p class="header-subtitle">Chi tiết chuyến đi của bạn</p>
        </div>
      </div>
      
      <div class="email-body">
        <h2 class="greeting">Xin chào ${user.name || 'Bạn'}!</h2>
        
        <p class="text-content">
          Cảm ơn bạn đã đặt tour với ${EMAIL_CONFIG.brand.name}. Chúng tôi đã chuẩn bị lịch trình chi tiết cho chuyến đi của bạn.
        </p>

        <div class="card">
          <h3 class="card-title">📋 Thông tin chuyến đi</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Mã đặt tour</span>
              <span class="info-value">${booking.code || `#${booking.id}`}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Điểm đến</span>
              <span class="info-value">${destination?.name || 'N/A'}</span>
            </div>
            ${booking.from ? `
            <div class="info-row">
              <span class="info-label">Ngày khởi hành</span>
              <span class="info-value">${this.formatDate(booking.from)}</span>
            </div>
            ` : ''}
            ${booking.to ? `
            <div class="info-row">
              <span class="info-label">Ngày kết thúc</span>
              <span class="info-value">${this.formatDate(booking.to)}</span>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="button-wrapper">
          <a href="${itineraryPdfUrl}" class="button button-primary" download>Tải lịch trình PDF</a>
        </div>

        <div class="alert alert-info">
          <div class="alert-title">ℹ️ Thông tin bổ sung</div>
          <p>Lịch trình PDF bao gồm chi tiết từng ngày, địa điểm tham quan, thời gian, và các lưu ý quan trọng. Vui lòng lưu lại để tham khảo trong chuyến đi.</p>
        </div>

        <div class="button-wrapper">
          <a href="${frontendUrl}/account/bookings" class="button button-success">Xem chi tiết đặt tour</a>
        </div>
      </div>
    `;

    const html = this.createBaseLayout(content, { from: '#6366f1', to: '#4f46e5' });
    
    return this.send({
      to: user.email,
      subject: `Lịch trình du lịch - ${destination?.name || 'Tour của bạn'}`,
      html,
      attachments: itineraryPdfUrl ? [{
        filename: `itinerary-${booking.code || booking.id}.pdf`,
        path: itineraryPdfUrl,
      }] : undefined,
    });
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================
const emailService = new EmailService();

emailService.initialize().catch(err => {
  console.error('Email service initialization error:', err.message);
});

// Export individual functions for backward compatibility
module.exports = {
  // Main service instance
  default: emailService,
  
  // Individual email functions
  sendEmail: (options) => emailService.send(options),
  sendWelcomeEmail: (user) => emailService.sendWelcome(user),
  sendBookingConfirmationEmail: (booking, user, destination) => 
    emailService.sendBookingConfirmation(booking, user, destination),
  sendPasswordResetEmail: (user, resetToken) => 
    emailService.sendPasswordReset(user, resetToken),
  sendScheduleChangeEmail: async (booking, user, destination, oldSchedule, newSchedule) => {
    const emailService = new EmailService();
    await emailService.initialize();

    const subject = `📅 Thay đổi lịch trình đặt tour - ${booking.code}`;
    const html = `
      ${EMAIL_STYLES}
      <div class="email-container">
        <div class="email-header">
          <div class="header-title">${EMAIL_CONFIG.brand.logoEmoji} Thay đổi lịch trình</div>
          <div class="header-subtitle">Đặt chỗ của bạn đã được cập nhật</div>
        </div>
        <div class="email-body">
          <div class="greeting">Xin chào ${user.name || 'Quý khách'}!</div>
          <p>Chúng tôi thông báo rằng lịch trình đặt tour của bạn đã được thay đổi:</p>
          
          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Mã đặt chỗ:</span>
              <span class="info-value">${booking.code}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Điểm đến:</span>
              <span class="info-value">${destination?.name || 'N/A'}</span>
            </div>
          </div>

          <div class="schedule-change">
            <div class="schedule-old">
              <h3>Lịch trình cũ:</h3>
              <p><strong>Khởi hành:</strong> ${new Date(oldSchedule.from).toLocaleDateString('vi-VN')}</p>
              <p><strong>Kết thúc:</strong> ${new Date(oldSchedule.to).toLocaleDateString('vi-VN')}</p>
            </div>
            <div class="schedule-new">
              <h3>Lịch trình mới:</h3>
              <p><strong>Khởi hành:</strong> ${new Date(newSchedule.from).toLocaleDateString('vi-VN')}</p>
              <p><strong>Kết thúc:</strong> ${new Date(newSchedule.to).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          <div class="alert alert-info">
            <div class="alert-title">ℹ️ Lưu ý</div>
            <p>Vui lòng kiểm tra lại lịch trình mới và liên hệ với chúng tôi nếu có bất kỳ thắc mắc nào.</p>
          </div>

          <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/account/bookings" class="button">Xem chi tiết đặt chỗ</a>
        </div>
        ${EMAIL_FOOTER}
      </div>
    `;

    return emailService.sendEmail({
      to: user.email,
      subject,
      html,
    });
  },
  sendBookingStatusUpdateEmail: (booking, user, destination, newStatus) => 
    emailService.sendBookingStatusUpdate(booking, user, destination, newStatus),
  sendPaymentReceiptEmail: (payment, booking, user, destination) => 
    emailService.sendPaymentReceipt(payment, booking, user, destination),
  sendLoginNotificationEmail: (user) => 
    emailService.sendLoginNotification(user),
  sendVerificationEmail: (user, verificationUrl) => 
    emailService.sendVerification(user, verificationUrl),
  sendBookingReminderEmail: (booking, user, destination) => 
    emailService.sendBookingReminder(booking, user, destination),
  sendPaymentReminderEmail: (booking, user, destination) => 
    emailService.sendPaymentReminder(booking, user, destination),
  sendItineraryPDFEmail: (booking, user, destination, itineraryPdfUrl) => 
    emailService.sendItineraryPDF(booking, user, destination, itineraryPdfUrl),
};