// Railway Proxy Server — Clone Website on hirerivets.up.railway.app
// Deploy this to Railway

const express = require('express');
const compression = require('compression');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── ORIGIN DOMAIN TO CLONE ──────────────────────────────────────────────────
// Change this to the website you want to clone
const ORIGIN_DOMAIN = 'hirerivet.up.railway.app';

// ─── CACHE CONFIGURATION ──────────────────────────────────────────────────────
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 600 }); // 24 hours

// ─── AD CONFIGURATION ────────────────────────────────────────────────────────
const AD_CONFIGS = {
  "hirerivets.up.railway.app": {
    key: '9d20a54f0e50580170813bbcaffd4a11',
    topKey: 'db54a48ff9ee9b416464f115e87d6edb'
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
<div style="text-align:center; width:100%; padding:8px 0; background:#f5f5f5; border-bottom:1px solid #eee;">
  ${scripts.top}
</div>
`;
  }
  if (scripts.main) {
    ads += `
<div style="text-align:center; width:100%; padding:10px 0; background:#f5f5f5; border-bottom:1px solid #eee;">
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
<div style="text-align:center; width:100%; padding:10px 0; background:#f5f5f5; border-top:1px solid #eee; margin-top:20px;">
  ${scripts.main}
</div>
`;
}

// ─── REWRITE FUNCTIONS ─────────────────────────────────────────────────────────
function rewriteText(body, proxyHost) {
  let result = body
    .split(`https://${ORIGIN_DOMAIN}`).join(`https://${proxyHost}`)
    .split(`http://${ORIGIN_DOMAIN}`).join(`https://${proxyHost}`);
  return result;
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

// ─── FALLBACK PAGE ─────────────────────────────────────────────────────────────
function serveFallbackPage(req, error) {
  const url = new URL(req.url || '/', `https://${req.get('host')}`);
  const pathParts = url.pathname.split('/');
  const slug = pathParts[pathParts.length - 1] || 'home';
  const title = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return `
<!DOCTYPE html>
<html>
<head>
  <title>${title} - Job Portal</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;color:#222;line-height:1.6}
    .header{background:linear-gradient(135deg,#1a237e 0%,#0d1445 100%);color:#fff;padding:1.5rem 0;text-align:center}
    .header h1{font-size:2rem}
    .header span{color:#ffd700}
    .container{max-width:960px;margin:0 auto;padding:2rem 1.5rem}
    .card{background:#fff;border-radius:12px;padding:2rem;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
    .title{font-size:1.8rem;font-weight:700;color:#1a237e;margin-bottom:.5rem}
    .note{background:#fff3e0;border-left:4px solid #ff9800;padding:1rem;border-radius:8px;margin:1rem 0}
    .btn{display:inline-block;padding:.8rem 2rem;background:#1a237e;color:#fff;border:none;border-radius:8px;text-decoration:none;font-weight:700}
    .btn:hover{background:#0d1445}
    .btn-apply{background:#ffd700;color:#1a202c}
    .btn-apply:hover{background:#f59e0b}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-top:1.5rem}
    .grid-item{background:#fff;border-radius:12px;padding:1.5rem;text-align:center;border:1px solid #e8e8e8;text-decoration:none;color:#333}
    .grid-item:hover{transform:translateY(-3px);box-shadow:0 5px 20px rgba(0,0,0,0.1)}
    footer{background:#1a1a2e;color:rgba(255,255,255,0.7);text-align:center;padding:1.5rem;margin-top:2rem}
    footer a{color:#ffd700}
  </style>
</head>
<body>
  <div class="header">
    <h1>Job<span>Portal</span></h1>
  </div>
  <div class="container">
    <div class="card">
      <div class="title">${title}</div>
      <div class="note">
        <strong>ℹ️ Note:</strong> The original website is temporarily unavailable. 
        This page is being served from cache.
      </div>
      <p style="margin:1rem 0;color:#666">The full content will appear once the source is back online.</p>
      <div style="margin-top:1.5rem">
        <a href="/" class="btn">← Back to Home</a>
        <a href="/jobs" class="btn btn-apply">Browse Jobs</a>
      </div>
    </div>
    <div class="grid">
      <a href="/jobs" class="grid-item">📋 Browse All Jobs</a>
      <a href="/jobs?type=remote" class="grid-item">🌐 Remote Jobs</a>
      <a href="/sitemap" class="grid-item">📄 Sitemap</a>
    </div>
  </div>
  <footer>&copy; 2026 JobPortal</footer>
</body>
</html>`;
}

// ─── MAIN HANDLER ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── DYNAMIC BASE URL ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.get('host');
  req.baseUrl = `${protocol}://${host}`;
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
    const response = await fetch(`https://${ORIGIN_DOMAIN}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    let html = await response.text();
    html = rewriteText(html, req.proxyHost);
    html = injectAds(html, req.proxyHost);
    
    cache.set(cacheKey, html);
    res.send(html);
    
  } catch (error) {
    console.error('Home page error:', error.message);
    const fallback = serveFallbackPage(req, error);
    res.send(fallback);
  }
});

// ─── JOBS PAGE ─────────────────────────────────────────────────────────────────
app.get('/jobs', async (req, res) => {
  const cacheKey = `jobs_${req.query.type || 'all'}_${req.query.page || 1}`;
  let cached = cache.get(cacheKey);
  
  if (cached) {
    return res.send(cached);
  }
  
  try {
    const queryString = new URLSearchParams(req.query).toString();
    const url = `https://${ORIGIN_DOMAIN}/jobs${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    let html = await response.text();
    html = rewriteText(html, req.proxyHost);
    html = injectAds(html, req.proxyHost);
    
    cache.set(cacheKey, html);
    res.send(html);
    
  } catch (error) {
    console.error('Jobs page error:', error.message);
    const fallback = serveFallbackPage(req, error);
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
    const response = await fetch(`https://${ORIGIN_DOMAIN}/jobs/${jobId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.status === 404) {
      return res.status(404).send(serveFallbackPage(req, 'Job not found'));
    }
    
    let html = await response.text();
    html = rewriteText(html, req.proxyHost);
    html = injectAds(html, req.proxyHost);
    
    // Remove "Apply Now" buttons from content
    html = html.replace(/<a[^>]*href="[^"]*apply[^"]*"[^>]*>[\s\S]*?Apply[\s]*Now[\s\S]*?<\/a>/gi, '');
    html = html.replace(/Apply Now/gi, '');
    
    cache.set(cacheKey, html);
    res.send(html);
    
  } catch (error) {
    console.error('Job page error:', error.message);
    const fallback = serveFallbackPage(req, error);
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
    let xml = await response.text();
    xml = xml.replace(/https:\/\/${ORIGIN_DOMAIN}/g, req.baseUrl);
    
    cache.set(cacheKey, xml);
    res.type('application/xml').send(xml);
    
  } catch (error) {
    // Generate fallback sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    for (let i = 1; i <= 100; i++) {
      xml += `\n  <sitemap><loc>${req.baseUrl}/sitemap-${i}.xml</loc></sitemap>`;
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
    
    let xml = await response.text();
    xml = xml.replace(/https:\/\/${ORIGIN_DOMAIN}/g, req.baseUrl);
    
    cache.set(cacheKey, xml);
    res.type('application/xml').send(xml);
    
  } catch (error) {
    res.status(404).send('Not found');
  }
});

// ─── ROBOTS.TXT ────────────────────────────────────────────────────────────────
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *
Allow: /
Sitemap: ${req.baseUrl}/sitemap.xml
Disallow: /api/`);
});

// ─── SITEMAP HTML ────────────────────────────────────────────────────────────
app.get('/sitemap', (req, res) => {
  const baseUrl = req.baseUrl;
  const html = `<!DOCTYPE html>
<html>
<head><title>Sitemap - Job Portal</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;padding:2rem;color:#222}
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
  <h1>📄 Sitemap - Job Portal</h1>
  <div class="grid">
    <div class="card">
      <h2>Main Pages</h2>
      <a href="${baseUrl}/">🏠 Home</a>
      <a href="${baseUrl}/jobs">📋 All Jobs</a>
      <a href="${baseUrl}/jobs?type=remote">🌐 Remote Jobs</a>
      <a href="${baseUrl}/jobs?type=onsite">🏢 On-site Jobs</a>
    </div>
    <div class="card">
      <h2>XML Sitemaps</h2>
      <a href="${baseUrl}/sitemap.xml">📄 Sitemap Index</a>
      <a href="${baseUrl}/sitemap-1.xml">📄 Sitemap 1 (Jobs 1-1000)</a>
      <a href="${baseUrl}/sitemap-2.xml">📄 Sitemap 2 (Jobs 1001-2000)</a>
      <span style="color:#888;font-size:.85rem">… 100 sitemap files total</span>
    </div>
    <div class="card">
      <h2>Job Pages</h2>
      <a href="${baseUrl}/jobs/1">🔹 Job #1 (First Remote Job)</a>
      <a href="${baseUrl}/jobs/50000">🔹 Job #50,000 (Last Remote Job)</a>
      <a href="${baseUrl}/jobs/50001">🔹 Job #50,001 (First On-site Job)</a>
      <a href="${baseUrl}/jobs/100000">🔹 Job #100,000 (Last Job)</a>
    </div>
  </div>
</div>
<div class="footer">&copy; 2026 JobPortal</div>
</body>
</html>`;
  res.send(html);
});

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send(serveFallbackPage(req, 'Page not found'));
});

// ─── START SERVER ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Job Portal running on port ${PORT}`);
  console.log(`📡 Cloning: https://${ORIGIN_DOMAIN}`);
  console.log(`🌍 Your domain: https://hirerivets.up.railway.app`);
  console.log(`💾 Cache TTL: 24 hours`);
});
