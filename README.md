# MtejaFlow

> Your business. Understood.

Phase 1 of the MtejaFlow MVP (part of the larger Mteja AI vision). This
covers: project scaffolding, the multi-tenant database schema, Supabase
Auth, the design system, the app shell, and the marketing landing page.

Customers, quotes, invoices, and follow-ups are stubbed with
"coming in Phase N" placeholders — those are the next phases.

## Structure

```
mtejaflow/
├── apps/
│   ├── web/     React + Vite frontend
│   └── api/     Node/Express backend (AI, PDF generation)
└── supabase/
    └── migrations/   SQL migrations (run these first)
```

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase SQL Editor, run each file in `supabase/migrations/`
   **in order** (0001 → 0007). Each is idempotent-ish (`if not exists`)
   but order matters because later files reference earlier tables.
3. In your project settings → API, copy:
   - **Project URL**
   - **anon public key** (goes in the frontend)
   - **service_role key** (goes in the backend only — never the frontend)
4. In Authentication → Settings, make sure "Enable email confirmations"
   is on if you want the email verification flow to actually gate access.

## 2. Configure environment variables

**Frontend** (`apps/web/.env` — copy from `.env.example`):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_API_BASE_URL=http://localhost:4000
```

**Backend** (`apps/api/.env` — copy from `.env.example`):
```
PORT=4000
WEB_ORIGIN=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-...
```

## 3. Install and run

```bash
# from the repo root
cd apps/web && npm install
cd ../api && npm install

# in one terminal
cd apps/api && npm run dev      # http://localhost:4000

# in another terminal
cd apps/web && npm run dev      # http://localhost:5173
```

## 4. Try it

1. Open `http://localhost:5173` — you'll land on the marketing page.
2. Click **Start for free**, sign up with an email + password.
3. Check your email for the verification link (or check the Supabase
   Auth logs if you're testing locally without real email delivery).
4. Log in → you'll be dropped into onboarding to create your business.
5. After onboarding, you land on `/app` — the dashboard, with the
   sidebar showing all MVP modules (most still "coming in Phase N").

## What's real vs. stubbed in this phase

**Fully working:**
- Sign up / log in / log out / forgot password / email verification
- Business onboarding → creates a row in `businesses` + `business_members`
- Dashboard — queries real Supabase data (will show zeros/empty states
  until you have customers, quotes, and invoices from later phases)
- Full RLS-enforced multi-tenant schema for the entire MVP feature set
- Design system (tokens, Button/Input/Select/Modal/Toast/StatCard/etc.)
- i18n (English/Swahili) with a working language switcher
- Node API skeleton with JWT verification, AI tool-calling scaffold,
  PDF rendering service, and the AI message generator endpoint —
  these have no UI wired to them yet (that's Phase 3/4/7)
- Marketing landing page

**Stubbed with "coming in Phase N" screens:**
- Customers (Phase 2), Quotes (Phase 3), Invoices (Phase 4),
  Follow-ups (Phase 5), AI Assistant (Phase 7)

## Notes on the backend

`apps/api` is functional but has no frontend calling it yet — that
wiring happens once customers/quotes/invoices exist (Phase 3+). You can
smoke-test it directly once you have a valid Supabase session token:

```bash
curl -X POST http://localhost:4000/api/messages/generate \
  -H "Authorization: Bearer <supabase-access-token>" \
  -H "Content-Type: application/json" \
  -d '{"customerName":"John","situation":"Quotation unanswered for 5 days","tone":"professional_friendly","language":"en"}'
```

## Next steps

Say "begin Phase 2" to build out full customer management (CRUD, search,
filters, profile page) on top of this foundation.
