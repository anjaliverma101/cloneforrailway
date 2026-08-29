// Railway Proxy Server — Reverse Proxy for hirerivet.up.railway.app
// Deploy this to Railway

const express = require('express');
const compression = require('compression');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── ORIGIN DOMAIN ──────────────────────────────────────────────────────────────
const ORIGIN_DOMAIN = 'hirerivet.up.railway.app';
const BASE_URL = process.env.BASE_URL || 'https://hirerivet-proxy.up.railway.app';

// ─── CACHE CONFIGURATION ──────────────────────────────────────────────────────────
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 600 }); // 24 hours cache

// ─── AD CONFIGURATION ────────────────────────────────────────────────────────
const AD_CONFIGS = {
  "bigbugit.digitalledlight.liveblog365.com": {
    key: '9d20a54f0e50580170813bbcaffd4a11',
    topKey: 'db54a48ff9ee9b416464f115e87d6edb'
  },
  "frontnova.wordle.infinityfreeapp.com": {
    key: 'a8c5a45895746605f5e7a2f9c9cc18f8'
  },
  "27.hostingpk.infinityfree.me": {
    key: '258a126db96603af459617c973ecb753',
    topKey: 'ceb2d651381a5967bbc416c4be2a1456'
  }
};

// ─── AD FUNCTIONS ──────────────────────────────────────────────────────────────
function getAdScripts(host) {
  const config = AD_CONFIGS[host];
  if (!config) return null;
  let scripts = { top: null, main: null };
  if (config.topKey) {
    scripts.top = `
<script>
  atOptions = {
    'key' : '${config.topKey}',
    'format' : 'iframe',
    'height' : 60,
    'width' : 468,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/${config.topKey}/invoke.js"></script>
`;
  }
  if (config.key) {
    scripts.main = `
<script>
  atOptions = {
    'key' : '${config.key}',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/${config.key}/invoke.js"></script>
`;
  }
  return scripts;
}

function getAdBanner(host) {
  const scripts = getAdScripts(host);
  if (!scripts) return '';
  let ads = '';
  if (scripts.top) {
    ads += `
<div style="text-align:center; width:100%; padding:8px 0; background:#fff; border-bottom:1px solid #eee;">
  ${scripts.top}
</div>
`;
  }
  if (scripts.main) {
    ads += `
<div style="text-align:center; width:100%; padding:10px 0; background:#fff; border-bottom:1px solid #eee;">
  ${scripts.main}
</div>
`;
  }
  return ads;
}

function getAdFooter(host) {
  const scripts = getAdScripts(host);
  if (!scripts || !scripts.main) return '';
  return `
<div style="text-align:center; width:100%; padding:10px 0; background:#fff; border-top:1px solid #eee; margin-top:20px;">
  ${scripts.main}
</div>
`;
}

// ─── REWRITE FUNCTIONS ─────────────────────────────────────────────────────────
function rewriteText(body, proxyHost) {
  return body
    .split(`https://${ORIGIN_DOMAIN}`).join(`https://${proxyHost}`)
    .split(`http://${ORIGIN_DOMAIN}`).join(`https://${proxyHost}`)
    .split('Vaia – Talents').join('Talent Portal')
    .split('Vaia').join('Talent')
    .split('hirerivet').join('TalentPortal');
}

// ─── RENDER HOME PAGE ──────────────────────────────────────────────────────────
function renderHomePage(content, proxyHost) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="canonical" href="${BASE_URL}/">
  <title>${content.title || 'Talent Portal'} - Find Your Dream Career</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f0f4f8;
      color: #1a202c;
      line-height: 1.6;
    }
    .header {
      background: linear-gradient(135deg, #1a237e 0%, #0d1445 100%);
      color: white;
      padding: 20px 0;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -1px;
    }
    .logo span { color: #ffd700; }
    .nav-links {
      display: flex;
      gap: 30px;
      align-items: center;
    }
    .nav-links a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      transition: opacity 0.3s;
    }
    .nav-links a:hover { opacity: 0.8; }
    
    .hero {
      background: linear-gradient(135deg, #1a237e 0%, #0d1445 50%, #070a1f 100%);
      color: white;
      padding: 100px 0 80px;
      text-align: center;
      border-radius: 0 0 60px 60px;
      margin-bottom: 40px;
    }
    .hero h1 {
      font-size: 52px;
      font-weight: 800;
      margin-bottom: 20px;
      letter-spacing: -1px;
    }
    .hero h1 .accent { color: #ffd700; }
    .hero p {
      font-size: 20px;
      max-width: 600px;
      margin: 0 auto 30px;
      opacity: 0.9;
    }
    .search-box {
      display: flex;
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 50px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    .search-box input {
      flex: 1;
      padding: 18px 25px;
      border: none;
      outline: none;
      font-size: 16px;
    }
    .search-box button {
      padding: 18px 35px;
      background: #ffd700;
      border: none;
      font-weight: 700;
      color: #1a202c;
      cursor: pointer;
      transition: background 0.3s;
    }
    .search-box button:hover { background: #f59e0b; }
    
    .stat-bar {
      display: flex;
      justify-content: center;
      gap: 3rem;
      flex-wrap: wrap;
      margin-top: 2.5rem;
    }
    .stat-item { text-align: center; }
    .stat-item .number {
      font-size: 2rem;
      font-weight: 800;
      color: #ffd700;
      display: block;
    }
    .stat-item .label {
      font-size: 0.85rem;
      opacity: 0.8;
    }
    
    .section-title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 30px;
      color: #1a202c;
      text-align: center;
    }
    .section-title span { color: #1a237e; }
    
    .job-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 25px;
      margin-top: 20px;
    }
    .job-card {
      background: white;
      border-radius: 15px;
      padding: 25px;
      transition: transform 0.3s, box-shadow 0.3s;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .job-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    .job-card h3 {
      font-size: 18px;
      margin-bottom: 8px;
      color: #1a237e;
    }
    .job-card .company {
      color: #718096;
      font-weight: 500;
      font-size: 0.95rem;
    }
    .job-card .location {
      color: #a0aec0;
      font-size: 14px;
      margin: 8px 0;
    }
    .job-card .tag {
      display: inline-block;
      padding: 4px 12px;
      background: #e2e8f0;
      border-radius: 20px;
      font-size: 12px;
      color: #4a5568;
    }
    .job-card .salary {
      font-weight: 700;
      color: #1a237e;
      margin-top: 10px;
    }
    
    .featured-section {
      background: white;
      border-radius: 20px;
      padding: 40px;
      margin-bottom: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    }
    
    .blog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 25px;
    }
    .blog-card {
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      transition: transform 0.3s;
      border: 1px solid #e2e8f0;
    }
    .blog-card:hover { transform: translateY(-5px); }
    .blog-card .content { padding: 20px; }
    .blog-card h4 {
      font-size: 18px;
      margin-bottom: 10px;
      color: #1a237e;
    }
    .blog-card p {
      color: #718096;
      font-size: 14px;
    }
    
    .apply-now-container {
      text-align: center;
      margin: 40px 0;
      padding: 40px;
      background: linear-gradient(135deg, #1a237e 0%, #0d1445 100%);
      border-radius: 20px;
      color: white;
      box-shadow: 0 10px 30px rgba(26, 35, 126, 0.3);
    }
    .apply-now-container h2 {
      font-size: 32px;
      margin-bottom: 15px;
    }
    .apply-now-container p {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 25px;
    }
    .apply-now-btn {
      display: inline-block;
      padding: 18px 50px;
      background: #ffd700;
      color: #1a202c;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 700;
      font-size: 18px;
      transition: transform 0.3s, box-shadow 0.3s;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .apply-now-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    }
    
    .footer {
      background: #1a1a2e;
      color: rgba(255,255,255,0.7);
      padding: 40px 0;
      margin-top: 40px;
      border-radius: 50px 50px 0 0;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 30px;
    }
    .footer h4 {
      margin-bottom: 15px;
      color: #ffd700;
    }
    .footer a {
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      display: block;
      margin-bottom: 8px;
      transition: color 0.3s;
    }
    .footer a:hover { color: white; }
    .footer-bottom {
      text-align: center;
      padding-top: 30px;
      margin-top: 30px;
      border-top: 1px solid #2d3748;
    }
    
    @media (max-width: 768px) {
      .hero h1 { font-size: 32px; }
      .hero { padding: 60px 0 40px; }
      .nav-links { gap: 15px; font-size: 0.9rem; }
      .search-box { flex-direction: column; border-radius: 20px; }
      .search-box button { border-radius: 0 0 20px 20px; }
      .stat-bar { gap: 1.5rem; }
      .apply-now-container h2 { font-size: 24px; }
    }
  </style>
  <meta name="google-site-verification" content="bGuP_rIwla6cpg952qUy0O7Y3pbHkPGsu2FvHv1RvnY" />
  <meta name="google-site-verification" content="reSOHfSgwM50dbCxkg1FAA1EBYu2fe-PgQYN72v1-uo" />
  <meta name="google-site-verification" content="8mxCdaOA6sexfOGvLjVikBJ8GFQKrCWCerdJy1jxf6s" />
</head>
<body>
  <header class="header">
    <div class="container header-content">
      <div class="logo">Talent<span>Portal</span></div>
      <nav class="nav-links">
        <a href="/">Home</a>
        <a href="/jobs">Jobs</a>
        <a href="/blog">Blog</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </nav>
    </div>
  </header>

  <section class="hero">
    <div class="container">
      <h1>Your Dream Career <span class="accent">Starts Here</span></h1>
      <p>Discover thousands of opportunities from top companies. Find the perfect job that matches your skills and passion.</p>
      <div class="search-box">
        <input type="text" placeholder="Search jobs, companies, or keywords...">
        <button>Search Jobs</button>
      </div>
      <div class="stat-bar">
        <div class="stat-item">
          <span class="number">10K+</span>
          <span class="label">Active Jobs</span>
        </div>
        <div class="stat-item">
          <span class="number">5K+</span>
          <span class="label">Companies</span>
        </div>
        <div class="stat-item">
          <span class="number">50K+</span>
          <span class="label">Happy Candidates</span>
        </div>
      </div>
    </div>
  </section>

  <div class="container">
    <div class="featured-section">
      <h2 class="section-title">Featured <span>Jobs</span></h2>
      <div class="job-grid">
        ${content.jobListings || `
          <div class="job-card">
            <h3>Software Engineer</h3>
            <div class="company">Tech Corp Inc.</div>
            <div class="location">📍 San Francisco, CA</div>
            <span class="tag">Full-time</span>
            <div class="salary">$120K - $160K</div>
          </div>
          <div class="job-card">
            <h3>Product Manager</h3>
            <div class="company">Innovation Labs</div>
            <div class="location">📍 New York, NY</div>
            <span class="tag">Remote</span>
            <div class="salary">$130K - $170K</div>
          </div>
          <div class="job-card">
            <h3>Data Scientist</h3>
            <div class="company">AI Solutions</div>
            <div class="location">📍 Austin, TX</div>
            <span class="tag">Full-time</span>
            <div class="salary">$140K - $180K</div>
          </div>
        `}
      </div>
    </div>

    <div class="featured-section">
      <h2 class="section-title">Latest <span>Insights</span></h2>
      <div class="blog-grid">
        ${content.blogPosts || `
          <div class="blog-card">
            <div class="content">
              <h4>How to Ace Your Next Interview</h4>
              <p>Tips and strategies to impress employers and land your dream job.</p>
            </div>
          </div>
          <div class="blog-card">
            <div class="content">
              <h4>Top Skills for 2026</h4>
              <p>Discover the most in-demand skills that employers are looking for.</p>
            </div>
          </div>
          <div class="blog-card">
            <div class="content">
              <h4>Remote Work Trends</h4>
              <p>How the workplace is evolving and what it means for job seekers.</p>
            </div>
          </div>
        `}
      </div>
    </div>

    <div class="apply-now-container">
      <h2>Ready to Take the Next Step?</h2>
      <p>Apply now and start your journey towards a brighter future</p>
      <a href="https://ruwmqs-uq.myshopify.com/pages/apply" class="apply-now-btn" target="_blank">Apply Now →</a>
    </div>
  </div>

  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <h4>TalentPortal</h4>
          <p style="color: rgba(255,255,255,0.6);">Your trusted partner in finding the perfect career opportunity.</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <a href="/jobs">Browse Jobs</a>
          <a href="/companies">Companies</a>
          <a href="/blog">Blog</a>
        </div>
        <div>
          <h4>Support</h4>
          <a href="/contact">Contact Us</a>
          <a href="/faq">FAQ</a>
          <a href="/privacy">Privacy Policy</a>
        </div>
      </div>
      <div class="footer-bottom">
        &copy; 2026 TalentPortal. All rights reserved.
      </div>
    </div>
  </footer>
</body>
</html>`;
}

// ─── RENDER INNER PAGE ─────────────────────────────────────────────────────────
function renderInnerPage(pageTitle, content) {
  let cleanContent = content.mainContent || '<p>Content not available</p>';
  cleanContent = cleanContent
    .replace(/<a[^>]*class="[^"]*apply[^"]*"[^>]*>[\s\S]*?Apply Now[\s\S]*?<\/a>/gi, '')
    .replace(/<a[^>]*href="[^"]*apply[^"]*"[^>]*>[\s\S]*?Apply[\s]*Now[\s\S]*?<\/a>/gi, '')
    .replace(/Apply Now/gi, '')
    .replace(/<button[^>]*>[\s]*Apply[\s]*Now[\s]*<\/button>/gi, '')
    .replace(/<div[^>]*class="[^"]*apply[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="canonical" href="${BASE_URL}${pageTitle ? '/jobs' : ''}">
  <title>${pageTitle} | TalentPortal</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f0f4f8;
      color: #1a202c;
      line-height: 1.6;
    }
    .header {
      background: linear-gradient(135deg, #1a237e 0%, #0d1445 100%);
      color: white;
      padding: 15px 0;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -1px;
    }
    .logo span { color: #ffd700; }
    .nav-links {
      display: flex;
      gap: 25px;
      align-items: center;
    }
    .nav-links a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      transition: opacity 0.3s;
    }
    .nav-links a:hover { opacity: 0.8; }
    
    .breadcrumb {
      background: white;
      padding: 15px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      margin-bottom: 30px;
    }
    .breadcrumb a {
      color: #1a237e;
      text-decoration: none;
    }
    
    .content-wrapper {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      margin-bottom: 30px;
      max-width: 900px;
      margin-left: auto;
      margin-right: auto;
    }
    .content-wrapper h1 {
      font-size: 32px;
      color: #1a202c;
      margin-bottom: 20px;
    }
    .content-wrapper h2 {
      font-size: 24px;
      color: #2d3748;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    .content-wrapper h3 {
      font-size: 20px;
      color: #4a5568;
      margin-top: 20px;
    }
    .content-wrapper p {
      color: #4a5568;
      margin-bottom: 15px;
    }
    .content-wrapper img {
      max-width: 100%;
      border-radius: 10px;
      margin: 20px 0;
    }
    .content-wrapper ul, .content-wrapper ol {
      color: #4a5568;
      margin: 15px 0 15px 25px;
    }
    
    .apply-section {
      text-align: center;
      margin-top: 30px;
      padding-top: 30px;
      border-top: 2px solid #e2e8f0;
    }
    .apply-now-btn-inner {
      display: inline-block;
      padding: 15px 45px;
      background: #ffd700;
      color: #1a202c;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 700;
      font-size: 16px;
      transition: transform 0.3s, box-shadow 0.3s;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .apply-now-btn-inner:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    }
    
    .footer {
      background: #1a1a2e;
      color: rgba(255,255,255,0.7);
      padding: 30px 0;
      margin-top: 40px;
    }
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }
    .footer a {
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      margin: 0 10px;
      transition: color 0.3s;
    }
    .footer a:hover { color: white; }
    .footer-bottom {
      text-align: center;
      padding-top: 20px;
      margin-top: 20px;
      border-top: 1px solid #2d3748;
    }
    
    @media (max-width: 768px) {
      .content-wrapper { padding: 20px; }
      .content-wrapper h1 { font-size: 24px; }
      .nav-links { gap: 15px; font-size: 14px; }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="container header-content">
      <div class="logo">Talent<span>Portal</span></div>
      <nav class="nav-links">
        <a href="/">Home</a>
        <a href="/jobs">Jobs</a>
        <a href="/blog">Blog</a>
      </nav>
    </div>
  </header>

  <div class="breadcrumb">
    <div class="container">
      <a href="/">Home</a> / <span>${pageTitle}</span>
    </div>
  </div>

  <div class="container">
    <div class="content-wrapper">
      ${cleanContent}
      <div class="apply-section">
        <a href="https://ruwmqs-uq.myshopify.com/pages/apply" class="apply-now-btn-inner" target="_blank">Apply Now →</a>
      </div>
    </div>
  </div>

  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div>&copy; 2026 TalentPortal. All rights reserved.</div>
        <div>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/contact">Contact</a>
        </div>
      </div>
      <div class="footer-bottom">
        Helping you find your dream career
      </div>
    </div>
  </footer>
</body>
</html>`;
}

// ─── FALLBACK PAGE ─────────────────────────────────────────────────────────────
function serveFallbackPage(req) {
  const url = new URL(req.url || '/', BASE_URL);
  const pathParts = url.pathname.split('/');
  const slug = pathParts[pathParts.length - 1] || 'job';
  const jobTitle = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return `
<!DOCTYPE html>
<html>
<head>
  <title>${jobTitle} - Talent Portal</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;color:#222;line-height:1.6}
    .header{background:linear-gradient(135deg,#1a237e 0%,#0d1445 100%);color:#fff;padding:1rem 0;text-align:center}
    .header h1{font-size:1.8rem}
    .header span{color:#ffd700}
    .container{max-width:960px;margin:0 auto;padding:2rem 1.5rem}
    .card{background:#fff;border-radius:12px;padding:2rem;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
    .title{font-size:1.8rem;font-weight:700;color:#1a237e;margin-bottom:.5rem}
    .company{color:#555;margin:1rem 0}
    .badge{display:inline-block;padding:.3rem .8rem;border-radius:20px;font-size:.75rem;font-weight:600}
    .badge-remote{background:#e8f5e9;color:#2e7d32}
    .badge-fulltime{background:#e3f2fd;color:#1565c0}
    .note{background:#fff3e0;border-left:4px solid #ff9800;padding:1rem;border-radius:8px;margin:1rem 0}
    .btn{display:inline-block;padding:.8rem 2rem;background:#1a237e;color:#fff;border:none;border-radius:8px;text-decoration:none;font-weight:700}
    .btn:hover{background:#0d1445}
    .btn-apply{background:#ffd700;color:#1a202c}
    .btn-apply:hover{background:#f59e0b}
    .apply-section{margin-top:1.5rem;padding-top:1.5rem;border-top:2px solid #e2e8f0;text-align:center}
    footer{background:#1a1a2e;color:rgba(255,255,255,0.7);text-align:center;padding:1.5rem;margin-top:2rem}
    footer a{color:#ffd700}
  </style>
</head>
<body>
  <div class="header">
    <h1>Talent<span>Portal</span></h1>
  </div>
  <div class="container">
    <div class="card">
      <div class="title">${jobTitle}</div>
      <div class="company">🏢 Talent Company</div>
      <div>
        <span class="badge badge-remote">🌐 Remote</span>
        <span class="badge badge-fulltime">Full-time</span>
      </div>
      <div class="note">
        <strong>ℹ️ Note:</strong> This page is being served from cache. The original job details will appear when the source is available.
      </div>
      <p style="margin:1.5rem 0;color:#666">This is a placeholder. The full job description will load once the remote server is online.</p>
      <div class="apply-section">
        <a href="https://ruwmqs-uq.myshopify.com/pages/apply" class="btn btn-apply" target="_blank">Apply Now →</a>
      </div>
      <div style="text-align:center;margin-top:1.5rem">
        <a href="/" class="btn">← Back to Home</a>
        <a href="/jobs" class="btn">Browse All Jobs</a>
      </div>
    </div>
  </div>
  <footer>&copy; 2026 TalentPortal</footer>
</body>
</html>`;
}

// ─── INJECT ADS ─────────────────────────────────────────────────────────────────
function injectAds(html, host) {
  const hasAds = !!AD_CONFIGS[host];
  if (!hasAds) return html;
  const adsHtml = getAdBanner(host);
  html = html.replace(/<body[^>]*>/, `$&${adsHtml}`);
  const footerAd = getAdFooter(host);
  if (footerAd) {
    html = html.replace(/<\/body>/, `${footerAd}</body>`);
  }
  return html;
}

// ─── EXTRACT CONTENT ────────────────────────────────────────────────────────────
function extractContent(body) {
  const titleMatch = body.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : "Job Portal";
  
  let mainContent = "";
  const mainMatch = body.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) {
    mainContent = mainMatch[1];
  } else {
    const contentMatch = body.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (contentMatch) mainContent = contentMatch[1];
  }
  
  let jobListings = "";
  const jobMatch = body.match(/<div[^>]*class="[^"]*job[^"]*"[^>]*>([\s\S]*?)<\/div>/gi);
  if (jobMatch) {
    jobListings = jobMatch.join("");
  }
  
  let blogPosts = "";
  const blogMatch = body.match(/<article[^>]*>([\s\S]*?)<\/article>/gi);
  if (blogMatch) {
    blogPosts = blogMatch.join("");
  }
  
  return { title, mainContent, jobListings, blogPosts };
}

// ─── MAIN HANDLER ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  // Get the host from the request
  const host = req.get('host');
  req.proxyHost = host;
  req.hasAds = !!AD_CONFIGS[host];
  next();
});

// ─── HOME PAGE ─────────────────────────────────────────────────────────────────
app.get('/', async (req, res) => {
  const cacheKey = 'home_page';
  let cached = cache.get(cacheKey);
  
  if (cached) {
    return res.send(cached);
  }
  
  try {
    const response = await fetch(`https://${ORIGIN_DOMAIN}/`);
    const body = await response.text();
    
    // Rewrite content
    let html = rewriteText(body, req.proxyHost);
    
    // Remove unwanted content
    html = html.replace(/Common Interview Questions And Answers/gi, "");
    html = html.replace(/Ads/gi, "");
    html = html.replace(/Close share/gi, "");
    html = html.replace(/Copy link/gi, "");
    html = html.replace(/Back to blog/gi, "");
    html = html.replace(/Get Hired Faster With Roku!/gi, "");
    
    // Remove share icons
    html = html.replace(/<[^>]*class="[^"]*share[^"]*"[^>]*>[\s\S]*?<\/[^>]*>/gi, "");
    html = html.replace(/<[^>]*class="[^"]*social[^"]*"[^>]*>[\s\S]*?<\/[^>]*>/gi, "");
    html = html.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, (match) => {
      if (match.includes("share") || match.includes("social") || match.includes("icon")) {
        return "";
      }
      return match;
    });
    
    // Extract content
    const content = extractContent(html);
    const finalHtml = renderHomePage(content, req.proxyHost);
    
    // Inject ads
    const withAds = injectAds(finalHtml, req.proxyHost);
    
    cache.set(cacheKey, withAds);
    res.send(withAds);
    
  } catch (error) {
    console.error('Home page error:', error.message);
    const fallback = serveFallbackPage(req);
    res.send(fallback);
  }
});

// ─── JOB LISTING PAGE ─────────────────────────────────────────────────────────
app.get('/jobs', async (req, res) => {
  const cacheKey = 'jobs_page';
  let cached = cache.get(cacheKey);
  
  if (cached) {
    return res.send(cached);
  }
  
  try {
    const response = await fetch(`https://${ORIGIN_DOMAIN}/jobs`);
    const body = await response.text();
    
    let html = rewriteText(body, req.proxyHost);
    html = html.replace(/Common Interview Questions And Answers/gi, "");
    html = html.replace(/Ads/gi, "");
    html = html.replace(/Close share/gi, "");
    html = html.replace(/Copy link/gi, "");
    html = html.replace(/Back to blog/gi, "");
    html = html.replace(/Get Hired Faster With Roku!/gi, "");
    
    html = html.replace(/<[^>]*class="[^"]*share[^"]*"[^>]*>[\s\S]*?<\/[^>]*>/gi, "");
    html = html.replace(/<[^>]*class="[^"]*social[^"]*"[^>]*>[\s\S]*?<\/[^>]*>/gi, "");
    html = html.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, (match) => {
      if (match.includes("share") || match.includes("social") || match.includes("icon")) {
        return "";
      }
      return match;
    });
    
    const content = extractContent(html);
    const finalHtml = renderHomePage({ ...content, title: 'Browse Jobs' }, req.proxyHost);
    const withAds = injectAds(finalHtml, req.proxyHost);
    
    cache.set(cacheKey, withAds);
    res.send(withAds);
    
  } catch (error) {
    console.error('Jobs page error:', error.message);
    const fallback = serveFallbackPage(req);
    res.send(fallback);
  }
});

// ─── INDIVIDUAL JOB PAGE ──────────────────────────────────────────────────────
app.get('/jobs/:id', async (req, res) => {
  const jobId = req.params.id;
  const cacheKey = `job_${jobId}`;
  let cached = cache.get(cacheKey);
  
  if (cached) {
    return res.send(cached);
  }
  
  try {
    const response = await fetch(`https://${ORIGIN_DOMAIN}/jobs/${jobId}`);
    
    if (response.status === 404) {
      return res.status(404).send(serveFallbackPage(req));
    }
    
    const body = await response.text();
    
    let html = rewriteText(body, req.proxyHost);
    html = html.replace(/Common Interview Questions And Answers/gi, "");
    html = html.replace(/Ads/gi, "");
    html = html.replace(/Close share/gi, "");
    html = html.replace(/Copy link/gi, "");
    html = html.replace(/Back to blog/gi, "");
    html = html.replace(/Get Hired Faster With Roku!/gi, "");
    
    // Remove Apply Now buttons from content
    html = html.replace(/<a[^>]*class="[^"]*apply[^"]*"[^>]*>[\s\S]*?Apply Now[\s\S]*?<\/a>/gi, '');
    html = html.replace(/<a[^>]*href="[^"]*apply[^"]*"[^>]*>[\s\S]*?Apply[\s]*Now[\s\S]*?<\/a>/gi, '');
    html = html.replace(/<a[^>]*>[\s]*Apply[\s]*Now[\s]*<\/a>/gi, '');
    html = html.replace(/<button[^>]*>[\s]*Apply[\s]*Now[\s]*<\/button>/gi, '');
    html = html.replace(/<div[^>]*class="[^"]*apply[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
    html = html.replace(/Apply Now/gi, '');
    
    html = html.replace(/<[^>]*class="[^"]*share[^"]*"[^>]*>[\s\S]*?<\/[^>]*>/gi, "");
    html = html.replace(/<[^>]*class="[^"]*social[^"]*"[^>]*>[\s\S]*?<\/[^>]*>/gi, "");
    html = html.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, (match) => {
      if (match.includes("share") || match.includes("social") || match.includes("icon")) {
        return "";
      }
      return match;
    });
    
    const content = extractContent(html);
    const pageTitle = content.title || "Job Details";
    const finalHtml = renderInnerPage(pageTitle, content);
    const withAds = injectAds(finalHtml, req.proxyHost);
    
    cache.set(cacheKey, withAds);
    res.send(withAds);
    
  } catch (error) {
    console.error('Job page error:', error.message);
    const fallback = serveFallbackPage(req);
    res.send(fallback);
  }
});

// ─── SITEMAP ──────────────────────────────────────────────────────────────────
app.get('/sitemap.xml', async (req, res) => {
  const cacheKey = 'sitemap_index';
  let cached = cache.get(cacheKey);
  
  if (cached) {
    return res.type('application/xml').send(cached);
  }
  
  try {
    const response = await fetch(`https://${ORIGIN_DOMAIN}/sitemap.xml`);
    let body = await response.text();
    body = body.replace(/https:\/\/${ORIGIN_DOMAIN}/g, BASE_URL);
    
    cache.set(cacheKey, body);
    res.type('application/xml').send(body);
    
  } catch (error) {
    // Generate fallback sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    for (let i = 1; i <= 100; i++) {
      xml += `\n  <sitemap><loc>${BASE_URL}/sitemap-${i}.xml</loc></sitemap>`;
    }
    xml += `\n</sitemapindex>`;
    res.type('application/xml').send(xml);
  }
});

app.get('/sitemap-:num.xml', async (req, res) => {
  const num = req.params.num;
  const cacheKey = `sitemap_${num}`;
  let cached = cache.get(cacheKey);
  
  if (cached) {
    return res.type('application/xml').send(cached);
  }
  
  try {
    const response = await fetch(`https://${ORIGIN_DOMAIN}/sitemap-${num}.xml`);
    
    if (response.status === 404) {
      return res.status(404).send('Not found');
    }
    
    let body = await response.text();
    body = body.replace(/https:\/\/${ORIGIN_DOMAIN}/g, BASE_URL);
    
    cache.set(cacheKey, body);
    res.type('application/xml').send(body);
    
  } catch (error) {
    res.status(404).send('Not found');
  }
});

// ─── ROBOTS.TXT ────────────────────────────────────────────────────────────────
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *
Allow: /
Sitemap: ${BASE_URL}/sitemap.xml
Disallow: /api/`);
});

// ─── SITEMAP HTML ────────────────────────────────────────────────────────────
app.get('/sitemap', (req, res) => {
  const html = `<!DOCTYPE html>
<html>
<head><title>Sitemap - TalentPortal</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;background:#f5f5f5;padding:2rem;color:#222}
  .container{max-width:960px;margin:0 auto}
  h1{color:#1a237e;margin-bottom:1rem}
  .card{background:#fff;border-radius:12px;padding:1.5rem;margin-bottom:1rem;border:1px solid #e8e8e8}
  .card h2{color:#1a237e;margin-bottom:.5rem}
  .card a{color:#1a237e;text-decoration:none;display:block;padding:.3rem 0}
  .card a:hover{text-decoration:underline}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem}
  .footer{text-align:center;padding:1.5rem;color:#888;margin-top:2rem}
</style>
</head>
<body>
<div class="container">
  <h1>📄 Sitemap - TalentPortal</h1>
  <div class="grid">
    <div class="card">
      <h2>Main Pages</h2>
      <a href="/">🏠 Home</a>
      <a href="/jobs">📋 All Jobs</a>
      <a href="/blog">📝 Blog</a>
      <a href="/about">ℹ️ About</a>
      <a href="/contact">📧 Contact</a>
    </div>
    <div class="card">
      <h2>XML Sitemaps</h2>
      <a href="/sitemap.xml">📄 Sitemap Index</a>
      <a href="/sitemap-1.xml">📄 Sitemap 1 (Jobs 1-1000)</a>
      <a href="/sitemap-2.xml">📄 Sitemap 2 (Jobs 1001-2000)</a>
      <span style="color:#888;font-size:.85rem">… 100 sitemap files total</span>
    </div>
    <div class="card">
      <h2>Job Pages Range</h2>
      <a href="/jobs/1">🔹 Job #1 (First Remote Job)</a>
      <a href="/jobs/50000">🔹 Job #50,000 (Last Remote Job)</a>
      <a href="/jobs/50001">🔹 Job #50,001 (First On-site Job)</a>
      <a href="/jobs/100000">🔹 Job #100,000 (Last Job)</a>
    </div>
  </div>
</div>
<div class="footer">&copy; 2026 TalentPortal</div>
</body>
</html>`;
  res.send(html);
});

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send(serveFallbackPage(req));
});

// ─── START SERVER ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 TalentPortal Proxy running on port ${PORT}`);
  console.log(`📡 Proxying: https://${ORIGIN_DOMAIN}`);
  console.log(`🌍 Base URL: ${BASE_URL}`);
  console.log(`💾 Cache TTL: 24 hours`);
  console.log(`📋 Proxy host: ${ORIGIN_DOMAIN}`);
});
