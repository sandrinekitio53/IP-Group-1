import compression from 'compression';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dist = path.join(__dirname, 'dist');
const app = express();
const port = Number(process.env.PORT) || 4173;

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  })
);

app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests' },
}));

app.use(compression());
app.use(express.static(dist, {
  etag: false,
  lastModified: false,
  setHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  },
}));

app.get('/health', (req, res) => {
  res.type('application/json').status(200).json({ status: 'ok' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(dist, 'index.html'));
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Server error' });
});

app.listen(port, () => {
  process.stdout.write(`Landing page server running on http://localhost:${port}\n`);
});
