# NovaStack — Digital Solutions & Technology

### Build Better. Scale Smarter.

NovaStack is a modern, full-stack digital solutions website designed to showcase technology services, manage customer enquiries, and provide a secure administration system. It combines a responsive frontend with a backend API and MongoDB database to deliver a professional digital experience.

## 📌 Table of Contents

* [Overview](#-overview)
* [Key Features](#-key-features)
* [Services](#-services)
* [Technology Stack](#-technology-stack)
* [System Architecture](#-system-architecture)
* [User Roles](#-user-roles)
* [Security](#-security)
* [Project Structure](#-project-structure)
* [Getting Started](#-getting-started)
* [Environment Configuration](#-environment-configuration)
* [Future Enhancements](#-future-enhancements)

## 🚀 Overview

NovaStack represents a digital technology company offering web development, application development, UI/UX design, digital marketing, cloud solutions, AI automation, and other technology services.

The platform enables visitors to explore services, create accounts, submit enquiries, and track their enquiry history. Administrators can manage enquiries, services, users, contact messages, and account settings through a protected dashboard.

The project focuses on responsive design, structured backend development, database integration, authentication, and role-based access control.

## ✨ Key Features

* **Modern UI:** Professional, responsive interface with a navy, off-white, and blue-violet visual theme.
* **Multiple Pages:** Dedicated Home, About, Services, and Contact pages.
* **12 Service Pages:** Individual pages describing different digital services.
* **User Authentication:** Registration and login functionality.
* **My Enquiries:** View enquiries associated with the signed-in user.
* **Contact Form:** Submit messages and service-related enquiries.
* **Admin Dashboard:** Manage enquiries, services, users, contact messages, and account settings.
* **Database Integration:** Store and retrieve application data using MongoDB.
* **Protected Admin Routes:** Restrict administrative operations to authorized administrators.
* **FAQ Copilot:** A local service and FAQ lookup widget that helps visitors find relevant information.
* **Animations:** Smooth UI transitions and interactive elements.
* **Dark/Light Theme:** Designed around a modern visual experience.

## 🧩 Services

NovaStack provides 12 service categories:

1. Web Development
2. Mobile App Development
3. UI/UX Design
4. Full-Stack Development
5. Backend & API Development
6. Digital Marketing
7. SEO Optimization
8. Cloud & Deployment Solutions
9. AI & Automation Solutions
10. Data Analytics & Visualization
11. Website Maintenance & Optimization
12. E-commerce Solutions

Each service has a dedicated route and can be managed through the backend service-management functionality.

## 🛠️ Technology Stack

### Frontend

* React.js
* Vite
* React Router
* Custom CSS
* Framer Motion
* Lucide React

### Backend

* Node.js
* Express.js
* REST API architecture
* Zod for request validation
* JWT-based authentication using HttpOnly cookies

### Database

* MongoDB
* Mongoose

### Security

* Helmet security headers
* CORS allowlist
* Rate limiting
* Server-side request validation
* Role-based authorization
* Protected administrative APIs

## 🏗️ System Architecture

The application follows a client-server architecture.

```text
             User / Administrator
                       |
                       v
             React Frontend (Vite)
                       |
                       v
             Express REST API
                       |
              Authentication
              Validation
              Authorization
                       |
                       v
               Mongoose ODM
                       |
                       v
                 MongoDB
```

The frontend communicates with the backend API, which validates requests, applies authentication and authorization rules, and interacts with MongoDB.

## 👥 User Roles

### 1. Guest

* Browse public pages and services.
* Explore service details.
* Submit enquiries and contact messages.

### 2. Registered User

* Register and log in.
* Submit service enquiries.
* View personal enquiry history.

### 3. Administrator

* Access the protected admin dashboard.
* Manage enquiries and their statuses.
* Create and manage service listings.
* Manage users and contact messages.
* Access administrative account settings.

Administrative privileges must be assigned through the authorized backend setup process, not through ordinary public registration.

## 🔐 Security

Security measures implemented in the application include:

* HttpOnly cookies for authentication tokens.
* Helmet for HTTP security headers.
* CORS restrictions for approved frontend origins.
* Rate limiting for API protection.
* Zod-based server-side validation.
* Role-based access control for administrative endpoints.
* Protected API routes for sensitive operations.

> Production deployments should also use HTTPS, secure environment variables, appropriate cookie settings, and regular security testing.

## 📁 Project Structure

The project uses separate frontend and backend applications.

```text
NovaStack/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   ├── public/
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── src/
│   ├── package.json
│   └── .env
│
└── README.md
```

*Note: Update this tree if your actual repository uses different folder names or file locations.*

## ⚙️ Getting Started

### Prerequisites

Install the following before running the project:

* Node.js and npm
* MongoDB or a MongoDB connection URI
* Git

### 1. Clone the Repository

```bash
git clone YOUR_NOVASTACK_REPOSITORY_URL
cd NovaStack
```

Replace the repository URL with your actual GitHub URL.

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

Open another terminal:

```bash
cd server
npm install
```

### 4. Configure Environment Variables

Create the backend `.env` file and configure the required variables.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_uri
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
```

Use the variable names expected by your actual backend configuration. Never commit real passwords, database credentials, or authentication secrets.

### 5. Initialize Services and Administrator

If the backend scripts are configured as described in the project setup:

```bash
npm run seed:services
npm run bootstrap:admin
```

Configure the required administrator environment variables before running the bootstrap command. Run these commands from the backend directory.

### 6. Start the Backend

```bash
npm run dev
```

### 7. Start the Frontend

From the frontend directory:

```bash
npm run dev
```

Open the local frontend URL shown by Vite, typically:

`http://localhost:5173`

The backend is configured to run on port `5000` in the example configuration above.

## 🔮 Future Enhancements

Potential improvements include:

* Email notifications for enquiry updates.
* Email verification and password recovery.
* Enhanced analytics and reporting in the admin dashboard.
* Improved automated testing and continuous integration.
* Production deployment with monitoring and logging.
* Integration with a real generative AI service for conversational assistance.

## 🎓 Project Purpose

NovaStack demonstrates the practical application of frontend development, REST API design, database integration, authentication, authorization, and administrative workflows in a full-stack web application.

It was developed as an academic software project to apply software engineering concepts to a realistic digital-services platform.

## 👩‍💻 Author

**Simran Jaiswal**

B.Tech — Computer Science and Engineering (Data Science)

* GitHub: [simranjaiswal801](https://github.com/simranjaiswal801)
* LinkedIn: [Simran Jaiswal](https://www.linkedin.com/in/simran-jaiswal-948791341/)

---

*NovaStack — Build Better. Scale Smarter.*
