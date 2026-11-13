# Giftify – COMP229 Term Project (Team Mark)

Giftify is a private wish-list app. Every user has a profile and can make wish lists for occasions (birthday, Christmas, wedding…). People follow each other, **and every follow has to be approved**. Approved followers can see your lists and **claim** a gift so nobody else buys the same thing. **The list owner never sees what has been claimed**, so the gift stays a surprise.

**Part 1 release:** backend only. Node.js, Express (MVC), MongoDB with Mongoose, and JWT authentication. Every API is tested with Postman/Newman.

## Project links
- **Demo video (Part 1):** https://youtu.be/nU_fmmJhThI
- **Trello board (Product Backlog & Task Board):** https://trello.com/b/MYDxTSsJ/giftify-team-mark
- **GitHub repository:** https://github.com/immaculatecapper/giftify

## Tech stack
- Node.js 18+, Express 4 (ES modules)
- MongoDB Atlas + Mongoose 8
- JWT auth (`jsonwebtoken` + `express-jwt`), salted SHA-256 password hashes
- helmet, cors, compression, cookie-parser
- Postman collection + Newman for API testing

## Getting started
```bash
npm install
cp .env.example .env        # then paste your MongoDB Atlas URI and a JWT secret
npm run seed                # creates the admin account
npm run seed -- --demo      # (optional) adds demo users ava/ben/cleo with lists and items
npm run dev                 # starts the API on http://localhost:3000 with nodemon
```

## Running the API tests
```bash
npm run test:api
```
This runs all 86 requests and 128 assertions in `tests/Giftify_API.postman_collection.json` against a **separate** database, `Giftify_test`. Your real data is left alone. The test database is created at the start of the run and deleted at the end.

You can also import the collection into Postman and run it with the Collection Runner. Start the server and run `npm run seed` first.

## Project structure (MVC)
```
config/config.js            environment config (.env)
server.js                   connects to MongoDB and starts Express
server/express.js           middleware + route registration + error handling
server/models/              Mongoose schemas (M)
  user.model.js             users collection
  follow.model.js           follows collection (pending / accepted)
  wishlist.model.js         wishlists collection
  item.model.js             items collection (includes the hidden claim)
server/controllers/         request handlers / business logic (C)
server/routes/              URL -> middleware -> controller mapping
server/helpers/             error messages + privacy rules (access.js)
server/seed/seed.js         admin + demo data
tests/                      Postman collection + Newman runner
```
This is an API-only release, so the JSON responses take the place of the "View" in MVC. The React front end arrives in Part 2.

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
| GET | `/api/users/:userId` | Profile, follower/following counts, and `followStatus` |
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
