# REST API Specification (Draft)

This document defines the endpoints. It distinguishes between **Static Data** (defined in the server code) and **User Data** (stored in the database).

## 1. Authentication (Database: `USERS`)
Standard routes for user management.

| Method | Endpoint | Description | Request Body Example |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Create a new user account. | `{ "username": "John", "email": "john@doe.com", "password": "secure123" }` |
| `POST` | `/auth/login` | Log in and receive a JWT Token. | `{ "email": "john@doe.com", "password": "secure123" }` |

---

## 2. Catalog of Services (Source: **SERVER CODE**)
These routes do **NOT** query the database. They return the list of hardcoded services supported by the backend (e.g., Google, GitHub, Discord).

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/services` | List all available services (names, logos, description). |
| `GET` | `/about.json` | **[Subject Requirement]** Returns the specific JSON format listing services, actions, and reactions. |

**Example Response for `GET /services`:**
```json
[
  {
    "name": "google",
    "description": "Google Integration",
    "supported_actions": ["GMAIL_RECEIVED"],
    "supported_reactions": ["GMAIL_SEND"]
  },
  {
    "name": "timer",
    "description": "Time based scheduler",
    "supported_actions": ["EVERY_HOUR"],
    "supported_reactions": []
  }
]
```

---

## 3. User's Connected Accounts (Database: `ACCOUNTS`)
These routes manage the **links** between a User and a Service (OAuth2 tokens).

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/accounts` | List the services the logged-in user has connected. |
| `POST` | `/accounts` | Save a new OAuth token (Connect a service). |
| `DELETE` | `/accounts/{id}` | Disconnect a service (Delete token from DB). |

**Example Body for `POST /accounts`:**
```json
{
  "provider": "google",
  "access_token": "ya29.a0Af...",
  "refresh_token": "1//04..."
}
```
*Note: This creates a new row in the `ACCOUNTS` table.*

---

## 4. AREAs (Database: `AREAS`, `ACTIONS`, `REACTIONS`)
The business logic linking a Trigger (Action) to a Consequence (Reaction).

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/areas` | List all automations created by the user. |
| `POST` | `/areas` | Create a new AREA. |
| `DELETE` | `/areas/{id}` | Delete an AREA. |
| `PUT` | `/areas/{id}` | Update an AREA (e.g., disable/enable). |

### Creating an AREA (The critical part)
To create an AREA, the frontend sends the configuration. It must specify which **Connected Account** (`account_id`) to use for the action/reaction.

**Example Body for `POST /areas`:**
```json
{
  "name": "If I get an email, send Discord message",
  "action": {
    "name": "GMAIL_RECEIVED",
    // Which Google account to check? The one with this ID in ACCOUNTS table.
    "account_id": "550e8400-e29b-41d4-a716-446655440000",
    "parameters": { "subject_contains": "Urgent" }
  },
  "reaction": {
    "name": "DISCORD_SEND_MSG",
    // Which Discord account to use? The one with this ID in ACCOUNTS table.
    "account_id": "770e8400-e29b-41d4-a716-446655440000",
    "parameters": { "channel_id": "999888777" }
  }
}
```
*Note: If the service does not need an account (like Timer), `account_id` is null.*
