// =============================================================================
//  CONFIGURATION — le seul fichier à modifier pour mettre le jeu en ligne
// =============================================================================
//  1. Dans Supabase : Project Settings > API (ou « Connect »)
//  2. Copiez « Project URL » et la clé « anon public » (ou « publishable »)
//  3. Collez-les ci-dessous, enregistrez, poussez sur GitHub.
//
//  Tant que ces valeurs contiennent « VOTRE », le site tourne en MODE LOCAL :
//  les données restent dans le navigateur (idéal pour tester seul).
//  La clé anon/publishable est faite pour être publique : la sécurité est
//  assurée par le script SQL (RLS + fonctions protégées par code d'équipe).
//  Ne mettez JAMAIS ici la clé « service_role » / « secret ».
// =============================================================================
export const CONFIG = {
  SUPABASE_URL: "https://lwzehavvliwbiuzcngbb.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_YEhkgUjV1KOMdyyziSHFGA_QfQ02vmq",

  // Mot de passe professeur en MODE LOCAL uniquement (ignoré avec Supabase)
  LOCAL_TEACHER_PASSWORD: "prof",

  // Fréquence de rafraîchissement automatique (millisecondes)
  POLL_INTERVAL_MS: 5000,
};
