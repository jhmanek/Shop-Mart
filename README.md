# 🛍️ Shop Mart

**Shop Mart** is a full-stack e-commerce platform built with **Next.js**, **MongoDB**, and **Razorpay**. It includes a secure admin panel, user authentication, product listing, cart management, and online payment functionality.

---

## 🚀 Features

- 🔐 JWT-based user & admin authentication
- 🛒 Cart management with MongoDB persistence
- 📦 Product listing, filtering, and infinite scroll
- 🧾 Razorpay payment integration
- 📤 Email-based OTP verification (Nodemailer)
- 🧑‍💻 Admin dashboard to manage orders & products
- 🌗 Light/Dark mode toggle

---

## 📁 Folder Structure

```
/app              → Next.js pages & routing
/components       → UI components (Navbar, Cards, etc.)
/lib              → Utility functions (auth, payment, etc.)
/models           → Mongoose models (User, Product, Order)
/public           → Static assets
/styles           → Tailwind CSS configs
```

---

## 🔐 Environment Variables

Create a `.env` file at the root using the provided `.env.example`.

```bash
cp .env.example .env
```

Fill in your credentials inside `.env`. Example structure:

```env
MONGODB_URI=your_mongodb_uri_here

JWT_USER_SECRET=your_jwt_user_secret_here
JWT_ADMIN_SECRET=your_jwt_admin_secret_here

EMAIL_USER=your_email_user_here
EMAIL_PASS=your_email_pass_here

ADMIN_EMAIL=your_admin_email_here
ADMIN_PASSWORD=your_admin_password_here

NEXT_PUBLIC_RAZORPAY_KEY_ID=your_next_public_razorpay_key_id_here
RAZORPAY_SECRET_KEY=your_razorpay_secret_key_here
```

---

## 🛠️ Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/jayeshhmanek/Shop-Mart.git
   cd Shop-Mart
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **State Management**: Redux
- **Backend**: MongoDB (Mongoose), Node.js API routes
- **Payments**: Razorpay
- **Email**: Nodemailer with Gmail SMTP

---

## 📦 Dummy Products Import

To quickly populate your database with sample products, we've included `test.products.json` in the project root. This file contains a set of dummy products that mirror the schema used by Shop Mart.

1. **Ensure MongoDB is running**

   ```bash
   mongod --config /usr/local/etc/mongod.conf
   ```

2. **Import the dummy data**

   ```bash
   mongoimport \
     --uri "$MONGODB_URI" \
     --collection products \
     --file test.products.json \
     --jsonArray \
     --drop
   ```

   - `--jsonArray` treats the file as an array of documents.
   - `--drop` clears the existing `products` collection before import.

3. **Verify in MongoDB shell**

   ```bash
   mongo "$MONGODB_URI" --eval "db.products.find().pretty()"
   ```

After import, your Shop Mart app will display these dummy products on the home page and in the admin panel.

---

## 👨‍💻 Author

**Jayesh H Manek**

---

## 📄 License

This project is licensed under the MIT License.
