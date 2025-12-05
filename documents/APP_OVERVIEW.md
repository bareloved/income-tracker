# Seder – App Overview

> High-level source of truth for the Seder app. Keep it short, accurate, and useful for humans + AI agents working on this repo.

--------------------------------------------------
1. What Seder Is
--------------------------------------------------

- Seder is a web app for organizing and tracking incomes from various clients.
- Built for working musicians and freelancers who want a clear view of what was earned, what is overdue, and what is coming next.
- Elevator pitch: a focused, RTL-friendly income desk with quick add, inline editing, and import/sync tools so gig-based earners always know their cashflow status.

--------------------------------------------------
2. Who It’s For
--------------------------------------------------

- Primary users: band leaders, solo musicians, and freelancers who invoice clients.
- Typical use cases:
  - Track income per gig/client with status (draft/sent/paid/overdue).
  - See paid vs unpaid at a glance with monthly KPIs.
  - Quickly log new incomes and update statuses from desktop or mobile.
  - Import past gigs from Google Calendar to avoid manual entry.

--------------------------------------------------
3. Core Concepts & Domain Model
--------------------------------------------------

Name | Description | Important fields (selected)
---- | ----------- | ---------------------------
User | Authenticated account (Better Auth) owning all income data | id, email, name, createdAt/updatedAt
Income Entry | Single gig/job record | date, description, clientName, category, amountGross, amountPaid, vatRate, includesVat, invoiceStatus, paymentStatus, invoiceSentDate, paidDate, calendarEventId, notes, userId
Session / Account | Auth/session + OAuth tokens for Google Calendar | session: token, expiresAt, userId; account: providerId, accessToken/refreshToken, userId, scope
Status & VAT Types (UI) | UI enums that map to DB fields | DisplayStatus, VatType in `app/income/types.ts`
KPI / Aggregates | Derived metrics per month or filtered view | totalGross, totalPaid/unpaid, outstanding, readyToInvoice, previousMonthPaid, trend

--------------------------------------------------
4. Main Screens / Flows
--------------------------------------------------

Route / Screen | Purpose | Notes
-------------- | ------- | -----
/ | Redirects to `/income` | No UI
/sign-in | Auth screen | Email/password + Google OAuth (Calendar scope)
/income | Primary dashboard | Month selector, KPIs, filters, income table + quick add, detail dialog, calendar import
/api/auth/[...all] | Auth handler | Better Auth Next.js route

--------------------------------------------------
5. Current Feature Set
--------------------------------------------------

- Income table (desktop + mobile cards) with quick add, inline edits, and full detail dialog.
- Status management: invoice status (draft/sent/paid/cancelled), payment status (unpaid/partial/paid), overdue highlighting, sent/paid actions.
- Filtering/search: status chips, client filter, free-text search, month/year selector; KPI cards double as filters.
- KPI row: totals, ready-to-invoice, outstanding, paid this month, trend vs previous month.
- Calendar import: Google Calendar read-only import to create draft entries with unique calendarEventId.
- VAT handling: includes/excludes VAT, vatRate field, calculated totals.
- Mobile support: mobile quick add and responsive cards.

--------------------------------------------------
6. Tech Stack & Architecture
--------------------------------------------------

- Frontend: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, shadcn-style components (Radix UI), lucide-react icons.
- Backend/API: Next.js server components + server actions; auth route at `/api/auth/[...all]`.
- Auth: Better Auth with Drizzle adapter; email/password and Google OAuth (Calendar scope).
- Database: PostgreSQL via Drizzle ORM (`db/schema.ts`, `db/client.ts`); core table `income_entries` scoped by `userId`.
- Data flow:
  - Server actions in `app/income/actions.ts` call domain/data helpers in `app/income/data.ts`.
  - Pages fetch month-scoped entries/aggregates on the server, then hydrate client components for optimistic updates and filtering.
  - Calendar import uses stored Google tokens to fetch events and insert draft entries (conflict-checked on calendarEventId).

--------------------------------------------------
7. Future Direction / Out of Scope (for now)
--------------------------------------------------

- Dedicated Client and Category entities (currently plain strings).
- Multi-currency or localization beyond Hebrew/RTL and ILS.
- Advanced reporting (yearly views, charts, breakdowns) and pagination/virtualization for very large months.
- Rich onboarding (guided tour/sample data) and polished error/toast system.
- Revisit calendar uniqueness for multi-user scenarios; thread authenticated user through all import paths.

--------------------------------------------------
8. How to Keep This File Useful
--------------------------------------------------

- Update when you add/remove a major screen, change core domain concepts, or adjust tech stack/auth/database choices.
- Keep descriptions concise; link to deeper docs if needed.
- Reflect meaningful UX or data-flow changes (e.g., new status rules, new integrations).
- Treat this as the source of truth—avoid duplicating conflicting overviews elsewhere.

