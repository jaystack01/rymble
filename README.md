# Rymble

**Rymble** is a real-time, workspace-based chat application inspired by Slack's interaction model but intentionally scoped for a fast, focused MVP. It emphasizes clean architecture, predictable state management, and incremental scalability rather than feature bloat.

Built with a modern TypeScript-first mindset on the client and a lean Node.js backend, Rymble supports authentication, workspaces, channels, direct messages, invites, real-time messaging, and presence tracking.


## ✨ Features

### Authentication & User Management

* JWT-based authentication
* Register, login, profile update
* Token-based auto-login
* Global auth state with refresh handling
* Centralized 401 handling with auto logout

### Workspaces

* Create, join, leave, delete workspaces
* Transfer workspace ownership
* Workspace member roles (owner, member)
* Persist last opened workspace per user

### Channels & Messaging

* Workspace-scoped channels
* Channel archiving & unarchiving
* Real-time messaging via Socket.io
* Message persistence with MongoDB
* Optimistic UI updates
* Scroll restoration and active channel persistence

### Direct Messages

* One-to-one messaging inside a workspace
* Member presence awareness
* Unified message input for channels and DMs

### Invites System

* Invite users to workspaces
* Accept / decline invites
* Pending invites counter
* Centralized invites state management

### UI / UX

* Dark mode by default
* Custom scrollbars (Firefox + Chromium)
* Smooth animations with Framer Motion
* Radix UI primitives
* Responsive, minimal layout
* Keyboard accessible modals


## 🧠 Architectural Philosophy

Rymble follows a **lean MVP-first approach**:

* No premature abstraction
* Context-based state over global stores
* Clear separation between UI, state, and side effects
* Server logic organized by domain controllers
* Schema-driven validation using Zod on both client and server

Breaking changes are explicitly marked in commit history and respected as part of intentional iteration.


## 🧱 Tech Stack

### Client

* **Next.js 16 (App Router)**
* **React 19**
* **TypeScript**
* **Tailwind CSS v4**
* **Radix UI**
* **Framer Motion**
* **Socket.io Client**
* **Axios**
* **React Hook Form + Zod**
* **Sonner (Toasts)**

### Server

* **Node.js**
* **Express 5**
* **MongoDB + Mongoose**
* **Socket.io**
* **JWT Authentication**
* **Zod Validation**
* **bcryptjs**


## 📁 Project Structure

```bash
rymble/
├── client/                # Next.js frontend
│   ├── app/               # App router pages & layouts
│   ├── components/        # UI components
│   ├── context/           # Auth, workspace, channel, socket contexts
│   ├── lib/               # API helpers, utilities
│   └── types/             # Type declarations
│
├── server/                # Node.js backend
│   ├── config/            # DB connections/Config
│   ├── controllers/       # Domain controllers
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routes
│   ├── middleware/        # Auth & error middleware
│   ├── socket/            # Socket IO setup
│   └── index.js           # Server entry
```


## ⚙️ Environment Variables

### Server (`server/.env`)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Client (`client/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```


## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/jaystack01/rymble.git
cd rymble
```

### 2. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Run the development servers

#### Backend

```bash
cd server
npm run dev
```

#### Frontend

```bash
cd client
npm run dev
```

App runs at:
👉 `http://localhost:3000`


## 🔌 Real-Time Architecture

* Socket connections are authenticated via JWT
* Users join rooms scoped to:

  * Workspace
  * Channel
  * Direct Message
* Presence updates are emitted on connect/disconnect
* Messages are persisted before broadcast to avoid ghost events


## 🧪 Error Handling & Validation

* Zod schemas validate:

  * Request payloads
  * Auth inputs
  * Profile updates
* Centralized API error responses
* Axios response interceptor handles:

  * 401 → logout + localStorage clear
* Defensive checks across contexts to avoid stale state


## 🔒 Security Considerations

* Passwords hashed using bcrypt
* JWT stored client-side with explicit invalidation
* Protected routes enforced server-side
* Socket authentication middleware applied
* No sensitive data exposed to client contexts


## 🛠️ Known Constraints (Intentional)

* No message reactions yet
* No file uploads
* No threaded messages
* No role hierarchy beyond owner/member

These are **deliberate MVP constraints**, not oversights.


## 📜 Commit Discipline

This repository follows:

* Conventional commits
* Explicit `BREAKING CHANGE` notes
* Progressive refactors instead of rewrites

The git history is part of the documentation.


## 📄 License

ISC License

