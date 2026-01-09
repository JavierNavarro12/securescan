import type { ApiKeyPattern, SecurityHeader, SensitiveFile } from '@/types';

// API Key patterns for detection
export const API_KEY_PATTERNS: ApiKeyPattern[] = [
  // OpenAI
  {
    name: 'Clave API de OpenAI',
    provider: 'OpenAI',
    pattern: /sk-[a-zA-Z0-9]{48,}/g,
    severity: 'critical',
    description: 'Clave API de OpenAI expuesta. Cualquier persona puede hacer llamadas a la API y los cargos irán a tu cuenta. Esto puede resultar en facturas de miles de euros.',
    remediation: {
      steps: [
        'Ve INMEDIATAMENTE a platform.openai.com y revoca esta clave',
        'Revisa el historial de uso para detectar consumo no autorizado',
        'Crea una nueva clave API',
        'Guarda la nueva clave en variables de entorno del servidor (nunca en el frontend)',
        'Crea un endpoint en tu backend que haga de proxy para las peticiones a OpenAI',
      ],
      revokeUrl: 'https://platform.openai.com/api-keys',
      codeExample: {
        bad: `// Codigo frontend - INSEGURO
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: { 'Authorization': 'Bearer sk-...' }
});`,
        good: `// Codigo frontend - SEGURO
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message: userInput })
});

// API route en el servidor (pages/api/chat.ts)
export default async function handler(req, res) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: { 'Authorization': \`Bearer \${process.env.OPENAI_API_KEY}\` }
  });
}`,
      },
    },
  },

  // Anthropic
  {
    name: 'Clave API de Anthropic',
    provider: 'Anthropic',
    pattern: /sk-ant-[a-zA-Z0-9-_]{40,}/g,
    severity: 'critical',
    description: 'Clave API de Anthropic (Claude) expuesta. Permite acceso no autorizado a la API de Claude con cargos a tu cuenta.',
    remediation: {
      steps: [
        'Ve a console.anthropic.com y revoca esta clave inmediatamente',
        'Genera una nueva clave API',
        'Guardala solo en variables de entorno del servidor',
        'Crea un endpoint backend para manejar las peticiones a Claude',
      ],
      revokeUrl: 'https://console.anthropic.com/settings/keys',
      codeExample: {
        bad: `const anthropic = new Anthropic({ apiKey: 'sk-ant-...' });`,
        good: `// Solo en el servidor
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });`,
      },
    },
  },

  // Stripe Live Key
  {
    name: 'Clave Secreta de Stripe (PRODUCCION)',
    provider: 'Stripe',
    pattern: /sk_live_[a-zA-Z0-9]{24,}/g,
    severity: 'critical',
    description: 'URGENTE: Clave secreta de Stripe en PRODUCCION expuesta. Un atacante puede realizar cobros, reembolsos, ver datos de clientes y acceder a toda tu informacion de pagos.',
    remediation: {
      steps: [
        'URGENTE: Rota esta clave AHORA en el Dashboard de Stripe',
        'Es una clave de PRODUCCION - revisa transacciones no autorizadas',
        'Las claves secretas (sk_) NUNCA deben estar en el frontend',
        'Usa solo claves publicables (pk_) en el lado del cliente',
        'Implementa webhooks para verificar pagos de forma segura',
      ],
      revokeUrl: 'https://dashboard.stripe.com/apikeys',
      codeExample: {
        bad: `const stripe = new Stripe('sk_live_...');`,
        good: `// Solo en el servidor (API route)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// En el cliente - solo usar clave publicable
const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);`,
      },
    },
  },

  // Stripe Test Key
  {
    name: 'Clave Secreta de Stripe (Test)',
    provider: 'Stripe',
    pattern: /sk_test_[a-zA-Z0-9]{24,}/g,
    severity: 'high',
    description: 'Clave secreta de Stripe en modo test expuesta. Aunque es modo prueba, revela la estructura de tu API y malas practicas de seguridad.',
    remediation: {
      steps: [
        'Rota esta clave en el Dashboard de Stripe',
        'Muevela a variables de entorno del servidor',
        'Nunca expongas claves secretas en codigo del cliente',
      ],
      revokeUrl: 'https://dashboard.stripe.com/test/apikeys',
      codeExample: {
        bad: `const stripe = new Stripe('sk_test_...');`,
        good: `const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);`,
      },
    },
  },

  // AWS Access Key
  {
    name: 'AWS Access Key ID',
    provider: 'AWS',
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: 'critical',
    description: 'AWS Access Key ID expuesta. Combinada con la clave secreta, permite acceso completo a tus servicios de AWS. Atacantes pueden crear recursos, robar datos o minar criptomonedas a tu costa.',
    remediation: {
      steps: [
        'Desactiva esta clave INMEDIATAMENTE en la consola de IAM',
        'Revisa CloudTrail para detectar uso no autorizado',
        'Crea nuevas credenciales con permisos minimos necesarios',
        'Usa IAM roles en vez de access keys cuando sea posible',
        'Nunca guardes credenciales AWS en codigo del cliente',
      ],
      revokeUrl: 'https://console.aws.amazon.com/iam/home#/security_credentials',
      codeExample: {
        bad: `const s3 = new AWS.S3({ accessKeyId: 'AKIA...', secretAccessKey: '...' });`,
        good: `// Usar variables de entorno
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
// Mejor aun: usar IAM roles en produccion`,
      },
    },
  },

  // Firebase/Google API
  {
    name: 'Clave API de Google/Firebase',
    provider: 'Google',
    pattern: /AIza[0-9A-Za-z-_]{35}/g,
    severity: 'medium',
    description: 'Clave API de Google/Firebase expuesta. Si no esta restringida, puede permitir uso no autorizado de APIs de Google con cargos a tu cuenta.',
    remediation: {
      steps: [
        'Restringe esta clave en Google Cloud Console',
        'Configura restricciones por HTTP referrer (tu dominio)',
        'Limita la clave solo a las APIs que necesitas',
        'Considera usar Firebase App Check para mayor seguridad',
      ],
      revokeUrl: 'https://console.cloud.google.com/apis/credentials',
      codeExample: {
        bad: `// Clave API sin restricciones en codigo cliente`,
        good: `// 1. Ve a Google Cloud Console > APIs & Services > Credentials
// 2. Edita la clave y añade restriccion HTTP referrer: tudominio.com/*
// 3. Limita a solo las APIs necesarias (ej: Maps, Firebase)`,
      },
    },
  },

  // GitHub Personal Access Token
  {
    name: 'Token Personal de GitHub',
    provider: 'GitHub',
    pattern: /ghp_[a-zA-Z0-9]{36}/g,
    severity: 'critical',
    description: 'Token personal de GitHub expuesto. Permite acceso a tus repositorios, puede crear commits, borrar repos y acceder a informacion privada.',
    remediation: {
      steps: [
        'Revoca este token INMEDIATAMENTE en GitHub Settings',
        'Revisa la actividad reciente de tu cuenta',
        'Crea un nuevo token con los permisos minimos necesarios',
        'Usa GitHub Apps o fine-grained tokens para mejor seguridad',
        'Nunca guardes tokens en repositorios',
      ],
      revokeUrl: 'https://github.com/settings/tokens',
    },
  },

  // GitHub OAuth Token
  {
    name: 'Token OAuth de GitHub',
    provider: 'GitHub',
    pattern: /gho_[a-zA-Z0-9]{36}/g,
    severity: 'critical',
    description: 'Token OAuth de GitHub expuesto. Proporciona acceso a recursos autorizados de GitHub.',
    remediation: {
      steps: [
        'Revoca la autorizacion de la app OAuth',
        'Revisa los permisos de la app OAuth',
        'Implementa almacenamiento seguro de tokens en el backend',
      ],
      revokeUrl: 'https://github.com/settings/applications',
    },
  },

  // Twilio
  {
    name: 'Clave API de Twilio',
    provider: 'Twilio',
    pattern: /SK[a-f0-9]{32}/g,
    severity: 'critical',
    description: 'Clave API de Twilio expuesta. Permite enviar SMS y hacer llamadas con cargos a tu cuenta.',
    remediation: {
      steps: [
        'Elimina esta clave en la consola de Twilio',
        'Crea una nueva clave API',
        'Implementa envio de SMS solo desde el backend',
        'Configura alertas de uso en Twilio',
      ],
      revokeUrl: 'https://console.twilio.com/us1/account/keys-credentials/api-keys',
    },
  },

  // SendGrid
  {
    name: 'Clave API de SendGrid',
    provider: 'SendGrid',
    pattern: /SG\.[a-zA-Z0-9]{22}\.[a-zA-Z0-9]{43}/g,
    severity: 'critical',
    description: 'Clave API de SendGrid expuesta. Permite enviar emails desde tu cuenta, lo que puede usarse para spam o phishing.',
    remediation: {
      steps: [
        'Revoca esta clave en SendGrid Settings',
        'Crea una nueva clave con permisos minimos',
        'Implementa envio de emails solo desde el backend',
      ],
      revokeUrl: 'https://app.sendgrid.com/settings/api_keys',
    },
  },

  // Mailgun
  {
    name: 'Clave API de Mailgun',
    provider: 'Mailgun',
    pattern: /key-[a-zA-Z0-9]{32}/g,
    severity: 'critical',
    description: 'Clave API de Mailgun expuesta. Permite enviar emails desde tu dominio.',
    remediation: {
      steps: [
        'Resetea esta clave en el Dashboard de Mailgun',
        'Crea una nueva clave API restringida',
        'Mueve el envio de emails al servidor',
      ],
      revokeUrl: 'https://app.mailgun.com/app/account/security/api_keys',
    },
  },

  // Slack
  {
    name: 'Token de Slack',
    provider: 'Slack',
    pattern: /xox[baprs]-[0-9a-zA-Z]{10,48}/g,
    severity: 'critical',
    description: 'Token de Slack expuesto. Permite enviar mensajes, leer conversaciones y acceder a datos del workspace.',
    remediation: {
      steps: [
        'Revoca este token en Slack App Settings',
        'Genera nuevos tokens',
        'Implementa la integracion de Slack via backend',
        'Usa tokens de corta duracion cuando sea posible',
      ],
      revokeUrl: 'https://api.slack.com/apps',
    },
  },

  // Discord Bot Token
  {
    name: 'Token de Bot de Discord',
    provider: 'Discord',
    pattern: /[MN][A-Za-z\d]{23,}\.[\w-]{6}\.[\w-]{27}/g,
    severity: 'critical',
    description: 'Token de bot de Discord expuesto. Permite control total de tu bot de Discord.',
    remediation: {
      steps: [
        'Regenera el token INMEDIATAMENTE en Discord Developer Portal',
        'Tu bot puede haber sido comprometido',
        'Nunca expongas tokens de bot en codigo cliente',
      ],
      revokeUrl: 'https://discord.com/developers/applications',
    },
  },

  // Generic Bearer Token in code
  {
    name: 'Token Bearer',
    provider: 'Generico',
    pattern: /['"`]Bearer\s+[a-zA-Z0-9-_=]+\.?[a-zA-Z0-9-_=]*\.?[a-zA-Z0-9-_.+/=]*['"`]/g,
    severity: 'high',
    description: 'Token Bearer hardcodeado encontrado. Puede ser un token de API o JWT que no deberia estar en el codigo.',
    remediation: {
      steps: [
        'Identifica a que servicio pertenece este token',
        'Revoca y regenera el token',
        'Mueve la autenticacion al servidor',
      ],
    },
  },

  // Private Key
  {
    name: 'Clave Privada',
    provider: 'Generico',
    pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/g,
    severity: 'critical',
    description: 'Clave privada expuesta en codigo cliente. Esto es EXTREMADAMENTE peligroso y puede comprometer toda la seguridad de tu sistema.',
    remediation: {
      steps: [
        'Elimina esta clave inmediatamente',
        'Genera un nuevo par de claves',
        'Las claves privadas NUNCA deben estar en codigo cliente',
        'Almacena claves privadas solo en el servidor con permisos restringidos',
      ],
    },
  },

  // Supabase Service Role Key
  {
    name: 'Clave Service Role de Supabase',
    provider: 'Supabase',
    pattern: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
    severity: 'critical',
    description: 'Posible clave service_role de Supabase (JWT). Esta clave bypasea Row Level Security y da acceso completo a tu base de datos.',
    remediation: {
      steps: [
        'Verifica si es la clave service_role (no la anon key)',
        'Rota las credenciales en Supabase Dashboard si es service_role',
        'Solo usa la anon key en codigo cliente',
        'La service_role key solo debe estar en el backend',
      ],
      revokeUrl: 'https://supabase.com/dashboard/project/_/settings/api',
    },
  },

  // Vercel Token
  {
    name: 'Token de Vercel',
    provider: 'Vercel',
    pattern: /vercel_[a-zA-Z0-9]{24}/g,
    severity: 'critical',
    description: 'Token de Vercel expuesto. Permite hacer deployments, gestionar proyectos y acceder a configuracion sensible.',
    remediation: {
      steps: [
        'Elimina este token en Vercel Settings',
        'Crea un nuevo token si lo necesitas',
        'Usa variables de entorno de Vercel para CI/CD',
      ],
      revokeUrl: 'https://vercel.com/account/tokens',
    },
  },
];

// Security headers to check
export const SECURITY_HEADERS: SecurityHeader[] = [
  {
    name: 'Content-Security-Policy',
    importance: 'medium',
    description: 'Falta la cabecera Content-Security-Policy (CSP). Esta cabecera previene ataques XSS controlando que recursos puede cargar tu pagina.',
    recommendation: 'Añade la cabecera Content-Security-Policy. Ejemplo basico: "default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'"',
  },
  {
    name: 'X-Frame-Options',
    importance: 'medium',
    description: 'Falta la cabecera X-Frame-Options. Sin ella, tu sitio puede ser embebido en un iframe malicioso para ataques de clickjacking.',
    recommendation: 'Añade la cabecera X-Frame-Options con valor "DENY" o "SAMEORIGIN" para prevenir que tu sitio sea embebido en iframes de otros dominios.',
  },
  {
    name: 'X-Content-Type-Options',
    importance: 'low',
    description: 'Falta la cabecera X-Content-Type-Options. Previene que el navegador "adivine" el tipo de contenido, lo que puede llevar a vulnerabilidades.',
    recommendation: 'Añade la cabecera X-Content-Type-Options con valor "nosniff".',
  },
  {
    name: 'Strict-Transport-Security',
    importance: 'medium',
    description: 'Falta la cabecera HSTS (Strict-Transport-Security). Esta cabecera fuerza al navegador a usar siempre HTTPS, previniendo ataques man-in-the-middle.',
    recommendation: 'Añade la cabecera Strict-Transport-Security con max-age de al menos 31536000 (1 año). Ejemplo: "max-age=31536000; includeSubDomains"',
  },
  {
    name: 'X-XSS-Protection',
    importance: 'low',
    description: 'Falta la cabecera X-XSS-Protection. Aunque los navegadores modernos usan CSP, esta cabecera proporciona proteccion para navegadores antiguos.',
    recommendation: 'Añade la cabecera X-XSS-Protection con valor "1; mode=block".',
  },
  {
    name: 'Referrer-Policy',
    importance: 'low',
    description: 'Falta la cabecera Referrer-Policy. Controla cuanta informacion del referrer se comparte al navegar a otros sitios.',
    recommendation: 'Añade la cabecera Referrer-Policy con valor "strict-origin-when-cross-origin" o mas restrictivo.',
  },
  {
    name: 'Permissions-Policy',
    importance: 'low',
    description: 'Falta la cabecera Permissions-Policy. Controla que funciones del navegador puede usar tu sitio (camara, microfono, geolocalizacion, etc.).',
    recommendation: 'Añade la cabecera Permissions-Policy para restringir funciones innecesarias. Ejemplo: "camera=(), microphone=(), geolocation=()"',
  },
];

// Sensitive files to check
export const SENSITIVE_FILES: SensitiveFile[] = [
  { path: '/.env', severity: 'critical', description: 'Archivo de variables de entorno con secretos' },
  { path: '/.env.local', severity: 'critical', description: 'Archivo de entorno local' },
  { path: '/.env.production', severity: 'critical', description: 'Archivo de entorno de produccion' },
  { path: '/.env.development', severity: 'high', description: 'Archivo de entorno de desarrollo' },
  { path: '/.git/config', severity: 'high', description: 'Configuracion del repositorio Git' },
  { path: '/.git/HEAD', severity: 'high', description: 'Referencia HEAD de Git' },
  { path: '/config.js', severity: 'medium', description: 'Archivo de configuracion JavaScript' },
  { path: '/config.json', severity: 'medium', description: 'Archivo de configuracion JSON' },
  { path: '/settings.json', severity: 'medium', description: 'Archivo de configuracion' },
  { path: '/.htaccess', severity: 'low', description: 'Configuracion de Apache' },
  { path: '/wp-config.php', severity: 'critical', description: 'Configuracion de WordPress' },
  { path: '/phpinfo.php', severity: 'medium', description: 'Pagina de informacion PHP' },
  { path: '/server.js', severity: 'medium', description: 'Archivo del servidor' },
  { path: '/database.yml', severity: 'critical', description: 'Configuracion de base de datos' },
  { path: '/secrets.yml', severity: 'critical', description: 'Archivo de secretos' },
  { path: '/credentials.json', severity: 'critical', description: 'Archivo de credenciales' },
  { path: '/.aws/credentials', severity: 'critical', description: 'Credenciales de AWS' },
  { path: '/id_rsa', severity: 'critical', description: 'Clave privada SSH' },
  { path: '/id_rsa.pub', severity: 'low', description: 'Clave publica SSH' },
  { path: '/.npmrc', severity: 'high', description: 'Configuracion NPM (puede contener tokens)' },
  { path: '/.dockerenv', severity: 'medium', description: 'Entorno Docker' },
  { path: '/docker-compose.yml', severity: 'medium', description: 'Configuracion Docker Compose' },
  { path: '/backup.sql', severity: 'critical', description: 'Backup de base de datos' },
  { path: '/dump.sql', severity: 'critical', description: 'Dump de base de datos' },
];

// Utility function to sanitize found API keys (show only partial)
export function sanitizeKey(key: string): string {
  if (key.length <= 12) {
    return key.substring(0, 4) + '...';
  }
  return key.substring(0, 8) + '...' + key.substring(key.length - 4);
}

// Check if a found key looks like a real key vs false positive
export function isLikelyRealKey(key: string, pattern: ApiKeyPattern): boolean {
  // Skip common false positives
  const falsePositives = [
    'sk-xxxxxxxx',
    'sk-test-key',
    'sk_test_xxx',
    'sk_live_xxx',
    'AKIAIOSFODNN7EXAMPLE', // AWS example key
    'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', // AWS example secret
  ];

  const lowerKey = key.toLowerCase();
  for (const fp of falsePositives) {
    if (lowerKey.includes(fp.toLowerCase())) {
      return false;
    }
  }

  // Check for placeholder patterns
  if (/^[x]+$/i.test(key.replace(/[^a-z]/gi, '')) || /your[-_]?key/i.test(key)) {
    return false;
  }

  return true;
}
