# Mission Plan de compétences

Jeu pédagogique en ligne pour le module **« Formation professionnelle & développement des compétences »** (14 h, 4 séances).
Les élèves, en équipe, jouent le service RH de **MécaLoire** et construisent pas à pas un **plan de développement des compétences**, jusqu’à l’oral devant le CSE.

- **4 étapes**, une par séance : le cycle de formation · les règles du jeu (droits, obligations, financement) · du besoin à la stratégie (entretiens, cartographie, CODIR) · construire et défendre le plan.
- Pour chaque étape : une **fiche révision** complète, des **quêtes secondaires** (quiz, classements, associations, remise en ordre, calculs) qui débloquent la soumission, une **activité principale** qui produit un morceau du plan, et un **corrigé** affiché après validation.
- **3 profils** :
  - **Équipe** : créer / rejoindre une équipe (nom + code à 6 caractères), réviser, jouer, construire le plan, échanger avec le prof.
  - **Professeur** : suivi en direct, commentaires, grille de notation /20 par étape, validation (qui débloque l’étape suivante), renvoi à l’équipe, ouverture des séances, export CSV des notes, réinitialisations (une étape, une équipe, toute la progression, tout supprimer).
  - **Spectateur** : présentation du jeu, tableau en direct (progression et points d’expérience), projection du livrable d’une équipe, mode démo pour parcourir toutes les étapes sans rien enregistrer.

Le site est entièrement statique (HTML, CSS, JavaScript, sans compilation) : il s’héberge gratuitement sur **GitHub Pages**. Les données sont stockées dans **Supabase**.

---

## 1. Essayer tout de suite (mode local)

Sans aucune configuration, le site fonctionne en **mode local** : les données restent dans votre navigateur. Pratique pour découvrir le jeu seul.

Pour l’ouvrir sur votre ordinateur, il faut un petit serveur (les modules JavaScript ne marchent pas en double-cliquant sur le fichier) :

```bash
cd mission-plan-competences
python3 -m http.server 8000
```
Puis ouvrez http://localhost:8000. Mot de passe professeur en mode local : `prof` (modifiable dans `js/config.js`).

Astuce : ouvrez l’espace équipe dans un onglet et l’espace professeur dans un autre, pour voir les deux côtés.

---

## 2. Créer la base Supabase (10 minutes)

1. Créez un compte sur https://supabase.com puis **New project** (région Europe conseillée). Notez le mot de passe de la base, il ne servira pas ici.
2. **Créer le compte professeur** : menu *Authentication › Users › Add user › Create new user*. Saisissez votre e-mail et un mot de passe, et cochez *Auto Confirm User*.
3. **Désactiver les inscriptions publiques** (recommandé) : *Authentication › Sign In / Providers* (ou *Settings*) › désactivez *Allow new users to sign up*.
4. **Créer les tables** : ouvrez `supabase/schema.sql`, remplacez **tout en bas** `prof@exemple.fr` par l’e-mail de l’étape 2, puis copiez tout le fichier dans *SQL Editor › New query* et cliquez **Run**. Le message « Success. No rows returned » est normal.
5. **Récupérer les clés** : *Project Settings › API* (ou bouton *Connect*). Copiez :
   - **Project URL** (ex. `https://abcdxyz.supabase.co`)
   - la clé **anon public** (ou **publishable**).
   ⚠️ Ne copiez jamais la clé *service_role* / *secret*.
6. Collez ces deux valeurs dans `js/config.js` :

```js
SUPABASE_URL: "https://abcdxyz.supabase.co",
SUPABASE_ANON_KEY: "eyJhbGciOi...",
```

> Plusieurs professeurs ? Créez leur compte (étape 2) puis, dans *SQL Editor* :
> `insert into public.teachers (email) values ('collegue@exemple.fr');`

---

## 3. Mettre le site en ligne sur GitHub Pages

1. Sur https://github.com : **New repository** (ex. `mission-plan-competences`), public, puis *Create*.
2. Sur la page du dépôt : *Add file › Upload files*, glissez **le contenu** du dossier (index.html, `css/`, `js/`, `supabase/`, README.md, `.nojekyll`), puis *Commit changes*.
   Ou en ligne de commande :
   ```bash
   cd mission-plan-competences
   git init && git add . && git commit -m "Mission Plan de compétences"
   git branch -M main
   git remote add origin https://github.com/VOTRE-COMPTE/mission-plan-competences.git
   git push -u origin main
   ```
3. *Settings › Pages* : *Source* = **Deploy from a branch**, branche **main**, dossier **/ (root)**, *Save*.
4. Après une minute, le site est disponible à `https://VOTRE-COMPTE.github.io/mission-plan-competences/`. C’est l’adresse à donner aux élèves (elle s’affiche aussi en grand dans l’onglet « Présentation du jeu » du spectateur).

---

## 4. Déroulé conseillé en classe

| Moment | Ce que fait le professeur |
|---|---|
| Avant la séance 1 | Se connecter, vérifier « Étape ouverte : Séance 1 » et « Création d’équipes : ouverte ». Relancer le projet Supabase s’il est en pause (projets gratuits inactifs ~1 semaine). |
| Début de séance 1 | Projeter **Spectateur › Présentation du jeu**, puis **Explorer les étapes (démo)** pour montrer une quête et l’activité. Les équipes se créent ; fermer ensuite la création d’équipes. |
| Pendant chaque séance | Suivre le tableau de bord (lignes surlignées = étape à corriger, 💬 = question d’une équipe), commenter, aider. |
| Fin de séance | Noter avec la grille et **valider** : l’étape suivante se débloque. Ouvrir la séance suivante au moment voulu (« Étape ouverte »). |
| Séance 4 (oral CSE) | Projeter le plan de l’équipe qui passe (« Projection sur l’écran spectateur »), noter l’oral et l’avis du CSE. |
| Fin du module | **Exporter les notes (CSV)**, puis « Tout supprimer » pour la classe suivante. |

**Règles de déblocage** : une équipe accède à une étape si (1) le professeur a validé l’étape précédente **et** (2) la séance correspondante est ouverte. Les fiches révision restent consultables dès que la séance est ouverte. Pour soumettre une étape, l’équipe doit réussir toutes les **quêtes obligatoires** (les quêtes bonus rapportent seulement des points d’expérience).

**Points d’expérience** (tableau spectateur) : quête obligatoire +10, quête bonus +5, étape validée +25. Les notes ne sont jamais affichées sur l’écran spectateur.

---

## 5. Modifier le contenu

Tout le contenu pédagogique est dans **`js/content.js`** : fiches révision, quêtes (questions, réponses, seuils de réussite), activités, grilles de notation, corrigés, cas MécaLoire et catalogue du CODIR. Les textes acceptent `**gras**`.

- Quiz (`qcm`) : la bonne réponse est l’indice `answer` dans `options` (l’ordre est mélangé à l’affichage).
- `classify` : chaque élément a `cat` = indice de la bonne catégorie.
- `match` : paires `left` / `right`. `order` : éléments dans le bon ordre. `numeric` : `answer` et tolérance `tol`.
- `required: false` = quête bonus ; `pass: 0.8` = 80 % de bonnes réponses requis.

⚠️ Les montants (CPF, plafonds, reste à charge…) et les règles de l’entretien de parcours professionnel évoluent : vérifiez-les avant chaque session.

Les couleurs se changent en haut de `css/style.css` (variables `:root`).

---

## 6. Sécurité et limites

- Les élèves n’ont pas de compte : chaque équipe est protégée par son **code**. Toutes leurs actions passent par des fonctions SQL qui vérifient ce code et les règles (étape verrouillée, étape soumise…). Les tables ne sont pas lisibles directement (RLS activé).
- Le professeur se connecte avec un vrai compte Supabase ; seuls les e-mails de la table `teachers` ont les droits.
- Les réponses des quiz sont dans le code du site : un élève très motivé pourrait les trouver. C’est un jeu d’entraînement, la note repose sur l’activité principale évaluée par le professeur.
- Plusieurs membres peuvent travailler en même temps. Conseil : un « secrétaire » remplit l’activité, les autres jouent les quêtes. Si un autre appareil modifie l’activité, un bandeau propose de charger ses modifications.
- Mise à jour automatique toutes les 5 secondes (réglable dans `js/config.js`).

## Structure

```
index.html
css/style.css
js/config.js            ← vos clés Supabase
js/content.js           ← tout le contenu pédagogique
js/api.js               ← accès aux données (Supabase ou mode local)
js/main.js, js/ui.js
js/components/          ← fiche, quêtes, activité, échanges, dossier final
js/views/               ← espaces équipe, professeur, spectateur
supabase/schema.sql     ← à exécuter une fois dans Supabase
```
