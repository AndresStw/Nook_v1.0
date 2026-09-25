export const SEXUAL_ORIENTATION = {
  hetero: "Heterosexual",
  gay: "Gay",
  lesbiana: "Lesbiana",
  bisexual: "Bisexual",
  pansexual: "Pansexual",
  asexual: "Asexual",
  demisexual: "Demisexual",
  queer: "Queer",
  prefiero_no_decir: "Prefiero no decir",
};

export const MARITAL_STATUS = {
  soltero: "Soltero/a",
  en_pareja: "En pareja",
  casado: "Casado/a",
  separado: "Separado/a",
  divorciado: "Divorciado/a",
  viudo: "Viudo/a",
  relacion_abierta: "Relación abierta",
  prefiero_no_decir: "Prefiero no decir",
};

export const HAS_KIDS = {
  no_tengo: "Sin hijos",
  tengo_vivo_con: "Con hijos, vivo con ellos",
  tengo_no_vivo_con: "Con hijos, no vivo con ellos",
  quiero_tener: "Quiero tener hijos",
  no_quiero_tener: "No quiero tener hijos",
  prefiero_no_decir: "Prefiero no decir",
};

export const SMOKES = {
  no: "No fumo",
  socialmente: "Fumo socialmente",
  a_diario: "Fumo a diario",
  deje: "Dejé de fumar",
  vapeo: "Vapeo",
  prefiero_no_decir: "Prefiero no decir",
};

export const DRINKS = {
  no: "No bebo",
  socialmente: "Bebo socialmente",
  ocasional: "Ocasionalmente",
  frecuente: "Con frecuencia",
  en_recuperacion: "En recuperación",
  prefiero_no_decir: "Prefiero no decir",
};

export const PERSONALITY = {
  introvertido: "Introvertido/a",
  extrovertido: "Extrovertido/a",
  ambivertido: "Ambivertido/a",
  depende_del_dia: "Depende del día",
  prefiero_no_etiquetarme: "Sin etiquetas",
};

export const RELIGION = {
  catolico: "Católico/a",
  cristiano: "Cristiano/a",
  evangelico: "Evangélico/a",
  judio: "Judío/a",
  musulman: "Musulmán/a",
  budista: "Budista",
  ateo: "Ateo/a",
  agnostico: "Agnóstico/a",
  espiritual: "Espiritual sin religión",
  prefiero_no_decir: "Prefiero no decir",
};

export const LANGUAGES = [
  "Español",
  "Inglés",
  "Portugués",
  "Francés",
  "Italiano",
  "Alemán",
  "Japonés",
  "Chino",
  "Coreano",
  "Ruso",
  "Árabe",
  "Lengua de señas",
  "Otro",
];

// Zodiaco: cálculo desde birth_date
export function getZodiac(birthDate) {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  const day = d.getUTCDate();
  const month = d.getUTCMonth() + 1;

  const signs = [
    { name: "Capricornio", emoji: "♑", start: [12, 22], end: [1, 19] },
    { name: "Acuario", emoji: "♒", start: [1, 20], end: [2, 18] },
    { name: "Piscis", emoji: "♓", start: [2, 19], end: [3, 20] },
    { name: "Aries", emoji: "♈", start: [3, 21], end: [4, 19] },
    { name: "Tauro", emoji: "♉", start: [4, 20], end: [5, 20] },
    { name: "Géminis", emoji: "♊", start: [5, 21], end: [6, 20] },
    { name: "Cáncer", emoji: "♋", start: [6, 21], end: [7, 22] },
    { name: "Leo", emoji: "♌", start: [7, 23], end: [8, 22] },
    { name: "Virgo", emoji: "♍", start: [8, 23], end: [9, 22] },
    { name: "Libra", emoji: "♎", start: [9, 23], end: [10, 22] },
    { name: "Escorpio", emoji: "♏", start: [10, 23], end: [11, 21] },
    { name: "Sagitario", emoji: "♐", start: [11, 22], end: [12, 21] },
  ];

  for (const s of signs) {
    const [sm, sd] = s.start;
    const [em, ed] = s.end;
    if (sm > em) {
      // Cruza año (Capricornio)
      if ((month === sm && day >= sd) || (month === em && day <= ed)) return s;
    } else {
      if ((month === sm && day >= sd) || (month === em && day <= ed)) return s;
    }
  }
  return null;
}

// Formato de altura doble
export function formatHeight(cm) {
  if (!cm) return null;
  const meters = (cm / 100).toFixed(2);
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  // Corregir caso 12 pulgadas
  const finalInches = inches === 12 ? 0 : inches;
  const finalFeet = inches === 12 ? feet + 1 : feet;
  return `${meters}m · ${finalFeet}'${finalInches}`;
}
