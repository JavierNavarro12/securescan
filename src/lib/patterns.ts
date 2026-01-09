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

  // MongoDB Connection String
  {
    name: 'Cadena de conexion MongoDB',
    provider: 'MongoDB',
    pattern: /mongodb(\+srv)?:\/\/[a-zA-Z0-9._-]+:[^@\s]+@[a-zA-Z0-9.-]+/g,
    severity: 'critical',
    description: 'Credenciales de MongoDB expuestas. Un atacante puede acceder, modificar o eliminar toda tu base de datos.',
    remediation: {
      steps: [
        'Cambia la contraseña del usuario de MongoDB INMEDIATAMENTE',
        'Revisa los logs de acceso en MongoDB Atlas',
        'Usa variables de entorno para la cadena de conexion',
        'Configura IP whitelisting en MongoDB Atlas',
        'Nunca expongas credenciales de base de datos en el frontend',
      ],
      revokeUrl: 'https://cloud.mongodb.com/',
    },
  },

  // PostgreSQL Connection String
  {
    name: 'Cadena de conexion PostgreSQL',
    provider: 'PostgreSQL',
    pattern: /postgres(ql)?:\/\/[a-zA-Z0-9._-]+:[^@\s]+@[a-zA-Z0-9.-]+/g,
    severity: 'critical',
    description: 'Credenciales de PostgreSQL expuestas. Acceso completo a tu base de datos.',
    remediation: {
      steps: [
        'Cambia la contraseña del usuario de PostgreSQL',
        'Mueve la cadena de conexion a variables de entorno del servidor',
        'Usa conexiones SSL/TLS',
        'Configura reglas de firewall para la base de datos',
      ],
    },
  },

  // MySQL Connection String
  {
    name: 'Cadena de conexion MySQL',
    provider: 'MySQL',
    pattern: /mysql:\/\/[a-zA-Z0-9._-]+:[^@\s]+@[a-zA-Z0-9.-]+/g,
    severity: 'critical',
    description: 'Credenciales de MySQL expuestas. Acceso completo a tu base de datos.',
    remediation: {
      steps: [
        'Cambia la contraseña del usuario de MySQL',
        'Usa variables de entorno para credenciales',
        'Nunca expongas credenciales de BD en codigo cliente',
      ],
    },
  },

  // Redis URL with password
  {
    name: 'URL de Redis con contraseña',
    provider: 'Redis',
    pattern: /redis:\/\/[^:]+:[^@\s]+@[a-zA-Z0-9.-]+/g,
    severity: 'critical',
    description: 'Credenciales de Redis expuestas. Permite acceso a cache y datos almacenados.',
    remediation: {
      steps: [
        'Rota las credenciales de Redis',
        'Usa variables de entorno',
        'Configura Redis para solo aceptar conexiones locales o de IPs especificas',
      ],
    },
  },

  // Heroku API Key
  {
    name: 'Clave API de Heroku',
    provider: 'Heroku',
    pattern: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,
    severity: 'high',
    description: 'Posible clave API de Heroku (formato UUID). Puede permitir gestionar apps y acceder a configuracion.',
    remediation: {
      steps: [
        'Verifica si es una clave de Heroku',
        'Regenera la clave en Heroku Dashboard',
        'Usa variables de entorno para CI/CD',
      ],
      revokeUrl: 'https://dashboard.heroku.com/account',
    },
  },

  // DigitalOcean Token
  {
    name: 'Token de DigitalOcean',
    provider: 'DigitalOcean',
    pattern: /dop_v1_[a-f0-9]{64}/g,
    severity: 'critical',
    description: 'Token de DigitalOcean expuesto. Permite crear/eliminar droplets, acceder a bases de datos y gestionar infraestructura.',
    remediation: {
      steps: [
        'Revoca este token en DigitalOcean',
        'Revisa recursos creados recientemente',
        'Crea un nuevo token con permisos minimos',
      ],
      revokeUrl: 'https://cloud.digitalocean.com/account/api/tokens',
    },
  },

  // Algolia API Key
  {
    name: 'Clave API de Algolia',
    provider: 'Algolia',
    pattern: /[a-f0-9]{32}/g,
    severity: 'medium',
    description: 'Posible clave de Algolia. Si es la Admin API Key, permite acceso completo al indice de busqueda.',
    remediation: {
      steps: [
        'Verifica si es la Admin Key o Search-Only Key',
        'Las Search-Only keys son seguras para el frontend',
        'Las Admin keys NUNCA deben estar en codigo cliente',
        'Rota la clave si es la Admin Key',
      ],
      revokeUrl: 'https://dashboard.algolia.com/account/api-keys/',
    },
  },

  // Cloudinary URL
  {
    name: 'URL de Cloudinary',
    provider: 'Cloudinary',
    pattern: /cloudinary:\/\/[0-9]+:[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+/g,
    severity: 'critical',
    description: 'Credenciales de Cloudinary expuestas. Permite subir, modificar y eliminar archivos multimedia.',
    remediation: {
      steps: [
        'Rota el API Secret en Cloudinary Dashboard',
        'Usa upload presets para subidas desde el frontend',
        'Las operaciones de administracion deben ser desde el backend',
      ],
      revokeUrl: 'https://console.cloudinary.com/settings/api-keys',
    },
  },

  // NPM Token
  {
    name: 'Token de NPM',
    provider: 'NPM',
    pattern: /npm_[a-zA-Z0-9]{36}/g,
    severity: 'critical',
    description: 'Token de NPM expuesto. Permite publicar paquetes maliciosos bajo tu cuenta.',
    remediation: {
      steps: [
        'Revoca este token INMEDIATAMENTE en npmjs.com',
        'Revisa paquetes publicados recientemente',
        'Habilita 2FA en tu cuenta de NPM',
        'Usa tokens de solo lectura para CI cuando sea posible',
      ],
      revokeUrl: 'https://www.npmjs.com/settings/tokens',
    },
  },

  // Mapbox Public Token
  {
    name: 'Token publico de Mapbox',
    provider: 'Mapbox',
    pattern: /pk\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
    severity: 'low',
    description: 'Token publico de Mapbox detectado. Es seguro para el frontend pero debe estar restringido por dominio.',
    remediation: {
      steps: [
        'Configura restricciones de URL en Mapbox Dashboard',
        'Limita el token a solo tu dominio de produccion',
        'Monitorea el uso para detectar abusos',
      ],
      revokeUrl: 'https://account.mapbox.com/access-tokens/',
    },
  },

  // Mapbox Secret Token
  {
    name: 'Token secreto de Mapbox',
    provider: 'Mapbox',
    pattern: /sk\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
    severity: 'critical',
    description: 'Token SECRETO de Mapbox expuesto. Permite acceso completo a tu cuenta y APIs privadas.',
    remediation: {
      steps: [
        'Elimina este token INMEDIATAMENTE',
        'Los tokens sk.* son secretos y NUNCA deben estar en el frontend',
        'Usa tokens pk.* (publicos) para el lado del cliente',
      ],
      revokeUrl: 'https://account.mapbox.com/access-tokens/',
    },
  },

  // Azure Connection String
  {
    name: 'Cadena de conexion de Azure',
    provider: 'Azure',
    pattern: /DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[^;]+/g,
    severity: 'critical',
    description: 'Cadena de conexion de Azure Storage expuesta. Acceso completo a blobs, colas y tablas.',
    remediation: {
      steps: [
        'Rota las claves de acceso en Azure Portal',
        'Usa Managed Identities cuando sea posible',
        'Implementa SAS tokens con permisos minimos para el frontend',
      ],
      revokeUrl: 'https://portal.azure.com/',
    },
  },

  // Datadog API Key
  {
    name: 'Clave API de Datadog',
    provider: 'Datadog',
    pattern: /dd[a-f0-9]{32}/g,
    severity: 'high',
    description: 'Clave API de Datadog expuesta. Permite enviar metricas y eventos a tu cuenta.',
    remediation: {
      steps: [
        'Rota esta clave en Datadog',
        'Usa variables de entorno',
        'Las claves de Datadog deben estar solo en el backend',
      ],
      revokeUrl: 'https://app.datadoghq.com/organization-settings/api-keys',
    },
  },

  // Linear API Key
  {
    name: 'Clave API de Linear',
    provider: 'Linear',
    pattern: /lin_api_[a-zA-Z0-9]{40}/g,
    severity: 'high',
    description: 'Clave API de Linear expuesta. Permite acceso a issues, proyectos y datos del equipo.',
    remediation: {
      steps: [
        'Revoca esta clave en Linear Settings',
        'Crea una nueva clave con permisos minimos',
        'Usa la API solo desde el backend',
      ],
      revokeUrl: 'https://linear.app/settings/api',
    },
  },

  // Notion API Key
  {
    name: 'Clave API de Notion',
    provider: 'Notion',
    pattern: /secret_[a-zA-Z0-9]{43}/g,
    severity: 'high',
    description: 'Clave API de Notion expuesta. Permite acceso a paginas y bases de datos de Notion.',
    remediation: {
      steps: [
        'Revoca esta integracion en Notion',
        'Crea una nueva integracion',
        'Limita el acceso a solo las paginas necesarias',
      ],
      revokeUrl: 'https://www.notion.so/my-integrations',
    },
  },

  // Airtable API Key
  {
    name: 'Clave API de Airtable',
    provider: 'Airtable',
    pattern: /key[a-zA-Z0-9]{14}/g,
    severity: 'high',
    description: 'Clave API de Airtable expuesta. Permite acceso a todas tus bases de Airtable.',
    remediation: {
      steps: [
        'Regenera tu clave API en Airtable',
        'Usa tokens de acceso personal con permisos limitados',
        'Implementa la API desde el backend',
      ],
      revokeUrl: 'https://airtable.com/account',
    },
  },

  // Shopify API Key
  {
    name: 'Clave API de Shopify',
    provider: 'Shopify',
    pattern: /shpat_[a-fA-F0-9]{32}/g,
    severity: 'critical',
    description: 'Token de acceso de Shopify expuesto. Permite acceso a la tienda, productos, ordenes y clientes.',
    remediation: {
      steps: [
        'Revoca este token en Shopify Admin',
        'Crea una nueva app privada con permisos minimos',
        'Nunca expongas tokens de Shopify en el frontend',
      ],
      revokeUrl: 'https://admin.shopify.com/',
    },
  },

  // Sentry DSN
  {
    name: 'DSN de Sentry',
    provider: 'Sentry',
    pattern: /https:\/\/[a-f0-9]+@[a-z0-9]+\.ingest\.sentry\.io\/[0-9]+/g,
    severity: 'low',
    description: 'DSN de Sentry detectado. Es normal que este en el frontend para reportar errores, pero un atacante podria enviar errores falsos.',
    remediation: {
      steps: [
        'Configura rate limiting en Sentry',
        'Usa allowed domains para limitar origenes',
        'Considera usar Sentry Relay para mayor control',
      ],
    },
  },

  // PlanetScale Password
  {
    name: 'Credenciales de PlanetScale',
    provider: 'PlanetScale',
    pattern: /pscale_pw_[a-zA-Z0-9_-]{32,}/g,
    severity: 'critical',
    description: 'Contraseña de PlanetScale expuesta. Acceso directo a tu base de datos MySQL serverless.',
    remediation: {
      steps: [
        'Elimina estas credenciales en PlanetScale',
        'Crea nuevas credenciales',
        'Usa variables de entorno en el servidor',
      ],
      revokeUrl: 'https://app.planetscale.com/',
    },
  },

  // Resend API Key
  {
    name: 'Clave API de Resend',
    provider: 'Resend',
    pattern: /re_[a-zA-Z0-9]{32}/g,
    severity: 'critical',
    description: 'Clave API de Resend expuesta. Permite enviar emails desde tu dominio.',
    remediation: {
      steps: [
        'Revoca esta clave en Resend Dashboard',
        'Crea una nueva clave',
        'Envia emails solo desde el backend',
      ],
      revokeUrl: 'https://resend.com/api-keys',
    },
  },

  // Clerk API Keys
  {
    name: 'Clave secreta de Clerk',
    provider: 'Clerk',
    pattern: /sk_live_[a-zA-Z0-9]{24,}/g,
    severity: 'critical',
    description: 'Clave secreta de Clerk expuesta. Acceso completo a autenticacion y usuarios.',
    remediation: {
      steps: [
        'Rota esta clave en Clerk Dashboard',
        'Las claves sk_ son secretas y solo para el backend',
        'Usa NEXT_PUBLIC_CLERK_* solo para claves publicas',
      ],
      revokeUrl: 'https://dashboard.clerk.com/',
    },
  },

  // Postmark API Token
  {
    name: 'Token de Postmark',
    provider: 'Postmark',
    pattern: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,
    severity: 'high',
    description: 'Posible token de Postmark (formato UUID). Permite enviar emails.',
    remediation: {
      steps: [
        'Verifica si es un token de Postmark',
        'Rota el token si es necesario',
        'Usa variables de entorno en el servidor',
      ],
    },
  },

  // Pusher Keys
  {
    name: 'Clave secreta de Pusher',
    provider: 'Pusher',
    pattern: /[a-f0-9]{20}/g,
    severity: 'medium',
    description: 'Posible clave de Pusher. La app key es publica, pero el secret debe ser privado.',
    remediation: {
      steps: [
        'Verifica si es el app_secret (no app_key)',
        'El app_secret NUNCA debe estar en codigo cliente',
        'Rota credenciales en Pusher Dashboard',
      ],
      revokeUrl: 'https://dashboard.pusher.com/',
    },
  },

  // Replicate API Token
  {
    name: 'Token API de Replicate',
    provider: 'Replicate',
    pattern: /r8_[a-zA-Z0-9]{37}/g,
    severity: 'critical',
    description: 'Token de Replicate expuesto. Permite ejecutar modelos de IA con cargos a tu cuenta.',
    remediation: {
      steps: [
        'Revoca este token en Replicate',
        'Los tokens de IA NUNCA deben estar en el frontend',
        'Crea un proxy en tu backend',
      ],
      revokeUrl: 'https://replicate.com/account/api-tokens',
    },
  },

  // Hugging Face Token
  {
    name: 'Token de Hugging Face',
    provider: 'Hugging Face',
    pattern: /hf_[a-zA-Z0-9]{34}/g,
    severity: 'high',
    description: 'Token de Hugging Face expuesto. Permite acceso a modelos privados y API de inferencia.',
    remediation: {
      steps: [
        'Revoca este token en Hugging Face',
        'Usa tokens solo desde el backend',
        'Crea tokens con permisos minimos',
      ],
      revokeUrl: 'https://huggingface.co/settings/tokens',
    },
  },

  // Groq API Key
  {
    name: 'Clave API de Groq',
    provider: 'Groq',
    pattern: /gsk_[a-zA-Z0-9]{52}/g,
    severity: 'critical',
    description: 'Clave API de Groq expuesta. Permite usar LLMs con cargos a tu cuenta.',
    remediation: {
      steps: [
        'Revoca esta clave en Groq Console',
        'Las claves de IA son para el backend',
        'Implementa un proxy server',
      ],
      revokeUrl: 'https://console.groq.com/keys',
    },
  },

  // Mistral API Key
  {
    name: 'Clave API de Mistral',
    provider: 'Mistral',
    pattern: /[a-zA-Z0-9]{32}/g,
    severity: 'high',
    description: 'Posible clave de Mistral AI. Permite acceso a la API de Mistral.',
    remediation: {
      steps: [
        'Verifica si es una clave de Mistral',
        'Rota la clave si es necesario',
        'Usa solo desde el backend',
      ],
    },
  },

  // Cohere API Key
  {
    name: 'Clave API de Cohere',
    provider: 'Cohere',
    pattern: /[a-zA-Z0-9]{40}/g,
    severity: 'high',
    description: 'Posible clave de Cohere. Permite acceso a modelos de lenguaje.',
    remediation: {
      steps: [
        'Verifica si es una clave de Cohere',
        'Rota la clave en Cohere Dashboard',
        'Implementa llamadas desde el servidor',
      ],
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
  // Environment files
  { path: '/.env', severity: 'critical', description: 'Archivo de variables de entorno con secretos' },
  { path: '/.env.local', severity: 'critical', description: 'Archivo de entorno local' },
  { path: '/.env.production', severity: 'critical', description: 'Archivo de entorno de produccion' },
  { path: '/.env.development', severity: 'high', description: 'Archivo de entorno de desarrollo' },
  { path: '/.env.backup', severity: 'critical', description: 'Backup de variables de entorno' },
  { path: '/.env.example', severity: 'low', description: 'Ejemplo de variables de entorno (puede revelar estructura)' },

  // Git
  { path: '/.git/config', severity: 'high', description: 'Configuracion del repositorio Git' },
  { path: '/.git/HEAD', severity: 'high', description: 'Referencia HEAD de Git' },
  { path: '/.gitconfig', severity: 'medium', description: 'Configuracion global de Git' },

  // Config files
  { path: '/config.js', severity: 'medium', description: 'Archivo de configuracion JavaScript' },
  { path: '/config.json', severity: 'medium', description: 'Archivo de configuracion JSON' },
  { path: '/config.yml', severity: 'medium', description: 'Archivo de configuracion YAML' },
  { path: '/config.yaml', severity: 'medium', description: 'Archivo de configuracion YAML' },
  { path: '/settings.json', severity: 'medium', description: 'Archivo de configuracion' },
  { path: '/app.config.js', severity: 'medium', description: 'Configuracion de aplicacion' },
  { path: '/.htaccess', severity: 'low', description: 'Configuracion de Apache' },

  // CMS
  { path: '/wp-config.php', severity: 'critical', description: 'Configuracion de WordPress' },
  { path: '/wp-config.php.bak', severity: 'critical', description: 'Backup de configuracion WordPress' },
  { path: '/configuration.php', severity: 'critical', description: 'Configuracion de Joomla' },
  { path: '/sites/default/settings.php', severity: 'critical', description: 'Configuracion de Drupal' },

  // PHP
  { path: '/phpinfo.php', severity: 'medium', description: 'Pagina de informacion PHP' },
  { path: '/info.php', severity: 'medium', description: 'Pagina de informacion PHP' },
  { path: '/test.php', severity: 'low', description: 'Archivo de prueba PHP' },

  // Server
  { path: '/server.js', severity: 'medium', description: 'Archivo del servidor' },
  { path: '/server.ts', severity: 'medium', description: 'Archivo del servidor TypeScript' },

  // Database
  { path: '/database.yml', severity: 'critical', description: 'Configuracion de base de datos' },
  { path: '/database.json', severity: 'critical', description: 'Configuracion de base de datos' },
  { path: '/db.json', severity: 'high', description: 'Base de datos JSON' },
  { path: '/secrets.yml', severity: 'critical', description: 'Archivo de secretos' },
  { path: '/credentials.json', severity: 'critical', description: 'Archivo de credenciales' },
  { path: '/backup.sql', severity: 'critical', description: 'Backup de base de datos' },
  { path: '/dump.sql', severity: 'critical', description: 'Dump de base de datos' },
  { path: '/database.sql', severity: 'critical', description: 'Base de datos SQL' },
  { path: '/data.sql', severity: 'critical', description: 'Datos SQL' },
  { path: '/db.sqlite', severity: 'critical', description: 'Base de datos SQLite' },
  { path: '/database.sqlite', severity: 'critical', description: 'Base de datos SQLite' },

  // Cloud credentials
  { path: '/.aws/credentials', severity: 'critical', description: 'Credenciales de AWS' },
  { path: '/.aws/config', severity: 'high', description: 'Configuracion de AWS' },
  { path: '/gcloud-credentials.json', severity: 'critical', description: 'Credenciales de Google Cloud' },
  { path: '/service-account.json', severity: 'critical', description: 'Service account de Google Cloud' },
  { path: '/firebase-adminsdk.json', severity: 'critical', description: 'Credenciales Firebase Admin' },
  { path: '/firebase.json', severity: 'low', description: 'Configuracion de Firebase' },

  // SSH/Keys
  { path: '/id_rsa', severity: 'critical', description: 'Clave privada SSH' },
  { path: '/id_rsa.pub', severity: 'low', description: 'Clave publica SSH' },
  { path: '/id_ed25519', severity: 'critical', description: 'Clave privada SSH Ed25519' },
  { path: '/.ssh/authorized_keys', severity: 'high', description: 'Claves SSH autorizadas' },
  { path: '/private.key', severity: 'critical', description: 'Clave privada' },
  { path: '/private.pem', severity: 'critical', description: 'Clave privada PEM' },
  { path: '/server.key', severity: 'critical', description: 'Clave privada del servidor' },

  // Package managers
  { path: '/.npmrc', severity: 'high', description: 'Configuracion NPM (puede contener tokens)' },
  { path: '/.yarnrc', severity: 'high', description: 'Configuracion Yarn' },
  { path: '/yarn.lock', severity: 'low', description: 'Lockfile de Yarn (revela dependencias)' },
  { path: '/package-lock.json', severity: 'low', description: 'Lockfile de NPM' },
  { path: '/composer.lock', severity: 'low', description: 'Lockfile de Composer' },

  // Docker
  { path: '/.dockerenv', severity: 'medium', description: 'Entorno Docker' },
  { path: '/docker-compose.yml', severity: 'medium', description: 'Configuracion Docker Compose' },
  { path: '/docker-compose.yaml', severity: 'medium', description: 'Configuracion Docker Compose' },
  { path: '/Dockerfile', severity: 'low', description: 'Dockerfile' },

  // CI/CD
  { path: '/.travis.yml', severity: 'medium', description: 'Configuracion Travis CI' },
  { path: '/.gitlab-ci.yml', severity: 'medium', description: 'Configuracion GitLab CI' },
  { path: '/.github/workflows', severity: 'low', description: 'GitHub Actions' },
  { path: '/Jenkinsfile', severity: 'medium', description: 'Configuracion Jenkins' },
  { path: '/bitbucket-pipelines.yml', severity: 'medium', description: 'Configuracion Bitbucket Pipelines' },

  // Source maps (revelan codigo fuente)
  { path: '/main.js.map', severity: 'medium', description: 'Source map - revela codigo fuente original' },
  { path: '/bundle.js.map', severity: 'medium', description: 'Source map - revela codigo fuente original' },
  { path: '/app.js.map', severity: 'medium', description: 'Source map - revela codigo fuente original' },
  { path: '/_next/static/chunks/main.js.map', severity: 'medium', description: 'Source map de Next.js' },

  // Admin panels
  { path: '/admin', severity: 'high', description: 'Panel de administracion accesible' },
  { path: '/admin/', severity: 'high', description: 'Panel de administracion accesible' },
  { path: '/administrator', severity: 'high', description: 'Panel de administracion' },
  { path: '/wp-admin', severity: 'high', description: 'Admin de WordPress' },
  { path: '/wp-login.php', severity: 'medium', description: 'Login de WordPress' },
  { path: '/phpmyadmin', severity: 'critical', description: 'phpMyAdmin accesible - acceso directo a BD' },
  { path: '/pma', severity: 'critical', description: 'phpMyAdmin (alias)' },
  { path: '/adminer.php', severity: 'critical', description: 'Adminer - gestor de BD accesible' },
  { path: '/cpanel', severity: 'high', description: 'cPanel accesible' },
  { path: '/webmail', severity: 'medium', description: 'Webmail accesible' },

  // API Documentation
  { path: '/swagger', severity: 'medium', description: 'Swagger UI - documentacion API publica' },
  { path: '/swagger/', severity: 'medium', description: 'Swagger UI accesible' },
  { path: '/swagger.json', severity: 'medium', description: 'Especificacion Swagger JSON' },
  { path: '/swagger.yaml', severity: 'medium', description: 'Especificacion Swagger YAML' },
  { path: '/api-docs', severity: 'medium', description: 'Documentacion de API accesible' },
  { path: '/openapi.json', severity: 'medium', description: 'Especificacion OpenAPI' },
  { path: '/graphql', severity: 'medium', description: 'Endpoint GraphQL (verificar introspection)' },
  { path: '/graphiql', severity: 'high', description: 'GraphiQL IDE accesible publicamente' },
  { path: '/playground', severity: 'high', description: 'GraphQL Playground accesible' },

  // Debug/Dev
  { path: '/debug', severity: 'high', description: 'Pagina de debug accesible' },
  { path: '/debug/', severity: 'high', description: 'Pagina de debug accesible' },
  { path: '/test', severity: 'low', description: 'Pagina de test' },
  { path: '/dev', severity: 'medium', description: 'Pagina de desarrollo' },
  { path: '/.well-known/security.txt', severity: 'low', description: 'Security.txt (informativo)' },
  { path: '/robots.txt', severity: 'low', description: 'Robots.txt (puede revelar rutas ocultas)' },
  { path: '/sitemap.xml', severity: 'low', description: 'Sitemap XML' },

  // Logs
  { path: '/error.log', severity: 'high', description: 'Log de errores accesible' },
  { path: '/access.log', severity: 'high', description: 'Log de acceso' },
  { path: '/debug.log', severity: 'high', description: 'Log de debug' },
  { path: '/logs/error.log', severity: 'high', description: 'Log de errores' },
  { path: '/var/log/apache2/error.log', severity: 'critical', description: 'Log de Apache' },

  // Backups
  { path: '/backup.zip', severity: 'critical', description: 'Backup comprimido' },
  { path: '/backup.tar.gz', severity: 'critical', description: 'Backup comprimido' },
  { path: '/site-backup.zip', severity: 'critical', description: 'Backup del sitio' },
  { path: '/www.zip', severity: 'critical', description: 'Backup del sitio web' },
  { path: '/public.zip', severity: 'critical', description: 'Backup del directorio publico' },
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
