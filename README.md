# Giftify – COMP229 Term Project (Team Mark)

Giftify is a private wish-list app. Every user has a profile and can make wish lists for occasions (birthday, Christmas, wedding…). People follow each other, **and every follow has to be approved**. Approved followers can see your lists and **claim** a gift so nobody else buys the same thing. **The list owner never sees what has been claimed**, so the gift stays a surprise.

| Release | What it delivers |
|---|---|
| Part 1 | Express MVC backend, MongoDB (Mongoose), JWT auth, full CRUD APIs tested with Postman/Newman |
| **Part 2** | **React front end connected to the API, full CRUD from the UI, authenticated navigation, unit tests (Vitest), E2E tests (Cypress + cy.prompt AI), performance work, cloud deployment (Render + MongoDB Atlas), CI/CD (GitHub Actions + Render auto-deploy)** |

## Project links
- **Live site:** https://giftify-0hns.onrender.com (Render free tier: the first visit after 15 idle minutes takes ~50 s to wake up)
- **Demo video (Part 1):** https://youtu.be/nU_fmmJhThI
- **Trello board (Product Backlog & Task Board):** https://trello.com/b/MYDxTSsJ/giftify-team-mark
- **GitHub repository:** https://github.com/immaculatecapper/giftify

## Tech stack
- **Front end:** React 18, React Router 6, Vite 5 (client/)
- **Back end:** Node.js 18+, Express 4 (ES modules), MVC
- **Database:** MongoDB Atlas + Mongoose 8
- **Auth:** JWT (`jsonwebtoken` + `express-jwt`), salted SHA-256 password hashes
- **Security / performance:** helmet (CSP), cors, gzip compression, long-cache hashed assets, lazy-loaded routes
- **Testing:** Vitest + React Testing Library (unit), Cypress 15 incl. `cy.prompt` (E2E), Postman + Newman (API)
- **Hosting / CI/CD:** Render (one web service), GitHub Actions

## Getting started
```bash
npm install                 # server dependencies (+ Cypress for E2E tests)
npm install --prefix client # React dependencies
cp .env.example .env        # then paste your MongoDB Atlas URI and a JWT secret
npm run seed                # creates the admin account
npm run seed -- --demo      # (optional) demo users ava/ben/cleo with lists and items
npm run dev                 # API on :3000 + React on http://localhost:5173 (Vite proxies /api and /auth)
```
Production mode (what Render runs): `npm run build && npm start`, then open http://localhost:3000. Express serves the React build and the API from the same port.

Demo logins after `npm run seed -- --demo`: `ava@example.com`, `ben@example.com`, `cleo@example.com`, password `Password1`. Admin: `admin@giftify.com` / `Admin@123`.

## Front end (client/)
| Page | Route | CRUD / API |
|---|---|---|
| Home (landing for visitors, dashboard when signed in) | `/` | `GET /api/feed`, `GET /api/wishlists` |
| Sign Up | `/signup` | **Create** user `POST /api/users`, then `POST /auth/signin` |
| Sign In / Sign Out | `/signin` | `POST /auth/signin`, `GET /auth/signout` |
| My Lists | `/lists` | **CRUD** wish lists |
| Wish list (owner) | `/lists/:id` | **CRUD** items, edit / delete the list |
| Friend's wish list | `/users/:id/lists/:listId` | claim / unclaim / gift given |
| Friends | `/friends` | search users, following / followers, unfollow, remove follower |
| Requests | `/requests` | approve / decline / cancel follow requests |
| My Gifts | `/gifts` | `GET /api/claims`, unclaim, gift given |
| My Profile | `/profile` | **Read / Update / Delete** my account |
| Profile | `/users/:id` | read profile, request to follow / unfollow |
| Users (admin) | `/admin/users` | read / update / delete any user |

The navigation bar is authenticated: visitors see **Home, Sign In, Sign Up**; signed-in users see **Home, My Lists, Friends, Requests (badge), My Gifts, My Profile, @username, Sign Out**; admins also see **Users**. The current page is highlighted with an underline (`NavLink` sets `class="active"` and `aria-current="page"`).

```
client/src/
  api/apiClient.js     fetch wrapper: adds "Authorization: Bearer <JWT>", JSON, errors, 401 -> sign out
  api/api.js           one function per API endpoint
  auth/                AuthContext (global sign-in state) + session.js (JWT in localStorage)
  components/          Navbar, Layout, PrivateRoute, Modal, forms, cards, ...
  pages/               one file per route (lazy-loaded)
  utils/               date / price formatting and form validation
  __tests__/           Vitest + React Testing Library unit tests
```

## Testing
| Command | What it runs |
|---|---|
| `npm run test:unit` | 28 Vitest / React Testing Library unit tests (components, pages, API client, helpers) |
| `npm run test:report --prefix client` | same tests + an HTML report in `client/test-report/` (open with `npx vite preview --outDir test-report`) |
| `npm run test:e2e` | Cypress E2E specs 01–04 headless, saves videos to `cypress/videos` (start the app first) |
| `npm run test:e2e:ai` | Opens the Cypress app for the AI spec `05_ai_prompt.cy.js` (`cy.prompt`, needs a free Cypress Cloud sign-in) |
| `npm run cypress:open` | Cypress app (interactive). Sign in to Cypress Cloud to run the AI spec `05_ai_prompt.cy.js` (`cy.prompt`) |
| `npm run test:api` | 86 Postman requests / 128 assertions with Newman against a separate `Giftify_test` database |

## Deployment (Render + MongoDB Atlas)
1. In MongoDB Atlas > Network Access, allow `0.0.0.0/0` (Render's IP addresses change).
2. On https://render.com > **New > Blueprint**, pick this GitHub repo. `render.yaml` creates one free web service.
3. Paste your Atlas connection string into `MONGODB_URI` (database name `Giftify`). `JWT_SECRET` is generated for you.
4. Render runs `npm install && npm run build`, then `npm start`. Health check: `/api`.

**CI/CD:** GitHub Actions (`.github/workflows/ci.yml`) runs the unit tests and the production build on every push and pull request. Render redeploys automatically whenever `main` changes, so merging a branch into `main` updates the live site.

## Running the API tests
```bash
npm run test:api
```
This runs all 86 requests and 128 assertions in `tests/Giftify_API.postman_collection.json` against a **separate** database, `Giftify_test`. Your real data is left alone. The test database is created at the start of the run and deleted at the end.

## Project structure (MVC + React)
```
config/config.js            environment config (.env)
server.js                   connects to MongoDB and starts Express
server/express.js           middleware, API routes, serves client/dist, error handling
server/models/              Mongoose schemas (M)
server/controllers/         request handlers / business logic (C)
server/routes/              URL -> middleware -> controller mapping
server/helpers/             error messages + privacy rules (access.js)
server/seed/seed.js         admin + demo data
client/                     React front end (V)
cypress/                    E2E tests
tests/                      Postman collection + Newman runner
render.yaml                 Render deployment blueprint
.github/workflows/ci.yml    GitHub Actions CI
```

## Database collections
| Collection | Purpose |
|---|---|
| `users` | Accounts and profiles: name, username, email, bio, avatarUrl, birthday, role |
| `follows` | follower → following, `status: pending \| accepted` |
| `wishlists` | owner, title, description, occasion, eventDate |
| `items` | wishlist, owner, name, url, imageUrl, price, priority, notes, claimedBy, claimedAt |

## Access rules
| Who | Can |
|---|---|
| Not signed in | Sign up, sign in |
| Any signed-in user | Search people, view basic profiles, send follow requests |
| Owner | Full CRUD on their own profile, wish lists and items. Accept or decline follow requests. Remove followers. **Never sees claim status** |
| Approved follower | View the owner's lists and items, claim or unclaim gifts, and remove an item they claimed once it has been given |
| Admin | Everything (moderation) |

## API reference
All routes except sign up and sign in need `Authorization: Bearer <token>`.

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/auth/signin` | `{ email or username, password }` → `{ token, user }` |
| GET | `/auth/signout` | Clear the auth cookie |
| GET | `/auth/me` | The signed-in user's account |

### Users
| Method | Route | Description |
|---|---|---|
| POST | `/api/users` | Sign up `{ name, username, email, password, bio?, birthday?, avatarUrl? }` |
| GET | `/api/users?q=` | Search users by name or username |
| GET | `/api/users/:userId` | Profile, follower/following counts, `followStatus` and `followId` |
| PUT | `/api/users/:userId` | Update profile (owner or admin) |
| DELETE | `/api/users/:userId` | Delete the account and its lists, items and follows (owner or admin) |

### Follows
| Method | Route | Description |
|---|---|---|
| POST | `/api/follows` | `{ userId }`: send a follow request (status `pending`) |
| GET | `/api/follows/requests` | Requests sent to me |
| GET | `/api/follows/sent` | Requests I've sent |
| PUT | `/api/follows/:followId/accept` | Approve a request (recipient only) |
| DELETE | `/api/follows/:followId` | Decline, cancel, unfollow or remove a follower |
| GET | `/api/users/:userId/followers` | Approved followers (private) |
| GET | `/api/users/:userId/following` | Who the user follows (private) |

### Wish lists
| Method | Route | Description |
|---|---|---|
| GET | `/api/wishlists` | My wish lists, with item counts |
| GET | `/api/feed` | Wish lists of everyone I follow (approved), soonest first |
| POST | `/api/wishlists` | Create `{ title, occasion?, eventDate?, description? }` |
| GET | `/api/users/:userId/wishlists` | Another user's lists (approved followers only) |
| GET | `/api/wishlists/:wishlistId` | One list |
| PUT | `/api/wishlists/:wishlistId` | Update (owner) |
| DELETE | `/api/wishlists/:wishlistId` | Delete the list and its items (owner) |

`occasion` is one of: birthday, christmas, wedding, baby_shower, graduation, anniversary, housewarming, other

### Items and claims
| Method | Route | Description |
|---|---|---|
| GET | `/api/wishlists/:wishlistId/items` | Items, highest priority first |
| POST | `/api/wishlists/:wishlistId/items` | Add `{ name, url?, imageUrl?, price?, priority?, notes? }` (owner) |
| GET | `/api/items/:itemId` | One item |
| PUT | `/api/items/:itemId` | Update (owner) |
| DELETE | `/api/items/:itemId` | Delete (owner), or remove after gifting (the claimer) |
| POST | `/api/items/:itemId/claim` | Claim a gift (approved follower) |
| DELETE | `/api/items/:itemId/claim` | Remove my claim |
| GET | `/api/claims` | Gifts I've claimed for other people |

Followers see `isClaimed` and `claimedByMe` on each item. The owner sees neither field.
