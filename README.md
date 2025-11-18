# AREA — Automation Platform

AREA is a modular automation platform inspired by IFTTT and Zapier.
It enables users to connect **Actions** (event triggers) from various services to **Reactions** (operations) in a unified, extensible ecosystem. The platform is composed of three main components:

- **Application Server (API)** — Hosts all business logic, manages users, services, and AREA executions.
- **Web Client** — Browser interface for configuring accounts, services, and AREA workflows.
- **Mobile Client (Android)** — Mobile UI for interacting with the platform, distributed as an APK.

This repository contains the full codebase and infrastructure required to run the project using **Docker Compose**.

---

## 📌 Features (Work in Progress)

- User registration, authentication, and OAuth2 account linking
- Service subscription and credential management
- Configurable Actions and Reactions
- AREA creation: link one Action to one or multiple Reactions
- Hook engine for detecting events and executing workflows
- REST API fully consumed by Web and Mobile clients
- Accessibility-friendly Web interface
- Android APK automatically built and served through the Web Client

---

## 🐳 Running the Project

The entire stack is orchestrated using Docker Compose.

```bash
docker-compose build
docker-compose up
```

This will start:
- API server on `http://localhost:8080`
- Web Client on `http://localhost:8081`
- Mobile Client (builds APK into shared volume)

---

## 📚 Documentation

The following documents will be added as the project evolves:

- **API Reference**
- **System Architecture**
- **Class and Sequence Diagrams**
- **HOWTOCONTRIBUTE.md** — Adding services, actions, and reactions
- **Security considerations**
- **Database design**

---

## 🧱 Project Status

This is an early-stage version of the README.
More technical details, diagrams, and contributor guidelines will be added as development progresses.

---

## 🤝 Contributing

Contributions are welcome! Please refer to the `HOWTOCONTRIBUTE.md` document for guidelines on adding new services, actions, and reactions.
