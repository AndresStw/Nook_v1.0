import { create } from "zustand";

const initialState = {
  // Paso actual (1-7)
  step: 1,

  basic: { name: "", city: "", birth_date: "" }, //nuevo

  // Fotos subidas (URLs)
  photos: [], // [{ url, position }]

  // Preguntas elegidas
  selectedQuestionIds: [], // [1, 3, 7]

  // Respuestas
  answers: {}, // { 1: 'texto...', 3: 'texto...' }

  // Intereses elegidos
  selectedInterestIds: [], // [1, 6, 13]

  //informacion personal
  details: {
    // ← NUEVO
    sexual_orientation: null,
    marital_status: null,
    has_kids: null,
    personality: null,
    smokes: null,
    drinks: null,
    religion: null,
    height_cm: null,
    languages: [],
  },

  safetyRead: false, //Nuevo

  // Completado
  completed: false,
};

export const useOnboardingStore = create((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setSafetyRead: (value) => set({ safetyRead: value }),
  setBasic: (key, value) =>
  set((s) => ({ basic: { ...s.basic, [key]: value } })),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 10) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),

  ///Metodos
  // Fotos
  addPhoto: (url, position) =>
    set((s) => ({
      photos: [
        ...s.photos.filter((p) => p.position !== position),
        { url, position },
      ].sort((a, b) => a.position - b.position),
    })),
  removePhoto: (position) =>
    set((s) => ({
      photos: s.photos.filter((p) => p.position !== position),
    })),

  // Preguntas
  toggleQuestion: (id) =>
    set((s) => {
      const selected = s.selectedQuestionIds;
      if (selected.includes(id)) {
        return { selectedQuestionIds: selected.filter((q) => q !== id) };
      }
      if (selected.length >= 3) return s;
      return { selectedQuestionIds: [...selected, id] };
    }),

  // Respuestas
  setAnswer: (questionId, text) =>
    set((s) => ({
      answers: { ...s.answers, [questionId]: text },
    })),

  // Intereses
  toggleInterest: (id) =>
    set((s) => {
      const selected = s.selectedInterestIds;
      if (selected.includes(id)) {
        return { selectedInterestIds: selected.filter((i) => i !== id) };
      }
      return { selectedInterestIds: [...selected, id] };
    }),

  // NUEVO: manejar detalles
  setDetail: (key, value) =>
    set((s) => ({
      details: { ...s.details, [key]: value },
    })),

  toggleLanguage: (lang) =>
    set((s) => {
      const langs = s.details.languages || [];
      return {
        details: {
          ...s.details,
          languages: langs.includes(lang)
            ? langs.filter((l) => l !== lang)
            : [...langs, lang],
        },
      };
    }),

  // Reset
  reset: () => set(initialState),

  // Helpers
  isStepValid: (step) => {
    const s = get();
    if (step === 2) return s.photos.length >= 1;
    if (step === 3) return s.selectedQuestionIds.length === 3;
    if (step === 4) return Object.keys(s.answers).length === 3;
    if (step === 5) return s.selectedInterestIds.length >= 3;
    if (step === 7) return s.safetyRead === true; // ← NUEVO
    return true;
  },
}));
