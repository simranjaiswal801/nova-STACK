# NovaStack

NovaStack — Digital Solutions & Technology. **Build Better. Scale Smarter.** This responsive React frontend is integrated with the Phase 2 API for persistent contact messages, service enquiries, and authentication.

## Features

- Home, About, Services, Contact, and branded not-found routes
- Twelve data-driven service detail routes with breadcrumbs, deliverables, FAQs, related services, and project enquiry forms
- Service catalogue filters across four service groups
- Responsive navigation with active route states and mobile menu
- Persistent light/dark theme preference
- Service cards, concept portfolio pieces, process section, and accessible FAQ accordion
- Client and server validation with API-backed contact and service enquiry submissions
- Login, registration, session restoration, logout, and protected user enquiry history
- Page titles and descriptions, reduced-motion support, keyboard focus styles
- Responsive layouts and original CSS-generated brand and project illustrations

Portfolio pieces are explicitly labeled concept projects. No clients, employee biographies, awards, or business statistics are represented as real. Form submissions persist only after the API confirms success; email notifications are not configured.

## Technology

React 18, Vite 6, JavaScript, React Router DOM, Framer Motion, Lucide React, and maintainable custom CSS.

## Setup

Requires Node.js 20 or newer. Configure `VITE_API_BASE_URL` in `.env` to point to the running API. See the root README for full-stack setup.

```sh
npm install
npm run dev
```

Build and preview the production bundle:

```sh
npm run build
npm run preview
```

## Structure

```text
src/
  App.jsx            Routes and page compositions
  components.jsx     Shared navigation, cards, buttons, FAQ, footer
  data.js            Canonical service, project, and FAQ content
  lib/api.js         Credentialed API client
  auth/              Authentication context and session restoration
  pages/AuthPages.jsx Login, registration, and private enquiry history
  ServiceDetails.jsx Shared data-driven service detail route
  index.css          Design tokens, components, responsive styles
  main.jsx           React entry point
index.html           Vite entry and base SEO metadata
.env.example         Backend API base URL
```

## Phase 2 readiness

The frontend uses the separate Express API in `../server`. Browser requests include credentials for the HttpOnly session cookie. Do not put secrets in Vite environment variables; only the public API base URL belongs here.
