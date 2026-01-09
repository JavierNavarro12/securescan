# SecureScan

**Escáner de seguridad para sitios web** - Detecta API keys expuestas, archivos sensibles y vulnerabilidades de configuración.

![SecureScan](https://via.placeholder.com/800x400?text=SecureScan)

## Características

- **Detección de API Keys**: OpenAI, Anthropic, Stripe, AWS, Firebase, GitHub, Twilio, SendGrid, Slack, Discord, y más
- **Archivos Sensibles**: .env, .git, config.js, credentials.json, etc.
- **Headers de Seguridad**: CSP, X-Frame-Options, HSTS, X-Content-Type-Options
- **Análisis de JS Bundles**: Escanea código JavaScript minificado
- **Source Maps**: Detecta si expones tu código fuente
- **Puntuación de Seguridad**: Score de 0-100 con clasificación por severidad

## Modelo de Negocio

- **Gratis**: Puntuación + resumen de vulnerabilidades
- **Pago (€0.99)**: Detalles completos + guías de solución + código de ejemplo

## Tech Stack

- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Pagos**: Stripe Checkout
- **Animaciones**: Framer Motion
- **Icons**: Lucide React

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/securescan.git
cd securescan
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve al SQL Editor y ejecuta el contenido de `supabase/schema.sql`
3. Copia las credenciales de la sección Settings > API

### 4. Configurar Stripe

1. Crea una cuenta en [stripe.com](https://stripe.com)
2. Obtén tus API keys de test en el Dashboard
3. Configura un webhook apuntando a `/api/webhook` con el evento `checkout.session.completed`

### 5. Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio en [vercel.com](https://vercel.com)
2. Añade las variables de entorno
3. Despliega

### Railway

1. Crea un nuevo proyecto en [railway.app](https://railway.app)
2. Conecta el repositorio
3. Añade las variables de entorno
4. Despliega

## Estructura del Proyecto

```
securescan/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── scan/          # POST /api/scan
│   │   │   ├── results/[id]/  # GET /api/results/:id
│   │   │   ├── checkout/      # POST /api/checkout
│   │   │   ├── webhook/       # POST /api/webhook (Stripe)
│   │   │   └── stats/         # GET /api/stats
│   │   ├── scan/[id]/         # Página de resultados
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── FAQ.tsx
│   │   ├── Features.tsx
│   │   ├── Footer.tsx
│   │   ├── Logo.tsx
│   │   ├── PaywallCard.tsx
│   │   ├── ProviderLogos.tsx
│   │   ├── ScanInput.tsx
│   │   ├── ScanProgress.tsx
│   │   ├── ScoreCircle.tsx
│   │   ├── Stats.tsx
│   │   ├── VulnerabilityCard.tsx
│   │   └── VulnerabilitySummary.tsx
│   ├── lib/
│   │   ├── patterns.ts        # Regex patterns para API keys
│   │   ├── rate-limit.ts      # Rate limiting
│   │   ├── scanner.ts         # Motor de escaneo
│   │   ├── scoring.ts         # Cálculo de puntuación
│   │   ├── stripe.ts          # Integración Stripe
│   │   └── supabase.ts        # Cliente Supabase
│   └── types/
│       └── index.ts           # TypeScript types
├── supabase/
│   └── schema.sql             # Schema de base de datos
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## API Reference

### POST /api/scan

Inicia un nuevo escaneo.

```json
// Request
{ "url": "https://example.com" }

// Response
{ "success": true, "scanId": "uuid-here", "cached": false }
```

### GET /api/results/:id

Obtiene los resultados de un escaneo.

```json
// Response
{
  "success": true,
  "results": {
    "id": "uuid",
    "url": "https://example.com",
    "score": 75,
    "status": "completed",
    "vulnerabilities": [...],
    "summary": { "critical": 1, "high": 0, "medium": 2, "low": 1, "total": 4 },
    "isPaid": false
  }
}
```

### POST /api/checkout

Crea una sesión de Stripe Checkout.

```json
// Request
{ "scanId": "uuid-here" }

// Response
{ "success": true, "checkoutUrl": "https://checkout.stripe.com/..." }
```

## Rate Limiting

- **5 escaneos por IP por hora** (configurable)
- Los resultados se cachean por **1 hora**

## Seguridad

- Las API keys encontradas **nunca se almacenan completas**
- Solo se guarda una versión sanitizada (primeros + últimos caracteres)
- Los escaneos se procesan en tiempo real
- Webhook de Stripe verificado con firma

## Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

---

Hecho con 🛡️ para proteger tu código
