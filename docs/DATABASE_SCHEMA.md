# Architecture of the Database Schema (ERD)

This document provides an overview of the architecture of the database schema used in our application. It outlines the key entities, their attributes, and the relationships between them.

## ER Diagram

```mermaid
erDiagram
    %% --- Users ---
    USERS {
        UUID id PK "Unique identifier"
        String username "Username"
        String email "Unique email"
        String password "Hash (Argon2)"
        DateTime created_at "Creation date"
        DateTime updated_at "Last update"
    }

    %% --- OAUTH & ACCOUNTS ---
    ACCOUNTS {
        UUID id PK
        UUID user_id FK "User link"
        String provider "Ex: google, discord"
        String provider_account_id "User ID provided by the platform (ex: 10239...)"
        String access_token "Encrypted API token"
        String refresh_token "For renewing access"
        DateTime expires_at "Token expiration date"
    }

    %% --- AREA (Action REAction) ---
    AREAS {
        UUID id PK
        UUID user_id FK "Owner"
        String name "Automation name"
        Boolean is_active "ON/OFF state"
    }

    ACTIONS {
        UUID id PK
        UUID area_id FK "Area link"
        UUID account_id FK "Account link (Nullable)"
        String name "Ex: GITHUB_NEW_ISSUE"
        JSON parameters "Flexible config"
    }

    REACTIONS {
        UUID id PK
        UUID area_id FK "Area link"
        UUID account_id FK "Account link (Nullable)"
        String name "Ex: DISCORD_SEND_MSG"
        JSON parameters "Flexible config"
    }

    %% --- RELATIONS ---
    USERS ||--o{ ACCOUNTS : "has"
    USERS ||--o{ AREAS : "creates"
    AREAS ||--|| ACTIONS : "triggered by"
    AREAS ||--o{ REACTIONS : "executes"
    ACCOUNTS |o--o{ ACTIONS : "authenticates"
    ACCOUNTS |o--o{ REACTIONS : "authenticates"
```

## Implementation Details
- `parameters` fields in both `ACTIONS` and `REACTIONS` tables are stored as JSON to allow for flexible configuration options depending on the type of action or reaction.
- Tokens OAuth must be stored encrypted to ensure security. (e.g., using AES encryption)
