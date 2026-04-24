# Assignment 3 – Developer Documentation

## 1. Overview

This API provides authenticated access to mail messages for a corporate mail system. It is built with Node.js and Express, and implements:

- **JWT-based authentication** via `POST /auth/login`
- **Role-based access control (RBAC)** using `admin` and `user` roles
- **Centralized error handling** with consistent JSON error responses
- **Per-IP rate limiting** to prevent abuse
- **Request logging** with unique request IDs on every call

---

## 2. Authentication

### 2.1 Auth Method

- Scheme: **Bearer token (JWT)**
- Algorithm: HS256 (signed with `JWT_SECRET` environment variable; falls back to hardcoded secret if not set)
- Token expiry: **1 hour** (`expiresIn: '1h'`)

**How to obtain a token:**

- Endpoint: `POST /auth/login`
- Request body format:
  ```json
  {
    "username": "user1",
    "password": "user123"
  }
  ```
- Example success response (`200 OK`):
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
  ```

**JWT payload claims:**

| Claim    | Description                        |
|----------|------------------------------------|
| `userID` | The user's unique identifier       |
| `role`   | The user's role (`admin` or `user`)|

> **Note:** Credentials are verified against `data/users.js` using plain-text password comparison.

---

### 2.2 Using the Token

Include the token in the `Authorization` header on every authenticated request:

```
Authorization: Bearer <token>
```

**Behavior:**

- If the header is **missing or malformed** (doesn't start with `Bearer `), the server returns `401 UnauthorizedError` with the message: `"Authorization header missing or malformed"`.
- If the token is **invalid or expired**, the server returns a `ForbiddenError` with the message: `"Invalid or expired token"`.
- If the token is **valid**, the decoded payload is attached to `req.user` and the request proceeds.

---

## 3. Roles & Access Rules

Two roles are supported:

- **`admin`** — can view any mail message, regardless of ownership.
- **`user`** — can only view mail messages where `mail.userId` matches their own `userId` from the JWT payload.

The access decision for `GET /mail/:id` is made by the `canViewMail` policy, which returns `true` if either:
- `user.role === 'admin'` (checked by `isAdmin`), **OR**
- `mail.userId === user.userId` (checked by `ownsResource`)

**Access matrix:**

| Endpoint       | Method | `admin`          | `user`            | Unauthenticated |
|----------------|--------|------------------|-------------------|-----------------|
| `/auth/login`  | POST   | ✅ (no token needed) | ✅ (no token needed) | ✅           |
| `/mail/:id`    | GET    | ✅ any mail      | ✅ own mail only  | ❌ 401          |
| `/status`      | GET    | ✅               | ✅                | ✅              |

---

## 4. Endpoints

### 4.1 `POST /auth/login`

**Description:**
Authenticate with a username and password and receive a signed JWT.

**Authentication required:** No

**Request Body:**

```json
{
  "username": "user1",
  "password": "user123"
}
```

**Success Response (`200 OK`):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

**Failure Response — Invalid credentials (`401 AuthenticationError`):**

```json
{
  "error": "AuthenticationError",
  "message": "Invalid username or password",
  "statusCode": 401,
  "requestId": "a1b2c3d4-e5f6-...",
  "timestamp": "2025-11-30T14:22:00.000Z"
}
```

**Common failure reasons:**

- Username not found in `data/users.js`
- Password does not match the stored value
- Missing `username` or `password` fields in the request body

---

### 4.2 `GET /mail/:id`

**Description:**
Retrieve a single mail message by its ID.

**Authentication required:** Yes — `Authorization: Bearer <token>` header required.

**Access Rules:**
- `admin`: may retrieve any mail ID.
- `user`: may only retrieve mail where `mail.userId` matches their own `userId` from the JWT.

**Example Request (authenticated, authorized):**

```bash
curl http://localhost:3000/mail/2 \
  -H "Authorization: Bearer <token>"
```

**Example Success Response (`200 OK`):**

```json
{
  "id": 2,
  "userId": 2,
  "subject": "Hello User1",
  "body": "Your report is ready."
}
```

**Example Unauthorized Response — missing/malformed token (`401 UnauthorizedError`):**

```json
{
  "error": "UnauthorizedError",
  "message": "Authorization header missing or malformed",
  "statusCode": 401,
  "requestId": "a1b2c3d4-e5f6-...",
  "timestamp": "2025-11-30T14:22:00.000Z"
}
```

**Example Forbidden Response — user accessing another user's mail (`403 ForbiddenError`):**

```json
{
  "error": "ForbiddenError",
  "message": "Forbiddeen: permission denied",
  "statusCode": 403,
  "requestId": "a1b2c3d4-e5f6-...",
  "timestamp": "2025-11-30T14:22:00.000Z"
}
```

> **Note:** The message `"Forbiddeen: permission denied"` reflects the exact string defined in `authorize.js`.

---

### 4.3 `GET /status`

**Description:**
Simple health check endpoint to confirm the API is running.

**Authentication required:** No

**Example Response (`200 OK`):**

```json
{
  "status": "ok"
}
```

---

## 5. Rate Limiting

Rate limiting is applied globally using an in-memory fixed-window strategy (`rateLimit.js`).

**Configuration (via environment variables):**

| Variable                    | Default | Description                              |
|-----------------------------|---------|------------------------------------------|
| `RATE_LIMIT_MAX`            | `5`     | Max requests allowed per window          |
| `RATE_LIMIT_WINDOW_SECONDS` | `60`    | Duration of the window in seconds        |

**Key behaviour:**

- Keyed by **client IP address** (`req.ip`).
- Each IP gets a fresh window starting at the time of their first request.
- The window resets if the elapsed time since `windowStart` exceeds `windowMs`.
- Once `bucket.count` exceeds `RATE_LIMIT_MAX`, subsequent requests are rejected until the window resets.

**When the limit is exceeded:**

- HTTP status: `429`
- A `Retry-After` header is set to the window duration in seconds (e.g., `60`).
- Error response:

```json
{
  "error": "Rate Limit Error",
  "message": "Too many request. Please try again later",
  "statusCode": 429,
  "requestId": "a1b2c3d4-e5f6-...",
  "timestamp": "2025-11-30T14:30:00.000Z"
}
```

> **Note:** The exact `error` name is `"Rate Limit Error"` and the message `"Too many request. Please try again later"` reflect the strings defined in `rateLimit.js`.

---

## 6. Error Response Format

All errors are handled by the centralized `errorHandler.js` middleware, which is the last `app.use(...)` registered in `server.js`. It returns a consistent JSON structure and never leaks internal stack traces to the client.

**Standard error response shape:**

```json
{
  "error": "<err.name or 'Error'>",
  "message": "<err.message or 'An unexpected error occurred.'>",
  "statusCode": <err.statusCode or 500>,
  "requestId": "<uuid from req.requestId, or null>",
  "timestamp": "<ISO 8601 timestamp>"
}
```

**Common error categories:**

| `error` name          | `statusCode` | Cause                                                     |
|-----------------------|--------------|-----------------------------------------------------------|
| `AuthenticationError` | `401`        | Invalid username or password at `/auth/login`             |
| `UnauthorizedError`   | `401`        | Missing or malformed `Authorization` header               |
| `ForbiddenError`      | `403`        | Invalid/expired token, or user accessing unauthorized resource |
| `Rate Limit Error`    | `429`        | Too many requests from the same IP within the window      |
| `Error`               | `500`        | Unhandled/unexpected server errors                        |

---

## 7. Request Logging

Every incoming request is assigned a UUID (`req.requestId`) by the `requestLogger.js` middleware. This ID is:

- Logged to the console in the format:
  ```
  [<ISO timestamp>] REQUEST <uuid> <METHOD> <path>
  ```
- Included in all error responses as the `requestId` field.

This makes it easy to correlate client-facing error responses with server-side logs.

---

## 8. Example Flows

### 8.1 Happy Path: Login + Access Own Mail

**Step 1 — Obtain a token:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user1", "password": "user123"}'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

**Step 2 — Access own mail with the token:**

```bash
curl http://localhost:3000/mail/2 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6..."
```

Response (`200 OK`):
```json
{
  "id": 2,
  "userId": 2,
  "subject": "Hello User1",
  "body": "Your report is ready."
}
```

---

### 8.2 Error Path: User Accessing Someone Else's Mail

**Step 1 — Login as `user1`:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user1", "password": "user123"}'
```

Response:
```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..." }
```

**Step 2 — Attempt to access mail belonging to another user:**

```bash
curl http://localhost:3000/mail/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6..."
```

Response (`403 Forbidden`):
```json
{
  "error": "ForbiddenError",
  "message": "Forbiddeen: permission denied",
  "statusCode": 403,
  "requestId": "a1b2c3d4-e5f6-...",
  "timestamp": "2025-11-30T14:22:00.000Z"
}
```

---

### 8.3 Error Path: Rate Limit Exceeded

After exceeding 5 requests within 60 seconds from the same IP:

```bash
curl http://localhost:3000/mail/2 \
  -H "Authorization: Bearer <token>"
```

Response (`429 Too Many Requests`) — includes `Retry-After: 60` header:
```json
{
  "error": "Rate Limit Error",
  "message": "Too many request. Please try again later",
  "statusCode": 429,
  "requestId": "f9e8d7c6-b5a4-...",
  "timestamp": "2025-11-30T14:30:00.000Z"
}
```
