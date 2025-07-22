# Security Best Practices

This guide covers security considerations for your homelab API server and service integrations.

## 🔐 Authentication & Authorization

### JWT Token Security
```javascript
// Use strong secrets
JWT_SECRET=your-super-secure-secret-at-least-32-characters-long
JWT_REFRESH_SECRET=different-refresh-secret-equally-strong

// Short token lifetimes
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Role-Based Access Control
```javascript
// Example user roles
const roles = {
  admin: ['read', 'write', 'control', 'system'],
  operator: ['read', 'write', 'control'],
  viewer: ['read']
};

// Middleware for role checking
const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    const userRoles = req.user.roles;
    const hasPermission = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

## 🌐 Network Security

### Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing

# API server
sudo ufw allow 3001/tcp

# SSH (if needed)
sudo ufw allow 22/tcp

# Block all other external access
sudo ufw deny 5000/tcp  # NAS
sudo ufw deny 2376/tcp  # Docker
```

### VPN Access
```bash
# Use WireGuard for remote access
sudo apt install wireguard

# Generate keys
wg genkey | tee privatekey | wg pubkey > publickey

# Configure server
cat > /etc/wireguard/wg0.conf << EOF
[Interface]
PrivateKey = <server-private-key>
Address = 10.0.0.1/24
ListenPort = 51820

[Peer]
PublicKey = <client-public-key>
AllowedIPs = 10.0.0.2/32
EOF
```

### Internal Network Isolation
```bash
# Use Docker networks for isolation
docker network create homelab-internal

# Run services on internal network only
docker run -d --network homelab-internal synology-api
```

## 🔒 Service-Specific Security

### NAS Security
```bash
# Create dedicated API user with minimal permissions
# Synology: Control Panel → User & Group
# - Create user "homelab-api"
# - Assign to "users" group only
# - Enable only required services:
#   - File Station (read-only)
#   - System information (read-only)

# Enable 2FA for admin accounts
# Disable unused services
# Regular security updates
```

### Docker Security
```bash
# Use non-root user in containers
USER 1001:1001

# Read-only root filesystem
docker run --read-only --tmpfs /tmp myapp

# Drop capabilities
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE myapp

# Use secrets for sensitive data
echo "db_password" | docker secret create db_pass -
```

## 🔑 Secrets Management

### Environment Variables
```bash
# Never commit .env files
echo ".env" >> .gitignore

# Use different secrets per environment
.env.development
.env.production

# Rotate secrets regularly
```

### Docker Secrets
```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    image: homelab-api
    secrets:
      - nas_password
      - db_password

secrets:
  nas_password:
    file: ./secrets/nas_password.txt
  db_password:
    file: ./secrets/db_password.txt
```

### HashiCorp Vault Integration
```javascript
const vault = require('node-vault')();

const getSecret = async (path) => {
  try {
    const result = await vault.read(path);
    return result.data.data;
  } catch (error) {
    console.error('Vault error:', error);
    throw error;
  }
};

// Usage
const nasCredentials = await getSecret('secret/nas');
```

## 🛡️ API Security

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many API requests',
  standardHeaders: true,
  legacyHeaders: false
});

// Strict limiting for control actions
const controlLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 control actions per minute
  message: 'Too many control requests'
});

app.use('/api', apiLimiter);
app.use('/api/*/control', controlLimiter);
```

### Input Validation
```javascript
const { body, param, validationResult } = require('express-validator');

// Validation middleware
const validateContainerId = [
  param('id').isAlphanumeric().isLength({ min: 12, max: 12 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Usage
app.post('/api/docker/containers/:id/start', validateContainerId, controlController.startContainer);
```

### CORS Configuration
```javascript
const cors = require('cors');

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
```

## 🔍 Security Monitoring

### Audit Logging
```javascript
const winston = require('winston');

const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/audit.log' })
  ]
});

// Audit middleware
const auditLog = (action) => {
  return (req, res, next) => {
    auditLogger.info({
      action,
      user: req.user?.id,
      ip: req.ip,
      timestamp: new Date(),
      details: {
        method: req.method,
        url: req.url,
        params: req.params,
        body: req.body
      }
    });
    next();
  };
};

// Usage
app.post('/api/docker/containers/:id/start', auditLog('container_start'), controlController.startContainer);
```

### Failed Authentication Monitoring
```javascript
const failedAttempts = new Map();

const trackFailedLogin = (ip) => {
  const attempts = failedAttempts.get(ip) || 0;
  failedAttempts.set(ip, attempts + 1);
  
  if (attempts >= 5) {
    // Alert or block IP
    console.warn(`Multiple failed login attempts from ${ip}`);
  }
  
  // Clean up old attempts
  setTimeout(() => {
    failedAttempts.delete(ip);
  }, 15 * 60 * 1000); // 15 minutes
};
```

### Security Headers
```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 🔐 HTTPS/TLS Configuration

### Let's Encrypt Certificate
```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d api.yourdomain.com

# Configure nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Self-Signed Certificate
```bash
# Generate certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Use in Node.js
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(3001);
```

## 🔄 Security Updates

### Automated Updates
```bash
# Enable automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Configure /etc/apt/apt.conf.d/50unattended-upgrades
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
};
```

### Dependency Scanning
```bash
# npm audit
npm audit
npm audit fix

# Snyk scanning
npm install -g snyk
snyk auth
snyk test
snyk monitor
```

## 📋 Security Checklist

### Pre-Deployment
- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Configure firewall rules
- [ ] Enable HTTPS/TLS
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Validate all inputs
- [ ] Set up audit logging

### Post-Deployment
- [ ] Monitor failed login attempts
- [ ] Regular security updates
- [ ] Review access logs
- [ ] Rotate secrets quarterly
- [ ] Test backup/recovery
- [ ] Security vulnerability scans

### Network Security
- [ ] VPN for remote access
- [ ] Internal network isolation
- [ ] Minimal port exposure
- [ ] Regular network scans

### Service Security
- [ ] Dedicated service accounts
- [ ] Minimal permissions
- [ ] Regular credential rotation
- [ ] Service-specific security configs

## 🚨 Incident Response

### Security Incident Playbook
1. **Detect**: Monitor logs, alerts, failed attempts
2. **Contain**: Isolate affected systems
3. **Investigate**: Analyze logs, determine impact
4. **Remediate**: Fix vulnerabilities, update systems
5. **Recover**: Restore services, verify integrity
6. **Learn**: Update procedures, improve monitoring

### Emergency Contacts
```bash
# Create incident response contact list
# - System administrator
# - Security team
# - Service providers
# - Management contacts
```

## 🔗 Related Documentation

- [NAS Security](./nas-security.md) - NAS-specific security measures
- [Docker Security](./docker-security.md) - Container security best practices
- [Deployment Security](../deployment/security-hardening.md) - Production security hardening
