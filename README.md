# NovaStack

NovaStack is a full-stack digital solutions platform. Phase 1 provides the React/Vite site and 12 data-driven service pages. Phase 2 adds a Node/Express API, MongoDB persistence, cookie-based authentication, contact submissions, project enquiries, and user-specific enquiry history.

## Architecture

```text
frontend/                       React 18 + Vite application
  src/data.js                   Initial 12-service catalogue / seed source
  src/services/ServicesContext.jsx MongoDB-backed public service catalogue
  src/pages/AdminPages.jsx      Protected admin console and management screens
  src/lib/api.js                Credentialed API client
  src/auth/AuthContext.jsx      Session restoration and auth actions
  src/pages/AuthPages.jsx       Login, registration, protected history
server/                         Express 5 API
  src/config/database.js        Mongoose lifecycle
  src/models/                   User, Enquiry, ContactMessage, Service
  src/routes/                   Auth, public, admin, enquiry, contact, health APIs
  src/controllers/              Persistence, dashboard and management APIs
  src/scripts/                  Initial service seed and one-time admin bootstrap
  src/validators/               Zod request schemas
  tests/api.test.js             MongoDB-backed integration tests
```

The server derives its service allowlist and canonical service names from `frontend/src/data.js`; service slugs are not maintained in a second list.

## Requirements

- Node.js 20 or newer
- MongoDB local service or MongoDB Atlas database

## Local setup

Install both applications separately:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
```

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Edit `server/.env` with a long random `JWT_SECRET` (at least 32 characters) and the exact browser origin in `FRONTEND_URL`. The example uses local MongoDB and `http://localhost:5173`. Edit `frontend/.env` so `VITE_API_BASE_URL` points to the API (default `http://localhost:5000`). Never commit `.env` files.

Seed the initial 12 MongoDB-backed services once (repeatable and non-destructive):

```powershell
cd server
npm run seed:services
```

Set `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_EMAIL`, and a unique `BOOTSTRAP_ADMIN_PASSWORD` (at least 12 characters) in `server/.env`, then create the first administrator with:

```powershell
cd server
npm run bootstrap:admin
```

The bootstrap refuses to replace an existing admin account. It never runs automatically on server startup. Keep these credentials private and remove the bootstrap password from the environment after initial provisioning. For first-time registration in the UI instead, set a separate random `ADMIN_SETUP_KEY` (at least 32 characters) in `server/.env`; visit `/admin/register` and use it once. Registration closes as soon as the first admin is created. The UI registration and CLI bootstrap are alternatives, so use only one.

Admin pages are available at `/admin/login`, `/admin/register` (one-time initial setup), and `/admin/dashboard`. Public user registration always creates a regular user. Admin registration is a one-time, setup-key-protected first-admin flow; after that, new admin accounts are not publicly registerable.

Run the frontend and backend in separate terminals:

```powershell
cd frontend
npm run dev
```

```powershell
cd server
npm run dev
```

The API waits for MongoDB before opening its HTTP listener. Check readiness at `GET http://localhost:5000/api/health`. Build the frontend with `cd frontend; npm run build`. Start the API for production with `cd server; npm start`.

## API endpoints

| Method             | Route                                 | Auth     | Purpose                                                                  |
| ------------------ | ------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `GET`              | `/api/health`                         | No       | Application and database readiness                                       |
| `POST`             | `/api/auth/register`                  | No       | Create a standard user account and session                               |
| `POST`             | `/api/auth/login`                     | No       | Sign in and set an HttpOnly cookie                                       |
| `GET`              | `/api/auth/me`                        | Cookie   | Restore the current user's profile                                       |
| `POST`             | `/api/auth/logout`                    | Cookie   | Revoke existing sessions and clear cookie                                |
| `POST`             | `/api/enquiries`                      | Optional | Persist a guest or authenticated service enquiry                         |
| `GET`              | `/api/enquiries/mine`                 | Cookie   | List only the signed-in user's enquiries (pagination supported)          |
| `POST`             | `/api/contact`                        | No       | Persist a contact message                                                |
| `GET`              | `/api/services`                       | No       | List published MongoDB-backed services                                   |
| `GET`              | `/api/services/:slug`                 | No       | View one published service                                               |
| `GET`              | `/api/admin/dashboard`                | Admin    | Live totals, 30-day enquiry chart, service popularity and recent records |
| `GET`              | `/api/admin/enquiries`                | Admin    | Search, filter, sort and paginate all enquiries                          |
| `GET/PATCH/DELETE` | `/api/admin/enquiries/:id`            | Admin    | View, update status/internal notes, or delete an enquiry                 |
| `GET/POST`         | `/api/admin/services`                 | Admin    | Search/list or create services                                           |
| `PATCH/DELETE`     | `/api/admin/services/:id`             | Admin    | Edit/publish or delete/archive a service                                 |
| `GET`              | `/api/admin/users`                    | Admin    | Search and paginate safe user profiles with enquiry counts               |
| `GET`              | `/api/admin/users/:id`                | Admin    | User profile and recent enquiries                                        |
| `PATCH`            | `/api/admin/users/:id/status`         | Admin    | Deactivate/reactivate; sessions are revoked                              |
| `GET`              | `/api/admin/messages`                 | Admin    | Search/filter/paginate contact messages                                  |
| `PATCH/DELETE`     | `/api/admin/messages/:id/read-status` | Admin    | Update read state (or delete by `/api/admin/messages/:id`)               |
| `POST`             | `/api/auth/password`                  | Cookie   | Change the current account password after verifying the current password |

Successful creation endpoints respond with HTTP 201 only after MongoDB confirms persistence. Errors use `{ success: false, error: { code, message, fieldErrors? } }`. Authentication uses a short-lived, HttpOnly JWT cookie; public registration cannot assign roles. Authenticated state-changing requests require the configured frontend `Origin` to reduce CSRF risk. CORS allows only the exact configured origin.

## Tests

Run API integration tests against a running local MongoDB service:

```powershell
cd server
npm test
```

The suite covers registration, duplicate and malformed accounts, password hashing, session restore/logout, role assignment rejection, protected access, ownership isolation, all 12 enquiry slugs and MongoDB persistence, contact persistence, CORS/security headers, malformed JSON, persistence failures, admin 401/403 authorization, real dashboard analytics, enquiry filters/status audit, service publishing/archive behavior, safe user responses, and message read status.

Build the frontend separately with `cd frontend; npm run build`.

## Security and current limitations

- Contact messages and project enquiries are stored in MongoDB; no email notification service is configured. Admins can use Reply to open their configured email application with the sender and subject filled in; NovaStack does not send the email itself.
- Authentication is cookie based. Set `COOKIE_SAME_SITE=none` only when the deployment uses cross-site frontend/API hosts, and serve both over HTTPS so cookies remain `Secure`.
- Admin access has no public registration route. The admin console supports Mongo-backed overview, enquiry management, service catalogue CRUD, user status controls, contact message read state, and password changes.
- Service seed uses the original 12 entries as insert-only defaults. Rerunning it preserves admin edits, publication states, and existing records. Enquiries keep a snapshot of the service name/slug; deleting a referenced service archives it.
- Deactivating an account revokes its current sessions. The current administrator cannot deactivate their own account; the last active administrator cannot be deactivated.
- Email notifications, a full admin role editor, invitation flow, password reset, email verification, payments, and production deployment hardening are not included.
- User enquiry history is protected and scoped by the verified session user ID.
- Set a trusted `FRONTEND_URL`, strong `JWT_SECRET`, and production database before deploying. The development `.env` is local only.
