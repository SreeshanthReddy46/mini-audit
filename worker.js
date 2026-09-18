export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health' || url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          service: 'mini-audit-gateway',
          runtime: 'cloudflare-workers',
          timestamp: new Date().toISOString(),
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mini Audit · Audit Document Review System</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background: #fafafa;
      color: #171717;
      line-height: 1.6;
      padding: 48px 20px;
    }
    .wrapper {
      max-width: 960px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 20px;
      padding: 56px 48px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.03);
    }
    .top-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 24px;
      margin-bottom: 40px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-mark {
      width: 38px;
      height: 38px;
      background: #171717;
      color: #ffffff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 18px;
      letter-spacing: -0.02em;
    }
    .brand-name {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #171717;
    }
    .nav-links {
      display: flex;
      gap: 20px;
      align-items: center;
    }
    .nav-link {
      font-size: 14px;
      font-weight: 600;
      color: #525252;
      text-decoration: none;
      transition: color 0.15s ease;
    }
    .nav-link:hover {
      color: #171717;
    }
    .hero {
      margin-bottom: 48px;
    }
    .eyebrow {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #737373;
      margin-bottom: 14px;
    }
    h1 {
      font-size: 40px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.15;
      color: #171717;
      margin-bottom: 18px;
    }
    .flow-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: #f5f5f5;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 600;
      color: #404040;
      margin-bottom: 18px;
    }
    .hero-desc {
      font-size: 17px;
      color: #525252;
      max-width: 680px;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .cta-group {
      display: flex;
      gap: 14px;
      align-items: center;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 11px 22px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.15s ease;
      cursor: pointer;
    }
    .btn-primary {
      background: #171717;
      color: #ffffff;
      border: 1px solid #171717;
    }
    .btn-primary:hover {
      background: #262626;
      transform: translateY(-1px);
    }
    .btn-outline {
      background: #ffffff;
      color: #171717;
      border: 1px solid #d4d4d4;
    }
    .btn-outline:hover {
      background: #f5f5f5;
      border-color: #a3a3a3;
      transform: translateY(-1px);
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #737373;
      margin-bottom: 14px;
    }
    .security-section {
      margin-bottom: 48px;
    }
    .security-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }
    .security-card {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #fafafa;
      border: 1px solid #e5e5e5;
      border-radius: 10px;
      padding: 14px 16px;
      font-size: 14px;
      font-weight: 600;
      color: #262626;
    }
    .check {
      color: #10b981;
      font-size: 16px;
      font-weight: 700;
    }
    .how-section {
      margin-bottom: 48px;
    }
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }
    .step-card {
      background: #fafafa;
      border: 1px solid #e5e5e5;
      border-radius: 10px;
      padding: 18px 16px;
    }
    .step-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      color: #737373;
      margin-bottom: 6px;
    }
    .step-name {
      font-size: 15px;
      font-weight: 700;
      color: #171717;
      margin-bottom: 4px;
    }
    .step-desc {
      font-size: 12px;
      color: #525252;
      line-height: 1.45;
    }
    .split-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .panel {
      background: #fafafa;
      border: 1px solid #e5e5e5;
      border-radius: 12px;
      padding: 26px;
    }
    .panel-header {
      margin-bottom: 16px;
    }
    .panel-title {
      font-size: 15px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #404040;
    }
    .callout {
      margin-top: 6px;
      font-size: 12.5px;
      color: #737373;
      font-style: italic;
    }
    .account-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 16px;
    }
    .account-row {
      background: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      padding: 12px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
    }
    .account-label {
      font-weight: 700;
      color: #171717;
    }
    .account-email {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12.5px;
      color: #262626;
      background: #f5f5f5;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .footnote {
      font-size: 12px;
      color: #737373;
      line-height: 1.5;
    }
    .invariants-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .invariant-item {
      font-size: 13px;
      color: #404040;
      line-height: 1.55;
    }
    .invariant-item strong {
      color: #171717;
      display: block;
      margin-bottom: 2px;
    }
    .footer {
      border-top: 1px solid #f0f0f0;
      padding-top: 24px;
      font-size: 13px;
      color: #737373;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    @media (max-width: 640px) {
      .wrapper { padding: 32px 20px; }
      h1 { font-size: 30px; }
      .hero-desc { font-size: 15px; }
      .steps-grid { grid-template-columns: 1fr; }
      .split-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <nav class="top-nav">
      <div class="brand">
        <div class="logo-mark">M</div>
        <span class="brand-name">Mini Audit</span>
      </div>
      <div class="nav-links">
        <a href="#how" class="nav-link">How It Works</a>
        <a href="#security" class="nav-link">Security</a>
        <a href="#accounts" class="nav-link">Evaluation Access</a>
      </div>
    </nav>

    <section class="hero">
      <div class="eyebrow">Mini Audit</div>
      <h1>Audit document review,<br/>built for traceability.</h1>
      <div class="flow-badge">
        Upload → Review → Correct → Approve
      </div>
      <p class="hero-desc">
        A secure multi-tenant workflow for audit teams, with versioned documents, role-based access and complete audit history.
      </p>
      <div class="cta-group">
        <a href="#accounts" class="btn btn-primary">Get Started</a>
        <a href="#architecture" class="btn btn-outline">View Demo</a>
      </div>
    </section>

    <section id="security" class="security-section">
      <div class="section-title">Security</div>
      <div class="security-grid">
        <div class="security-card">
          <span class="check">✓</span>
          <span>Tenant isolation</span>
        </div>
        <div class="security-card">
          <span class="check">✓</span>
          <span>Role-based authorization</span>
        </div>
        <div class="security-card">
          <span class="check">✓</span>
          <span>Private document storage</span>
        </div>
        <div class="security-card">
          <span class="check">✓</span>
          <span>Append-only audit trail</span>
        </div>
      </div>
    </section>

    <section id="how" class="how-section">
      <div class="section-title">How It Works</div>
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-num">01</div>
          <div class="step-name">Upload</div>
          <p class="step-desc">Staff uploads statutory files with SHA-256 integrity verification.</p>
        </div>
        <div class="step-card">
          <div class="step-num">02</div>
          <div class="step-name">Review</div>
          <p class="step-desc">Reviewer begins inspection under strict tenant boundaries.</p>
        </div>
        <div class="step-card">
          <div class="step-num">03</div>
          <div class="step-name">Correct</div>
          <p class="step-desc">Mandatory comments required to flag discrepancies and request changes.</p>
        </div>
        <div class="step-card">
          <div class="step-num">04</div>
          <div class="step-name">Approve</div>
          <p class="step-desc">Formal sign-off advancing document status to compliant.</p>
        </div>
        <div class="step-card">
          <div class="step-num">05</div>
          <div class="step-name">Trace</div>
          <p class="step-desc">Append-only audit trail capturing every actor and timestamp.</p>
        </div>
      </div>
    </section>

    <div class="split-grid">
      <div id="accounts" class="panel">
        <div class="panel-header">
          <div class="panel-title">Evaluation Accounts</div>
          <div class="callout">Demo-only accounts. No production data.</div>
        </div>
        <div class="account-list">
          <div class="account-row">
            <span class="account-label">Staff</span>
            <span class="account-email">rohit@abc.com</span>
          </div>
          <div class="account-row">
            <span class="account-label">Reviewer</span>
            <span class="account-email">aman@abc.com</span>
          </div>
          <div class="account-row">
            <span class="account-label">Isolation Test</span>
            <span class="account-email">priya@xyz.com</span>
          </div>
        </div>
        <p class="footnote">
          Demo credentials and passwords are provided in the repository README.
        </p>
      </div>

      <div id="architecture" class="panel">
        <div class="panel-header">
          <div class="panel-title">System Architecture</div>
          <div class="callout">Core architectural invariants</div>
        </div>
        <ul class="invariants-list">
          <li class="invariant-item">
            <strong>Tenant Isolation</strong>
            Every tenant-owned query is scoped to the authenticated user&rsquo;s firm; cross-firm access returns 404.
          </li>
          <li class="invariant-item">
            <strong>Audit Trail</strong>
            Append-only events committed atomically in the same database transaction.
          </li>
          <li class="invariant-item">
            <strong>State Engine</strong>
            Strict lifecycle progression from PENDING to APPROVED.
          </li>
          <li class="invariant-item">
            <strong>File Security</strong>
            Private storage outside web root; streamed via authenticated endpoints.
          </li>
        </ul>
      </div>
    </div>

    <footer class="footer">
      <div>Mini Audit System · Production Architecture</div>
      <div>Zero Badging · Pure Design System</div>
    </footer>
  </div>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
      },
    });
  },
};
