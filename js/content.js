// =============================================================================
//  CONTENU PÉDAGOGIQUE DU JEU
//  Tiré du support « Formation professionnelle & développement des compétences »
//  (module de 14 h, 4 séances). Tout le texte affiché aux élèves est ici :
//  vous pouvez le modifier sans toucher au reste du code.
//
//  Petite syntaxe dans les textes : **gras**
// =============================================================================

export const COURSE = {
  title: "Mission Plan de compétences",
  subtitle: "Formation professionnelle & développement des compétences",
  author: "William Graffin",
  pitch:
    "Votre équipe est le service RH de MécaLoire. En 4 étapes, une par séance, vous allez parcourir le cycle de formation et construire le plan de développement des compétences le plus pertinent possible… puis le défendre devant le CSE.",
};

// Données chiffrées du cas fil rouge
export const BUDGET = 60000;
export const MASSE_SALARIALE = 5200000;
export const TAUX_HORAIRE = 28;

export const STRATEGIC_GOALS = [
  "Réussir la robotisation de la soudure",
  "Obtenir la certification EN 9100 (aéronautique)",
  "Déployer le nouvel ERP de production",
  "Transmettre les savoir-faire critiques (seniors)",
  "Respecter les obligations légales et la sécurité",
  "Fidéliser les jeunes salariés",
];

export const CATALOG = [
  { id: "habil", action: "Recyclage habilitation électrique", public: "25 salariés", effectif: 25, heures: 7, cost: 6000, mandatory: true },
  { id: "caces", action: "Recyclage CACES chariots", public: "12 caristes", effectif: 12, heures: 14, cost: 4800, mandatory: true },
  { id: "robots", action: "Programmation et maintenance des robots de soudure", public: "8 soudeurs, 35 h", effectif: 8, heures: 35, cost: 14000 },
  { id: "manag", action: "Management de proximité (4 jours)", public: "12 chefs d’équipe", effectif: 12, heures: 28, cost: 18000 },
  { id: "erp", action: "Prise en main du nouvel ERP production", public: "30 salariés", effectif: 30, heures: 14, cost: 9000 },
  { id: "afest", action: "Tutorat et transmission (AFEST) pour les seniors", public: "10 tuteurs", effectif: 10, heures: 21, cost: 7500 },
  { id: "anglais", action: "Anglais technique", public: "6 commerciaux", effectif: 6, heures: 30, cost: 8400 },
  { id: "audit", action: "Auditeurs internes EN 9100", public: "8 salariés", effectif: 8, heures: 21, cost: 6400 },
  { id: "bilans", action: "Bilans de compétences", public: "3 salariés", effectif: 3, heures: 24, cost: 4800 },
];

const CYCLE_STEPS = [
  "1. Analyse de la demande",
  "2. Analyse des besoins",
  "3. Conception",
  "4. Réalisation",
  "5. Évaluation",
  "6. Suivi",
];

const ACTEURS = [
  "Direction", "RH / responsable formation", "Managers", "Salarié / stagiaire", "Formateur",
  "Organisme de formation (Qualiopi)", "CSE", "OPCO", "France compétences", "URSSAF",
  "Caisse des dépôts", "Transitions Pro", "Opérateur CEP", "État / Régions",
];

// -----------------------------------------------------------------------------
//  DOSSIER MÉCALOIRE (accessible à toutes les étapes)
// -----------------------------------------------------------------------------
export const COMPANY = {
  title: "MécaLoire, l’entreprise fil rouge",
  sections: [
    {
      title: "Identité",
      blocks: [
        { t: "p", text: "PME industrielle (usinage, chaudronnerie, soudure) près de Saint-Étienne." },
        {
          t: "stats",
          items: [
            { value: "148", label: "salariés : 96 ouvriers · 34 techniciens & agents de maîtrise · 18 cadres" },
            { value: "5,2 M€", label: "de masse salariale annuelle" },
            { value: "60 k€", label: "de budget formation voté pour l’an prochain" },
          ],
        },
      ],
    },
    {
      title: "Enjeux stratégiques",
      blocks: [{ t: "list", items: ["Robotiser la soudure (2 robots livrés en mars)", "Décrocher la certification EN 9100 pour l’aéronautique", "Déployer un nouvel ERP en production"] }],
    },
    {
      title: "Ressources humaines",
      blocks: [{ t: "list", items: ["22 % des salariés ont plus de 55 ans", "3 savoir-faire critiques détenus par 1 seule personne", "Turnover élevé chez les moins de 30 ans"] }],
    },
    {
      title: "Points de vigilance",
      blocks: [{ t: "list", items: ["Recyclages CACES et habilitations électriques à échéance", "2 accidents du travail l’an dernier", "Entretiens professionnels très en retard"] }],
    },
    {
      title: "Instances",
      blocks: [
        { t: "list", items: ["CSE de 7 titulaires", "Pas d’accord GEPP (moins de 300 salariés)", "Consultation annuelle du CSE sur la formation"] },
        { t: "key", text: "148 salariés, donc 50 et plus : MécaLoire **doit consulter le CSE** sur la formation et **l’OPCO ne finance plus son plan** (sauf alternance et cas particuliers). Le budget de 60 k€ est un effort propre de l’entreprise, **en plus** des contributions obligatoires." },
      ],
    },
  ],
};

// -----------------------------------------------------------------------------
//  LES 4 ÉTAPES
// -----------------------------------------------------------------------------
export const STAGES = [
  // ===========================================================================
  //  ÉTAPE 1
  // ===========================================================================
  {
    n: 1,
    seance: "Séance 1 · 4 h",
    title: "Le cycle de formation",
    theme: "Fondamentaux & cycle de formation",
    cycle: "Demande → besoins",
    intro:
      "Avant de construire un plan, il faut parler la même langue. Vous allez maîtriser le vocabulaire de base, comprendre le cycle de formation à partir de vos propres expériences, et faire une première lecture du cas MécaLoire.",
    objectifs: [
      "Maîtriser le vocabulaire de base",
      "Comprendre le cycle de formation, du besoin au suivi",
      "Identifier les acteurs et leur rôle",
    ],
    livrable: "Schéma du cycle de formation annoté, illustré par les récits de l’équipe",

    fiche: [
      {
        title: "La formation professionnelle, tout au long de la vie",
        blocks: [
          {
            t: "cards",
            items: [
              { title: "Formation initiale", text: ["Avant l’entrée dans la vie active : école, université, apprentissage", "Objectif : obtenir un premier diplôme ou une qualification"] },
              { title: "Formation professionnelle continue", text: ["Pendant la vie active : salariés, demandeurs d’emploi, indépendants", "Objectif : s’adapter, évoluer, se reconvertir"] },
            ],
          },
          { t: "p", text: "**Lifelong learning** : apprendre ne s’arrête pas au diplôme, les compétences se renouvellent tout au long de la carrière." },
          { t: "p", text: "**Une « obligation nationale »** : Code du travail, art. **L6111-1**." },
          {
            t: "table",
            head: ["Date", "Repère"],
            rows: [
              ["1971", "Loi Delors : naissance du système"],
              ["2018", "Loi « Avenir professionnel » (5 septembre) : CPF en euros, OPCO, France compétences, plan de développement des compétences"],
              ["2025", "Loi du 24 octobre : entretien de parcours professionnel, période de reconversion"],
            ],
          },
        ],
      },
      {
        title: "Qu’est-ce qu’une compétence ?",
        blocks: [
          { t: "key", text: "Compétence = la capacité à **mobiliser des savoirs, savoir-faire et savoir-être** pour **agir efficacement dans une situation de travail**. (Le Boterf : « savoir agir en situation »)" },
          {
            t: "table",
            head: ["Dimension", "C’est…", "Exemple : soudeur"],
            rows: [
              ["Savoir", "Les connaissances", "Connaître les métaux, les normes de soudure, les règles de sécurité"],
              ["Savoir-faire", "La pratique, les gestes", "Régler un poste à souder, réaliser une soudure conforme"],
              ["Savoir-être", "Les comportements", "Rigueur, respect des consignes, coopération avec l’équipe"],
            ],
          },
          { t: "note", text: "Une compétence est **observable** et **liée à un contexte**. On évalue ce que la personne fait, pas ce qu’elle est. Le « savoir-être » est discuté (on parle aussi de compétences comportementales ou soft skills)." },
        ],
      },
      {
        title: "L’ingénierie de formation : trois niveaux",
        blocks: [
          {
            t: "table",
            head: ["Niveau", "Question", "Qui ?"],
            rows: [
              ["**Ingénierie des compétences** (stratégique)", "Quelles compétences l’entreprise doit-elle développer pour atteindre ses objectifs ?", "Direction, RH"],
              ["**Ingénierie de formation** (dispositif)", "Quel plan, quel parcours, pour qui, comment, avec quel budget et quelle évaluation ?", "Responsable formation, RH"],
              ["**Ingénierie pédagogique** (séquence)", "Quels objectifs pédagogiques, méthodes, supports et activités pour faire apprendre ?", "Formateur, concepteur"],
            ],
          },
          { t: "key", text: "Ce module (et ce jeu) se concentre sur l’**ingénierie de formation** : passer d’un besoin à un plan d’actions évalué." },
        ],
      },
      {
        title: "Employabilité et « employeurabilité »",
        blocks: [
          {
            t: "cards",
            items: [
              { title: "Employabilité", text: ["Capacité du salarié à occuper, conserver ou retrouver un emploi", "Dépend de ses compétences, de sa mobilité, de son réseau", "Le salarié en est acteur : CPF, bilan, VAE, CEP"] },
              { title: "« Employeurabilité »", text: ["Capacité de l’employeur à attirer, développer et retenir ses salariés", "Passe par une organisation qui fait apprendre", "L’employeur en est acteur : plan de développement des compétences, entretiens, mobilité interne"] },
            ],
          },
          { t: "key", text: "Une **responsabilité partagée** entre le salarié et l’employeur (l’employeur a une obligation légale, art. L6321-1 : voir étape 2)." },
        ],
      },
      {
        title: "Les 4 catégories d’actions (art. L6313-1)",
        blocks: [
          {
            t: "cards",
            items: [
              { title: "1 · Actions de formation", text: ["Parcours pédagogique pour atteindre un objectif professionnel", "En présentiel, à distance ou en situation de travail (AFEST)"] },
              { title: "2 · Bilan de compétences", text: ["Analyser ses compétences, aptitudes et motivations", "Définir un projet professionnel ou de formation"] },
              { title: "3 · Validation des acquis de l’expérience (VAE)", text: ["Obtenir tout ou partie d’une certification grâce à son expérience", "Passe par un dossier et un jury"] },
              { title: "4 · Formation par apprentissage", text: ["Alternance entre entreprise et centre de formation (CFA)", "Obtenir un diplôme ou un titre professionnel"] },
            ],
          },
          { t: "key", text: "Seuls les organismes certifiés **Qualiopi** peuvent être financés par des fonds publics ou mutualisés (OPCO, CPF…)." },
        ],
      },
      {
        title: "Le cycle de formation en 6 étapes",
        blocks: [
          {
            t: "table",
            head: ["Étape", "Question clé", "Qui est impliqué", "Outils", "Livrable"],
            rows: [
              ["1. Analyse de la demande", "Qui demande quoi, et pourquoi ?", "Demandeur (manager, salarié, direction), RH", "Entretien avec le demandeur", "Demande clarifiée et reformulée"],
              ["2. Analyse des besoins", "Quel écart de compétences ? Est-ce un sujet de formation ?", "RH, managers, salariés", "Entretiens, cartographie des compétences, observation", "Écarts de compétences identifiés"],
              ["3. Conception", "Quels objectifs, contenus, modalités, budget ?", "Responsable formation, prestataires", "Cahier des charges, référentiels", "Objectifs, programme, budget, choix du prestataire"],
              ["4. Réalisation", "Comment organiser et animer ?", "Formateur, stagiaires, RH", "Convocations, supports, feuilles d’émargement", "Formation réalisée"],
              ["5. Évaluation", "Qu’a-t-on appris ? Qu’est-ce qui a changé ?", "Stagiaires, managers, formateur", "Questionnaires, tests, mises en situation", "Résultats d’évaluation"],
              ["6. Suivi", "Les acquis sont-ils utilisés ? Que faut-il ajuster ?", "Managers, RH", "Entretien de retour, indicateurs", "Plan d’ajustement, nouveaux besoins"],
            ],
          },
          { t: "key", text: "**Toute demande de formation n’est pas un besoin de formation.** Exemple : un manager demande une formation Excel ; en réalité le reporting est saisi en double. La bonne réponse est peut-être un outil mieux paramétré. Et le suivi fait émerger de nouveaux besoins : **le cycle recommence**." },
        ],
      },
      {
        title: "Les acteurs : qui fait quoi ?",
        blocks: [
          {
            t: "cards",
            items: [
              { title: "État, régions & institutions", text: ["État : fixe le cadre légal", "Régions : formation des demandeurs d’emploi", "France compétences : régule, répartit les fonds, gère RNCP et RS", "URSSAF : collecte les contributions", "Caisse des dépôts : gère le CPF"] },
              { title: "Financeurs paritaires", text: ["OPCO : financent l’alternance et le plan des moins de 50 salariés, conseillent les branches", "Transitions Pro : financent les projets de transition professionnelle", "Branches professionnelles : priorités et accords"] },
              { title: "Dans l’entreprise", text: ["Direction : fixe les orientations", "RH / responsable formation : pilote le plan", "Managers : repèrent les besoins, accompagnent le retour", "CSE : consulté sur la formation"] },
              { title: "Autour du salarié", text: ["Le salarié : acteur de son parcours", "Organismes de formation (Qualiopi)", "Opérateurs du CEP : conseil gratuit et confidentiel", "Centres de bilan, certificateurs, jurys VAE"] },
            ],
          },
        ],
      },
    ],

    quests: [
      {
        id: "s1-vocab",
        title: "Le vocabulaire de base",
        type: "qcm",
        required: true,
        pass: 0.75,
        intro: "10 questions sur les définitions de la séance. Il faut au moins 75 % de bonnes réponses.",
        questions: [
          { q: "Qu’est-ce qu’une compétence ?", options: ["La capacité à mobiliser savoirs, savoir-faire et savoir-être pour agir efficacement en situation de travail", "L’ensemble des diplômes obtenus par une personne", "Un trait de personnalité stable", "Une connaissance théorique validée par un examen"], answer: 0, explain: "Une compétence est observable et liée à un contexte de travail." },
          { q: "La formation professionnelle continue concerne…", options: ["Les personnes déjà dans la vie active (salariés, demandeurs d’emploi, indépendants)", "Uniquement les élèves avant leur premier diplôme", "Uniquement les cadres", "Uniquement les demandeurs d’emploi"], answer: 0, explain: "La formation initiale a lieu avant l’entrée dans la vie active, la formation continue pendant." },
          { q: "Quel article du Code du travail fait de la formation tout au long de la vie une « obligation nationale » ?", options: ["L6111-1", "L6321-1", "L6313-1", "L2242-20"], answer: 0, explain: "L6321-1 = obligations de l’employeur, L6313-1 = les 4 catégories d’actions, L2242-20 = GEPP." },
          { q: "Quelle loi marque la naissance du système de formation professionnelle en 1971 ?", options: ["La loi Delors", "La loi « Avenir professionnel »", "La loi Auroux", "La loi du 24 octobre 2025"], answer: 0, explain: "1971 : loi Delors. 2018 : Avenir professionnel. 2025 : entretien de parcours professionnel." },
          { q: "Que crée la loi « Avenir professionnel » de 2018 ?", options: ["France compétences, les OPCO et le CPF en euros", "Le comité social et économique (CSE)", "La VAE", "Le contrat d’apprentissage"], answer: 0, explain: "Elle crée aussi le plan de développement des compétences, qui remplace le plan de formation." },
          { q: "L’ingénierie pédagogique, c’est…", options: ["Concevoir la séquence : objectifs pédagogiques, méthodes, supports, activités", "Définir les compétences dont l’entreprise a besoin pour sa stratégie", "Construire le plan et son budget", "Négocier l’accord GEPP"], answer: 0, explain: "Trois niveaux : compétences (stratégie), formation (dispositif), pédagogique (séquence)." },
          { q: "L’« employeurabilité » désigne…", options: ["La capacité de l’employeur à attirer, développer et retenir ses salariés", "La capacité du salarié à retrouver un emploi", "Le nombre d’emplois créés par une entreprise", "Le taux d’encadrement d’une équipe"], answer: 0, explain: "L’employabilité concerne le salarié ; l’employeurabilité concerne l’employeur. Responsabilité partagée." },
          { q: "Que signifie AFEST ?", options: ["Action de formation en situation de travail", "Aide financière à l’emploi et au salaire temporaire", "Accord de formation des entreprises sous-traitantes", "Attestation de fin d’études et de stage"], answer: 0, explain: "L’AFEST est une action de formation à part entière depuis 2018." },
          { q: "Quelle certification un organisme doit-il détenir pour être financé par un OPCO ou le CPF ?", options: ["Qualiopi", "ISO 9001", "EN 9100", "RNCP"], answer: 0, explain: "EN 9100 est la norme qualité aéronautique que vise MécaLoire, rien à voir avec la formation." },
          { q: "« Toute demande de formation… »", options: ["… n’est pas forcément un besoin de formation", "… doit être acceptée par l’employeur", "… doit passer par le CSE", "… est financée par l’OPCO"], answer: 0, explain: "L’analyse de la demande et des besoins évite de former pour rien." },
        ],
      },
      {
        id: "s1-cycle",
        title: "Remettre le cycle dans l’ordre",
        type: "order",
        required: true,
        pass: 1,
        intro: "Les 6 étapes du cycle de formation ont été mélangées. Remettez-les dans l’ordre (100 % requis).",
        items: ["Analyse de la demande", "Analyse des besoins", "Conception", "Réalisation", "Évaluation", "Suivi"],
        explain: "Demande → besoins → conception → réalisation → évaluation → suivi… et le suivi fait émerger de nouveaux besoins.",
      },
      {
        id: "s1-savoirs",
        title: "Savoir, savoir-faire ou savoir-être ?",
        type: "classify",
        required: true,
        pass: 0.8,
        intro: "Classez chaque élément dans la bonne dimension de la compétence.",
        categories: ["Savoir", "Savoir-faire", "Savoir-être"],
        items: [
          { text: "Connaître les normes de soudure", cat: 0 },
          { text: "Régler un poste à souder", cat: 1 },
          { text: "Respecter les consignes", cat: 2 },
          { text: "Connaître les propriétés des métaux", cat: 0 },
          { text: "Réaliser une soudure conforme", cat: 1 },
          { text: "Coopérer avec l’équipe", cat: 2 },
          { text: "Lire un plan technique", cat: 1 },
          { text: "Faire preuve de rigueur", cat: 2 },
          { text: "Connaître les règles de sécurité de l’atelier", cat: 0 },
          { text: "Créer un tableau croisé dynamique", cat: 1 },
        ],
      },
      {
        id: "s1-acteurs",
        title: "Qui fait quoi ?",
        type: "match",
        required: true,
        pass: 0.8,
        intro: "Associez chaque acteur à son rôle.",
        pairs: [
          { left: "France compétences", right: "Régule le système, répartit les fonds, gère RNCP et RS" },
          { left: "URSSAF", right: "Collecte les contributions des entreprises" },
          { left: "Caisse des dépôts", right: "Gère le CPF (Mon Compte Formation)" },
          { left: "OPCO", right: "Finance l’alternance et le plan des moins de 50 salariés" },
          { left: "Transitions Pro", right: "Finance les projets de transition professionnelle" },
          { left: "Régions", right: "Financent la formation des demandeurs d’emploi" },
          { left: "CSE", right: "Est consulté sur la formation" },
          { left: "Managers", right: "Repèrent les besoins, accompagnent le retour de formation" },
          { left: "Opérateurs du CEP", right: "Conseil en évolution gratuit et confidentiel" },
        ],
      },
      {
        id: "s1-categories",
        title: "Bonus · Les 4 catégories d’actions",
        type: "classify",
        required: false,
        pass: 0.8,
        intro: "Quête bonus : à quelle catégorie de l’article L6313-1 correspond chaque situation ?",
        categories: ["Action de formation", "Bilan de compétences", "VAE", "Apprentissage"],
        items: [
          { text: "Obtenir un CAP de chaudronnier en alternant entreprise et CFA", cat: 3 },
          { text: "Analyser ses compétences et motivations pour définir un projet", cat: 1 },
          { text: "Obtenir un titre professionnel grâce à 15 ans d’expérience, devant un jury", cat: 2 },
          { text: "Apprendre à programmer un robot en situation de travail (AFEST)", cat: 0 },
          { text: "Suivre une classe virtuelle sur le nouvel ERP", cat: 0 },
          { text: "Faire le point en 3 phases : préliminaire, investigation, conclusion", cat: 1 },
          { text: "Constituer un dossier pour faire reconnaître son expérience", cat: 2 },
          { text: "Préparer un BTS en contrat d’alternance avec un CFA", cat: 3 },
        ],
      },
    ],

    activity: {
      title: "Le schéma du cycle de formation",
      intro:
        "En séance, vous avez raconté vos meilleures et pires expériences de formation. Ici, vous les transformez en modèle : chaque récit est placé sur une étape du cycle, avec les acteurs concernés. Puis vous faites une première lecture de MécaLoire.",
      sections: [
        {
          title: "A. Nos récits « meilleure / pire formation »",
          help: "Notez au moins 6 moments clés tirés de vos récits (école, entreprise, sport, permis…). Pour chacun : réussite ou échec, avant / pendant / après, et l’étape du cycle concernée.",
          fields: [
            {
              id: "recits",
              type: "repeater",
              min: 6,
              addLabel: "Ajouter un moment clé",
              columns: [
                { id: "texte", label: "Moment clé", type: "textarea", placeholder: "Ex. : « On ne savait pas pourquoi on était là »" },
                { id: "type", label: "Réussite / échec", type: "select", options: ["Réussite", "Échec"] },
                { id: "moment", label: "Quand ?", type: "select", options: ["Avant", "Pendant", "Après"] },
                { id: "etape", label: "Étape du cycle", type: "select", options: CYCLE_STEPS },
              ],
            },
          ],
        },
        {
          title: "B. Le cycle illustré",
          help: "Pour chaque étape : un exemple réussi, un exemple raté (tirés de vos récits si possible), les acteurs qui interviennent et le livrable de l’étape.",
          fields: [
            {
              id: "cycle",
              type: "grid",
              rows: [
                { id: "demande", label: "1. Analyse de la demande", hint: "Qui demande quoi, et pourquoi ?" },
                { id: "besoins", label: "2. Analyse des besoins", hint: "Quel écart de compétences ? Est-ce un sujet de formation ?" },
                { id: "conception", label: "3. Conception", hint: "Quels objectifs, contenus, modalités, budget ?" },
                { id: "realisation", label: "4. Réalisation", hint: "Comment organiser et animer ?" },
                { id: "evaluation", label: "5. Évaluation", hint: "Qu’a-t-on appris ? Qu’est-ce qui a changé ?" },
                { id: "suivi", label: "6. Suivi", hint: "Les acquis sont-ils utilisés ? Que faut-il ajuster ?" },
              ],
              columns: [
                { id: "reussi", label: "Exemple réussi", type: "textarea" },
                { id: "rate", label: "Exemple raté", type: "textarea" },
                { id: "acteurs", label: "Acteurs", type: "chips", options: ACTEURS },
                { id: "livrable", label: "Outil / livrable de l’étape", type: "text" },
              ],
            },
          ],
        },
        {
          title: "C. La boucle",
          fields: [
            { id: "boucle", type: "textarea", label: "Comment le suivi fait-il émerger de nouveaux besoins ? Donnez un exemple concret.", placeholder: "Ex. : à 3 mois, le manager constate que…" },
          ],
        },
        {
          title: "D. Nos définitions",
          help: "Reformulez avec vos mots et illustrez par un exemple tiré de MécaLoire (consultez le dossier MécaLoire).",
          fields: [
            {
              id: "definitions",
              type: "grid",
              rows: [
                { id: "competence", label: "Compétence" },
                { id: "ingenierie", label: "Ingénierie de formation" },
                { id: "employabilite", label: "Employabilité / employeurabilité" },
              ],
              columns: [
                { id: "def", label: "Notre définition", type: "textarea" },
                { id: "exemple", label: "Exemple MécaLoire", type: "textarea" },
              ],
            },
          ],
        },
        {
          title: "E. Première lecture de MécaLoire",
          help: "Relevez au moins 4 éléments du dossier MécaLoire qui devront peser dans le futur plan. Pour chacun, dites de quel type d’enjeu il s’agit et si la formation est (ou non) une bonne réponse.",
          fields: [
            {
              id: "meca",
              type: "repeater",
              min: 4,
              addLabel: "Ajouter un élément",
              columns: [
                {
                  id: "element", label: "Élément du dossier", type: "select",
                  options: ["Robotisation de la soudure", "Certification EN 9100", "Nouvel ERP", "22 % de plus de 55 ans", "3 savoir-faire critiques détenus par 1 personne", "Turnover des moins de 30 ans", "Recyclages CACES / habilitations à échéance", "2 accidents du travail", "Entretiens professionnels en retard"],
                },
                { id: "type", label: "Type d’enjeu", type: "select", options: ["Stratégique", "Ressources humaines", "Obligation légale", "Sécurité"] },
                { id: "reponse", label: "Réponse envisagée", type: "select", options: ["Action de formation", "Bilan de compétences", "VAE", "Apprentissage", "Pas (seulement) une formation"] },
                { id: "pourquoi", label: "Pourquoi ?", type: "textarea" },
              ],
            },
          ],
        },
      ],
    },

    rubric: [
      { id: "etapes", label: "Les 6 étapes sont présentes, dans l’ordre", max: 3 },
      { id: "recits", label: "Chaque étape est illustrée par un récit", max: 4 },
      { id: "acteurs", label: "Les acteurs sont correctement placés", max: 3 },
      { id: "boucle", label: "La boucle est visible (le suivi relance les besoins)", max: 3 },
      { id: "meca", label: "Lecture de MécaLoire pertinente", max: 4 },
      { id: "clarte", label: "Lisible par quelqu’un qui n’a pas suivi la séance", max: 3 },
    ],

    corrige: [
      {
        title: "Un exemple de cycle illustré",
        blocks: [
          {
            t: "table",
            head: ["Étape", "Réussi", "Raté", "Acteurs", "Livrable"],
            rows: [
              ["1. Demande", "Le manager explique pourquoi il demande la formation ; on reformule", "« On ne savait pas pourquoi on était là »", "Demandeur, RH", "Demande clarifiée"],
              ["2. Besoins", "L’entretien révèle que le problème vient de l’outil, pas des compétences", "Formation Excel alors que le problème était une double saisie", "RH, managers, salariés", "Écarts identifiés (cartographie)"],
              ["3. Conception", "Cahier des charges précis, formateur qui connaît le métier", "« Le formateur ne connaissait pas notre métier »", "Responsable formation, prestataire Qualiopi", "Objectifs, programme, budget"],
              ["4. Réalisation", "Convocation claire, alternance théorie / pratique", "Convoqué la veille, salle non équipée", "Formateur, stagiaires, RH", "Émargement, formation réalisée"],
              ["5. Évaluation", "Test pratique en fin de formation", "Seulement un questionnaire de satisfaction", "Stagiaires, managers, formateur", "Résultats d’évaluation"],
              ["6. Suivi", "Entretien de retour avec le manager à 3 mois", "« Rien n’a changé au retour »", "Managers, RH", "Plan d’ajustement, nouveaux besoins"],
            ],
          },
          { t: "key", text: "La boucle : au suivi, on constate par exemple que les soudeurs formés aux robots ne savent pas encore gérer les pannes : c’est un **nouveau besoin**, qui relance l’analyse." },
        ],
      },
      {
        title: "Lecture de MécaLoire",
        blocks: [
          {
            t: "table",
            head: ["Élément", "Enjeu", "Réponse"],
            rows: [
              ["Robotisation", "Stratégique", "Action de formation (programmation des robots) : adaptation au poste"],
              ["3 savoir-faire critiques", "RH", "Transmission : tutorat, AFEST, et fidéliser le détenteur"],
              ["22 % de plus de 55 ans", "RH", "Transmission, entretiens de fin de carrière"],
              ["CACES / habilitations", "Obligation légale", "Formation obligatoire : non négociable"],
              ["Entretiens en retard", "Obligation légale", "Pas une formation : organiser les entretiens de parcours"],
              ["Turnover des jeunes", "RH", "Pas seulement une formation : intégration, perspectives, management"],
              ["2 accidents du travail", "Sécurité", "Analyser d’abord les causes : la formation n’est qu’une réponse possible"],
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================================
  //  ÉTAPE 2
  // ===========================================================================
  {
    n: 2,
    seance: "Séance 2 · 4 h",
    title: "Les règles du jeu",
    theme: "Cadre légal, droits des salariés & financement",
    cycle: "Cadre et moyens",
    intro:
      "Avant de choisir des actions, il faut connaître les règles : ce que l’employeur doit faire, ce que le salarié peut demander, et qui paie. Vous allez trouver le bon dispositif pour 6 salariés de MécaLoire et chiffrer ses contributions.",
    objectifs: [
      "Distinguer obligations de l’employeur et droits du salarié",
      "Associer chaque dispositif à son public et son financement",
      "Comprendre le circuit de financement",
    ],
    livrable: "Fiche mémo des dispositifs : pour qui, à l’initiative de qui, financement, temps de travail",

    fiche: [
      {
        title: "Ce que l’employeur doit faire (art. L6321-1)",
        blocks: [
          {
            t: "cards",
            items: [
              { title: "1 · Adapter au poste", sub: "Obligation", text: ["Former le salarié quand son poste évolue : nouvelle machine, nouveau logiciel, nouvelle procédure", "MécaLoire : former les soudeurs aux robots"] },
              { title: "2 · Maintenir l’employabilité", sub: "Obligation", text: ["Veiller à ce que le salarié reste capable d’occuper un emploi, face aux évolutions des métiers et technologies", "MécaLoire : préparer les métiers de demain"] },
              { title: "3 · Développer les compétences", sub: "Possibilité", text: ["Proposer des formations qui vont au-delà du poste actuel", "MécaLoire : former les chefs d’équipe au management"] },
            ],
          },
          { t: "key", text: "Ne pas former un salarié pendant des années expose l’employeur à des **dommages-intérêts** devant les prud’hommes (licenciement économique, insuffisance professionnelle)." },
        ],
      },
      {
        title: "Formation obligatoire ou non obligatoire ?",
        blocks: [
          {
            t: "table",
            head: ["", "Formation obligatoire", "Formation non obligatoire"],
            rows: [
              ["Définition", "Conditionne l’exercice d’une activité (loi, règlement, convention internationale)", "Tout le reste : management, langues, logiciels, qualité…"],
              ["Exemples", "CACES, habilitation électrique, FIMO/FCO", "Management, anglais, ERP…"],
              ["Quand ?", "Toujours pendant le temps de travail, rémunération maintenue", "En principe pendant le temps de travail"],
              ["Hors temps de travail ?", "Non", "Possible avec accord collectif ou accord écrit du salarié, **30 h par an** max (2 % du forfait jours)"],
              ["Refus du salarié", "Impossible", "Refuser une formation **hors** temps de travail n’est pas une faute"],
            ],
          },
          { t: "key", text: "Depuis 2018, le plan ne distingue plus que ces **2 catégories** (avant : adaptation, évolution, développement)." },
        ],
      },
      {
        title: "L’entretien de parcours professionnel (loi du 24 octobre 2025)",
        blocks: [
          {
            t: "steps",
            items: [
              { title: "1re année", text: "Premier entretien après l’embauche" },
              { title: "Tous les 4 ans", text: "Entretien de parcours professionnel" },
              { title: "Tous les 8 ans", text: "État des lieux récapitulatif" },
            ],
          },
          { t: "list", items: ["On parle : compétences, qualifications et leur évolution ; parcours et besoins de formation ; souhaits d’évolution (mobilité, reconversion, bilan, VAE) ; CPF, abondements possibles, CEP", "**Pas d’évaluation du travail** : ce n’est pas l’entretien annuel", "Vers **45 ans** : entretien renforcé après la visite médicale de mi-carrière", "Dans les **2 ans avant 60 ans** : entretien sur la fin de carrière"] },
          { t: "note", text: "Sanction (50 salariés et plus) : **3 000 € versés sur le CPF** du salarié si, en 8 ans, il n’a pas eu tous ses entretiens **et** aucune formation non obligatoire." },
        ],
      },
      {
        title: "Les droits du salarié : 6 dispositifs",
        blocks: [
          {
            t: "table",
            head: ["Dispositif", "Pour…", "En bref"],
            rows: [
              ["**CEP**", "Être conseillé", "Conseil en évolution professionnelle, gratuit et confidentiel, sans accord de l’employeur (France Travail, APEC, missions locales, Cap emploi, opérateurs régionaux). Souvent la première étape."],
              ["**Bilan de compétences**", "Faire le point", "24 h maximum, en 3 phases (préliminaire, investigation, conclusion). Résultats remis au seul salarié. Finançable par le CPF."],
              ["**VAE**", "Faire reconnaître", "Certification grâce à l’expérience : dossier + jury. Plateforme France VAE. Congé VAE de 48 h."],
              ["**CPF**", "Se former", "Compte personnel de formation, crédité en euros chaque année, géré par la Caisse des dépôts."],
              ["**PTP**", "Changer de métier", "Projet de transition professionnelle : formation certifiante longue. 24 mois d’activité dont 12 dans l’entreprise. Financé par Transitions Pro, salaire maintenu. L’employeur peut reporter, pas refuser."],
              ["**Période de reconversion**", "Évoluer avec l’employeur", "Depuis 2026 (fusion de Pro-A et Transitions collectives). Tout salarié, sans condition d’âge ni de diplôme. Mobilité interne ou externe (contrat suspendu). Financée par l’OPCO (forfait horaire)."],
            ],
          },
        ],
      },
      {
        title: "Le CPF en chiffres",
        blocks: [
          {
            t: "stats",
            items: [
              { value: "500 €", label: "par an, plafonné à 5 000 €" },
              { value: "800 €", label: "par an pour les moins qualifiés, plafonné à 8 000 €" },
              { value: "150 €", label: "de reste à charge par formation (depuis avril 2026), sauf abondement" },
            ],
          },
          { t: "list", items: ["Pour : certifications RNCP et RS, bilan de compétences, VAE, permis de conduire, création d’entreprise", "Plafonds (février 2026) : certification RS 1 500 € · bilan 1 600 € · permis B 900 € · RNCP, VAE, CléA sans plafond", "**Hors temps de travail** : pas besoin de l’accord de l’employeur (ni même de l’informer)", "**Sur le temps de travail** : demande **60 jours** avant (**120** si 6 mois et plus) ; réponse sous **30 jours**, silence = accord"] },
          { t: "note", text: "Ces montants évoluent souvent : à vérifier sur moncompteformation.gouv.fr." },
        ],
      },
      {
        title: "Qui paie ? Le circuit du financement",
        blocks: [
          {
            t: "steps",
            items: [
              { title: "Entreprises", text: "Contribution unique, via la DSN" },
              { title: "URSSAF", text: "Collecte" },
              { title: "France compétences", text: "Répartit" },
              { title: "Financeurs", text: "OPCO (alternance, plan des moins de 50) · Caisse des dépôts (CPF) · Transitions Pro (PTP) · État & régions (demandeurs d’emploi) · opérateurs CEP" },
            ],
          },
          {
            t: "table",
            head: ["Contribution", "Taux", "MécaLoire (5,2 M€)"],
            rows: [
              ["Formation professionnelle", "0,55 % (moins de 11 sal.) · 1 % (11 sal. et plus)", "≈ 52 000 €"],
              ["Taxe d’apprentissage", "0,68 %", "≈ 35 000 €"],
              ["CPF-CDD", "1 % des salaires des CDD", "selon CDD"],
            ],
          },
          {
            t: "cards",
            items: [
              { title: "Moins de 50 salariés", text: ["L’OPCO peut financer le plan (fonds mutualisés), selon les priorités de la branche", "Appui technique de l’OPCO"] },
              { title: "50 salariés et plus (MécaLoire)", text: ["Le plan est financé sur les **fonds propres**, en plus de la contribution obligatoire", "L’OPCO finance toujours l’alternance"] },
              { title: "Leviers complémentaires", text: ["Abonder le CPF du salarié (co-financement)", "Période de reconversion (OPCO)", "Alternance (OPCO)", "Formation interne, tutorat, AFEST"] },
            ],
          },
          { t: "key", text: "La contribution versée à l’URSSAF n’est **pas « récupérable »**. MécaLoire finance son plan de 60 k€ sur ses fonds propres." },
        ],
      },
    ],

    quests: [
      {
        id: "s2-rappel",
        title: "Quiz de rappel (séance 1)",
        type: "qcm",
        required: true,
        pass: 0.8,
        intro: "5 questions pour réactiver la séance 1.",
        questions: [
          { q: "Quelles sont les 3 dimensions d’une compétence ?", options: ["Savoir, savoir-faire, savoir-être", "Diplôme, expérience, motivation", "Connaissance, intelligence, personnalité", "Théorie, pratique, examen"], answer: 0, explain: "Mobilisées en situation de travail." },
          { q: "Quelles sont les 4 catégories d’actions de développement des compétences ?", options: ["Actions de formation, bilan de compétences, VAE, apprentissage", "CPF, CEP, PTP, VAE", "Présentiel, distanciel, blended, AFEST", "Adaptation, évolution, développement, reconversion"], answer: 0, explain: "Article L6313-1 du Code du travail." },
          { q: "Quelle est la première étape du cycle de formation ?", options: ["L’analyse de la demande", "L’analyse des besoins", "La conception", "Le choix du prestataire"], answer: 0, explain: "Qui demande quoi, et pourquoi ?" },
          { q: "Qui collecte les contributions des entreprises pour la formation ?", options: ["L’URSSAF, via la DSN", "L’OPCO", "France compétences", "La Caisse des dépôts"], answer: 0, explain: "L’URSSAF collecte, France compétences répartit." },
          { q: "Quelle certification un organisme de formation doit-il avoir pour être financé par un OPCO ou le CPF ?", options: ["Qualiopi", "ISO 9001", "RNCP", "EN 9100"], answer: 0, explain: "Qualiopi est obligatoire pour les fonds publics ou mutualisés." },
        ],
      },
      {
        id: "s2-sigles",
        title: "La soupe de sigles",
        type: "match",
        required: true,
        pass: 0.8,
        intro: "Associez chaque sigle à sa signification.",
        pairs: [
          { left: "CPF", right: "Compte personnel de formation" },
          { left: "CEP", right: "Conseil en évolution professionnelle" },
          { left: "PTP", right: "Projet de transition professionnelle" },
          { left: "VAE", right: "Validation des acquis de l’expérience" },
          { left: "OPCO", right: "Opérateur de compétences" },
          { left: "DSN", right: "Déclaration sociale nominative" },
          { left: "RNCP", right: "Répertoire national des certifications professionnelles" },
          { left: "RS", right: "Répertoire spécifique" },
          { left: "CACES", right: "Certificat d’aptitude à la conduite en sécurité" },
          { left: "FIMO", right: "Formation initiale minimale obligatoire (chauffeurs routiers)" },
        ],
      },
      {
        id: "s2-vraifaux",
        title: "Vrai ou faux ?",
        type: "classify",
        required: true,
        pass: 0.8,
        intro: "Droits et obligations : démêlez le vrai du faux.",
        categories: ["Vrai", "Faux"],
        items: [
          { text: "Un salarié peut refuser de suivre son recyclage CACES", cat: 1 },
          { text: "Refuser une formation hors temps de travail n’est pas une faute", cat: 0 },
          { text: "Une formation non obligatoire peut avoir lieu hors temps de travail, avec accord, dans la limite de 30 h par an", cat: 0 },
          { text: "Pour utiliser son CPF hors temps de travail, le salarié doit avoir l’accord de son employeur", cat: 1 },
          { text: "L’employeur peut refuser un PTP même si les conditions sont remplies", cat: 1 },
          { text: "Les résultats d’un bilan de compétences sont remis au seul salarié", cat: 0 },
          { text: "L’entretien de parcours professionnel sert à évaluer le travail de l’année", cat: 1 },
          { text: "MécaLoire (148 salariés) peut faire financer son plan par l’OPCO", cat: 1 },
          { text: "Le CEP est gratuit et confidentiel", cat: 0 },
          { text: "La période de reconversion est réservée aux salariés de plus de 45 ans", cat: 1 },
        ],
      },
      {
        id: "s2-chiffres",
        title: "Le juste chiffre",
        type: "qcm",
        required: true,
        pass: 0.75,
        intro: "Les chiffres clés à connaître par cœur.",
        questions: [
          { q: "Combien le CPF d’un salarié est-il crédité par an (cas général) ?", options: ["500 €", "800 €", "1 000 €", "150 €"], answer: 0, explain: "500 € par an, plafonné à 5 000 € (800 € / 8 000 € pour les moins qualifiés)." },
          { q: "Quel est le reste à charge du salarié par formation CPF depuis avril 2026 ?", options: ["150 €", "0 €", "100 €", "500 €"], answer: 0, explain: "Sauf demandeur d’emploi ou abondement de l’employeur ou de l’OPCO." },
          { q: "CPF sur le temps de travail, formation de moins de 6 mois : le salarié demande l’autorisation…", options: ["60 jours avant", "30 jours avant", "120 jours avant", "15 jours avant"], answer: 0, explain: "120 jours si la formation dure 6 mois ou plus. L’employeur a 30 jours pour répondre ; silence = accord." },
          { q: "Une formation non obligatoire hors temps de travail est limitée à…", options: ["30 h par an", "48 h par an", "24 h par an", "Aucune limite"], answer: 0, explain: "Ou 2 % du forfait pour les salariés en forfait jours." },
          { q: "À quelle fréquence a lieu l’entretien de parcours professionnel (après le premier) ?", options: ["Tous les 4 ans", "Tous les ans", "Tous les 2 ans", "Tous les 6 ans"], answer: 0, explain: "1re année, puis tous les 4 ans, et un état des lieux tous les 8 ans." },
          { q: "Montant de la sanction versée sur le CPF (50 salariés et plus) ?", options: ["3 000 €", "1 500 €", "5 000 €", "500 €"], answer: 0, explain: "Si en 8 ans : entretiens manquants et aucune formation non obligatoire." },
          { q: "Durée maximale d’un bilan de compétences ?", options: ["24 h", "48 h", "35 h", "12 h"], answer: 0, explain: "En 3 phases : préliminaire, investigation, conclusion." },
          { q: "Taux de la contribution formation pour une entreprise de 11 salariés et plus ?", options: ["1 % de la masse salariale", "0,55 %", "0,68 %", "2 %"], answer: 0, explain: "0,55 % sous 11 salariés ; la taxe d’apprentissage est de 0,68 %." },
        ],
      },
      {
        id: "s2-circuit",
        title: "Bonus · Le circuit de l’argent",
        type: "order",
        required: false,
        pass: 1,
        intro: "Quête bonus : remettez dans l’ordre le trajet de la contribution formation.",
        items: ["L’entreprise déclare et paie via la DSN", "L’URSSAF collecte", "France compétences répartit", "Les financeurs (OPCO, Caisse des dépôts, Transitions Pro…) financent les actions"],
        explain: "Entreprises → URSSAF → France compétences → financeurs.",
      },
    ],

    activity: {
      title: "Étude de cas : quel dispositif pour qui ?",
      intro:
        "6 salariés de MécaLoire ont une demande ou une situation particulière. Pour chacun, trouvez le dispositif le plus adapté, qui en a l’initiative, qui finance et sur quel temps. Votre tableau devient automatiquement votre fiche mémo.",
      sections: [
        {
          title: "A. Les 6 cas",
          help: "Plusieurs réponses sont parfois possibles : justifiez avec un article, une condition ou un chiffre de la fiche révision.",
          fields: [
            {
              id: "cas",
              type: "grid",
              rows: [
                { id: "karim", label: "1 · Karim, 34 ans, soudeur", hint: "8 ans d’ancienneté. Il veut devenir infirmier : une formation de 3 ans." },
                { id: "sylvie", label: "2 · Sylvie, 57 ans, contrôleuse qualité", hint: "30 ans d’expérience, aucun diplôme. Elle veut faire reconnaître son savoir-faire." },
                { id: "lucas", label: "3 · Lucas, 22 ans, cariste", hint: "Embauché le mois dernier. Son CACES expire dans 2 mois." },
                { id: "nadia", label: "4 · Nadia, 41 ans, assistante commerciale", hint: "Elle se sent bloquée, ne sait pas vers quoi évoluer et veut faire le point." },
                { id: "thomas", label: "5 · Thomas, 29 ans, technicien méthodes", hint: "Il veut passer une certification d’anglais en cours du soir, sans en parler à son chef." },
                { id: "mohamed", label: "6 · Mohamed, 50 ans, soudeur", hint: "Les robots vont réduire les postes de soudeurs. Il veut devenir programmeur des robots." },
              ],
              columns: [
                { id: "dispositif", label: "Dispositif(s)", type: "chips", options: ["CEP", "Bilan de compétences", "VAE", "CPF", "PTP", "Période de reconversion", "Plan : formation obligatoire", "Plan : formation non obligatoire", "Alternance"] },
                { id: "initiative", label: "À l’initiative de", type: "select", options: ["Salarié", "Employeur", "Les deux"] },
                { id: "financement", label: "Qui finance ?", type: "chips", options: ["Employeur (fonds propres)", "CPF", "Abondement employeur", "OPCO", "Transitions Pro", "Gratuit (CEP)"] },
                { id: "temps", label: "Sur quel temps ?", type: "select", options: ["Pendant le temps de travail, rémunéré", "Hors temps de travail, sans accord de l’employeur", "Congé spécifique, salaire maintenu", "Pendant ou hors temps de travail selon le cas"] },
                { id: "justif", label: "Justification", type: "textarea", placeholder: "Condition, article, chiffre…" },
              ],
            },
          ],
        },
        {
          title: "B. Notre fiche mémo",
          help: "Générée automatiquement à partir de vos réponses.",
          fields: [{ type: "memo", source: "cas" }],
        },
        {
          title: "C. Les chiffres de MécaLoire",
          help: "Masse salariale : 5,2 M€ · budget formation voté : 60 000 €.",
          fields: [
            { id: "contrib", type: "number", label: "Contribution formation professionnelle (€)", unit: "€" },
            { id: "taxe", type: "number", label: "Taxe d’apprentissage (€)", unit: "€" },
            { id: "effort", type: "number", label: "Effort de formation : budget / masse salariale (%)", unit: "%" },
            { id: "financeur_plan", type: "select", label: "Qui finance le plan de MécaLoire ?", options: ["L’OPCO (fonds mutualisés)", "MécaLoire, sur ses fonds propres", "France compétences", "L’URSSAF rembourse la contribution"] },
            { id: "financeur_justif", type: "textarea", label: "Pourquoi ?" },
          ],
        },
        {
          title: "D. Ce que ça change pour le plan de MécaLoire",
          fields: [
            { id: "obligations", type: "textarea", label: "Quelles obligations MécaLoire doit-elle absolument respecter dans son plan ? (pensez aux points de vigilance du dossier)" },
            { id: "risques", type: "textarea", label: "Les entretiens professionnels sont très en retard : quels risques, et que faire ?" },
            { id: "plan_vs_droits", type: "textarea", label: "Parmi les 6 cas, lesquels relèvent du plan de l’employeur, et lesquels des droits individuels du salarié ?" },
          ],
        },
      ],
    },

    rubric: [
      { id: "dispositifs", label: "Dispositifs justes pour les 6 cas", max: 6 },
      { id: "init_fin", label: "Initiative et financement corrects", max: 4 },
      { id: "temps", label: "Temps de travail et conditions maîtrisés", max: 3 },
      { id: "chiffres", label: "Chiffres de MécaLoire justes", max: 3 },
      { id: "analyse", label: "Analyse : obligations et conséquences pour le plan", max: 4 },
    ],

    corrige: [
      {
        title: "Corrigé de l’étude de cas",
        blocks: [
          {
            t: "table",
            head: ["Cas", "Dispositif", "Initiative", "Financement", "Temps de travail"],
            rows: [
              ["1 · Karim", "Projet de transition professionnelle (après un CEP)", "Salarié", "Transitions Pro", "Congé, salaire maintenu"],
              ["2 · Sylvie", "VAE", "Salariée", "CPF (+ abondement possible)", "Congé VAE 48 h ou hors temps"],
              ["3 · Lucas", "Formation obligatoire (plan)", "Employeur", "Employeur (fonds propres)", "Pendant, rémunéré"],
              ["4 · Nadia", "CEP puis bilan de compétences", "Salariée", "CEP gratuit · bilan : CPF", "Hors temps : sans accord"],
              ["5 · Thomas", "CPF : certification d’anglais", "Salarié", "CPF (150 € à sa charge)", "Hors temps : sans accord"],
              ["6 · Mohamed", "Période de reconversion interne ou plan", "Les deux", "OPCO ou employeur", "Pendant le temps de travail"],
            ],
          },
          { t: "list", items: ["Karim remplit la condition de 24 mois d’activité dont 12 dans l’entreprise ; l’employeur peut seulement reporter.", "Sylvie : plateforme France VAE ; son prochain entretien peut aussi aborder la fin de carrière.", "Lucas : le CACES conditionne la conduite du chariot ; MécaLoire a plus de 50 salariés, donc fonds propres.", "Nadia : bilan plafonné à 1 600 €, reste à charge de 150 € sauf abondement.", "Thomas : certification RS plafonnée à 1 500 €, aucune autorisation nécessaire hors temps de travail.", "Mohamed : obligation d’adaptation et de maintien dans l’emploi ; à aborder lors de son entretien de parcours."] },
          { t: "key", text: "Le **CEP** est presque toujours une bonne première étape quand le projet n’est pas encore clair." },
        ],
      },
      {
        title: "Les chiffres de MécaLoire",
        blocks: [
          { t: "list", items: ["Contribution formation : 5 200 000 × 1 % = **52 000 €**", "Taxe d’apprentissage : 5 200 000 × 0,68 % = **35 360 €** (≈ 35 000 €)", "Effort de formation : 60 000 / 5 200 000 ≈ **1,15 %** (hors contributions obligatoires)", "Le plan est financé sur les **fonds propres** (148 salariés, donc 50 et plus)"] },
          { t: "p", text: "Obligations : recyclages CACES et habilitations électriques (formations obligatoires), adaptation des soudeurs aux robots, entretiens de parcours à rattraper (sinon 3 000 € sur le CPF de chaque salarié concerné en cas de contrôle à 8 ans sans formation non obligatoire)." },
        ],
      },
    ],
  },

  // ===========================================================================
  //  ÉTAPE 3
  // ===========================================================================
  {
    n: 3,
    seance: "Séance 3 · 4 h",
    title: "Du besoin à la stratégie",
    theme: "Du besoin individuel à la stratégie",
    cycle: "Besoins → conception",
    intro:
      "Les besoins remontent des entretiens, la stratégie descend de la direction. Vous allez faire émerger les besoins réels de trois salariés, lire une cartographie des compétences, puis jouer le CODIR de MécaLoire : 78 900 € de demandes pour 60 000 € de budget.",
    objectifs: [
      "Mener un entretien et faire émerger le besoin réel",
      "Cartographier des compétences",
      "Relier les besoins à la stratégie de l’entreprise",
    ],
    livrable: "Grille d’entretien, cartographie, arbitrage budgétaire et 3 orientations prioritaires",

    fiche: [
      {
        title: "Entretien annuel ou entretien de parcours ?",
        blocks: [
          {
            t: "table",
            head: ["", "Entretien annuel d’évaluation", "Entretien de parcours professionnel"],
            rows: [
              ["Obligatoire ?", "Non (sauf convention ou accord)", "Oui (Code du travail)"],
              ["Regarde vers…", "Le passé : l’année écoulée", "L’avenir : le parcours"],
              ["Objet", "Résultats, atteinte des objectifs, performance", "Compétences, projet, besoins de formation, évolution"],
              ["Fréquence", "Chaque année en général", "1re année, puis tous les 4 ans"],
              ["Conséquences", "Objectifs, primes, augmentation", "Formations, mobilité, bilan, VAE"],
              ["Mené par", "Le manager", "Le manager ou les RH"],
            ],
          },
          { t: "key", text: "On peut les faire le même jour, mais **en deux temps distincts avec deux comptes rendus**." },
        ],
      },
      {
        title: "Besoin exprimé, besoin réel",
        blocks: [
          {
            t: "cards",
            items: [
              { title: "Besoin exprimé (la partie visible)", text: ["« Je veux une formation Excel »"] },
              { title: "Besoin réel (sous la surface)", text: ["Problème : les tableaux de production sont faux", "Causes : double saisie, outil mal paramétré", "Écart de compétences : tableaux croisés dynamiques"] },
            ],
          },
          {
            t: "steps",
            items: [
              { title: "Question 1", text: "Quelle situation de travail pose problème ?" },
              { title: "Question 2", text: "Quel écart entre ce qui est attendu et ce qui est fait ?" },
              { title: "Question 3", text: "Cet écart vient-il vraiment d’un manque de compétences ?" },
            ],
          },
          { t: "note", text: "Si la cause est l’organisation, les outils, le management ou la motivation, **la formation ne résoudra rien**." },
        ],
      },
      {
        title: "Mener l’entretien : structure et techniques",
        blocks: [
          {
            t: "steps",
            items: [
              { title: "1 · Accueillir", text: "Rappeler l’objectif et le cadre" },
              { title: "2 · Faire le bilan du parcours", text: "Postes, formations, compétences acquises" },
              { title: "3 · Explorer les souhaits", text: "Projet, mobilité, envies" },
              { title: "4 · Identifier les besoins", text: "Écarts, priorités, dispositifs" },
              { title: "5 · Conclure", text: "Synthèse, suite, compte rendu" },
            ],
          },
          {
            t: "cards",
            items: [
              { title: "Questions ouvertes", text: ["« Comment se passent tes missions ? »", "« Qu’est-ce qui te prend le plus de temps ? »"] },
              { title: "Reformulation", text: ["« Si je comprends bien, ce qui te gêne c’est… »", "Montre l’écoute, vérifie la compréhension"] },
              { title: "QQOQCP", text: ["Qui, quoi, où, quand, comment, pourquoi", "Pour creuser une demande vague"] },
              { title: "À éviter", text: ["Promettre une formation sur-le-champ", "Juger, couper la parole, mélanger avec l’évaluation"] },
            ],
          },
          { t: "p", text: "**Grille d’observation** : cadre et objectif annoncés · questions ouvertes · reformulation · écoute (le salarié parle 2/3 du temps) · besoin réel identifié · aucune promesse hâtive · synthèse et suite claires." },
        ],
      },
      {
        title: "Cartographier les compétences",
        blocks: [
          { t: "p", text: "La cartographie croise les salariés (ou les postes) et les compétences requises, avec un niveau pour chacune." },
          { t: "p", text: "**Échelle** : 1 = notions · 2 = applique avec aide · 3 = autonome · 4 = expert, sait transmettre." },
          { t: "list", items: ["Repérer les écarts avec le niveau requis", "Repérer les compétences rares ou critiques (une seule personne)", "Organiser la polyvalence", "Préparer le plan et les recrutements"] },
        ],
      },
      {
        title: "De la stratégie aux compétences",
        blocks: [
          {
            t: "steps",
            items: [
              { title: "Orientations stratégiques", text: "Robotiser la soudure" },
              { title: "Métiers impactés", text: "Soudeurs, techniciens maintenance" },
              { title: "Compétences cibles", text: "Programmer et surveiller un robot" },
              { title: "Écarts avec l’existant", text: "Personne n’est autonome" },
              { title: "Réponses", text: "Former, recruter, transmettre" },
            ],
          },
          {
            t: "table",
            head: ["Les « 5 B »", "Signification", "Exemple MécaLoire"],
            rows: [
              ["**Build**", "Former", "Former les soudeurs aux robots"],
              ["**Buy**", "Recruter", "Recruter un roboticien"],
              ["**Borrow**", "Faire appel à l’extérieur (intérim, prestataire)", "Prestataire pour la maintenance des robots"],
              ["**Bind**", "Fidéliser", "Garder Paul le temps de transmettre"],
              ["**Bounce**", "Se séparer, reclasser", "Accompagner un reclassement"],
            ],
          },
          { t: "key", text: "La formation n’est **qu’une réponse parmi d’autres**." },
        ],
      },
      {
        title: "La GEPP et le plan de développement des compétences",
        blocks: [
          {
            t: "steps",
            items: [
              { title: "1 · Diagnostic", text: "Pyramide des âges, cartographie, départs prévus" },
              { title: "2 · Projection", text: "Métiers et compétences nécessaires à 3 ans" },
              { title: "3 · Écarts", text: "Ce qui manque, ce qui sera en trop" },
              { title: "4 · Plan d’action", text: "Formation, recrutement, mobilité, transmission" },
            ],
          },
          { t: "list", items: ["GEPP = gestion des emplois et des parcours professionnels (ancienne GPEC, renommée en **2017**)", "Négociation obligatoire **tous les 3 ans à partir de 300 salariés** (art. L2242-20)", "MécaLoire (148 salariés) : pas d’obligation de négocier, mais **consultation annuelle du CSE** sur les orientations stratégiques et la formation"] },
          { t: "p", text: "**Plan de développement des compétences** (depuis 2018, remplace le plan de formation) : l’ensemble des actions décidées par l’employeur. Contenu : formations obligatoires, non obligatoires, bilans, VAE, AFEST, tutorat. Construction : besoins individuels (entretiens) + besoins collectifs (stratégie, GEPP) + obligations légales. Validation : arbitrage de la direction, consultation du CSE (50 salariés et plus)." },
          { t: "key", text: "Les **formations obligatoires passent en premier**, puis on arbitre le reste selon les priorités stratégiques. Le plan traduit la stratégie, pas une somme de demandes." },
        ],
      },
    ],

    quests: [
      {
        id: "s3-entretiens",
        title: "Annuel ou parcours ?",
        type: "classify",
        required: true,
        pass: 0.75,
        intro: "Chaque affirmation concerne-t-elle l’entretien annuel d’évaluation ou l’entretien de parcours professionnel ?",
        categories: ["Entretien annuel", "Entretien de parcours"],
        items: [
          { text: "Obligatoire selon le Code du travail", cat: 1 },
          { text: "Regarde l’année écoulée", cat: 0 },
          { text: "Fixe des objectifs et peut conduire à une prime", cat: 0 },
          { text: "Aborde le CPF, le CEP et les abondements possibles", cat: 1 },
          { text: "A lieu la 1re année, puis tous les 4 ans", cat: 1 },
          { text: "Évalue les résultats et la performance", cat: 0 },
          { text: "Débouche sur des formations, une mobilité, une VAE", cat: 1 },
          { text: "N’est obligatoire que si une convention ou un accord le prévoit", cat: 0 },
        ],
      },
      {
        id: "s3-pratiques",
        title: "Les bons réflexes d’entretien",
        type: "classify",
        required: true,
        pass: 0.8,
        intro: "À faire ou à éviter pendant un entretien de parcours ?",
        categories: ["À faire", "À éviter"],
        items: [
          { text: "« Comment se passent tes missions ? »", cat: 0 },
          { text: "« Si je comprends bien, ce qui te gêne c’est… »", cat: 0 },
          { text: "« Pas de souci, je t’inscris en formation Excel la semaine prochaine. »", cat: 1 },
          { text: "Rappeler l’objectif et le cadre au début", cat: 0 },
          { text: "Revenir sur les erreurs de l’année", cat: 1 },
          { text: "Utiliser le QQOQCP pour creuser une demande vague", cat: 0 },
          { text: "Couper la parole pour gagner du temps", cat: 1 },
          { text: "Laisser le salarié parler les 2/3 du temps", cat: 0 },
          { text: "Conclure par une synthèse et la suite donnée", cat: 0 },
          { text: "Juger le projet du salarié irréaliste", cat: 1 },
        ],
      },
      {
        id: "s3-5b",
        title: "Les 5 B",
        type: "match",
        required: true,
        pass: 0.8,
        intro: "La formation n’est qu’une réponse parmi d’autres. Associez chaque situation à son « B ».",
        pairs: [
          { left: "Former les soudeurs à la programmation des robots", right: "Build (former)" },
          { left: "Recruter un roboticien expérimenté", right: "Buy (recruter)" },
          { left: "Confier la maintenance des robots à un prestataire", right: "Borrow (faire appel à l’extérieur)" },
          { left: "Aménager le poste de Paul pour qu’il reste le temps de transmettre", right: "Bind (fidéliser)" },
          { left: "Accompagner le reclassement d’un salarié dont le poste disparaît", right: "Bounce (se séparer, reclasser)" },
        ],
      },
      {
        id: "s3-strategie",
        title: "Besoin, stratégie et plan",
        type: "qcm",
        required: true,
        pass: 0.75,
        intro: "8 questions sur l’analyse des besoins, la GEPP et le plan.",
        questions: [
          { q: "Un manager demande une formation Excel ; les tableaux sont faux à cause d’une double saisie. Meilleure réponse ?", options: ["Revoir l’outil et l’organisation de la saisie avant d’envisager une formation", "Inscrire toute l’équipe à une formation Excel", "Refuser la demande", "Proposer un bilan de compétences"], answer: 0, explain: "Si la cause est l’outil ou l’organisation, la formation ne résoudra rien." },
          { q: "Quelle est la première question pour passer de la demande au besoin ?", options: ["Quelle situation de travail pose problème ?", "Quel est le budget disponible ?", "Quel prestataire choisir ?", "Combien de jours de formation ?"], answer: 0, explain: "Puis : quel écart ? Cet écart vient-il d’un manque de compétences ?" },
          { q: "Dans l’échelle de cartographie, le niveau 4 signifie…", options: ["Expert, sait transmettre", "Autonome", "Applique avec aide", "Notions"], answer: 0, explain: "1 notions · 2 avec aide · 3 autonome · 4 expert, sait transmettre." },
          { q: "Une compétence détenue par une seule personne proche de la retraite est…", options: ["Une compétence critique à transmettre", "Une compétence couverte", "Une compétence à supprimer", "Un sujet pour l’entretien annuel"], answer: 0, explain: "C’est le cas du soudage TIG titane de Paul : tutorat, AFEST." },
          { q: "La négociation GEPP est obligatoire…", options: ["Tous les 3 ans à partir de 300 salariés", "Chaque année à partir de 50 salariés", "Tous les 4 ans pour toutes les entreprises", "Jamais"], answer: 0, explain: "MécaLoire (148 salariés) n’y est pas obligée, mais consulte son CSE chaque année." },
          { q: "Depuis 2018, le plan de développement des compétences remplace…", options: ["Le plan de formation", "La GEPP", "Le CPF", "Le bilan social"], answer: 0, explain: "Loi Avenir professionnel du 5 septembre 2018." },
          { q: "Lors de l’arbitrage du plan, que retient-on en premier ?", options: ["Les formations obligatoires", "Les demandes les plus anciennes", "Les formations les moins chères", "Les demandes des cadres"], answer: 0, explain: "Puis on arbitre le reste selon les priorités stratégiques." },
          { q: "Le plan de développement des compétences, c’est…", options: ["La traduction de la stratégie en actions, pas une somme de demandes", "La liste de toutes les demandes individuelles", "Un document imposé par l’OPCO", "Le budget de la taxe d’apprentissage"], answer: 0, explain: "Il combine besoins individuels, besoins collectifs et obligations légales." },
        ],
      },
      {
        id: "s3-temps",
        title: "Bonus · Les 5 temps de l’entretien",
        type: "order",
        required: false,
        pass: 1,
        intro: "Quête bonus : remettez les 5 temps de l’entretien dans l’ordre.",
        items: ["Accueillir : objectif et cadre", "Faire le bilan du parcours", "Explorer les souhaits", "Identifier les besoins", "Conclure : synthèse et suite"],
        explain: "Un entretien de 15 à 45 minutes en 5 temps.",
      },
    ],

    activity: {
      title: "De l’entretien au CODIR",
      intro:
        "Partie 1 : préparer et exploiter les entretiens (jeu de rôle en trio). Partie 2 : lire la cartographie. Partie 3 : vous êtes le CODIR de MécaLoire et vous arbitrez le budget, puis vous rédigez 3 orientations prioritaires.",
      sections: [
        {
          title: "A. Notre grille d’entretien",
          help: "Pour chaque temps de l’entretien, écrivez la question (ouverte !) ou la phrase que le manager utilisera.",
          fields: [
            {
              id: "grille",
              type: "grid",
              rows: [
                { id: "accueil", label: "1 · Accueillir", hint: "Rappeler l’objectif et le cadre" },
                { id: "parcours", label: "2 · Bilan du parcours", hint: "Postes, formations, compétences acquises" },
                { id: "souhaits", label: "3 · Explorer les souhaits", hint: "Projet, mobilité, envies" },
                { id: "besoins", label: "4 · Identifier les besoins", hint: "Écarts, priorités, dispositifs" },
                { id: "conclure", label: "5 · Conclure", hint: "Synthèse, suite, compte rendu" },
              ],
              columns: [{ id: "question", label: "Notre question / phrase type", type: "textarea" }],
            },
            { id: "reformulation", type: "text", label: "Une phrase de reformulation" },
          ],
        },
        {
          title: "B. Les 3 entretiens du jeu de rôle",
          help: "Après le jeu de rôle, analysez chaque scénario : du besoin exprimé au besoin réel, puis la réponse adaptée.",
          fields: [
            {
              id: "scenarios",
              type: "grid",
              rows: [
                { id: "julie", label: "A · Julie, 31 ans, agente d’ordonnancement", hint: "Le manager sait que ses tableaux de production contiennent souvent des erreurs. Un nouvel ERP arrive dans 6 mois." },
                { id: "paul", label: "B · Paul, 59 ans, soudeur expert", hint: "Le manager sait que Paul est le seul à maîtriser le soudage TIG sur titane, essentiel pour l’aéronautique." },
                { id: "ines", label: "C · Inès, 27 ans, opératrice CN", hint: "Le manager sait qu’un chef d’équipe part en retraite l’an prochain. Inès est appréciée de ses collègues." },
              ],
              columns: [
                { id: "exprime", label: "Besoin exprimé", type: "text" },
                { id: "reel", label: "Besoin réel", type: "textarea" },
                { id: "cause", label: "Nature de l’écart", type: "select", options: ["Manque de compétences", "Organisation / outil", "Reconnaissance / motivation", "Projet d’évolution", "Transmission d’un savoir-faire critique"] },
                { id: "b5", label: "Réponse (5 B)", type: "chips", options: ["Build", "Buy", "Borrow", "Bind", "Bounce"] },
                { id: "dispositif", label: "Dispositif(s)", type: "chips", options: ["Plan : formation", "AFEST", "Tutorat", "CPF", "CEP", "VAE", "Bilan de compétences", "Période de reconversion", "Aménagement de fin de carrière"] },
              ],
            },
            { id: "observation", type: "textarea", label: "Retour des observateurs : qu’est-ce qui a permis de faire émerger le besoin réel ? Qu’est-ce qui a bloqué ?" },
          ],
        },
        {
          title: "C. Lire la cartographie de MécaLoire",
          fields: [
            {
              type: "info",
              blocks: [
                {
                  t: "table",
                  head: ["Salarié", "Soudage MIG", "Soudage TIG titane", "Lecture de plans", "Programmation robot", "ERP production"],
                  rows: [
                    ["Paul", "4", "4", "4", "–", "1"],
                    ["Mohamed", "4", "2", "3", "–", "2"],
                    ["Karim", "3", "1", "3", "–", "2"],
                    ["Inès", "2", "–", "3", "1", "3"],
                    ["**Niveau requis**", "3", "3", "3", "3", "3"],
                  ],
                },
                { t: "p", text: "Échelle : 1 = notions · 2 = applique avec aide · 3 = autonome · 4 = expert, sait transmettre." },
              ],
            },
            {
              id: "carto",
              type: "grid",
              rows: [
                { id: "mig", label: "Soudage MIG" },
                { id: "tig", label: "Soudage TIG titane" },
                { id: "plans", label: "Lecture de plans" },
                { id: "robot", label: "Programmation robot" },
                { id: "erp", label: "ERP production" },
              ],
              columns: [
                { id: "diag", label: "Diagnostic", type: "select", options: ["Compétence couverte", "Écart à combler (formation prioritaire)", "Compétence critique à transmettre", "Écart à surveiller"] },
                { id: "reponse", label: "Réponse envisagée", type: "text" },
              ],
            },
          ],
        },
        {
          title: "D. La cartographie de notre équipe",
          help: "Chacun s’auto-évalue de 1 à 4. Puis lisez : quelles compétences sont rares ? Qui peut former les autres ?",
          fields: [
            {
              id: "selfmap",
              type: "repeater",
              min: 2,
              addLabel: "Ajouter un membre",
              average: true,
              columns: [
                { id: "nom", label: "Membre", type: "text" },
                { id: "tableur", label: "Tableur", type: "select", options: ["1", "2", "3", "4"], numeric: true },
                { id: "oral", label: "Prise de parole", type: "select", options: ["1", "2", "3", "4"], numeric: true },
                { id: "projet", label: "Gestion de projet", type: "select", options: ["1", "2", "3", "4"], numeric: true },
                { id: "anglais", label: "Anglais pro", type: "select", options: ["1", "2", "3", "4"], numeric: true },
                { id: "droit", label: "Droit social", type: "select", options: ["1", "2", "3", "4"], numeric: true },
                { id: "reunion", label: "Animation de réunion", type: "select", options: ["1", "2", "3", "4"], numeric: true },
              ],
            },
            { id: "selfmap_lecture", type: "textarea", label: "Notre lecture : compétences rares, qui peut former qui, priorités pour notre futur métier" },
          ],
        },
        {
          title: "E. Le CODIR : répartition des rôles",
          help: "Chacun défend ses priorités. Le DRH garantit le respect des obligations.",
          fields: [
            {
              id: "roles",
              type: "grid",
              rows: [
                { id: "dg", label: "Directeur général", hint: "Robotisation et certification aéronautique" },
                { id: "drh", label: "DRH", hint: "Obligations légales, seniors, fidélisation des jeunes" },
                { id: "prod", label: "Directeur de production", hint: "Productivité, sécurité, ERP" },
                { id: "qualite", label: "Directrice qualité", hint: "Certification EN 9100, réduction des rebuts" },
              ],
              columns: [{ id: "membre", label: "Joué par", type: "text" }],
            },
          ],
        },
        {
          title: "F. Le CODIR : arbitrer 60 000 €",
          help: "Le catalogue chiffré dépasse le budget. Pour chaque action : retenir, réduire, reporter ou financer autrement. Le compteur se met à jour en direct.",
          fields: [{ id: "codir", type: "codir" }],
        },
        {
          title: "G. Nos 3 orientations prioritaires",
          help: "Chaque orientation est reliée à un objectif stratégique et regroupe des actions retenues.",
          fields: [
            {
              id: "orientations",
              type: "grid",
              rows: [
                { id: "o1", label: "Orientation 1" },
                { id: "o2", label: "Orientation 2" },
                { id: "o3", label: "Orientation 3" },
              ],
              columns: [
                { id: "titre", label: "Intitulé de l’orientation", type: "text", placeholder: "Ex. : Réussir la robotisation" },
                { id: "objectif", label: "Objectif stratégique", type: "select", options: STRATEGIC_GOALS },
                { id: "actions", label: "Actions rattachées", type: "chips", options: CATALOG.map((c) => c.action) },
                { id: "justif", label: "Justification", type: "textarea" },
              ],
            },
            { id: "reportes", type: "textarea", label: "Ce qui est reporté ou financé autrement, et pourquoi" },
          ],
        },
      ],
    },

    rubric: [
      { id: "grille", label: "Grille d’entretien (questions ouvertes, 5 temps)", max: 3 },
      { id: "besoins", label: "Besoins réels identifiés pour les 3 scénarios", max: 5 },
      { id: "carto", label: "Lecture de la cartographie", max: 3 },
      { id: "arbitrage", label: "Arbitrage budgétaire et obligations respectées", max: 5 },
      { id: "orientations", label: "3 orientations reliées à la stratégie", max: 4 },
    ],

    corrige: [
      {
        title: "Les 3 scénarios",
        blocks: [
          {
            t: "table",
            head: ["Scénario", "Besoin exprimé", "Besoin réel", "Réponse"],
            rows: [
              ["A · Julie", "Une formation Excel", "Mieux maîtriser les tableaux de bord de l’ERP ; à terme évoluer vers la planification", "Formation ERP (Build), parcours vers la planification, info CPF / CEP. La formation Excel n’est pas la bonne réponse."],
              ["B · Paul", "Rien : « Je pars dans 3 ans »", "Pour l’entreprise : transmettre le TIG titane. Pour Paul : reconnaissance, lever le pied", "Tutorat / AFEST (Build + Bind), aménagement de fin de carrière, entretien de fin de carrière"],
              ["C · Inès", "« Évoluer »", "Devenir cheffe d’équipe (un départ en retraite l’an prochain)", "Formation au management de proximité, éventuellement VAE ou certification ; l’informer du CPF et du CEP"],
            ],
          },
        ],
      },
      {
        title: "La cartographie",
        blocks: [
          { t: "list", items: ["**Programmation robot** : personne n’est autonome alors que les robots arrivent en mars : formation prioritaire.", "**TIG titane** : un seul expert (Paul), qui part dans 3 ans : compétence critique à transmettre (AFEST, tutorat).", "**ERP** : niveau général faible avant le déploiement : formation à prévoir.", "**MIG** et **lecture de plans** : globalement couverts (Inès à accompagner sur le MIG)."] },
        ],
      },
      {
        title: "Un exemple d’arbitrage (il n’y a pas de bonne réponse unique)",
        blocks: [
          {
            t: "table",
            head: ["Action", "Décision", "Imputé au budget"],
            rows: [
              ["Habilitation électrique + CACES", "Retenir (obligatoire)", "10 800 €"],
              ["Programmation des robots", "Retenir", "14 000 €"],
              ["Tutorat / AFEST seniors", "Retenir", "7 500 €"],
              ["ERP production", "Retenir", "9 000 €"],
              ["Auditeurs internes EN 9100", "Retenir", "6 400 €"],
              ["Management de proximité", "Réduire à 6 chefs d’équipe cette année", "9 000 €"],
              ["Anglais technique", "Financer autrement : CPF + abondement", "≈ 3 000 €"],
              ["Bilans de compétences", "Financer autrement : CPF / reporter", "0 €"],
              ["**Total**", "", "**≈ 59 700 €**"],
            ],
          },
          { t: "p", text: "Et la reconversion de Mohamed vers la programmation des robots peut passer par la **période de reconversion** financée par l’OPCO." },
          { t: "note", text: "Pièges : retirer les recyclages CACES et habilitations (obligatoires) est une erreur. Le tutorat seniors répond à la fois au départ de Paul et à la certification aéronautique." },
        ],
      },
    ],
  },

  // ===========================================================================
  //  ÉTAPE 4
  // ===========================================================================
  {
    n: 4,
    seance: "Séance 4 · 2 h",
    title: "Construire et défendre le plan",
    theme: "Construire et défendre le plan",
    cycle: "Conception → évaluation → suivi",
    intro:
      "Dernière ligne droite : vos 3 orientations deviennent un plan de développement des compétences chiffré, avec un cahier des charges, des indicateurs… et un oral de 8 minutes devant le CSE.",
    objectifs: [
      "Traduire des orientations en plan chiffré",
      "Rédiger un cahier des charges",
      "Présenter et défendre le plan devant le CSE",
    ],
    livrable: "Plan de développement des compétences budgété, cahier des charges d’une action, oral de 8 min",

    fiche: [
      {
        title: "La trame du plan",
        blocks: [
          {
            t: "table",
            head: ["Orientation", "Action", "Public", "Modalité", "Durée & période", "Coût", "Financement", "Indicateur"],
            rows: [["Réussir la robotisation", "Programmation des robots de soudure", "8 soudeurs", "Présentiel + AFEST", "35 h · mars-avril", "14 000 €", "Fonds propres", "8 soudeurs autonomes à 3 mois"]],
          },
          { t: "key", text: "Une ligne par action · chaque action rattachée à une orientation · **un indicateur mesurable par action** · total ≤ 60 000 € (coûts pédagogiques ; les salaires des stagiaires sont un coût indirect à signaler)." },
        ],
      },
      {
        title: "Choisir les modalités pédagogiques",
        blocks: [
          {
            t: "cards",
            items: [
              { title: "Présentiel", text: ["Interactions, gestes techniques", "Coûteux, mobilise les équipes"] },
              { title: "Distanciel", text: ["Synchrone (classe virtuelle) ou asynchrone (e-learning)", "Souple, mais demande de l’autonomie"] },
              { title: "Blended (mixte)", text: ["Théorie à distance, pratique en salle", "Le meilleur des deux"] },
              { title: "AFEST", text: ["Formation en situation de travail", "4 conditions : analyse de l’activité, formateur désigné, phases réflexives, évaluation des acquis"] },
              { title: "Tutorat", text: ["Un salarié expérimenté transmet", "Idéal pour les savoir-faire rares"] },
              { title: "Coaching", text: ["Accompagnement individuel", "Pour managers et prises de poste"] },
            ],
          },
          { t: "p", text: "Choisir selon l’objectif, le public et les contraintes (production, horaires postés, dispersion géographique). Exemple : la transmission du TIG titane de Paul se prête parfaitement à l’AFEST." },
        ],
      },
      {
        title: "Chiffrer le budget",
        blocks: [
          {
            t: "table",
            head: ["Poste", "Contenu", "Exemple : formation robots"],
            rows: [
              ["Coûts pédagogiques", "Prestataire, formateur, supports, certification", "14 000 €"],
              ["Salaires des stagiaires", "Temps passé en formation", "8 × 35 h × 28 € = 7 840 €"],
              ["Frais annexes", "Déplacement, repas, hébergement", "0 €"],
              ["**Coût complet**", "", "**21 840 €**"],
            ],
          },
          { t: "list", items: ["Optimiser : formation intra plutôt qu’inter-entreprises, formateurs internes, tutorat, AFEST, co-financement CPF (abondement), période de reconversion (OPCO)", "Indicateur pour le CSE : **budget / masse salariale** (MécaLoire : 60 000 / 5 200 000 ≈ 1,15 %)"] },
        ],
      },
      {
        title: "Le cahier des charges d’une action",
        blocks: [
          {
            t: "steps",
            items: [
              { title: "1 · Contexte", text: "L’entreprise, le projet, pourquoi cette formation" },
              { title: "2 · Objectifs", text: "Ce que les stagiaires sauront faire à l’issue" },
              { title: "3 · Public", text: "Nombre, postes, niveau de départ" },
              { title: "4 · Contenu attendu", text: "Grands thèmes, sans imposer la pédagogie" },
              { title: "5 · Modalités", text: "Lieu, durée, période, présentiel ou distanciel" },
              { title: "6 · Évaluation", text: "Comment mesurer les acquis et le transfert" },
              { title: "7 · Budget & calendrier", text: "Enveloppe, date de réponse, date de démarrage" },
              { title: "8 · Critères de choix", text: "Pédagogie, expertise, prix, Qualiopi, références" },
            ],
          },
          { t: "key", text: "Le cahier des charges **décrit le besoin, pas la solution** : on laisse le prestataire proposer sa pédagogie. Exiger Qualiopi en cas de co-financement public ou mutualisé." },
        ],
      },
      {
        title: "Présenter le plan au CSE",
        blocks: [
          { t: "list", items: ["Entreprises de **50 salariés et plus**", "Consultation annuelle sur les **orientations stratégiques** (GEPP, orientations de la formation) et sur la **politique sociale** (plan de développement des compétences)", "Documents dans la **BDESE**", "**Avis consultatif** : l’employeur décide, mais après avoir consulté", "Commission formation à partir de **300 salariés**"] },
          { t: "p", text: "**Les questions que posent les élus** : Les ouvriers ont-ils autant accès à la formation que les cadres ? Égalité femmes-hommes, temps partiel, seniors ? Des formations hors temps de travail ? Que reste-t-il une fois les obligatoires payées ? Le plan de l’an dernier a-t-il été réalisé ?" },
          {
            t: "table",
            head: ["Oral : plan conseillé", "Durée"],
            rows: [["Contexte et enjeux", "1 min"], ["Les 3 orientations", "2 min"], ["Les actions et le budget", "3 min"], ["Évaluation et suivi", "2 min"]],
          },
        ],
      },
      {
        title: "Évaluer : les 4 niveaux de Kirkpatrick",
        blocks: [
          {
            t: "table",
            head: ["Niveau", "Question", "Exemple : formation robots"],
            rows: [
              ["1 · Réaction", "Les stagiaires sont-ils satisfaits ?", "Questionnaire à chaud"],
              ["2 · Apprentissage", "Qu’a-t-on appris ?", "Test pratique en fin de formation"],
              ["3 · Comportement", "Les acquis sont-ils utilisés au travail ?", "À 3 mois, les soudeurs programment seuls"],
              ["4 · Résultats", "Quel effet sur l’entreprise ?", "Moins de rebuts, cadence des robots atteinte"],
            ],
          },
          { t: "key", text: "Plus on monte, plus l’évaluation est utile… et difficile. Beaucoup d’entreprises s’arrêtent au niveau 1." },
        ],
      },
      {
        title: "Suivre le plan : indicateurs",
        blocks: [
          {
            t: "table",
            head: ["Indicateur", "Ce qu’il mesure"],
            rows: [
              ["Taux d’accès", "Part des salariés formés dans l’année, par catégorie, sexe, âge"],
              ["Heures / salarié", "Nombre moyen d’heures de formation"],
              ["Taux de réalisation", "Actions réalisées / actions prévues"],
              ["Budget / masse salariale", "Effort de formation de l’entreprise"],
              ["Entretiens à jour", "Part des entretiens de parcours réalisés"],
              ["Effets mesurés", "Résultats des évaluations à froid (niveaux 3 et 4)"],
            ],
          },
          { t: "p", text: "Le suivi permet de rendre compte au CSE l’année suivante… et d’alimenter le nouveau cycle." },
        ],
      },
    ],

    quests: [
      {
        id: "s4-kirkpatrick",
        title: "Les 4 niveaux de Kirkpatrick",
        type: "classify",
        required: true,
        pass: 0.75,
        intro: "À quel niveau d’évaluation correspond chaque exemple ?",
        categories: ["1 · Réaction", "2 · Apprentissage", "3 · Comportement", "4 · Résultats"],
        items: [
          { text: "Questionnaire de satisfaction à chaud", cat: 0 },
          { text: "Test pratique en fin de formation", cat: 1 },
          { text: "À 3 mois, les soudeurs programment seuls", cat: 2 },
          { text: "Le taux de rebuts baisse de 15 %", cat: 3 },
          { text: "« La formatrice était très claire »", cat: 0 },
          { text: "Mise en situation notée le dernier jour", cat: 1 },
          { text: "Le manager observe l’usage de l’ERP 2 mois après", cat: 2 },
          { text: "La cadence des robots est atteinte", cat: 3 },
        ],
      },
      {
        id: "s4-modalites",
        title: "Quelle modalité ?",
        type: "match",
        required: true,
        pass: 0.8,
        intro: "Associez chaque situation à la modalité la plus adaptée.",
        pairs: [
          { left: "Transmettre un geste en situation de travail, avec phases réflexives et évaluation", right: "AFEST" },
          { left: "Un salarié expérimenté accompagne un nouveau sur la durée", right: "Tutorat" },
          { left: "Théorie de l’ERP en e-learning, puis exercices en salle", right: "Blended" },
          { left: "Accompagner individuellement un nouveau chef d’équipe", right: "Coaching" },
          { left: "Apprendre un geste technique sur machine avec un formateur", right: "Présentiel" },
          { left: "Commerciaux dispersés : classe virtuelle d’anglais le midi", right: "Distanciel" },
        ],
      },
      {
        id: "s4-calculs",
        title: "Calcule le coût complet",
        type: "numeric",
        required: true,
        pass: 0.8,
        intro: "Sortez la calculatrice. Les espaces et les virgules sont acceptés.",
        questions: [
          { q: "Formation robots : 14 000 € de coûts pédagogiques, 8 soudeurs × 35 h × 28 €/h de salaires, pas de frais annexes. Coût complet ?", answer: 21840, tol: 0, unit: "€", explain: "14 000 + 8 × 35 × 28 = 14 000 + 7 840 = 21 840 €." },
          { q: "Management : 9 000 € de coûts pédagogiques, 6 chefs d’équipe × 28 h × 32 €/h, 600 € de frais annexes. Coût complet ?", answer: 14976, tol: 0, unit: "€", explain: "9 000 + 6 × 28 × 32 + 600 = 9 000 + 5 376 + 600 = 14 976 €." },
          { q: "Budget formation 60 000 € pour 5 200 000 € de masse salariale. Effort de formation en % (2 décimales) ?", answer: 1.15, tol: 0.01, unit: "%", explain: "60 000 / 5 200 000 = 1,15 %." },
          { q: "Le catalogue du CODIR coûte 78 900 € pour un budget de 60 000 €. Combien faut-il économiser ou financer autrement ?", answer: 18900, tol: 0, unit: "€", explain: "78 900 − 60 000 = 18 900 €." },
          { q: "Que reste-t-il du budget une fois les deux formations obligatoires payées (6 000 € + 4 800 €) ?", answer: 49200, tol: 0, unit: "€", explain: "60 000 − 10 800 = 49 200 €." },
        ],
      },
      {
        id: "s4-cse",
        title: "Cahier des charges & CSE",
        type: "qcm",
        required: true,
        pass: 0.75,
        intro: "8 questions pour préparer l’oral.",
        questions: [
          { q: "Le cahier des charges décrit…", options: ["Le besoin, pas la solution", "La pédagogie imposée au prestataire", "Le salaire des stagiaires", "L’avis du CSE"], answer: 0, explain: "On laisse le prestataire proposer sa pédagogie." },
          { q: "À partir de quel effectif le CSE est-il consulté chaque année sur la formation ?", options: ["50 salariés", "11 salariés", "300 salariés", "Toutes les entreprises"], answer: 0, explain: "La commission formation existe à partir de 300 salariés." },
          { q: "L’avis du CSE sur le plan est…", options: ["Consultatif", "Contraignant", "Facultatif", "Validé par l’OPCO"], answer: 0, explain: "L’employeur décide, mais après avoir consulté." },
          { q: "Où le CSE trouve-t-il les informations ?", options: ["Dans la BDESE", "Dans la DSN", "Sur Mon Compte Formation", "Au RNCP"], answer: 0, explain: "Base de données économiques, sociales et environnementales." },
          { q: "Laquelle n’est PAS une des 4 conditions de l’AFEST ?", options: ["Un examen final devant un jury externe", "Analyser l’activité de travail", "Désigner un formateur au préalable", "Prévoir des phases réflexives"], answer: 0, explain: "La 4e condition : des évaluations spécifiques des acquis." },
          { q: "Le taux de réalisation du plan, c’est…", options: ["Actions réalisées / actions prévues", "Budget / masse salariale", "Salariés formés / effectif", "Heures de formation / salarié"], answer: 0, explain: "Les autres sont : effort de formation, taux d’accès, heures par salarié." },
          { q: "Quelle certification exiger d’un prestataire si l’action est co-financée par des fonds mutualisés ?", options: ["Qualiopi", "EN 9100", "ISO 14001", "Aucune"], answer: 0, explain: "Obligatoire pour les fonds publics ou mutualisés." },
          { q: "Pour la formation robots, « à 3 mois, les soudeurs programment seuls » est un indicateur de niveau…", options: ["3 · Comportement", "1 · Réaction", "2 · Apprentissage", "4 · Résultats"], answer: 0, explain: "Le transfert des acquis en situation de travail." },
        ],
      },
      {
        id: "s4-final",
        title: "Bonus · Le grand quiz du module",
        type: "qcm",
        required: false,
        pass: 0.75,
        intro: "Quête bonus : 8 questions sur l’ensemble du module.",
        questions: [
          { q: "Que crée la loi du 24 octobre 2025 ?", options: ["L’entretien de parcours professionnel et la période de reconversion", "Le CPF en euros", "France compétences", "La VAE"], answer: 0, explain: "Le CPF en euros et France compétences datent de 2018." },
          { q: "Quel dispositif permet de changer de métier avec un congé rémunéré ?", options: ["Le PTP", "Le CEP", "Le bilan de compétences", "L’entretien de parcours"], answer: 0, explain: "Financé par Transitions Pro." },
          { q: "La période de reconversion fusionne…", options: ["Pro-A et Transitions collectives", "CPF et CEP", "VAE et bilan", "PTP et apprentissage"], answer: 0, explain: "Décrets du 28 janvier 2026." },
          { q: "Qui gère le CPF ?", options: ["La Caisse des dépôts", "L’OPCO", "L’URSSAF", "Le CSE"], answer: 0, explain: "Via Mon Compte Formation." },
          { q: "Le CEP est…", options: ["Gratuit, confidentiel, sans accord de l’employeur", "Payant via le CPF", "Réservé aux cadres", "Décidé par l’employeur"], answer: 0, explain: "France Travail, APEC, missions locales, Cap emploi, opérateurs régionaux." },
          { q: "« Bind » dans les 5 B signifie…", options: ["Fidéliser", "Recruter", "Former", "Se séparer"], answer: 0, explain: "Build, Buy, Borrow, Bind, Bounce." },
          { q: "Dernière étape du cycle de formation ?", options: ["Le suivi", "L’évaluation", "La réalisation", "La consultation du CSE"], answer: 0, explain: "Le suivi fait émerger de nouveaux besoins : le cycle recommence." },
          { q: "L’évaluation à chaud d’un module correspond au niveau…", options: ["1 de Kirkpatrick", "2", "3", "4"], answer: 0, explain: "Réaction : les stagiaires sont-ils satisfaits ?" },
        ],
      },
    ],

    activity: {
      title: "Le plan de développement des compétences",
      intro:
        "Transformez vos 3 orientations en plan chiffré. Importez vos décisions du CODIR, complétez chaque ligne (modalité, durée, financement, indicateur), rédigez le cahier des charges d’une action, puis préparez l’oral devant le CSE.",
      sections: [
        {
          title: "A. Le plan chiffré",
          help: "Le coût complet ajoute les salaires des stagiaires (effectif × heures × taux horaire). Seul le montant « imputé au budget » compte dans les 60 000 €.",
          fields: [{ id: "plan", type: "plan" }],
        },
        {
          title: "B. Le cahier des charges d’une action",
          fields: [
            { id: "cdc_action", type: "text", label: "Action concernée" },
            {
              id: "cdc",
              type: "grid",
              rows: [
                { id: "contexte", label: "1 · Contexte", hint: "L’entreprise, le projet, pourquoi cette formation" },
                { id: "objectifs", label: "2 · Objectifs", hint: "Ce que les stagiaires sauront faire à l’issue" },
                { id: "public", label: "3 · Public", hint: "Nombre, postes, niveau de départ" },
                { id: "contenu", label: "4 · Contenu attendu", hint: "Grands thèmes, sans imposer la pédagogie" },
                { id: "modalites", label: "5 · Modalités", hint: "Lieu, durée, période, présentiel ou distanciel" },
                { id: "evaluation", label: "6 · Évaluation", hint: "Comment mesurer les acquis et le transfert" },
                { id: "budget", label: "7 · Budget & calendrier", hint: "Enveloppe, date de réponse, date de démarrage" },
                { id: "criteres", label: "8 · Critères de choix", hint: "Pédagogie, expertise, prix, Qualiopi, références" },
              ],
              columns: [{ id: "texte", label: "Contenu", type: "textarea" }],
            },
          ],
        },
        {
          title: "C. Évaluation et suivi",
          help: "Pour votre action phare : comment l’évaluerez-vous aux 4 niveaux ?",
          fields: [
            { id: "eval_action", type: "text", label: "Action phare évaluée" },
            {
              id: "kirk",
              type: "grid",
              rows: [
                { id: "n1", label: "1 · Réaction", hint: "Les stagiaires sont-ils satisfaits ?" },
                { id: "n2", label: "2 · Apprentissage", hint: "Qu’ont-ils appris ?" },
                { id: "n3", label: "3 · Comportement", hint: "Utilisent-ils leurs acquis au travail ?" },
                { id: "n4", label: "4 · Résultats", hint: "Quel effet sur l’entreprise ?" },
              ],
              columns: [
                { id: "outil", label: "Outil / indicateur", type: "text" },
                { id: "quand", label: "Quand ?", type: "text" },
              ],
            },
            { id: "indicateurs", type: "chips", label: "Indicateurs de suivi du plan présentés au CSE", options: ["Taux d’accès", "Heures / salarié", "Taux de réalisation", "Budget / masse salariale", "Entretiens à jour", "Effets mesurés (niveaux 3 et 4)"] },
            { id: "boucle", type: "textarea", label: "Comment le suivi relancera-t-il le cycle l’an prochain ?" },
          ],
        },
        {
          title: "D. Préparer l’oral devant le CSE",
          help: "8 minutes de présentation + 4 minutes de questions des élus.",
          fields: [
            {
              id: "oral",
              type: "grid",
              rows: [
                { id: "contexte", label: "Contexte et enjeux (1 min)" },
                { id: "orientations", label: "Les 3 orientations (2 min)" },
                { id: "actions", label: "Les actions et le budget (3 min)" },
                { id: "suivi", label: "Évaluation et suivi (2 min)" },
              ],
              columns: [
                { id: "notes", label: "Nos notes", type: "textarea" },
                { id: "orateur", label: "Qui parle ?", type: "text" },
              ],
            },
            {
              id: "elus",
              type: "grid",
              rows: [
                { id: "q1", label: "« Les ouvriers ont-ils autant accès à la formation que les cadres ? »" },
                { id: "q2", label: "« Et l’égalité femmes-hommes, le temps partiel, les seniors ? »" },
                { id: "q3", label: "« Y a-t-il des formations hors temps de travail ? »" },
                { id: "q4", label: "« Que reste-t-il une fois les obligatoires payées ? »" },
                { id: "q5", label: "« Comment saurez-vous si le plan a été réalisé et a servi ? »" },
              ],
              columns: [{ id: "reponse", label: "Notre réponse", type: "textarea" }],
            },
          ],
        },
      ],
    },

    rubric: [
      { id: "lien", label: "Lien clair entre stratégie et orientations", max: 5 },
      { id: "obligations", label: "Obligations légales respectées", max: 3 },
      { id: "actions", label: "Actions précises, budget cohérent", max: 4 },
      { id: "evaluation", label: "Évaluation et indicateurs prévus", max: 3 },
      { id: "oral", label: "Qualité de l’oral et réponses aux élus", max: 5 },
    ],
    extraReview: { id: "avis_cse", label: "Avis du CSE (vote des élus)", options: ["Avis favorable", "Avis défavorable", "Pas de vote"] },

    corrige: [
      {
        title: "Repères pour un plan réussi",
        blocks: [
          { t: "list", items: ["Les deux formations obligatoires (10 800 €) figurent dans le plan.", "Chaque action est rattachée à une orientation, elle-même reliée à un objectif stratégique.", "Le total imputé au budget est ≤ 60 000 € ; le coût complet (avec les salaires) est signalé au CSE.", "Chaque action a un indicateur mesurable, idéalement de niveau 3 ou 4.", "Les financements alternatifs sont mobilisés : CPF + abondement, période de reconversion (OPCO), AFEST / tutorat.", "L’oral anticipe les questions des élus : accès des ouvriers, égalité, seniors, hors temps de travail, réalisation du plan."] },
          {
            t: "table",
            head: ["Orientation", "Action", "Public", "Modalité", "Coût", "Indicateur"],
            rows: [
              ["Réussir la robotisation", "Programmation des robots de soudure", "8 soudeurs", "Présentiel + AFEST, 35 h, mars-avril", "14 000 € (coût complet 21 840 €)", "8 soudeurs autonomes à 3 mois (niveau 3)"],
              ["Sécuriser savoir-faire et conformité", "Tutorat / AFEST TIG titane", "10 tuteurs", "AFEST", "7 500 €", "2 soudeurs autonomes en TIG titane avant le départ de Paul"],
              ["Respecter les obligations", "Recyclage CACES", "12 caristes", "Présentiel", "4 800 €", "100 % des CACES à jour"],
            ],
          },
        ],
      },
    ],
  },
];

// Points d’expérience (affichés au tableau spectateur)
export const XP = { required: 10, bonus: 5, validated: 25 };

export function stageByN(n) {
  return STAGES.find((s) => s.n === Number(n));
}
export function allQuests() {
  return STAGES.flatMap((s) => s.quests.map((q) => ({ ...q, stage: s.n })));
}
