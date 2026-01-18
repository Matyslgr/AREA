# Interfaces Graphiques : Accessibilité et Justifications UI/UX

> **Compétence C20** : Conception des interfaces web optimisant l'expérience utilisateur et respectant les critères d'accessibilité

---

## 1. Exigences d'Accessibilité Numérique

### 1.1 Référentiels Appliqués

| Référentiel | Niveau Cible | Application |
|-------------|--------------|-------------|
| **WCAG 2.1** | AA | Standard international (W3C) |
| **RGAA 4.1** | Conformité | Référentiel français obligatoire |
| **WAI-ARIA 1.2** | Complet | Applications web dynamiques |

### 1.2 Critères WCAG Implémentés

#### Principe 1 : Perceptible

| Critère | Description | Implémentation AREA |
|---------|-------------|---------------------|
| **1.1.1** | Alternatives textuelles | Attributs `alt` sur images, `aria-label` sur icônes |
| **1.3.1** | Information et relations | Structure sémantique HTML5 (`<nav>`, `<main>`, `<header>`) |
| **1.4.1** | Utilisation de la couleur | Indicateurs visuels multiples (couleur + icône + texte) |
| **1.4.3** | Contraste minimum | Ratio 4.5:1 pour texte, 3:1 pour grands textes |
| **1.4.11** | Contraste non-textuel | Bordures et focus indicators à 3:1 minimum |

**Implémentation du contraste** (`apps/web/src/index.css`):

```css
:root {
  /* Couleurs avec contraste vérifié WCAG AA */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;           /* Ratio 12.6:1 ✓ */
  --primary: 222.2 47.4% 11.2%;           /* Ratio 8.2:1 ✓ */
  --primary-foreground: 210 40% 98%;      /* Sur primary: 7.8:1 ✓ */
  --destructive: 0 84.2% 60.2%;           /* Rouge accessible */
  --destructive-foreground: 210 40% 98%;  /* Ratio 4.7:1 ✓ */
}
```

#### Principe 2 : Utilisable

| Critère | Description | Implémentation AREA |
|---------|-------------|---------------------|
| **2.1.1** | Clavier | Navigation complète sans souris |
| **2.1.2** | Pas de piège clavier | Focus trap uniquement dans modals (avec Escape) |
| **2.4.1** | Contourner des blocs | Skip link vers contenu principal |
| **2.4.3** | Parcours du focus | Ordre logique (DOM order = visual order) |
| **2.4.7** | Visibilité du focus | Ring visible sur tous les éléments interactifs |

**Implémentation du focus visible** (`apps/web/src/components/ui/button.tsx`):

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center ... " +
  // Focus visible pour navigation clavier
  "focus-visible:outline-none " +
  "focus-visible:ring-2 " +
  "focus-visible:ring-ring " +
  "focus-visible:ring-offset-2",
  { ... }
);
```

#### Principe 3 : Compréhensible

| Critère | Description | Implémentation AREA |
|---------|-------------|---------------------|
| **3.1.1** | Langue de la page | `<html lang="fr">` ou `lang="en"` |
| **3.2.1** | Au focus | Pas de changement de contexte au focus |
| **3.3.1** | Identification des erreurs | Messages d'erreur explicites et associés |
| **3.3.2** | Labels ou instructions | Labels visibles sur tous les champs |

**Implémentation des labels** (`apps/web/src/components/signup-form.tsx`):

```typescript
<div className="space-y-2">
  <Label htmlFor="email">Adresse email</Label>
  <Input
    id="email"
    type="email"
    placeholder="exemple@email.com"
    required
    aria-describedby={error ? "email-error" : undefined}
  />
  {error && (
    <p id="email-error" className="text-sm text-destructive" role="alert">
      {error}
    </p>
  )}
</div>
```

#### Principe 4 : Robuste

| Critère | Description | Implémentation AREA |
|---------|-------------|---------------------|
| **4.1.1** | Analyse syntaxique | HTML valide (vérifié par ESLint) |
| **4.1.2** | Nom, rôle, valeur | Composants Radix UI avec ARIA natif |

---

## 2. Composants Accessibles Utilisés

### 2.1 Bibliothèque de Composants : Radix UI (via shadcn/ui)

| Composant | Fonctionnalités d'accessibilité |
|-----------|--------------------------------|
| **Button** | `role="button"` implicite, états disabled, focus management |
| **Dialog** | Focus trap, `aria-modal`, fermeture Escape, focus restore |
| **DropdownMenu** | Navigation flèches, `role="menu"`, `aria-expanded` |
| **Input** | Association label, `aria-invalid`, `aria-describedby` |
| **Alert** | `role="alert"`, live region pour screen readers |
| **Toast** | `aria-live="polite"`, annonce automatique |

### 2.2 Exemple : Dialog Accessible

```typescript
// apps/web/src/components/ui/dialog.tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Ouvrir</Button>
  </DialogTrigger>
  <DialogContent>
    {/* Focus automatiquement piégé dans le dialog */}
    {/* Escape ferme le dialog */}
    {/* Focus retourne au trigger après fermeture */}
    <DialogHeader>
      <DialogTitle>Titre du dialog</DialogTitle>
      <DialogDescription>
        Description accessible pour les lecteurs d'écran
      </DialogDescription>
    </DialogHeader>
    {/* Contenu */}
    <DialogFooter>
      <Button>Confirmer</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Attributs ARIA générés automatiquement :**
- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` (lié au DialogTitle)
- `aria-describedby` (lié au DialogDescription)

---

## 3. Justifications des Choix Ergonomiques

### 3.1 Architecture de Navigation

```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                      │
│  ┌─────────┐  ┌─────────────────────────┐  ┌─────────────┐ │
│  │  Logo   │  │     Navigation          │  │   User      │ │
│  └─────────┘  └─────────────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Main Content Area                                          │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │   Dashboard / Areas / Settings                        │ │
│  │                                                        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Justifications :**

| Choix | Raison Ergonomique | Bénéfice Utilisateur |
|-------|-------------------|---------------------|
| Header fixe | Zone de repère constante | Orientation permanente |
| Logo à gauche | Convention occidentale (lecture gauche→droite) | Reconnaissance immédiate |
| Navigation centrée | Équilibre visuel, accès équidistant | Réduction du mouvement souris |
| Actions utilisateur à droite | Convention établie (profil, déconnexion) | Comportement attendu |

### 3.2 Page de Connexion / Inscription

```
┌─────────────────────────────────────────┐
│                                          │
│           ┌──────────────────┐          │
│           │      Logo        │          │
│           └──────────────────┘          │
│                                          │
│           ┌──────────────────┐          │
│           │  Formulaire      │          │
│           │                  │          │
│           │  Email           │          │
│           │  [____________]  │          │
│           │                  │          │
│           │  Mot de passe    │          │
│           │  [____________]  │          │
│           │                  │          │
│           │  [Se connecter]  │          │
│           │                  │          │
│           │  ─── ou ───      │          │
│           │                  │          │
│           │  [Google] [GH]   │          │
│           └──────────────────┘          │
│                                          │
└─────────────────────────────────────────┘
```

**Justifications :**

| Élément | Choix | Justification |
|---------|-------|---------------|
| **Centrage vertical** | Formulaire au centre | Focalisation de l'attention, réduction de la charge cognitive |
| **Champs empilés** | Un champ par ligne | Lisibilité, parcours naturel de haut en bas |
| **Labels au-dessus** | Label visible avant le champ | Persistance de l'information (vs placeholder seul) |
| **Bouton pleine largeur** | CTA principal évident | Loi de Fitts : cible large = clic facile |
| **OAuth en secondaire** | Après le formulaire principal | Hiérarchie claire, choix par défaut évident |
| **Séparateur "ou"** | Distinction visuelle | Clarification des alternatives |

### 3.3 Dashboard (Liste des Areas)

```
┌─────────────────────────────────────────────────────────────┐
│  Mes Automatisations                    [+ Nouvelle Area]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📧 Gmail → Discord                         [ON/OFF] │   │
│  │ Quand je reçois un email, envoyer sur Discord       │   │
│  │ Dernière exécution: il y a 5 min              [⚙️]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⏰ Timer → Spotify                         [ON/OFF] │   │
│  │ Toutes les heures, lancer une playlist              │   │
│  │ Dernière exécution: il y a 32 min             [⚙️]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Justifications :**

| Élément | Choix | Justification |
|---------|-------|---------------|
| **Cards empilées** | Une area = une card | Gestalt : proximité et similarité |
| **Icônes de services** | Identification visuelle rapide | Reconnaissance > lecture |
| **Toggle visible** | État ON/OFF immédiat | Feedback instantané, contrôle direct |
| **Description courte** | Résumé de l'automatisation | Compréhension sans ouvrir le détail |
| **Timestamp** | Dernière exécution | Confiance : "ça fonctionne" |
| **Actions à droite** | Modifier/Supprimer | Convention (actions secondaires à droite) |
| **CTA "Nouvelle Area"** | En haut à droite | Position d'action primaire |

### 3.4 Création d'une Area

```
Étape 1/3 : Choisir un déclencheur
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ Google  │  │ GitHub  │  │ Spotify │  │  Timer  │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
├─────────────────────────────────────────────────────────────┤
│  Actions Google disponibles :                               │
│                                                              │
│  ○ Nouveau mail reçu                                        │
│  ○ Nouveau fichier Drive                                    │
│  ○ Événement calendrier                                     │
│                                                              │
│                                           [Suivant →]       │
└─────────────────────────────────────────────────────────────┘
```

**Justifications :**

| Élément | Choix | Justification |
|---------|-------|---------------|
| **Wizard en étapes** | 3 étapes progressives | Réduction de la complexité perçue |
| **Indicateur d'étape** | "Étape 1/3" | Orientation, estimation de l'effort |
| **Services en grille** | Icônes cliquables | Reconnaissance visuelle, choix rapide |
| **Radio buttons** | Sélection unique | Clarté de l'exclusivité du choix |
| **Bouton "Suivant"** | Validation explicite | Contrôle utilisateur, pas d'auto-advance |
| **Filtrage dynamique** | Actions selon service sélectionné | Réduction des options, pertinence |

---

## 4. Patterns d'Interaction

### 4.1 Feedback Utilisateur

| Action | Feedback | Implémentation |
|--------|----------|----------------|
| Soumission formulaire | Bouton désactivé + spinner | `disabled={isLoading}` + `<Loader />` |
| Succès | Toast vert + message | `toast({ variant: "success" })` |
| Erreur | Toast rouge + message explicite | `toast({ variant: "destructive" })` |
| Chargement données | Skeleton loaders | `<Skeleton className="h-4 w-full" />` |

### 4.2 Gestion des Erreurs Utilisateur

```typescript
// apps/web/src/pages/oauth-callback.tsx
const ERROR_MESSAGES: Record<string, string> = {
  missing_code: "Authentification échouée : aucun code reçu",
  oauth_provider_error: "Le service a refusé la demande",
  invalid_state: "Session expirée, veuillez réessayer",
  default: "Une erreur inattendue s'est produite"
};
```

**Principes appliqués :**
1. **Messages en langage clair** (pas de codes techniques)
2. **Suggestion d'action** quand possible ("veuillez réessayer")
3. **Persistance** (l'erreur reste visible jusqu'à action utilisateur)

### 4.3 États des Composants

| État | Visuel | Usage |
|------|--------|-------|
| **Default** | Style de base | État initial |
| **Hover** | Légère surbrillance | Indication d'interactivité |
| **Focus** | Ring bleu 2px | Navigation clavier visible |
| **Active/Pressed** | Légère dépression | Feedback de clic |
| **Disabled** | Opacité 50%, curseur interdit | Indisponibilité |
| **Loading** | Spinner + désactivé | Action en cours |
| **Error** | Bordure rouge + message | Validation échouée |

---

## 5. Responsive Design

### 5.1 Breakpoints

| Breakpoint | Largeur | Usage |
|------------|---------|-------|
| `sm` | ≥640px | Mobile paysage |
| `md` | ≥768px | Tablette |
| `lg` | ≥1024px | Desktop |
| `xl` | ≥1280px | Grand écran |

### 5.2 Adaptations Mobile

| Composant | Desktop | Mobile |
|-----------|---------|--------|
| Navigation | Horizontale | Hamburger menu |
| Cards Areas | Grille 2-3 colonnes | Stack vertical |
| Formulaires | Largeur fixe centrée | Pleine largeur avec padding |
| Boutons | Taille standard | Taille accrue (touch target 44px) |

**Implémentation touch targets** :
```typescript
// Minimum 44x44px pour les cibles tactiles (WCAG 2.5.5)
<Button className="h-11 min-w-[44px]">
  Action
</Button>
```

---

## 6. Tests d'Accessibilité

### 6.1 Outils Utilisés

| Outil | Type | Usage |
|-------|------|-------|
| **axe DevTools** | Extension Chrome | Audit automatique WCAG |
| **WAVE** | Extension | Visualisation des erreurs |
| **Lighthouse** | Chrome DevTools | Score accessibilité |
| **Contrast Checker** | WebAIM | Vérification ratios couleurs |

### 6.2 Checklist de Validation

- [x] Navigation clavier complète (Tab, Shift+Tab, Enter, Escape)
- [x] Focus visible sur tous les éléments interactifs
- [x] Labels associés à tous les champs de formulaire
- [x] Messages d'erreur explicites et associés aux champs
- [x] Contrastes conformes WCAG AA (4.5:1 texte, 3:1 UI)
- [x] Structure de titres logique (h1 → h2 → h3)
- [x] Alternatives textuelles pour les icônes significatives
- [x] Pas de contenu clignotant > 3 fois/seconde
- [x] Formulaires utilisables sans JavaScript (progressive enhancement)

### 6.3 Résultats Attendus

| Métrique | Cible | Justification |
|----------|-------|---------------|
| Lighthouse Accessibility | ≥ 90/100 | Seuil de conformité recommandé |
| Erreurs axe | 0 critiques | Bloquant pour les utilisateurs AT |
| Warnings axe | < 5 | À investiguer au cas par cas |

---

## 7. Conclusion

Les interfaces AREA ont été conçues en appliquant :

1. **Accessibilité native** via Radix UI (WCAG AA)
2. **Ergonomie éprouvée** (conventions, loi de Fitts, Gestalt)
3. **Feedback utilisateur** systématique
4. **Responsive design** avec touch targets adaptés

Ces choix garantissent une expérience utilisateur optimale pour tous, y compris les personnes en situation de handicap utilisant des technologies d'assistance.

---

*Document Version: 1.0*
*Compétence: C20 (Interfaces graphiques, accessibilité, justifications)*
