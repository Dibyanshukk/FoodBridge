# 🌾 FoodBridge

FoodBridge is a web-based platform designed to reduce food wastage and support the United Nations Sustainable Development Goal 2 (Zero Hunger). The platform connects food donors, NGOs, and volunteers to ensure surplus food reaches people in need.

## 🚀 Features

### 👤 User Authentication

* User Signup
* User Login
* Role-based access control
* Supported roles:

  * Donor
  * NGO
  * Volunteer

### 🍱 Food Donation Management

* Donors can submit food donations
* Food details include:

  * Food type
  * Quantity
  * Expiry time
  * Pickup location
* Real-time donation tracking

### 🙏 Food Request Management

* NGOs can request food supplies
* Request details include:

  * Food needed
  * Quantity required
  * Location

### 🚴 Distribution Management

* Volunteers can be assigned to donations
* Delivery status tracking
* Mark deliveries as completed

### 📊 Dashboard

* Total donations
* Total requests
* Total deliveries
* Total volunteers
* Top donor leaderboard

## 🛠️ Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MySQL

### Other Tools

* Git
* GitHub

## 📂 Project Structure

```text
FoodBridge/
│
├── index.html
├── login.html
├── signup.html
├── server.js
├── schema.sql
├── package.json
├── package-lock.json
└── .gitignore
```

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/Dibyanshukk/FoodBridge.git
cd FoodBridge
```

### Install Dependencies

```bash
npm install
```

### Configure Database

1. Create a MySQL database named:

```sql
foodbridge
```

2. Import the schema:

```sql
source schema.sql
```

### Start Server

```bash
node server.js
```

or

```bash
nodemon server.js
```

Server will run at:

```text
http://localhost:3000
```

## 🔑 User Roles

### Donor

* Create food donations
* View donation history

### NGO

* Request food
* Track requests

### Volunteer

* View assigned deliveries
* Mark deliveries as completed

## 🎯 Project Objective

FoodBridge aims to bridge the gap between food surplus and food scarcity by creating a simple, scalable, and efficient platform where donors, NGOs, and volunteers can collaborate to reduce hunger and food waste.

## 🌍 SDG Goal Supported

**United Nations Sustainable Development Goal 2: Zero Hunger**

FoodBridge contributes to ending hunger by facilitating the redistribution of surplus food to individuals and communities in need.

## 👨‍💻 Developer

**Dibyanshu Kumar**

B.Tech Computer Science and Engineering Student
Lovely Professional University (LPU)

## 📜 License

This project is developed for educational and learning purposes.
