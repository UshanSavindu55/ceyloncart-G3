# CeylonCart

CeylonCart is a full-stack e-commerce MVP for locally made Sri Lankan products. The project uses a Vite + React client and a Node.js + Express backend, with shared cart state, a product catalogue, simulated payment, and in-memory order handling.

## MVP Scope

This repository is intentionally limited to a lightweight MVP.

Included:

- Product catalogue with 10 Sri Lankan dummy products
- Product detail view and add-to-cart flow
- Cart management with quantity controls and totals
- Checkout form with client-side validation
- Simulated payment flow with success and failure paths
- Order confirmation screen with generated order summary
- In-memory backend products, payment simulation, and orders

Not included:

- Real payment gateway integration
- Database persistence
- User accounts or authentication
- Admin authentication or management tools

## Technology Stack

- Frontend: React, Vite, React Router, Tailwind CSS
- Backend: Node.js, Express
- State: React Context + localStorage/sessionStorage
- Tooling: concurrently, nodemon, dotenv, cors

## Folder Structure

```text
.
├── client
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   └── services
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server
│   ├── data
│   ├── src
│   │   ├── middleware
│   │   └── routes
│   └── package.json
├── package.json
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer

## Installation

From the repository root, install dependencies with:

```bash
npm install
```

The root `package.json` also exposes the matching install script:

```bash
npm run install:all
```

## Environment Variables

Copy the example files and set the values locally.

Client: [client/.env.example](client/.env.example)

```bash
VITE_API_URL=http://localhost:5000
```

Server: [server/.env.example](server/.env.example)

```bash
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

## Running the Project

Run both client and server together from the root:

```bash
npm run dev
```

Run the client only:

```bash
npm run dev --workspace client
```

Run the server only:

```bash
npm run dev --workspace server
```

Start the server in production mode:

```bash
npm run start --workspace server
```

Build the client:

```bash
npm run build
```

Preview the built client:

```bash
npm run preview --workspace client
```

The client runs on `http://localhost:5173` and the API runs on `http://localhost:5000`.

## Fictional Payment Card Numbers

The payment form is simulated only. Do not enter a real card.

- `4242 4242 4242 4242` returns payment success
- `4000 0000 0000 0002` returns payment failure
- Any other card number returns payment failure

Spaces are ignored when the backend checks the card number.

## Core Features

- Catalogue page that fetches products from the API
- Product detail page with add-to-cart quantity selection
- Cart page with remove and quantity controls
- Checkout form with inline validation and session persistence
- Simulated payment submission and backend order creation
- Order confirmation page with the saved order summary
- Responsive layout and lightweight notification messages

## Optional Features Completed

None. Search/filter and admin tooling were intentionally left out to keep the MVP focused.

## Known Limitations

- All products, orders, and payment responses are dummy data
- Orders are stored only in memory and are lost when the server restarts
- Checkout and payment details are not sent to a real payment processor
- There is no authentication, order history, or admin workflow

## Payment and Data Notice

CeylonCart does not use a real payment gateway and does not store real customer payment data. The checkout flow is fictional and exists only for MVP demonstration and testing.