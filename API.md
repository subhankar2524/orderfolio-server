# Orderfolio API Documentation

Base URL

```
http://localhost:8080/api
```

Content-Type for all requests:

```
Content-Type: application/json
```

---

# 1. User Signup

Creates a new **user or rider account** and sends OTP for email verification.

Endpoint

```
POST /auth/signup
```

Curl

```
curl -X POST http://localhost:8080/api/auth/signup \
-H "Content-Type: application/json" \
-d '{
  "name": "Subhankar",
  "email": "user@test.com",
  "password": "test1234",
  "role": "user"
}'
```

Example Response

```
{
  "message": "Signup successful. Please verify the OTP sent to your email.",
  "email": "user@test.com"
}
```

---

# 2. Request OTP (Resend)

Sends a new OTP if the user hasn't verified email yet.

Endpoint

```
POST /auth/request-otp
```

Curl

```
curl -X POST http://localhost:8080/api/auth/request-otp \
-H "Content-Type: application/json" \
-d '{
  "email": "user@test.com"
}'
```

Response

```
{
  "message": "OTP sent to email."
}
```

---

# 3. Verify Email OTP

Verifies the OTP and activates the account.

Endpoint

```
POST /auth/verify-otp
```

Curl

```
curl -X POST http://localhost:8080/api/auth/verify-otp \
-H "Content-Type: application/json" \
-d '{
  "email": "user@test.com",
  "otp": "123456"
}'
```

Response

```
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "mongo_user_id",
    "name": "Subhankar",
    "email": "user@test.com",
    "role": "user",
    "isEmailVerified": true
  }
}
```

---

# 4. User / Rider Login

Logs in a verified user or rider.

Endpoint

```
POST /auth/login
```

Curl

```
curl -X POST http://localhost:8080/api/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "user@test.com",
  "password": "test1234"
}'
```

Response

```
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "mongo_user_id",
    "name": "Subhankar",
    "email": "user@test.com",
    "role": "user",
    "isEmailVerified": true
  }
}
```

---

# 5. Admin Login

Logs in the system administrator.

Endpoint

```
POST /auth/admin/login
```

Curl

```
curl -X POST http://localhost:8080/api/auth/admin/login \
-H "Content-Type: application/json" \
-d '{
  "email": "admin@orderfolio",
  "password": "admin123"
}'
```

Response

```
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "admin",
    "email": "admin@orderfolio",
    "role": "admin"
  }
}
```

---

# Authentication Header (For Protected APIs)

For future protected endpoints:

```
Authorization: Bearer <JWT_TOKEN>
```

Example

```
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

# Roles

```
user  → customer
rider → delivery partner
admin → system administrator
```

---

# Environment Variables Required

```
MONGO_URI=
JWT_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
```

---

# Server Start

```
npm run start
```

Server runs on

```
http://localhost:8080
```
