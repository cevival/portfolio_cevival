// Préférences du visiteur (thème, langue), gardées d'une visite à l'autre.
// Un navigateur aux cookies bloqués refuse le stockage et lève à chaque accès :
// la page doit marcher sans, elle oublie seulement le choix à la visite suivante.

/** Valeur enregistrée sous `key`, ou `null` si elle manque ou si le stockage est refusé */
export function readPreference(key: string): string | null {
  try {
    return globalThis.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Enregistre `value` sous `key` ; sans effet si le stockage est refusé */
export function writePreference(key: string, value: string) {
  try {
    globalThis.localStorage.setItem(key, value);
  } catch {
    // Le choix vaut pour cette visite, il ne sera pas retenu
  }
}
