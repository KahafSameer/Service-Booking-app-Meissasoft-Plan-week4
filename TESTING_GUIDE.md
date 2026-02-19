# Service Booking App – Testing Guide

Yeh guide aapko **pool timeout** se bachne, **testing mode** chalane, aur **Postman/curl** se poore backend/frontend test karne ke liye hai.

---

## 1. Pool timeout error – kya karein

Jab error aaye:  
`pool timeout: failed to retrieve a connection from pool after 10003ms`

### Code me jo change kiya gaya

- **`lib/prisma.js`** me `localhost` ki jagah **`127.0.0.1`** use ho raha hai (Windows par kabhi localhost socket use karta hai, isliye 127.0.0.1 try kiya).
- **`connectTimeout: 8000`** set hai taake zyada der wait na ho.
- **Logger** add hai – console me `[DB Error]` dikhega, jisse asli DB error samajh aata hai.

### Aapko ye check karna hai

| Step | Check |
|------|--------|
| 1 | MySQL/MariaDB **service running** ho (Windows: Services me "MySQL" ya "MariaDB" start karein). |
| 2 | **Database banao:** MySQL me login karke `CREATE DATABASE booking;` chalao. |
| 3 | **.env** me sahi values: `DATABASE_HOST=localhost` (ya `127.0.0.1`), `DATABASE_USER=root`, `DATABASE_PASSWORD=apna_password`, `DATABASE_NAME=booking`. |
| 4 | **DATABASE_URL** bhi sahi ho: `mysql://root:YOUR_PASSWORD@localhost:3306/booking` |

Agar phir bhi pool timeout aaye to console me **`[DB Error]`** wali line dekhein – wahi asli reason hoga.

---

## 2. Testing mode (bina database ke test)

Jab MySQL connect nahi ho raha ho, tab bhi aap **API structure** aur **frontend** test kar sakte ho.

### Mock server chalana

```bash
cd backend
npm run test:server
```

- Ye **database use nahi karta** – sirf in-memory fake data.
- Port same rahega (default **5000**).
- **Zaroori:** `npm run test:server` chalane se pehle koi aur process port 5000 pe band karein (e.g. jo `npm run dev` se chal raha ho). Ek time pe sirf ya to real server ya mock server chalao.
- Frontend ko `http://localhost:5000/api` pe point karke saari flows test kar sakte ho (login, signup, services, bookings).

**Important:** Real server chalane ke liye `npm run dev` use karein. DB connect nahi ho raha to testing ke liye `npm run test:server` use karein.

---

## 3. Backend API – Postman / curl se test

Base URL: **`http://localhost:5000/api`**

### 3.1 Auth (token nahi chahiye)

**Signup**

```http
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "123456",
  "role": "customer"
}
```

- **Expected:** `200` – body me `token` aur `user` (id, name, email, role).

**Login**

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456"
}
```

- **Expected:** `200` – body me `token` aur `user`.  
- Baaki saare APIs ke liye **Header** me ye token bhejna:  
  `Authorization: Bearer <token>`

---

### 3.2 Services (sab pe `Authorization: Bearer <token>` chahiye)

**List services**

```http
GET http://localhost:5000/api/services
Authorization: Bearer <YOUR_TOKEN>
```

- **Expected:** `200` – array of services.

**Single service**

```http
GET http://localhost:5000/api/services/1
Authorization: Bearer <YOUR_TOKEN>
```

- **Expected:** `200` – ek service object, ya `404` agar id galat ho.

**Create service (sirf admin)**

```http
POST http://localhost:5000/api/services
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "category": "DevOps",
  "title": "CI/CD Setup",
  "providerName": "Meissa",
  "contactEmail": "dev@test.com",
  "contactPhone": "1234567890"
}
```

- **Expected:** `200` – created service. Non-admin pe `403`.

**Update service (sirf admin)**

```http
PUT http://localhost:5000/api/services/1
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "title": "Updated Title",
  "maxBookings": 10
}
```

- **Expected:** `200` – updated service.

**Delete service (sirf admin)**

```http
DELETE http://localhost:5000/api/services/1
Authorization: Bearer <ADMIN_TOKEN>
```

- **Expected:** `200` – `{ "message": "Service deleted" }`.

---

### 3.3 Bookings (sab pe `Authorization: Bearer <token>` chahiye)

**All bookings (sirf admin)**

```http
GET http://localhost:5000/api/booking
Authorization: Bearer <ADMIN_TOKEN>
```

- **Expected:** `200` – array of bookings (user + service ke sath).

**My bookings**

```http
GET http://localhost:5000/api/booking/my
Authorization: Bearer <YOUR_TOKEN>
```

- **Expected:** `200` – current user ki bookings.

**Create booking**

```http
POST http://localhost:5000/api/booking/1
Authorization: Bearer <YOUR_TOKEN>
```

- **Expected:** `201` – `{ "message": "Booking created successfully", "booking": {...} }`.  
- Agar service full ho to `400` – "Service is fully booked".

**Cancel booking**

```http
DELETE http://localhost:5000/api/booking/1
Authorization: Bearer <YOUR_TOKEN>
```

- **Expected:** `200` – `{ "message": "Booking cancelled" }`.  
- User sirf apni booking cancel kar sakta hai; admin koi bhi cancel kar sakta hai.

---

## 4. cURL examples (copy-paste)

**Signup**

```bash
curl -X POST http://localhost:5000/api/auth/signup -H "Content-Type: application/json" -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"123456\",\"role\":\"customer\"}"
```

**Login (token save karke use karein)**

```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"123456\"}"
```

**Services list (TOKEN replace karein)**

```bash
curl -X GET http://localhost:5000/api/services -H "Authorization: Bearer TOKEN"
```

**Create booking (TOKEN aur service id replace karein)**

```bash
curl -X POST http://localhost:5000/api/booking/1 -H "Authorization: Bearer TOKEN"
```

---

## 5. Frontend testing

1. **Backend pehle:**  
   - Ya to `npm run dev` (real DB) ya `npm run test:server` (mock) se backend 5000 pe chalao.

2. **Frontend:**  
   ```bash
   cd frontend
   npm run dev
   ```
   - Browser me app open karein (e.g. http://localhost:5173).

3. **Flow check karein:**  
   - Signup → Login → Dashboard (services list) → Book → My Bookings (list + cancel).  
   - Admin: Login as admin → Add/Edit/Delete service → All Bookings.

4. **API URL:**  
   Frontend `.env` me `VITE_API_URL=http://localhost:5000/api` ho (ya axios me baseURL same ho).

---

## 6. Summary – kaun sa command kab

| Purpose | Command |
|--------|---------|
| Real server (MySQL chahiye) | `cd backend` → `npm run dev` |
| Test without DB (mock) | `cd backend` → `npm run test:server` |
| Frontend | `cd frontend` → `npm run dev` |
| Migrations (DB ready hone par) | `cd backend` → `npm run migrate` |

Pool timeout aane par pehle **testing mode** se pura flow verify karein, phir MySQL fix karke real server se test karein.  
Koi bhi naya error aaye to console me **`[DB Error]`** zaroor dekhein.
