# How to Contribute to AREA Features

This guide focuses on **extending the functionality** of the AREA platform.
If you are looking for git workflow rules (commits, branches), please refer to the general [CONTRIBUTING.md](https://github.com/Matyslgr/.github/blob/main/CONTRIBUTING.md).

The AREA architecture is designed to be modular. Adding a new Service (e.g., Spotify, Discord) or a new Action follows a strict process to ensure stability across the Server, Web, and Mobile clients.

---

## 🧩 Architecture Overview

The core logic lies in the `apps/server` directory. The system uses a **Polling Engine** (or Webhooks) to detect triggers.
Interfaces are shared between Front and Back via the `packages/shared` folder.

---

## ➕ Adding a New Service

To add a service (e.g., `Twitch`):

### 1. Backend Implementation
1.  Create a new folder `apps/server/src/services/twitch`.
2.  Create a configuration file implementing the `IService` interface.
3.  Define the OAuth2 scopes required in `apps/server/src/config/oauth.ts`.
4.  Add the service logo in `apps/web/public/assets/services/twitch.png`.

### 2. Registering the Service
Add your service key to the global service registry in `apps/server/src/services/index.ts`.
*This will automatically make it appear in the `GET /about.json` and `GET /services` endpoints.*

---

## ⚡ Adding a New Action (Trigger)

An **Action** is a function that returns `true` or `false` (or data) based on an event.

1.  **Define the Action:**
    In your service folder, create an action file (e.g., `StreamStarted.ts`).
    It must implement the `IAction` interface:
    ```typescript
    export const StreamStarted: IAction = {
      name: "TWITCH_STREAM_STARTED",
      description: "Triggered when a specific user starts streaming",
      parameters: [{ name: "channel_name", type: "string" }],
      check: async (userToken, params) => {
         // Logic to call Twitch API
         // Return true if stream is live && wasn't live before
      }
    };
    ```

2.  **Frontend Form:**
    The Web and Mobile clients generate forms automatically based on the `parameters` list defined in the backend. You generally do not need to touch the Frontend code unless you need a custom UI component.

---

## 🚀 Adding a New Reaction

A **Reaction** is a function executed when an Action is validated.

1.  **Define the Reaction:**
    In your service folder, create a reaction file (e.g., `BanUser.ts`).
    It must implement the `IReaction` interface:
    ```typescript
    export const BanUser: IReaction = {
      name: "TWITCH_BAN_USER",
      description: "Bans a user from the chat",
      parameters: [{ name: "username", type: "string" }],
      execute: async (userToken, params, actionData) => {
         // Logic to call Twitch API to ban the user
      }
    };
    ```

---

## 🧪 Testing your Feature

Before submitting a Pull Request:

1.  **Unit Tests:** Write tests for your `check` and `execute` functions in `apps/server/test/services/`.
2.  **Integration:**
    - Run `docker compose up`.
    - Go to the Web Client.
    - Create an AREA using your new Action/Reaction.
    - Verify in the Server logs that the trigger is detected.