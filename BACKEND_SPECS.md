# Cahier des Charges - Backend Sardine API

## Stack Technique
- **Framework**: FastAPI (Python 3.11+)
- **Base de données**: MongoDB (avec Motor pour async)
- **Authentification**: JWT (access + refresh tokens)
- **Validation**: Pydantic V2
- **Documentation**: OpenAPI/Swagger auto-générée

---

## Architecture Générale

```
src/
├── main.py                 # Point d'entrée FastAPI
├── config.py               # Configuration (env vars)
├── database.py             # Connexion MongoDB
├── dependencies.py         # Dépendances (auth, pagination)
│
├── models/                 # Modèles Pydantic
│   ├── user.py
│   ├── organization.py
│   ├── document.py
│   ├── folder.py
│   ├── agent.py
│   ├── flow.py
│   ├── team.py
│   └── member.py
│
├── schemas/                # Schémas Request/Response
│   ├── auth.py
│   ├── user.py
│   ├── organization.py
│   ├── document.py
│   ├── folder.py
│   ├── agent.py
│   ├── flow.py
│   ├── team.py
│   └── member.py
│
├── routers/                # Routes API
│   ├── auth.py
│   ├── users.py
│   ├── organizations.py
│   ├── documents.py
│   ├── folders.py
│   ├── trash.py
│   ├── agents.py
│   ├── flows.py
│   ├── teams.py
│   └── members.py
│
├── services/               # Logique métier
│   ├── auth_service.py
│   ├── user_service.py
│   ├── organization_service.py
│   ├── document_service.py
│   ├── folder_service.py
│   ├── trash_service.py
│   ├── agent_service.py
│   ├── flow_service.py
│   ├── team_service.py
│   └── member_service.py
│
└── utils/                  # Utilitaires
    ├── security.py         # Hashing, JWT
    ├── file_utils.py       # Upload/Download
    └── validators.py       # Validations custom
```

---

## Collections MongoDB

### 1. `users`
```json
{
  "_id": "ObjectId",
  "email": "string (unique, indexed)",
  "password_hash": "string",
  "first_name": "string",
  "last_name": "string",
  "avatar_url": "string | null",
  "is_active": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 2. `organizations`
```json
{
  "_id": "ObjectId",
  "name": "string",
  "description": "string | null",
  "is_personal": "boolean",
  "holding_id": "ObjectId | null",
  "distributor_id": "ObjectId | null",
  "created_by": "ObjectId (ref: users)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 3. `organization_members`
```json
{
  "_id": "ObjectId",
  "organization_id": "ObjectId (ref: organizations, indexed)",
  "user_id": "ObjectId (ref: users, indexed)",
  "role": "enum: admin | member | reader",
  "added_by": "ObjectId (ref: users)",
  "added_at": "datetime"
}
```

### 4. `teams`
```json
{
  "_id": "ObjectId",
  "organization_id": "ObjectId (ref: organizations, indexed)",
  "name": "string",
  "description": "string | null",
  "created_by": "ObjectId (ref: users)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 5. `team_members`
```json
{
  "_id": "ObjectId",
  "team_id": "ObjectId (ref: teams, indexed)",
  "user_id": "ObjectId (ref: users, indexed)",
  "added_at": "datetime"
}
```

### 6. `folders`
```json
{
  "_id": "ObjectId",
  "organization_id": "ObjectId (ref: organizations, indexed)",
  "parent_id": "ObjectId | null (ref: folders, indexed)",
  "name": "string",
  "path": "string (full path, indexed)",
  "created_by": "ObjectId (ref: users)",
  "created_at": "datetime",
  "updated_at": "datetime",
  "deleted_at": "datetime | null (indexed)",
  "original_path": "string | null"
}
```

### 7. `files`
```json
{
  "_id": "ObjectId",
  "organization_id": "ObjectId (ref: organizations, indexed)",
  "folder_id": "ObjectId | null (ref: folders, indexed)",
  "name": "string",
  "original_name": "string",
  "extension": "string",
  "mime_type": "string",
  "size": "integer (bytes)",
  "file_type": "enum: pdf | doc | xls | img | txt | other",
  "storage_path": "string",
  "created_by": "ObjectId (ref: users)",
  "created_at": "datetime",
  "updated_at": "datetime",
  "deleted_at": "datetime | null (indexed)",
  "original_path": "string | null"
}
```

### 8. `agents`
```json
{
  "_id": "ObjectId",
  "organization_id": "ObjectId (ref: organizations, indexed)",
  "name": "string",
  "reference": "string (unique per org, indexed)",
  "version": "string",
  "description": "string | null",
  "status": "enum: active | inactive | error",
  "config": "object (agent-specific configuration)",
  "shared_with": ["ObjectId (ref: organizations)"],
  "share_with_children": "boolean",
  "created_by": "ObjectId (ref: users)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 9. `flows`
```json
{
  "_id": "ObjectId",
  "organization_id": "ObjectId (ref: organizations, indexed)",
  "name": "string",
  "reference": "string | null (unique per org if not null)",
  "version": "string",
  "description": "string | null",
  "status": "enum: active | inactive | error",
  "is_template": "boolean (indexed)",
  "flow_data": {
    "nodes": [{
      "id": "string",
      "name": "string",
      "type": "enum: start | end | if | switch | merge | edit | agent | approval | http | notification",
      "x": "number",
      "y": "number",
      "color": "string",
      "icon": { "icon": "string", "rotate": "number | null" },
      "inputs": [{ "id": "string", "label": "string" }],
      "outputs": [{ "id": "string", "label": "string" }],
      "entries": [{ "id": "string", "label": "string" }],
      "exits": [{ "id": "string", "label": "string" }],
      "configured": "boolean",
      "config": "object (node-specific)"
    }],
    "links": [{
      "id": "string",
      "src": { "nodeId": "string", "portIndex": "number", "kind": "string" },
      "dst": { "nodeId": "string", "portIndex": "number", "kind": "string" },
      "relation": "enum: io | entry-exit",
      "map": "object | null"
    }],
    "viewport": { "x": "number", "y": "number", "scale": "number" }
  },
  "shared_with": ["ObjectId (ref: organizations)"],
  "share_with_children": "boolean",
  "created_by": "ObjectId (ref: users)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 10. `flow_executions`
```json
{
  "_id": "ObjectId",
  "flow_id": "ObjectId (ref: flows, indexed)",
  "organization_id": "ObjectId (ref: organizations, indexed)",
  "status": "enum: pending | running | completed | failed | cancelled",
  "trigger_type": "enum: manual | scheduled | webhook",
  "triggered_by": "ObjectId | null (ref: users)",
  "started_at": "datetime | null",
  "completed_at": "datetime | null",
  "error": "string | null",
  "execution_data": "object (runtime state)",
  "created_at": "datetime"
}
```

---

## API Endpoints

### Authentification (`/api/auth`)

| Méthode | Endpoint | Description | Body | Response |
|---------|----------|-------------|------|----------|
| POST | `/register` | Créer un compte | `{ email, password, first_name, last_name }` | `{ user, tokens }` |
| POST | `/login` | Connexion | `{ email, password }` | `{ user, tokens }` |
| POST | `/refresh` | Rafraîchir le token | `{ refresh_token }` | `{ access_token }` |
| POST | `/logout` | Déconnexion | - | `{ success }` |
| POST | `/forgot-password` | Mot de passe oublié | `{ email }` | `{ success }` |
| POST | `/reset-password` | Réinitialiser mdp | `{ token, password }` | `{ success }` |

### Utilisateurs (`/api/users`)

| Méthode | Endpoint | Description | Response |
|---------|----------|-------------|----------|
| GET | `/me` | Profil utilisateur courant | `User` |
| PATCH | `/me` | Modifier profil | `User` |
| GET | `/me/organizations` | Mes organisations | `Organization[]` |

### Organisations (`/api/organizations`)

| Méthode | Endpoint | Description | Body | Response |
|---------|----------|-------------|------|----------|
| GET | `/` | Liste des organisations | - | `Organization[]` |
| POST | `/` | Créer une organisation | `{ name, description, holding_id?, distributor_id?, member_ids[] }` | `Organization` |
| GET | `/{id}` | Détails organisation | - | `Organization` |
| PATCH | `/{id}` | Modifier organisation | `{ name?, description? }` | `Organization` |
| DELETE | `/{id}` | Supprimer organisation | - | `{ success }` |
| GET | `/{id}/children` | Organisations enfants | - | `Organization[]` |

### Membres d'organisation (`/api/organizations/{org_id}/members`)

| Méthode | Endpoint | Description | Body | Response |
|---------|----------|-------------|------|----------|
| GET | `/` | Liste des membres | - | `Member[]` |
| POST | `/` | Ajouter des membres | `[{ email, role }]` | `Member[]` |
| PATCH | `/{user_id}` | Modifier rôle | `{ role }` | `Member` |
| DELETE | `/{user_id}` | Retirer membre | - | `{ success }` |

### Équipes (`/api/organizations/{org_id}/teams`)

| Méthode | Endpoint | Description | Body | Response |
|---------|----------|-------------|------|----------|
| GET | `/` | Liste des équipes | - | `Team[]` |
| POST | `/` | Créer une équipe | `{ name, description, member_ids[] }` | `Team` |
| GET | `/{id}` | Détails équipe | - | `Team` |
| PATCH | `/{id}` | Modifier équipe | `{ name?, description? }` | `Team` |
| DELETE | `/{id}` | Supprimer équipe | - | `{ success }` |
| POST | `/{id}/members` | Ajouter membres | `{ user_ids[] }` | `Team` |
| DELETE | `/{id}/members/{user_id}` | Retirer membre | - | `{ success }` |

### Dossiers (`/api/organizations/{org_id}/folders`)

| Méthode | Endpoint | Description | Body | Response |
|---------|----------|-------------|------|----------|
| GET | `/` | Liste dossiers racine | - | `Folder[]` |
| GET | `/{id}` | Contenu d'un dossier | - | `{ folder, subfolders[], files[] }` |
| POST | `/` | Créer un dossier | `{ name, parent_id? }` | `Folder` |
| PATCH | `/{id}` | Renommer dossier | `{ name }` | `Folder` |
| POST | `/{id}/move` | Déplacer dossier | `{ target_folder_id }` | `Folder` |
| DELETE | `/{id}` | Supprimer (vers corbeille) | - | `{ success }` |
| GET | `/{id}/breadcrumbs` | Fil d'Ariane | - | `Folder[]` |

### Fichiers (`/api/organizations/{org_id}/files`)

| Méthode | Endpoint | Description | Body | Response |
|---------|----------|-------------|------|----------|
| POST | `/upload` | Upload fichier(s) | `FormData: files[], folder_id?` | `File[]` |
| GET | `/{id}` | Métadonnées fichier | - | `File` |
| GET | `/{id}/download` | Télécharger fichier | - | `FileStream` |
| PATCH | `/{id}` | Renommer fichier | `{ name }` | `File` |
| POST | `/{id}/move` | Déplacer fichier | `{ target_folder_id }` | `File` |
| DELETE | `/{id}` | Supprimer (vers corbeille) | - | `{ success }` |

### Corbeille (`/api/organizations/{org_id}/trash`)

| Méthode | Endpoint | Description | Response |
|---------|----------|-------------|----------|
| GET | `/` | Contenu de la corbeille | `{ folders[], files[] }` |
| POST | `/folders/{id}/restore` | Restaurer dossier | `Folder` |
| POST | `/files/{id}/restore` | Restaurer fichier | `File` |
| DELETE | `/folders/{id}` | Supprimer définitivement dossier | `{ success }` |
| DELETE | `/files/{id}` | Supprimer définitivement fichier | `{ success }` |
| DELETE | `/empty` | Vider la corbeille | `{ success, deleted_count }` |

### Agents (`/api/organizations/{org_id}/agents`)

| Méthode | Endpoint | Description | Body | Response |
|---------|----------|-------------|------|----------|
| GET | `/` | Liste des agents | `?status=&search=` | `Agent[]` |
| POST | `/` | Créer un agent | `{ name, reference, description, status, shared_with[], share_with_children }` | `Agent` |
| GET | `/{id}` | Détails agent | - | `Agent` |
| PATCH | `/{id}` | Modifier agent | `{ name?, description?, status? }` | `Agent` |
| POST | `/{id}/toggle-status` | Activer/Désactiver | - | `Agent` |
| DELETE | `/{id}` | Supprimer agent | - | `{ success }` |

### Flows (`/api/organizations/{org_id}/flows`)

| Méthode | Endpoint | Description | Body | Response |
|---------|----------|-------------|------|----------|
| GET | `/` | Liste des flows | `?status=&search=&is_template=` | `Flow[]` |
| POST | `/` | Créer un flow | `{ name, reference?, description, status, is_template, flow_data, shared_with[], share_with_children }` | `Flow` |
| GET | `/{id}` | Détails flow | - | `Flow` |
| PATCH | `/{id}` | Modifier flow | `{ name?, description?, status?, flow_data? }` | `Flow` |
| POST | `/{id}/toggle-status` | Activer/Désactiver | - | `Flow` |
| DELETE | `/{id}` | Supprimer flow | - | `{ success }` |
| POST | `/{id}/execute` | Exécuter flow | `{ input_data? }` | `FlowExecution` |
| GET | `/{id}/executions` | Historique exécutions | - | `FlowExecution[]` |
| POST | `/{id}/export` | Exporter flow | - | `{ flow_json }` |
| POST | `/import` | Importer flow | `{ flow_json }` | `Flow` |

---

## User Stories

### US-AUTH: Authentification

#### US-AUTH-01: Inscription
**En tant que** visiteur
**Je veux** créer un compte
**Afin de** pouvoir accéder à l'application

**Critères d'acceptation:**
- Email unique et valide (format email)
- Mot de passe minimum 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
- Création automatique d'une organisation personnelle
- Envoi d'un email de confirmation (optionnel)

#### US-AUTH-02: Connexion
**En tant que** utilisateur enregistré
**Je veux** me connecter
**Afin de** accéder à mes données

**Critères d'acceptation:**
- Validation email/mot de passe
- Retour des tokens JWT (access 15min, refresh 7 jours)
- Retour des informations utilisateur et ses organisations

#### US-AUTH-03: Déconnexion
**En tant que** utilisateur connecté
**Je veux** me déconnecter
**Afin de** sécuriser mon compte

**Critères d'acceptation:**
- Invalidation du refresh token
- Nettoyage côté client

---

### US-ORG: Gestion des Organisations

#### US-ORG-01: Lister mes organisations
**En tant que** utilisateur connecté
**Je veux** voir toutes mes organisations
**Afin de** choisir mon contexte de travail

**Critères d'acceptation:**
- Liste de toutes les organisations où je suis membre
- Affichage du rôle dans chaque organisation
- Indication de l'organisation personnelle

#### US-ORG-02: Créer une organisation
**En tant que** administrateur
**Je veux** créer une nouvelle organisation
**Afin de** gérer un nouveau périmètre

**Critères d'acceptation:**
- Nom requis et unique
- Description optionnelle
- Sélection optionnelle d'un holding et distributeur
- Ajout de membres initiaux
- Option "tous les membres du parent"

#### US-ORG-03: Modifier une organisation
**En tant que** administrateur de l'organisation
**Je veux** modifier les informations
**Afin de** les maintenir à jour

#### US-ORG-04: Supprimer une organisation
**En tant que** administrateur
**Je veux** supprimer une organisation
**Afin de** nettoyer les données obsolètes

**Critères d'acceptation:**
- Confirmation requise
- Suppression en cascade (membres, documents, équipes)
- Impossible de supprimer une organisation personnelle

---

### US-MEMBER: Gestion des Membres

#### US-MEMBER-01: Lister les membres
**En tant que** membre de l'organisation
**Je veux** voir la liste des membres
**Afin de** connaître l'équipe

**Critères d'acceptation:**
- Liste avec nom, email, rôle, date d'ajout
- Filtrage par rôle (admin, member, reader)
- Recherche par nom ou email

#### US-MEMBER-02: Ajouter des membres
**En tant que** administrateur
**Je veux** ajouter des membres
**Afin de** donner accès à l'organisation

**Critères d'acceptation:**
- Ajout en masse (plusieurs emails)
- Attribution d'un rôle par membre
- Envoi d'invitation par email si utilisateur inexistant
- Rattachement automatique si utilisateur existe

#### US-MEMBER-03: Modifier le rôle d'un membre
**En tant que** administrateur
**Je veux** changer le rôle d'un membre
**Afin de** ajuster ses permissions

**Critères d'acceptation:**
- Rôles: admin, member, reader
- Impossible de rétrograder le dernier admin

#### US-MEMBER-04: Retirer un membre
**En tant que** administrateur
**Je veux** retirer un membre
**Afin de** révoquer son accès

**Critères d'acceptation:**
- Confirmation requise
- Impossible de se retirer soi-même si dernier admin

---

### US-TEAM: Gestion des Équipes

#### US-TEAM-01: Lister les équipes
**En tant que** membre de l'organisation
**Je veux** voir les équipes
**Afin de** connaître la structure

**Critères d'acceptation:**
- Liste avec nom, description, nombre de membres
- Recherche par nom

#### US-TEAM-02: Créer une équipe
**En tant que** administrateur
**Je veux** créer une équipe
**Afin de** grouper des membres

**Critères d'acceptation:**
- Nom requis
- Description optionnelle
- Sélection des membres

#### US-TEAM-03: Gérer les membres d'une équipe
**En tant que** administrateur
**Je veux** ajouter/retirer des membres
**Afin de** maintenir l'équipe à jour

#### US-TEAM-04: Supprimer une équipe
**En tant que** administrateur
**Je veux** supprimer une équipe
**Afin de** nettoyer la structure

---

### US-DOC: Gestion des Documents

#### US-DOC-01: Naviguer dans les dossiers
**En tant que** membre
**Je veux** parcourir l'arborescence des dossiers
**Afin de** trouver mes documents

**Critères d'acceptation:**
- Affichage des sous-dossiers et fichiers
- Fil d'Ariane (breadcrumbs)
- Vue liste ou carte
- Compteur de fichiers/dossiers par dossier

#### US-DOC-02: Créer un dossier
**En tant que** membre (admin ou member)
**Je veux** créer un nouveau dossier
**Afin de** organiser mes documents

**Critères d'acceptation:**
- Nom requis
- Création à la racine ou dans un dossier parent
- Nom unique dans le même niveau

#### US-DOC-03: Renommer un dossier
**En tant que** membre (admin ou member)
**Je veux** renommer un dossier
**Afin de** corriger son intitulé

#### US-DOC-04: Déplacer un dossier
**En tant que** membre (admin ou member)
**Je veux** déplacer un dossier
**Afin de** réorganiser l'arborescence

**Critères d'acceptation:**
- Impossible de déplacer dans un de ses descendants
- Mise à jour des chemins de tous les enfants

#### US-DOC-05: Supprimer un dossier
**En tant que** membre (admin ou member)
**Je veux** supprimer un dossier
**Afin de** nettoyer l'arborescence

**Critères d'acceptation:**
- Déplacement vers la corbeille (soft delete)
- Conservation pendant 30 jours
- Tous les sous-dossiers et fichiers suivent

#### US-DOC-06: Uploader des fichiers
**En tant que** membre (admin ou member)
**Je veux** uploader des fichiers
**Afin de** stocker mes documents

**Critères d'acceptation:**
- Upload multiple
- Types supportés: PDF, DOC/DOCX, XLS/XLSX, images, TXT
- Limite de taille (configurable, défaut 50MB)
- Détection automatique du type

#### US-DOC-07: Télécharger un fichier
**En tant que** membre
**Je veux** télécharger un fichier
**Afin de** le consulter localement

#### US-DOC-08: Renommer un fichier
**En tant que** membre (admin ou member)
**Je veux** renommer un fichier
**Afin de** corriger son nom

#### US-DOC-09: Déplacer un fichier
**En tant que** membre (admin ou member)
**Je veux** déplacer un fichier
**Afin de** le réorganiser

#### US-DOC-10: Supprimer un fichier
**En tant que** membre (admin ou member)
**Je veux** supprimer un fichier
**Afin de** le retirer

**Critères d'acceptation:**
- Déplacement vers la corbeille (soft delete)
- Conservation pendant 30 jours

#### US-DOC-11: Rechercher des documents
**En tant que** membre
**Je veux** rechercher par nom
**Afin de** trouver rapidement un document

**Critères d'acceptation:**
- Recherche dans le dossier courant
- Recherche insensible à la casse
- Filtrage en temps réel

---

### US-TRASH: Gestion de la Corbeille

#### US-TRASH-01: Voir la corbeille
**En tant que** membre
**Je veux** voir les éléments supprimés
**Afin de** les restaurer si besoin

**Critères d'acceptation:**
- Séparation dossiers/fichiers
- Affichage du chemin d'origine
- Affichage des jours restants avant suppression définitive
- Vue liste ou carte

#### US-TRASH-02: Restaurer un élément
**En tant que** membre (admin ou member)
**Je veux** restaurer un élément
**Afin de** récupérer un document supprimé

**Critères d'acceptation:**
- Restauration au chemin d'origine
- Si le dossier parent n'existe plus, restauration à la racine
- Gestion des conflits de noms (renommage automatique)

#### US-TRASH-03: Supprimer définitivement
**En tant que** membre (admin ou member)
**Je veux** supprimer définitivement
**Afin de** libérer de l'espace

**Critères d'acceptation:**
- Confirmation requise
- Suppression du fichier physique
- Action irréversible

#### US-TRASH-04: Vider la corbeille
**En tant que** administrateur
**Je veux** vider toute la corbeille
**Afin de** faire un nettoyage complet

**Critères d'acceptation:**
- Confirmation requise
- Suppression de tous les éléments

#### US-TRASH-05: Nettoyage automatique
**En tant que** système
**Je veux** supprimer automatiquement les éléments de plus de 30 jours
**Afin de** maintenir le stockage

**Critères d'acceptation:**
- Job CRON quotidien
- Suppression des fichiers physiques
- Logging des suppressions

---

### US-AGENT: Gestion des Agents IA

#### US-AGENT-01: Lister les agents
**En tant que** membre
**Je veux** voir les agents disponibles
**Afin de** les utiliser dans mes flows

**Critères d'acceptation:**
- Liste avec nom, référence, version, statut
- Filtrage par statut (active, inactive, error)
- Recherche par nom ou référence
- Vue liste ou carte

#### US-AGENT-02: Créer un agent
**En tant que** administrateur
**Je veux** créer un agent
**Afin de** automatiser des tâches

**Critères d'acceptation:**
- Nom et référence requis
- Référence unique dans l'organisation
- Description optionnelle
- Statut initial (active/inactive)
- Configuration du partage (organisations spécifiques ou enfants)

#### US-AGENT-03: Modifier un agent
**En tant que** administrateur
**Je veux** modifier un agent
**Afin de** ajuster sa configuration

#### US-AGENT-04: Activer/Désactiver un agent
**En tant que** administrateur
**Je veux** changer le statut
**Afin de** contrôler son utilisation

#### US-AGENT-05: Supprimer un agent
**En tant que** administrateur
**Je veux** supprimer un agent
**Afin de** le retirer

**Critères d'acceptation:**
- Vérification qu'il n'est pas utilisé dans un flow actif
- Confirmation requise

---

### US-FLOW: Gestion des Flows

#### US-FLOW-01: Lister les flows
**En tant que** membre
**Je veux** voir les flows
**Afin de** les gérer

**Critères d'acceptation:**
- Séparation flows / templates
- Filtrage par statut
- Recherche par nom ou référence
- Vue liste ou carte

#### US-FLOW-02: Créer un flow
**En tant que** administrateur
**Je veux** créer un flow
**Afin de** automatiser un processus

**Critères d'acceptation:**
- Nom requis
- Référence optionnelle mais unique si fournie
- Statut initial
- Données du flow (nodes, links, viewport)
- Configuration du partage

#### US-FLOW-03: Créer un template
**En tant que** administrateur
**Je veux** créer un template
**Afin de** réutiliser des patterns

**Critères d'acceptation:**
- Nom requis
- Pas de référence pour les templates
- Marqué comme is_template = true

#### US-FLOW-04: Modifier un flow
**En tant que** administrateur
**Je veux** modifier le flow
**Afin de** ajuster le processus

**Critères d'acceptation:**
- Sauvegarde des nodes, links et viewport
- Versioning automatique

#### US-FLOW-05: Activer/Désactiver un flow
**En tant que** administrateur
**Je veux** changer le statut
**Afin de** contrôler son exécution

#### US-FLOW-06: Supprimer un flow
**En tant que** administrateur
**Je veux** supprimer un flow
**Afin de** le retirer

#### US-FLOW-07: Exporter un flow
**En tant que** administrateur
**Je veux** exporter un flow
**Afin de** le sauvegarder ou partager

**Critères d'acceptation:**
- Export JSON complet
- Exclusion des IDs internes

#### US-FLOW-08: Importer un flow
**En tant que** administrateur
**Je veux** importer un flow
**Afin de** le réutiliser

**Critères d'acceptation:**
- Validation du format JSON
- Génération de nouveaux IDs
- Détection des agents manquants

#### US-FLOW-09: Exécuter un flow
**En tant que** membre (admin ou member)
**Je veux** exécuter un flow
**Afin de** lancer le processus

**Critères d'acceptation:**
- Création d'une entrée d'exécution
- Exécution asynchrone
- Gestion des erreurs par node

#### US-FLOW-10: Voir l'historique d'exécution
**En tant que** membre
**Je veux** voir les exécutions passées
**Afin de** monitorer le flow

**Critères d'acceptation:**
- Liste avec statut, date, durée
- Détails de chaque exécution
- Logs d'erreur si échec

---

## Configurations des Nodes (Flow)

### StartConfig
```json
{
  "trigger_type": "manual | scheduled | webhook",
  "schedule": "cron expression (si scheduled)",
  "webhook_secret": "string (si webhook)"
}
```

### EndConfig
```json
{
  "status": "completed | failed | cancelled",
  "output_mapping": "object"
}
```

### IfConfig
```json
{
  "condition": "string (expression)",
  "field": "string (json path)",
  "operator": "equals | not_equals | contains | greater | less | exists",
  "value": "any"
}
```

### SwitchConfig
```json
{
  "field": "string (json path)",
  "cases": [
    { "label": "string", "value": "any" }
  ],
  "default_case": "string | null"
}
```

### MergeConfig
```json
{
  "mode": "all | any | first",
  "timeout": "number (seconds, optionnel)"
}
```

### EditConfig
```json
{
  "operations": [
    {
      "type": "set | delete | rename | append",
      "path": "string (json path)",
      "value": "any (pour set/append)",
      "new_path": "string (pour rename)"
    }
  ]
}
```

### AgentConfig
```json
{
  "agent_id": "ObjectId",
  "agent_name": "string",
  "version": "string",
  "input_mapping": "object",
  "output_path": "string"
}
```

### ApprovalConfig
```json
{
  "title": "string",
  "message": "string",
  "options": [
    { "label": "string", "value": "string", "color": "string" }
  ],
  "assignee_type": "user | team | role",
  "assignee_id": "ObjectId",
  "assignee_name": "string",
  "timeout": "number (seconds, optionnel)",
  "timeout_action": "approve | reject | skip"
}
```

### HttpConfig
```json
{
  "method": "GET | POST | PUT | PATCH | DELETE",
  "url": "string",
  "headers": [
    { "key": "string", "value": "string" }
  ],
  "body": "string | object",
  "body_type": "none | json | form | raw",
  "timeout": "number (seconds)",
  "retries": "number",
  "output_path": "string"
}
```

### NotificationConfig
```json
{
  "title": "string",
  "message": "string",
  "channel": "app | email | sms",
  "targets": [
    { "type": "user | team | organization | role", "id": "ObjectId", "name": "string" }
  ],
  "priority": "low | normal | high | urgent",
  "action_url": "string (optionnel)",
  "action_label": "string (optionnel)"
}
```

---

## Permissions par Rôle

| Action | Admin | Member | Reader |
|--------|-------|--------|--------|
| Voir organisation | ✓ | ✓ | ✓ |
| Modifier organisation | ✓ | ✗ | ✗ |
| Supprimer organisation | ✓ | ✗ | ✗ |
| Gérer membres | ✓ | ✗ | ✗ |
| Gérer équipes | ✓ | ✗ | ✗ |
| Voir documents | ✓ | ✓ | ✓ |
| Créer/modifier documents | ✓ | ✓ | ✗ |
| Supprimer documents | ✓ | ✓ | ✗ |
| Voir corbeille | ✓ | ✓ | ✓ |
| Restaurer/supprimer corbeille | ✓ | ✓ | ✗ |
| Vider corbeille | ✓ | ✗ | ✗ |
| Voir agents/flows | ✓ | ✓ | ✓ |
| Créer/modifier agents/flows | ✓ | ✗ | ✗ |
| Exécuter flows | ✓ | ✓ | ✗ |

---

## Gestion des Erreurs

### Codes d'erreur HTTP
- `400 Bad Request` - Données invalides
- `401 Unauthorized` - Non authentifié
- `403 Forbidden` - Permissions insuffisantes
- `404 Not Found` - Ressource inexistante
- `409 Conflict` - Conflit (ex: email déjà utilisé)
- `422 Unprocessable Entity` - Validation échouée
- `500 Internal Server Error` - Erreur serveur

### Format de réponse d'erreur
```json
{
  "detail": "Message d'erreur lisible",
  "code": "ERROR_CODE",
  "field": "champ concerné (optionnel)"
}
```

---

## Variables d'Environnement

```env
# Application
APP_NAME=Sardine API
APP_ENV=development|staging|production
DEBUG=true|false

# MongoDB
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=sardine

# JWT
JWT_SECRET_KEY=your-secret-key-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# File Storage
STORAGE_PATH=/app/storage
MAX_FILE_SIZE_MB=50

# CORS
CORS_ORIGINS=http://localhost:4200,https://app.sardine.fr

# Email (optionnel)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user
SMTP_PASSWORD=password
EMAIL_FROM=noreply@sardine.fr

# Trash
TRASH_RETENTION_DAYS=30
```

---

## Index MongoDB Recommandés

```javascript
// users
db.users.createIndex({ "email": 1 }, { unique: true })

// organizations
db.organizations.createIndex({ "holding_id": 1 })
db.organizations.createIndex({ "distributor_id": 1 })

// organization_members
db.organization_members.createIndex({ "organization_id": 1, "user_id": 1 }, { unique: true })
db.organization_members.createIndex({ "user_id": 1 })

// teams
db.teams.createIndex({ "organization_id": 1 })

// team_members
db.team_members.createIndex({ "team_id": 1, "user_id": 1 }, { unique: true })

// folders
db.folders.createIndex({ "organization_id": 1, "parent_id": 1 })
db.folders.createIndex({ "organization_id": 1, "deleted_at": 1 })
db.folders.createIndex({ "path": 1 })

// files
db.files.createIndex({ "organization_id": 1, "folder_id": 1 })
db.files.createIndex({ "organization_id": 1, "deleted_at": 1 })

// agents
db.agents.createIndex({ "organization_id": 1, "reference": 1 }, { unique: true })
db.agents.createIndex({ "organization_id": 1, "status": 1 })

// flows
db.flows.createIndex({ "organization_id": 1, "is_template": 1 })
db.flows.createIndex({ "organization_id": 1, "status": 1 })
db.flows.createIndex({ "organization_id": 1, "reference": 1 }, { unique: true, sparse: true })

// flow_executions
db.flow_executions.createIndex({ "flow_id": 1, "created_at": -1 })
db.flow_executions.createIndex({ "organization_id": 1, "status": 1 })
```

---

## Jobs CRON

### Nettoyage de la corbeille
**Fréquence**: Quotidien à 2h00 AM
**Action**: Suppression définitive des éléments avec `deleted_at` > 30 jours

```python
# Pseudo-code
async def cleanup_trash():
    cutoff_date = datetime.now() - timedelta(days=TRASH_RETENTION_DAYS)

    # Supprimer les fichiers
    deleted_files = await files_collection.find({
        "deleted_at": { "$lt": cutoff_date, "$ne": None }
    })
    for file in deleted_files:
        await delete_physical_file(file.storage_path)
        await files_collection.delete_one({ "_id": file._id })

    # Supprimer les dossiers
    await folders_collection.delete_many({
        "deleted_at": { "$lt": cutoff_date, "$ne": None }
    })
```

---

## Pagination

### Format de requête
```
GET /api/resource?page=1&page_size=20&sort_by=created_at&sort_order=desc
```

### Format de réponse
```json
{
  "items": [...],
  "total": 150,
  "page": 1,
  "page_size": 20,
  "total_pages": 8
}
```

---

## Recherche et Filtrage

### Paramètres de recherche standards
- `search`: Recherche textuelle (nom, description, etc.)
- `status`: Filtrage par statut
- `role`: Filtrage par rôle
- `is_template`: Filtrage booléen
- `created_after`: Date minimum de création
- `created_before`: Date maximum de création

---

Ce cahier des charges couvre l'ensemble des fonctionnalités du frontend Angular et définit toutes les APIs nécessaires pour un backend FastAPI + MongoDB complet.
