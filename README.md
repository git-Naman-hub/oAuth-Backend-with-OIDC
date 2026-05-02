# 🔐 Custom OAuth 2.0 + OpenID Connect Server

A fully functional backend implementation of an **OAuth 2.0 Authorization Server** with **OpenID Connect (OIDC)** support, built from scratch using Node.js, Express, and TypeScript.

---

## 🚀 Features

### 🔑 Authentication & Authorization
- Session-based user authentication
- Secure login & signup flow
- Authorization Code Flow implementation

### 🔄 OAuth 2.0 Flow
- `/auth/authorize` endpoint for issuing authorization codes
- `/auth/tokens` endpoint for exchanging code → tokens
- Authorization codes:
  - Short-lived (expiry enforced)
  - Single-use (deleted after consumption)

### 🪪 OpenID Connect (OIDC)
- ID Token generation (JWT - RS256)
- Standard claims:
  - `iss`, `sub`, `aud`, `given_name`, `family_name`
- `/auth/userinfo` endpoint for fetching user profile

### 🔐 Security
- JWT signed using **private key (RS256)**
- Public key exposed via JWKS
- Client secret stored as **hashed**
- Exact `redirect_uri` matching
- Authorization code replay protection

### 🔎 Discovery & Keys
- `/.well-known/openid-configuration`
- `/.well-known/public-keys`

---

## 🧠 Architecture Overview

Client App
↓
/auth/authorize?clientId= → issues authorization code
↓
/auth/tokens → exchanges code for tokens
↓
token issued if valid user
↓
/auth/userinfo → returns user profile

---

## 📦 Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Drizzle ORM
- JSON Web Tokens (JWT)

---


