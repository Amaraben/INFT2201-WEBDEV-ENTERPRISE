# **Assignment 2 – Authentication, Authorization, and RBAC (Node + PHP + JWT)**

### **Overview**

In this assignment, you will upgrade your corporate Mail application to support:

* User accounts
* Authentication (login + JWT issuance)
* Authorization (restrict access based on token contents)
* Role-Based Access Control (RBAC)
* A multi-service architecture (Node → PHP → database)

A fully functional **React client application is provided for you.**
You **do not need to write any React code** for this assignment.

Your task is to implement all **backend** behaviour so that the provided UI works correctly.

---

# **Learning Focus**

This assignment reinforces:

* Stateless authentication
* Token issuance and verification
* Securing PHP endpoints using a Verifier class
* RBAC (admin vs user access rules)
* Dockerized multi-service development
* Clean separation of concerns across services

React is *not* taught in this course — the UI is provided only so you can visually verify your backend.

---

# **Starter Files**

Unzip `assignment-three-starter.zip`.
The project contains:

```
/docker             → docker-compose + Dockerfiles for Node + PHP
/node               → login service (modify this)
/codebase           → PHP API + client UI (use, don’t rewrite)
    /html           → Provided React front-end
    /api            → PHP API endpoints (modify these)
```

Start your full environment from the `/docker` directory:

```
docker-compose build && docker-compose up -d
```

To enter the Node container:

```
docker exec -it docker-server-node-1 /bin/bash
```

To enter the PHP container:

```
docker exec -it docker-server-web-1 /bin/bash
```

---

# **Requirements**

---

## **1. Node Authentication Service (Modify `/node/index.js`)**

Implement a login endpoint:

```
POST /node/login
Body: { "username": "...", "password": "..." }
Returns: { "token": "<JWT here>" }
```

The Node service must:

### **1. Validate credentials using `users.txt`**

Each line looks like:

```
username,password,userId,role
```

Example:

```
user1,12345,1,user
admin,admin123,99,admin
```

### **2. Issue a JWT containing:**

```
{ 
  userId: <number>,
  role: "admin" | "user"
}
```

### **3. Sign the token**

Use `jsonwebtoken` and a **random secret string**:

```js
jwt.sign(payload, "<YOUR_RANDOM_SECRET>", { expiresIn: "1h" })
```

> ⚠ **Penalty:** -1 mark if you do not change the secret to a random string.

---

## **2. Client Application (Provided, Do Not Rewrite)**

The React client in `/codebase/html/index.js`:

* Displays a login form
* Calls `POST /node/login`
* Stores token in memory
* Adds `Authorization: Bearer <token>` to all backend requests
* Shows mail based on RBAC
* Allows composing new mail
* Offers logout functionality

You **do not** need to modify this file unless you want to change the appearance.

Your backend must be implemented so that **this client works as-is**.

---

## **3. PHP API Integration (Modify `/codebase/html/api/mail/*.php`)**

### **1. Use the provided `Verifier` class**

Located at:

```
/codebase/classes/Application/Verifier.class.php
```

It extracts:

```
$this->userId
$this->role
```

from the JWT.

> ⚠ **Penalty:** -2 marks if Verifier is not autoloaded correctly.

### **2. Authenticate Every Request**

Every request to:

* `GET /api/mail/`
* `POST /api/mail/`

must include:

```
Authorization: Bearer <token>
```

If missing or invalid → return HTTP 401.

---

## **4. Implement Role-Based Access Control (RBAC)**

Using `$verifier->userId` and `$verifier->role`:

### **Admin (`role === "admin"`):**

* Can see **all mail**
* Can create mail on behalf of any user (client UI sends name/message only)

### **Regular user (`role === "user"`):**

* Can see **only their own mail**
* Can create mail associated with **their userId**

The database schema already includes a `userId` column.

### **Endpoints to implement**

Required:

* **GET /api/mail/** → return mail scoped by role
* **POST /api/mail/** → insert mail with correct `userId`

Not required:

* PUT
* DELETE

---

## **5. Scope Mail Data Correctly**

PHP’s GET handler must return:

### **If admin**

```
[
  { id: 1, name: "...", message: "...", userId: 1 },
  ...
]
```

### **If userId = 2**

Return only mail where `userId = 2`.

The React app automatically updates the UI based on your results.

---

# **Testing**

### **Test Node login**

```
curl -d '{"username":"user1","password":"12345"}' \
     -H "Content-Type: application/json" \
     -X POST http://localhost/node/login
```

### **Why can’t I use curl for PHP endpoints?**

Because **Docker is routing Apache to the host machine**, not Node.

The React client accesses both services internally:

* Node via `http://node/login`
* PHP via `/api/mail/`

This mirrors a real multi-service production setup.

---

# **Submission**

Upload a zip file containing:

* The updated Node `index.js`
* Updated PHP mail endpoint files
* No `vendor/` directory
* No node_modules

The React app **must remain functional**.

---

# **Rubric (20 points total)**

| Component                                                          |  Marks  |
| ------------------------------------------------------------------ | :-----: |
| **Node authentication endpoint**                                   |    /5   |
| – Correct validation, JWT issuance, proper payload and JSON output |         |
| **End-to-end auth using provided client**                          |    /5   |
| – Login, logout, sending mail, viewing mail works seamlessly       |         |
| **Authorization header handling**                                  |    /2   |
| – PHP correctly checks for `Authorization: Bearer ...`             |         |
| **PHP Verifier + token decoding**                                  |    /3   |
| – Autoloaded, secret matches Node, extracts userId + role          |         |
| **RBAC enforcement**                                               |    /3   |
| – Admin sees all mail, regular users only theirs                   |         |
| **User-scoped data**                                               |    /2   |
| – New mail saved under authenticated userId                        |         |
| **Total**                                                          | **/20** |

### **Penalties**

* -1: JWT secret not changed
* -2: Verifier not autoloaded correctly
* -5: Late submission
* -5: Missing AI documentation
* -20: Submitted after late window (not graded)

