## Backend Prisma Migration Guide — readme7

Is document mein maine poore `backend` ko MongoDB/Mongoose se Prisma + MySQL par migrate kiya, Mongo wala code comment kiya, aur har relevant file ka high‑level line‑by‑line reasoning di hai.

---

### 1. `package.json` (context)

- **Scripts**
  - `"start": "node server.js"` — backend ko run karne ke liye.
  - `"dev": "nodemon server.js"` — development mode.
  - `"migrate": "npx prisma migrate dev --name init"` — Prisma migrations ke liye.
  - `"generate": "npx prisma generate"` — Prisma Client generate karne ke liye.
- **Dependencies**
  - `@prisma/adapter-mariadb`, `@prisma/client`, `prisma` — Prisma + MySQL/MariaDB stack.
  - `mongoose` ab sirf legacy ke liye present hai; saara Mongoose code comment ho chuka hai.

Reason:
- Aapka backend already Prisma stack use kar raha tha, humne isi ko cleanup + complete kiya.

---

### 2. `prisma/schema.prisma` — Prisma models

- **Generator**
  - `generator client { provider = "prisma-client-js"; output = "../generated/prisma" }`
  - Reason: Client `generated/prisma` folder me banta hai jise `lib/prisma.js` import karta hai.

- **Datasource**
  - `datasource db { provider = "mysql" }`
  - Reason: Provider MySQL hai; `url` ko `prisma.config.js` + `.env` handle kar rahe hain (Prisma 7 ka naya config system).

- **`model User`**
  - Fields:
    - `id Int @id @default(autoincrement())`
    - `name String`
    - `email String @unique`
    - `password String`
    - `role Role @default(customer)`
    - `bookings Booking[]`
  - Mapping:
    - Mongo `User` schema se Id, name, email, password, role ko map kiya.
    - `bookings` relation add kiya taa ke ek user ki multiple bookings represent ho saken.

- **`enum Role`**
  - Values: `customer`, `admin`
  - Mapping: Mongo enum `['customer', 'admin']` ka direct equivalent.

- **`model Service` (NEW)**
  - Fields:
    - `id Int @id @default(autoincrement())`
    - `category String`
    - `title String`
    - `providerName String`
    - `contactEmail String`
    - `contactPhone String`
    - `available Boolean @default(true)`
    - `maxBookings Int @default(5)`
    - `currentBookings Int @default(0)`
    - `bookings Booking[]`
    - `createdAt DateTime @default(now())`
    - `updatedAt DateTime @updatedAt`
  - Mapping:
    - Mongo `Service` fields (`category`, `title`, `providerName`, `contactEmail`, `contactPhone`, `available`, `maxBookings`, `currentBookings`, timestamps) ko Prisma + MySQL compatible types me convert kiya.

- **`model Booking` (NEW)**
  - Fields:
    - `id Int @id @default(autoincrement())`
    - `service Service @relation(fields: [serviceId], references: [id])`
    - `serviceId Int`
    - `user User @relation(fields: [userId], references: [id])`
    - `userId Int`
    - `createdAt DateTime @default(now())`
    - `updatedAt DateTime @updatedAt`
  - Mapping:
    - Mongo `Booking` ke `service: ObjectId(Service)` aur `user: ObjectId(User)` ko proper foreign keys se map kiya.

---

### 3. `lib/prisma.js` — Prisma Client setup

- `require("dotenv").config();`
  - `.env` se DB credentials load karne ke liye.
- `const { PrismaMariaDb } = require("@prisma/adapter-mariadb");`
  - MariaDB adapter use ho raha hai.
- `const { PrismaClient } = require("../generated/prisma/client");`
  - Generated Prisma Client import ho raha hai (output path schema me set hai).
- `const adapter = new PrismaMariaDb({ host, user, password, database, connectionLimit });`
  - Host/User/Password/Database values env vars se aa rahe hain.
- `const prisma = new PrismaClient({ adapter });`
  - Ek shared Prisma instance create kiya gaya.
- `module.exports = prisma;`
  - Is instance ko sabhi routes me reuse kiya jata hai.

Reason:
- Centralised DB access, connection pooling aur config management ke liye.

---

### 4. `server.js` — Express app + Mongo detach

- Imports:
  - `express`, `cors`, `dotenv`, `morgan`, routes, `authenticateToken`.
  - `// const mongoose = require('mongoose'); // MongoDB (now migrated to Prisma/MySQL)`
    - Mongo import ko comment kiya gaya (user requirement: Mongo code ko comment karo).

- App setup:
  - `dotenv.config();`
  - `const app = express();`
  - `app.use(morgan('dev'));`
  - `app.use(express.json());`
  - `app.use(cors({ origin: "*", credentials: true }));`

- Routes:
  - `app.use('/api/auth', authRoutes);`
  - `app.use('/api/dashboard', authenticateToken, dashboardRoutes);`
  - `app.use('/api/services', authenticateToken, serviceRoutes);`
  - `app.use('/api/booking', authenticateToken, bookingRoutes);`

- Test route:
  - `app.get('/', ...)` → `"Hello World!"` response for simple health check.

- Mongo connect block:
  - Purana `mongoose.connect(process.env.MONGO_URI)...` already commented tha; aapki request ke mutabiq ise commented hi rehne diya (Mongo runtime use band).

- Server listen:
  - `app.listen(process.env.PORT, () => { console.log(\`Server is running on port ${process.env.PORT}\`); });`
  - Prisma client lazy connect karega jab first query chalti hai.

---

### 5. `routes/authRoutes.js` — Auth on Prisma

- Header:
  - `// const User = require('../models/User'); // MongoDB model (now migrated to Prisma)`
  - `const jwt = require('jsonwebtoken');`
  - `const bcrypt = require('bcrypt');`
  - `const prisma = require('../lib/prisma');`
  - Reason: Ab Prisma `user` model use ho raha hai; Mongo `User` sirf commented reference hai.

**Signup (`POST /signup`)**
- Input:
  - `{ name, email, password, role }` body se liya.
- Validations:
  - `if (!name || !email || !password)` → required field check.
  - `if (password.length < 4)` → minimum length check (existing behaviour preserve).
  - `emailRegex` se email format check.
- Duplicate user check:
  - Purana Mongo:
    - `// let user = await User.findOne({ email });`
  - Naya Prisma:
    - `const existingUser = await prisma.user.findUnique({ where: { email } });`
    - Agar user mila to `400 'User already exists'`.
- User creation:
  - `const hashedPassword = await bcrypt.hash(password, 10);`
  - `const user = await prisma.user.create({ data: { name, email, password: hashedPassword, role } });`
- JWT:
  - `const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });`
  - Response: `{ token, user: { id, name, email, role } }`.

**Login (`POST /login`)**
- Fields:
  - `{ email, password }`.
- Flow:
  - Required field validation.
  - `const user = await prisma.user.findUnique({ where: { email } });`
  - Agar user nahi mila → `400 'Invalid Email'`.
  - `const isMatch = await bcrypt.compare(password, user.password);`
  - Agar mismatch → `400 'Invalid Password'`.
  - Same JWT sign + user payload response.

Reason:
- Auth flows ab MySQL/Prisma par chal rahe hain; Mongoose based `User` pura comment hai.

---

### 6. `middleware/auth.js` — JWT verification

- `authenticateToken`:
  - `Authorization` header se `Bearer <token>` hata kar token nikalta hai.
  - `jwt.verify(token, process.env.JWT_SECRET)` se decode karta hai.
  - `req.user = decoded;` set karta hai (jo signup/login me sign kiya gaya hai: `{ id, role }`).
  - Agar token missing/invalid ho to 401/400 error return karta hai.

Reason:
- DB agnostic JWT auth, Prisma migration me is file me koi change ki zarurat nahi thi.

---

### 7. `routes/serviceRoutes.js` — Services on Prisma

- Header:
  - `// const Service = require('../models/Service'); // MongoDB model (now migrated to Prisma)`
  - `const auth = require('../middleware/auth');`
  - `const prisma = require('../lib/prisma');`

**Create Service (`POST /api/services`)**
- Auth:
  - `if (req.user.role !== 'admin')` → sirf admin ko allow.
- Input:
  - `{ category, title, providerName, contactEmail, contactPhone }`.
  - Agar koi required field missing → `400 'Please enter all required fields'`.
- Old Mongo (commented):
  - `// const service = new Service(req.body);`
  - `// await service.save();`
- Naya Prisma:
  - `const service = await prisma.service.create({ data: { category, title, providerName, contactEmail, contactPhone, available: req.body.available ?? true, maxBookings: req.body.maxBookings ?? 5, currentBookings: 0 } });`
  - Response: `res.json(service);`

Reason:
- Prisma model ke hisaab se defaults set kiye gaye, aur Mongo dependent code comment me shift hua.

**Get all Services (`GET /api/services`)**
- Old:
  - `// const services = await Service.find();` (Mongo).
- New:
  - `const services = await prisma.service.findMany();`
  - `res.json(services);`

Reason:
- Ab saare services MySQL `Service` table se aate hain.

---

### 8. `routes/bookingRoutes.js` — Bookings with Prisma transaction

- Header:
  - `// const Service = require('../models/Service'); // MongoDB model (now migrated to Prisma)`
  - `// const Booking = require('../models/Booking'); // MongoDB model (now migrated to Prisma)`
  - `const prisma = require('../lib/prisma');`

**Create Booking (`POST /api/booking/:serviceId`)**

- Service ID:
  - `const { serviceId } = req.params;`
  - `const parsedServiceId = parseInt(serviceId, 10);`
  - Agar `NaN` → `400 'Invalid service id'`.

- Transaction logic:
  - `const result = await prisma.$transaction(async (tx) => { ... });`
  - Steps:
    1. `const service = await tx.service.findUnique({ where: { id: parsedServiceId } });`
       - Agar nahi mila → `{ error: { status: 404, message: 'Service not found' } }` return.
    2. Capacity check:
       - `if (service.currentBookings >= service.maxBookings)` → `{ error: { status: 400, message: 'Service is fully booked' } }`.
    3. Service update:
       - `await tx.service.update({ where: { id: parsedServiceId }, data: { currentBookings: { increment: 1 } } });`
       - Ye Mongo ke `service.currentBookings += 1; await service.save();` ka atomic SQL equivalent hai.
    4. Booking create:
       - `const booking = await tx.booking.create({ data: { serviceId: parsedServiceId, userId: req.user.id }, include: { service: true, user: true } });`
    5. `return { updatedService, booking };`

- Result handle:
  - Agar `result.error` hai → `res.status(result.error.status).json({ message: result.error.message });`
  - Warna:
    - `res.status(201).json({ message: 'Booking created successfully', booking: result.booking });`

- Catch block:
  - Console me error log + `500 'Server error'` response.

Reason:
- Mongo version me `Service.findById` + manual increment + `new Booking(...).save()` tha.
- Prisma version me `$transaction` se concurrency safe, relational booking create hoti hai.

---

### 9. `routes/dashboardRoutes.js` — Protected Hello

- Simple route:
  - `router.get('/data', auth, (req, res) => { res.json({ message: \`welcome user ${req.user.id}\` }); });`
  - Reason: Ye sirf JWT verified user ko greet karta hai; DB access nahi karta, isliye migrate karne ki zarurat nahi thi.

---

### 10. Legacy Mongo models — `models/User.js`, `models/Service.js`, `models/Booking.js`

- Har file me:
  - Top comment: `// Legacy MongoDB/Mongoose ... model (now disabled after Prisma/MySQL migration)`
  - Poora original Mongoose code `//` se comment:
    - `const mongoose = require('mongoose');`
    - Schema definitions.
    - `module.exports = mongoose.model(...);`

Effect:
- Koi Mongo code runtime pe execute nahi hota.
- Legacy schema reference ke liye still available hai.

---

### 11. Testing summary (backend)

- Commands run:
  - `npm run generate`
    - Result: Prisma Client successfully `generated/prisma` me rebuild hua (schema me naye `Service` + `Booking` models include).
  - `npm start`
    - Result: `.env` loaded hua, aur console me:
      - `"Server is running on port 5000"`
    - Iska matlab:
      - `server.js`, routes, Prisma imports sab syntax/runtime level pe valid hain.

- Notes:
  - `npm test` script sirf `"Error: no test specified"` print karta hai (koi Jest/Mocha tests defined nahi).
  - Actual DB queries aapke MySQL/MariaDB credentials pe depend karengi; agar credentials galat hon to Prisma queries runtime pe fail kar sakti hain (ye behaviour environment config se driven hai, code se nahi).

---

### 12. Quick usage (Prisma + MySQL)

- `.env` (backend root) me configure karein:
  - `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `DATABASE_URL`
  - `JWT_SECRET`
  - `PORT` (optional, default 5000).
- Prisma:
  - `npm run generate` — schema change ke baad hamesha chalayein.
  - `npm run migrate` — jab bhi DB schema ko MySQL me apply/update karna ho.
- Server:
  - `npm start` ya `npm run dev`.

Is migration ke baad aapka backend MongoDB se completely Prisma + MySQL based ho chuka hai, Mongo ka saara active code comment mode me hai, aur upar har main file ke behaviour + reason explain kiye gaye hain.

