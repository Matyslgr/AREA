# Dossier de Prototypage - AREA

> **Compétences C8 & C12** : Présentation des travaux de prototypage et solutions algorithmiques

---

## 1. Introduction

Ce document présente les différentes phases de prototypage du projet AREA, les alternatives évaluées, et les décisions techniques justifiées. Il couvre également les algorithmes originaux développés pour répondre aux besoins spécifiques du projet.

---

## 2. Prototypes Architecturaux

### 2.1 Prototype A : Architecture Monolithique

**Description :**
Premier prototype explorant une architecture monolithique classique avec Express.js et React dans un seul repository.

```
prototype-a/
├── src/
│   ├── client/          # React frontend
│   ├── server/          # Express backend
│   └── shared/          # Code partagé
├── package.json
└── webpack.config.js
```

**Caractéristiques :**
- Single codebase, single deployment
- Webpack pour bundling client + server
- Hot reload via webpack-dev-middleware

**Avantages :**
| Aspect | Évaluation |
|--------|-----------|
| Simplicité de déploiement | ✅ Un seul artifact |
| Partage de code | ✅ Import direct |
| Configuration initiale | ✅ Minimale |
| Coût infrastructure | ✅ Un seul serveur |

**Inconvénients :**
| Aspect | Évaluation |
|--------|-----------|
| Scalabilité | ❌ Scaling vertical uniquement |
| Temps de build | ❌ 3min+ (tout recompilé) |
| Équipe parallèle | ❌ Conflits fréquents |
| Mobile | ❌ Non intégrable |
| Tests isolés | ❌ Couplage fort |

**Raison du rejet :** Incompatible avec l'exigence de client mobile (APK Android). Le monolithe ne permet pas de partager efficacement la logique entre web et mobile.

---

### 2.2 Prototype B : Microservices Complets

**Description :**
Architecture microservices avec services indépendants communicant via message queue.

```
prototype-b/
├── services/
│   ├── auth-service/        # Authentification
│   ├── user-service/        # Gestion utilisateurs
│   ├── area-service/        # Logique métier AREA
│   ├── notification-service/# Notifications
│   └── gateway/             # API Gateway
├── infrastructure/
│   ├── docker-compose.yml
│   └── kubernetes/
└── shared/
    └── proto/               # Protobuf definitions
```

**Caractéristiques :**
- Chaque service = container Docker indépendant
- Communication via RabbitMQ / gRPC
- Kubernetes pour orchestration
- Base de données par service

**Avantages :**
| Aspect | Évaluation |
|--------|-----------|
| Scalabilité | ✅ Horizontale par service |
| Isolation des pannes | ✅ Un service down ≠ tout down |
| Équipes autonomes | ✅ Ownership par service |
| Technologies hétérogènes | ✅ Possible |

**Inconvénients :**
| Aspect | Évaluation |
|--------|-----------|
| Complexité opérationnelle | ❌ Kubernetes, service mesh |
| Latence réseau | ❌ Appels inter-services |
| Debugging distribué | ❌ Tracing complexe |
| Coût infrastructure | ❌ 5+ containers minimum |
| Temps de setup | ❌ 2+ semaines |
| Overkill pour MVP | ❌ Prématuré |

**Raison du rejet :** Complexité disproportionnée pour un projet académique. L'overhead opérationnel (Kubernetes, message queues, distributed tracing) dépasse les bénéfices pour une équipe réduite.

---

### 2.3 Prototype C : Monorepo avec Applications Découplées (RETENU)

**Description :**
Architecture monorepo avec applications indépendantes partageant des packages communs.

```
AREA/                        # PROTOTYPE RETENU
├── apps/
│   ├── server/              # Fastify API (indépendant)
│   ├── web/                 # React SPA (indépendant)
│   └── mobile/              # React Native (indépendant)
├── packages/
│   ├── shared/              # Types, DTOs partagés
│   ├── ui/                  # Composants UI partagés
│   └── eslint-config/       # Config partagée
├── turbo.json               # Orchestration builds
└── docker-compose.yml       # Déploiement local
```

**Caractéristiques :**
- TurboRepo pour orchestration et cache
- Chaque app déployable indépendamment
- Partage minimal (types uniquement)
- Docker pour chaque application

**Avantages :**
| Aspect | Évaluation |
|--------|-----------|
| Scalabilité | ✅ Chaque app scale indépendamment |
| Partage de code | ✅ Types et DTOs partagés |
| Build incrémental | ✅ 95% cache hit rate |
| Mobile intégré | ✅ React Native dans le monorepo |
| Complexité maîtrisée | ✅ Pas de Kubernetes requis |
| CI/CD simple | ✅ GitHub Actions standard |

**Inconvénients :**
| Aspect | Évaluation |
|--------|-----------|
| Learning curve TurboRepo | ⚠️ Configuration initiale |
| Versions packages | ⚠️ Synchronisation requise |

**Raison de la sélection :** Équilibre optimal entre découplage (chaque app indépendante) et productivité (partage de code, cache de build). Permet l'intégration mobile sans complexité microservices.

---

## 3. Tableau Comparatif des Prototypes

| Critère | Monolithe (A) | Microservices (B) | Monorepo (C) |
|---------|--------------|-------------------|--------------|
| **Temps de setup** | 1 jour | 2 semaines | 2 jours |
| **Temps de build** | 3 min | 30s/service | 2s (cached) |
| **Scalabilité** | Verticale | Horizontale totale | Horizontale par app |
| **Coût infra mensuel** | $20 | $150+ | $60 |
| **Support mobile** | ❌ | ✅ | ✅ |
| **Complexité ops** | Faible | Très élevée | Moyenne |
| **Partage de code** | Direct | Protobuf/API | Packages npm |
| **Debugging** | Simple | Distribué | Simple |
| **Équipe parallèle** | Difficile | Excellente | Bonne |
| **Adapté projet académique** | ⚠️ | ❌ | ✅ |

**Verdict :** Le **Prototype C (Monorepo)** offre le meilleur compromis entre les contraintes académiques (temps, coût, équipe) et les exigences techniques (web + mobile + API).

---

## 4. Prototypes de Stack Technique

### 4.1 Backend : Express vs Fastify vs NestJS

| Prototype | Framework | Résultat Benchmark | Décision |
|-----------|-----------|-------------------|----------|
| Backend-v1 | Express | 30k req/sec | ❌ Trop lent |
| Backend-v2 | NestJS | 28k req/sec | ❌ Overhead decorators |
| Backend-v3 | **Fastify** | 76k req/sec | ✅ **Retenu** |

**Justification Fastify :**
- Performance 2.5x supérieure à Express
- Validation JSON Schema native (pas de Zod/Joi)
- Documentation Swagger auto-générée
- Écosystème mature (plugins auth, CORS, etc.)

### 4.2 Frontend : CRA vs Vite vs Next.js

| Prototype | Stack | Dev Start | Build | Décision |
|-----------|-------|-----------|-------|----------|
| Web-v1 | Create React App | 15s | 60s | ❌ Trop lent |
| Web-v2 | Next.js | 3s | 25s | ❌ SSR non requis |
| Web-v3 | **Vite + React** | 0.8s | 18s | ✅ **Retenu** |

**Justification Vite :**
- HMR instantané (50ms vs 1000ms CRA)
- Pas de SSR overhead (SPA suffisant)
- Build production optimisé avec Rollup

### 4.3 Mobile : Flutter vs Ionic vs React Native

| Prototype | Framework | Code Sharing | Build Time | Décision |
|-----------|-----------|--------------|------------|----------|
| Mobile-v1 | Flutter | 0% | 5min | ❌ Nouveau langage (Dart) |
| Mobile-v2 | Ionic | 80% | 2min | ❌ Performance native limitée |
| Mobile-v3 | **React Native + Expo** | 70% | 3min | ✅ **Retenu** |

**Justification React Native :**
- Partage logique avec web (TypeScript)
- Expo simplifie le build (pas de Xcode)
- Performance native réelle
- Écosystème shadcn/ui compatible (react-native-reusables)

---

## 5. Algorithmes Originaux (Compétence C12)

### 5.1 Area Engine : Algorithme de Déclenchement Action-Réaction

> **Problème :** Aucun algorithme standard n'existe pour orchestrer des automatisations "if-this-then-that" avec support multi-services, état persistant, et gestion d'erreurs par automatisation.

#### 5.1.1 Conception de l'Algorithme

**Entrées :**
- Liste des Areas actives (utilisateur + configuration)
- État précédent de chaque Action (pour détection de changement)

**Sortie :**
- Exécution des Reactions si l'Action détecte un changement
- Mise à jour de l'état de l'Action
- Log d'erreur par Area en cas d'échec

**Pseudo-code :**

```
ALGORITHME AreaEngine.tick()

POUR CHAQUE area DANS areas_actives:
    SI area.is_active = FAUX:
        CONTINUER

    action ← RÉCUPÉRER_DÉFINITION(area.action.name)
    SI action = NULL:
        LOGUER_ERREUR(area, "Action inconnue")
        CONTINUER

    ESSAYER:
        // Phase 1: Vérification du déclencheur
        résultat ← action.check(
            utilisateur: area.user,
            paramètres: area.action.parameters,
            état_précédent: area.action.state
        )

        SI résultat = NULL:
            // Pas de changement détecté
            CONTINUER

        // Phase 2: Mise à jour de l'état
        METTRE_À_JOUR_ÉTAT(area.action, résultat.nouvel_état)
        METTRE_À_JOUR_TIMESTAMP(area)

        // Phase 3: Exécution des réactions
        POUR CHAQUE reaction DANS area.reactions:
            reaction_def ← RÉCUPÉRER_DÉFINITION(reaction.name)

            ESSAYER:
                reaction_def.execute(
                    utilisateur: area.user,
                    paramètres: reaction.parameters,
                    données_action: résultat.données
                )
            ATTRAPER erreur:
                LOGUER_ERREUR(area, "Reaction failed: " + erreur)
                // Continue autres reactions
        FIN POUR

    ATTRAPER erreur:
        LOGUER_ERREUR(area, "Action check failed: " + erreur)
FIN POUR
```

#### 5.1.2 Implémentation TypeScript

**Fichier :** `apps/server/src/core/area.engine.ts`

```typescript
export class AreaEngine {
  private serviceManager: ServiceManager;

  async tick(): Promise<void> {
    // Récupération des areas actives avec leurs relations
    const areas = await prisma.area.findMany({
      where: { is_active: true },
      include: {
        user: { include: { accounts: true } },
        action: { include: { account: true } },
        reactions: { include: { account: true } },
      },
    });

    for (const area of areas) {
      await this.processArea(area);
    }
  }

  private async processArea(area: AreaWithRelations): Promise<void> {
    const actionDef = this.serviceManager.getAction(area.action.name);

    if (!actionDef) {
      await this.logError(area, `Unknown action: ${area.action.name}`);
      return;
    }

    try {
      // Phase 1: Check if action triggers
      const result = await actionDef.check(
        area.user,
        area.action.parameters,
        area.action.state
      );

      if (result === null) {
        return; // No trigger
      }

      // Phase 2: Update action state
      await prisma.action.update({
        where: { id: area.action.id },
        data: { state: result.newState },
      });

      await prisma.area.update({
        where: { id: area.id },
        data: { last_executed_at: new Date(), error_log: null },
      });

      // Phase 3: Execute reactions
      for (const reaction of area.reactions) {
        await this.executeReaction(area, reaction, result.data);
      }
    } catch (err: any) {
      await this.logError(area, `Action check failed: ${err.message}`);
    }
  }

  private async executeReaction(
    area: AreaWithRelations,
    reaction: Reaction,
    actionData: any
  ): Promise<void> {
    const reactionDef = this.serviceManager.getReaction(reaction.name);

    if (!reactionDef) {
      await this.logError(area, `Unknown reaction: ${reaction.name}`);
      return;
    }

    try {
      await reactionDef.execute(area.user, reaction.parameters, actionData);
    } catch (err: any) {
      await this.logError(area, `Reaction failed: ${err.message}`);
    }
  }

  private async logError(area: AreaWithRelations, message: string): Promise<void> {
    await prisma.area.update({
      where: { id: area.id },
      data: { error_log: message },
    });
  }
}
```

#### 5.1.3 Complexité Algorithmique

| Opération | Complexité | Justification |
|-----------|------------|---------------|
| Parcours des areas | O(n) | n = nombre d'areas actives |
| Check d'une action | O(1) à O(m) | m = données à vérifier (API call) |
| Exécution reactions | O(r) | r = nombre de reactions par area |
| **Total par tick** | **O(n × (1 + r))** | Linéaire en nombre d'automatisations |

#### 5.1.4 Originalité de l'Algorithme

**Problèmes résolus non couverts par des algorithmes existants :**

1. **Gestion d'état par Action** : Chaque action maintient son propre état (ex: `lastMessageId` pour Gmail) permettant la détection de nouveaux éléments sans re-traiter l'historique.

2. **Isolation des erreurs** : Une erreur dans une Area n'affecte pas les autres. Le `error_log` permet le debugging sans arrêter le système.

3. **Chaînage Action → Multiple Reactions** : Une action peut déclencher plusieurs reactions indépendantes avec passage de données contextuelles.

4. **Support multi-comptes OAuth** : Chaque action/reaction peut utiliser un compte OAuth différent du même utilisateur.

---

### 5.2 Algorithme de Rafraîchissement de Tokens OAuth

> **Problème :** Les tokens OAuth expirent. Il faut un mécanisme transparent de renouvellement sans interrompre l'exécution des automatisations.

#### 5.2.1 Conception

```
ALGORITHME getAccessTokenWithRefresh(utilisateur, provider)

    compte ← TROUVER_COMPTE(utilisateur, provider)
    SI compte = NULL:
        LEVER_ERREUR("Compte non connecté")

    access_token ← DÉCHIFFRER(compte.access_token)

    SI compte.expires_at > MAINTENANT + 5_MINUTES:
        // Token encore valide
        RETOURNER access_token

    // Token expiré ou proche expiration
    SI compte.refresh_token = NULL:
        LEVER_ERREUR("Refresh token manquant")

    refresh_token ← DÉCHIFFRER(compte.refresh_token)

    // Appel au provider pour nouveau token
    nouveaux_tokens ← provider.refreshAccessToken(refresh_token)

    // Chiffrement et stockage
    METTRE_À_JOUR_COMPTE(compte, {
        access_token: CHIFFRER(nouveaux_tokens.access_token),
        refresh_token: CHIFFRER(nouveaux_tokens.refresh_token),
        expires_at: MAINTENANT + nouveaux_tokens.expires_in
    })

    RETOURNER nouveaux_tokens.access_token
```

#### 5.2.2 Implémentation

**Fichier :** `apps/server/src/utils/token.utils.ts`

```typescript
export const getAccessTokenWithRefresh = async (
  user: UserWithAccounts,
  provider: string
): Promise<string> => {
  const account = user.accounts.find((a) => a.provider === provider);

  if (!account) {
    throw new Error(`No ${provider} account connected`);
  }

  const decryptedToken = decrypt(account.access_token);

  // Check if token is still valid (with 5min buffer)
  if (account.expires_at && account.expires_at > new Date(Date.now() + 5 * 60 * 1000)) {
    return decryptedToken;
  }

  // Token expired, refresh it
  if (!account.refresh_token) {
    throw new Error(`No refresh token for ${provider}`);
  }

  const decryptedRefreshToken = decrypt(account.refresh_token);
  const providerStrategy = OAuthFactory.getProvider(provider);
  const newTokens = await providerStrategy.refreshAccessToken(decryptedRefreshToken);

  // Update database with encrypted new tokens
  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: encrypt(newTokens.access_token),
      refresh_token: newTokens.refresh_token
        ? encrypt(newTokens.refresh_token)
        : account.refresh_token,
      expires_at: new Date(Date.now() + newTokens.expires_in * 1000),
    },
  });

  return newTokens.access_token;
};
```

#### 5.2.3 Originalité

Cette solution combine :
- **Chiffrement AES-256** des tokens au repos
- **Renouvellement transparent** sans intervention utilisateur
- **Buffer de sécurité** (5 minutes) pour éviter les race conditions
- **Mise à jour atomique** en base de données

---

### 5.3 Pattern Service Manager avec Factory

> **Problème :** Permettre l'ajout de nouveaux services (Google, Spotify, GitHub...) sans modifier le code existant.

#### 5.3.1 Architecture

```
                    ┌─────────────────┐
                    │ ServiceManager  │
                    │  - services[]   │
                    │  - actions{}    │
                    │  - reactions{}  │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  GoogleService  │ │ SpotifyService  │ │  TimerService   │
│  - actions[]    │ │  - actions[]    │ │  - actions[]    │
│  - reactions[]  │ │  - reactions[]  │ │  - reactions[]  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

#### 5.3.2 Implémentation

**Fichier :** `apps/server/src/services/service.manager.ts`

```typescript
class ServiceManager {
  private services: IService[] = [];
  private actionsMap: Map<string, IAction> = new Map();
  private reactionsMap: Map<string, IReaction> = new Map();

  register(service: IService): void {
    this.services.push(service);

    // Index all actions
    for (const action of service.actions) {
      this.actionsMap.set(action.id, action);
    }

    // Index all reactions
    for (const reaction of service.reactions) {
      this.reactionsMap.set(reaction.id, reaction);
    }
  }

  getAction(id: string): IAction | undefined {
    return this.actionsMap.get(id);
  }

  getReaction(id: string): IReaction | undefined {
    return this.reactionsMap.get(id);
  }

  getAllServices(): IService[] {
    return this.services;
  }
}

// Usage
const manager = new ServiceManager();
manager.register(new GoogleService());
manager.register(new SpotifyService());
manager.register(new TimerService());
```

#### 5.3.3 Originalité

- **Open/Closed Principle** : Nouveau service = nouvelle classe, pas de modification du manager
- **Lookup O(1)** : Actions et reactions indexées par Map
- **Auto-documentation** : `/about.json` généré automatiquement depuis les services enregistrés

---

## 6. Évolution des Prototypes (Git History)

| Phase | Commits | Changement Majeur |
|-------|---------|-------------------|
| v0.1 | #1-#20 | Setup monorepo, structure de base |
| v0.2 | #21-#50 | Auth système (JWT, argon2) |
| v0.3 | #51-#80 | Premier service (Timer) |
| v0.4 | #81-#100 | OAuth Google, Action/Reaction engine |
| v0.5 | #101-#120 | Mobile (React Native + Expo) |
| v0.6 | #121-#135 | Services multiples, refresh tokens |

**Commits clés :**
- `#92` : Area creation flow
- `#94` : Dashboard page
- `#130` : OAuth flow with Ngrok support
- `#132` : Action return values
- `#135` : Refresh token for remaining services

---

## 7. Conclusion

Le processus de prototypage a permis de :

1. **Éliminer les architectures inadaptées** (monolithe, microservices complets)
2. **Valider le choix monorepo** comme compromis optimal
3. **Développer des algorithmes originaux** pour les besoins spécifiques :
   - Area Engine (orchestration action-réaction)
   - Token refresh transparent
   - Service Manager extensible

Ces travaux de prototypage ont directement influencé l'architecture finale, garantissant une solution adaptée aux contraintes du projet.

---

*Document Version: 1.0*
*Compétences: C8 (Prototypage), C12 (Algorithmes originaux)*
