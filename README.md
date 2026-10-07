# 🏠 Nook

### A modern social platform built to connect people through meaningful interactions.

Nook is a web application focused on creating a modern and interactive environment where users can **discover people, build connections, explore profiles and communicate** through different interaction systems.

The project was built from the ground up with a focus on **user experience, modular architecture, authentication, real-time interactions and scalable frontend development**.

---

## ✨ Overview

Nook combines social discovery, profiles, connections and communication into a single platform.

The goal is to create an experience that feels simple and intuitive while providing the infrastructure necessary for more complex social features.

### What can users do?

* 👤 Create and customize their profile
* 🔎 Discover and search for other users
* ❤️ Create connections
* 💬 Interact through conversations
* 🕵️ Use blind-chat interactions
* ⚙️ Manage account and application settings
* 🔔 Receive connection and interaction updates
* 🛡️ Use age verification and account protection systems
* 🚨 Report problems or inappropriate behavior

---

# 🖥️ Interface

Nook was designed with a responsive and modern interface focused on keeping navigation simple and intuitive.

### 🏠 Main Experience

<p align="center">
  <img width="100%" src="https://github.com/user-attachments/assets/1ca18156-1dea-4233-aeac-9c21ba8cafc5" />
</p>

---

### 🔎 Discover & Explore

<p align="center">
  <img width="100%" src="https://github.com/user-attachments/assets/a5f3fd82-e56a-4ddd-9e3d-44500b013424" />
</p>

---

### 👤 User Profiles

<p align="center">
  <img
    width="100%"
    src="https://github.com/user-attachments/assets/e385effd-9512-4d2b-8b2d-4c56abbd5969"
    alt="Nook interface"
  />
</p>

---

### 📱 Mobile Experience

<p align="center">
  <img height="600" src="https://github.com/user-attachments/assets/666ac433-198f-45ca-ac98-e5e3cbb88846" />
  <img height="600" src="https://github.com/user-attachments/assets/07684ccb-0f67-45df-8f7e-b852fb0b4929" />
</p>

---

# 🚀 Core Features

### 👤 Profile System

Users can create and manage their personal profile, including information, preferences and answered questions.

### 🔍 Discovery

A dedicated exploration system allows users to search and discover other profiles.

### 🤝 Connections

Nook includes a connection system that handles interactions between users and keeps track of connection states.

### 💬 Blind Chat

A separate interaction system allows users to participate in blind-chat experiences.

The system includes invitation handling and route protection to ensure that users can only access the appropriate conversations.

### 🔐 Authentication & Protection

The application includes protected routes and validation systems designed to control access to different parts of the application.

### 🛡️ Age Verification

Nook implements age verification during onboarding to prevent underage users from accessing restricted parts of the platform.

### 🔔 Notifications & Unread States

The application tracks unread interactions and connection activity to keep the user experience responsive and informative.

### ⚙️ Account & Settings

Users can manage their account and application preferences through dedicated settings.

---

# 🧠 Technical Highlights

Nook is more than a UI project. Several of its systems required designing application logic and reusable frontend infrastructure.

Some of the systems implemented include:

* 🔐 Protected routes
* 🧩 Reusable React components
* 🪝 Custom React hooks
* 🗃️ Global onboarding state
* 🤝 Connection state management
* 🔎 Exploration/search logic
* 💬 Blind-chat invitation flow
* 🔔 Unread-count management
* 🛡️ Age validation
* 👤 Profile management
* 🚨 Bug-report functionality

The project is structured around reusable components and hooks to avoid duplicating application logic across different parts of the interface.

---

# 🛠️ Tech Stack

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge\&logo=react\&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge\&logo=javascript\&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge\&logo=html5\&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge\&logo=css3\&logoColor=white)

### Backend / Infrastructure

![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge\&logo=supabase\&logoColor=3ECF8E)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge\&logo=vercel\&logoColor=white)

---

# 🏗️ Project Architecture

The application uses a component-based architecture where UI elements and business logic are separated into reusable modules.

```text
Nook
│
├── Components
│   ├── UI
│   ├── Profile
│   ├── Connections
│   ├── Explore
│   └── Chat
│
├── Hooks
│   ├── Connections
│   ├── Explore
│   ├── Notifications
│   └── User State
│
├── Onboarding
│   ├── Registration
│   ├── Basic Information
│   ├── Age Verification
│   └── Preferences
│
├── Authentication
│   ├── Route Guards
│   └── Session Management
│
└── Features
    ├── Profiles
    ├── Connections
    ├── Blind Chat
    ├── Search
    └── Settings
```

---

# 📈 Development

Nook has been developed incrementally, adding complete systems instead of only building isolated interface components.

Some of the major development milestones include:

* ✅ User registration and onboarding
* ✅ Profile management
* ✅ Search and exploration
* ✅ Connection system
* ✅ Blind-chat system
* ✅ Protected routes
* ✅ Age verification
* ✅ Notification/unread systems
* ✅ Settings
* 🚧 Further optimization and feature development

---

# 🗺️ Roadmap

### Completed

* [x] Authentication
* [x] Registration
* [x] Onboarding
* [x] Profile system
* [x] Search / Explore
* [x] Connections
* [x] Blind Chat
* [x] Settings
* [x] Age verification
* [x] Protected routes

### In Progress

* [ ] UI/UX improvements
* [ ] Performance optimization
* [ ] Additional communication features
* [ ] More advanced discovery systems

### Future

* [ ] Advanced recommendation system
* [ ] More social interaction features
* [ ] Expanded notification system
* [ ] Mobile-focused improvements
* [ ] Additional safety features

---

# 🎯 What I Learned

Building Nook has allowed me to work with more than just frontend interfaces.

The project has involved designing and implementing:

* Component-based frontend architecture
* State management
* Authentication flows
* Protected navigation
* User interaction systems
* Reusable hooks
* Database-backed features
* Validation and business rules
* Responsive UI
* Application structure and scalability

It has also helped me understand how individual features need to work together as part of a larger product.

---

# 🤝 Collaboration

Nook is part of my broader development work under **Axion Studios**.

I'm interested in collaborating with developers, designers and other creators who want to build real software projects.

If you're interested in contributing, improving the architecture, designing new features or simply discussing the project, feel free to reach out.

> **Ideas → Code → Product**

---

## 👨‍💻 Author

**Andres Diaz — @AndresStw**

Software Developer & Game Developer
Founder of **Axion Studios**

## V1.6.0 beta

Building games, applications and experimental systems.

---

⭐ If you find the project interesting, consider giving the
