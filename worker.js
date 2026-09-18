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
  <title>Mini Audit · Document Review System</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background: #fafafa;
      color: #171717;
      line-height: 1.6;
      padding: 40px 20px;
    }
    .container {
      max-width: 880px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 16px;
      padding: 48px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    }
    .header {
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .logo-icon {
      width: 36px;
      height: 36px;
      background: #171717;
      color: #fff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 18px;
    }
    h1 {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .subtitle {
      color: #737373;
      font-size: 16px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
      margin: 28px 0;
    }
    .card {
      background: #fafafa;
      border: 1px solid #e5e5e5;
      border-radius: 12px;
      padding: 24px;
    }
    .card h3 {
      font-size: 15px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #525252;
      margin-bottom: 12px;
    }
    .card p, .card li {
      font-size: 14px;
      color: #404040;
    }
    ul { list-style: none; }
    li { margin-bottom: 8px; }
    .credential-item {
      padding: 10px 12px;
      background: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      margin-bottom: 8px;
      font-size: 13px;
    }
    .credential-role {
      font-weight: 700;
      color: #171717;
      display: block;
      margin-bottom: 2px;
    }
    .code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: #262626;
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }
    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      margin-right: 6px;
    }
    .footer {
      border-top: 1px solid #f0f0f0;
      padding-top: 24px;
      margin-top: 36px;
      font-size: 13px;
      color: #737373;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <div class="logo-icon">M</div>
        <h1>Mini Audit Document Review System</h1>
      </div>
      <p class="subtitle">
        Production-minded, multi-tenant statutory audit lifecycle engine for Chartered Accountant firms.
      </p>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <h3><span class="status-dot"></span>Cloudflare Gateway Status</h3>
      <p>
        Cloudflare Edge Worker is operational. The full application consists of a Next.js 14 frontend and a FastAPI Python backend with strict multi-tenant database isolation.
      </p>
    </div>

    <div class="grid">
      <div class="card">
        <h3>Evaluation Accounts</h3>
        <div class="credential-item">
          <span class="credential-role">Firm A · Staff</span>
          Email: <span class="code">rohit@abc.com</span><br/>
          Password: <span class="code">password123</span>
        </div>
        <div class="credential-item">
          <span class="credential-role">Firm A · Reviewer</span>
          Email: <span class="code">aman@abc.com</span><br/>
          Password: <span class="code">password123</span>
        </div>
        <div class="credential-item">
          <span class="credential-role">Firm B · Reviewer (Isolation Target)</span>
          Email: <span class="code">priya@xyz.com</span><br/>
          Password: <span class="code">password123</span>
        </div>
      </div>

      <div class="card">
        <h3>System Architecture</h3>
        <ul>
          <li><strong>Tenant Isolation:</strong> Enforced by strict row-level database filtering. Cross-firm queries return 404.</li>
          <li><strong>Audit Trail:</strong> Append-only events committed atomically in the same transaction.</li>
          <li><strong>State Engine:</strong> Strict lifecycle progression from PENDING to APPROVED.</li>
          <li><strong>File Security:</strong> Private storage outside web root; streamed via authenticated endpoints.</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <div>Mini Audit System · Evaluation Build</div>
      <div>Zero Badging · Pure Design System</div>
    </div>
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
