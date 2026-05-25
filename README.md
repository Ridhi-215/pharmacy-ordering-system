# Pharmacy Ordering System - Full Stack Application

Welcome to the **Pharmacy Ordering System**! This is a complete, production-ready, full-stack application built using a **Java Spring Boot** backend, **MySQL** database, and **React.js** frontend. It is designed to be fully runnable, high-performance, and feature-rich, suitable for hackathons and professional deployments.

---

## 🏗️ System Architecture & Folder Structure

The project is structured under a clean-architecture pattern with modular separating directories:

```text
pharmacy-ordering-system/
├── database/
│   ├── schema.sql             # Full MySQL ER Schema
│   └── seed.sql               # Pre-populated admin, categories, medicines, and points
├── backend/
│   ├── pom.xml                # Maven configuration with Spring Boot dependencies
│   └── src/main/java/com/pharmacy/ordering/
│       ├── config/            # Static files configuration & data initializer
│       ├── controller/        # REST APIs with validation and response codes
│       ├── dto/               # Unified Request/Response Transfer Objects
│       ├── entity/            # JPA Data Entities (OneToMany/ManyToOne relations)
│       ├── exception/         # Exception classes and @ControllerAdvice handlers
│       ├── repository/        # Spring Data JPA Repository layer
│       ├── security/          # Spring Security, Bcrypt, JWT Token Filters
│       └── service/           # Transactional Business Logic & core rules
└── frontend/
    ├── package.json           # React dependencies (Vite, Tailwind, React Router DOM, Axios)
    └── src/
        ├── components/        # Shared layouts (Navbar, Footer, MedicineCard)
        ├── context/           # Global AuthContext API
        ├── pages/             # Premium responsive UI Views (Admin & Customer dashboards)
        ├── routes/            # Protected role-based route guard
        └── services/          # Custom Axios API client
```

---

## 🛠️ Tech Stack & Requirements

### Backend:
- **Java 17**
- **Spring Boot 3.2.5**
- **Spring Security & JWT Authentication**
- **Spring Data JPA & Hibernate**
- **Lombok**
- **Maven**
- **Swagger OpenAPI v3**

### Frontend:
- **React 19**
- **React Router DOM v7**
- **Tailwind CSS v4**
- **Axios**
- **Lucide Icons**

### Database:
- **MySQL 8.x**

---

## 🚀 Setup & Execution Instructions

### Step 1: Database Setup
1. Ensure your local MySQL server is running.
2. Open your terminal or MySQL command line client and execute:
   ```sql
   CREATE DATABASE pharmacy_db;
   ```
3. Load the schema and seed files into the database:
   ```bash
   mysql -u root -p pharmacy_db < database/schema.sql
   mysql -u root -p pharmacy_db < database/seed.sql
   ```

> [!NOTE]
> The database configuration properties are located in `backend/src/main/resources/application.properties`. If your MySQL username or password is not `root`, update lines 6 & 7 in that file:
> ```properties
> spring.datasource.username=YOUR_MYSQL_USERNAME
> spring.datasource.password=YOUR_MYSQL_PASSWORD
> ```

---

### Step 2: Running the Spring Boot Backend
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Compile and package the application:
   ```bash
   mvn clean install
   ```
3. Run the Spring Boot development server:
   ```bash
   mvn spring-boot:run
   ```
4. The server will start on **`http://localhost:8080`**.
5. Access Swagger API Interactive Docs at **`http://localhost:8080/swagger-ui/index.html`** to test all available REST APIs directly from the browser!

---

### Step 3: Running the React Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install all node packages:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. The application will be active on **`http://localhost:5173`**. Open this address in your browser.

---

## 👤 Sample Seed Credentials

The database script automatically creates pre-configured users with different roles for convenient testing:

### 1. Admin Account (Management Panel)
- **Email**: `admin@pharmacy.com`
- **Password**: `admin123`
- **Role**: `ADMIN`
- **Permissions**: Full access to dashboard metrics, manage medicines (create, edit, delete), check customer orders, approve/reject uploaded doctor prescriptions.

### 2. Customer Account (Browsing & Cart)
- **Email**: `customer@pharmacy.com`
- **Password**: `customer123`
- **Role**: `CUSTOMER`
- **Loyalty Points**: Pre-credited with `50` points.
- **Permissions**: Browse and search medicines, add products to cart, upload new PDF or image prescriptions, place orders, view personal order history.

---

## 🔄 Core Business Logic Rules Implemented
1. **Prescription Restrictions**: Medicines flagged with `requires_prescription = true` (e.g., Antibiotics, Antidiabetics) cannot be checked out unless the logged-in customer has an **APPROVED** prescription document linked to their account. Attempting to place an order for a restricted drug without a valid prescription will throw a clean validation message.
2. **Inventory Management**: Placed orders automatically deduct stock quantities from the `medicines` inventory.
3. **Out-of-Stock Verification**: Orders are prevented if the medicine quantity requested exceeds current stock counts.
4. **Loyalty Rewards**: Customer orders automatically contribute to their loyalty profile.

---

## 📝 Sample API Requests Reference

Below are the raw HTTP JSON payloads that you can use to test backend endpoints via Postman or Swagger:

### 1. User Login (Auth)
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
```json
{
  "email": "customer@pharmacy.com",
  "password": "customer123"
}
```
- **Response**: Returns a JWT Bearer token and role profiles. Add the token as an `Authorization: Bearer <TOKEN>` header in subsequent secured requests.

### 2. Register New User (Auth)
- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword",
  "phone": "9876543210",
  "address": "789 Emerald Boulevard, HealthCity"
}
```

### 3. Add to Cart (Customer)
- **Endpoint**: `POST /api/cart/add`
- **Headers**: `Authorization: Bearer <TOKEN>`
- **Request Body**:
```json
{
  "medicineId": 1,
  "quantity": 3
}
```

### 4. Place Order (Customer)
- **Endpoint**: `POST /api/orders/place`
- **Headers**: `Authorization: Bearer <TOKEN>`
- **Request Body**:
```json
{
  "deliveryAddress": "456 Wellness Avenue, CareTown",
  "paymentMethod": "CREDIT_CARD"
}
```

### 5. Create Category (Admin Only)
- **Endpoint**: `POST /api/categories`
- **Headers**: `Authorization: Bearer <TOKEN>`
- **Request Body**:
```json
{
  "categoryName": "Dermatologicals",
  "description": "Creams and medical treatments for skin health conditions."
}
```

### 6. Create Medicine (Admin Only)
- **Endpoint**: `POST /api/medicines`
- **Headers**: `Authorization: Bearer <TOKEN>`
- **Request Body**:
```json
{
  "categoryId": 3,
  "name": "Vitamin D3",
  "description": "Supports bone density and calcium absorption.",
  "dosage": "5000 IU",
  "packaging": "Bottle of 120 softgels",
  "price": 14.99,
  "stockQuantity": 80,
  "requiresPrescription": false,
  "manufacturer": "Solgar"
}
```
