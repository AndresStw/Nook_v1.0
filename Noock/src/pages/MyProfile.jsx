import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import PiBadge from "../components/ui/PiBadge";
import { useDiscovery } from "../hooks/useDiscovery";
import MyEventArchives from "../components/events/MyEventArchives";

//prettier-ignore
import { User, MapPin, Calendar, Sparkles, FileText, Camera, Trash2,
Plus, Eye, Loader2, Check, AlertCircle, Lightbulb, MessageCircle, Lock, Heart,
HelpCircle, X, Search, Settings2, Move,  Star } from "lucide-react";

//prettier-ignore
import { invalidateCompletionCache, setEscape as activateEscape, getEscapeCount,
getNextEscapeConfig, hasEscapesAvailable, } from "../lib/profileCompletion";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../hooks/useAuth";
import { usePhotos } from "../hooks/usePhotos";
import PhotoAdjustModal from "../components/ui/PhotoAdjustModal";

//prettier-ignore
import { validateBio, validateName, validateTagline, } from "../lib/profileValidation";

//prettier-ignore
import { SEXUAL_ORIENTATION, MARITAL_STATUS, HAS_KIDS, SMOKES, DRINKS, PERSONALITY, RELIGION,
LANGUAGES, formatHeight, } from "../lib/profileLabels";
import { COLOMBIAN_CITIES, isValidCity } from "../lib/cities";
import { supabase } from "../lib/supabase";
import "../assets/Css/myprofile.css";

const QUOTES = [
  {
    text: "Sé real, no perfecto. La gente conecta con personas, no con perfiles impecables.",
    author: "Vale, Bogotá",
  },
  {
    text: "Una buena conversación vale más que mil fotos perfectas.",
    author: "Andrés, Medellín",
  },
  {
    text: "Aquí no gana el más guapo. Gana el que habla de verdad.",
    author: "Kevin, Fundador",
  },
  {
    text: "No busques a alguien perfecto. Busca a alguien real.",
    author: "Sofía, Cali",
  },
];

const THEMES = [
  { id: "menta", name: "Menta", color: "#14E5C0" },
  { id: "ambar", name: "Ámbar", color: "#E89B3C" },
  { id: "violeta", name: "Violeta", color: "#A855F7" },
  { id: "coral", name: "Coral", color: "#F26B5E" },
  { id: "azul", name: "Azul hielo", color: "#3FBFB0" },
  { id: "dorado", name: "Dorado", color: "#D9A017" },
  { id: "rosa", name: "Rosa suave", color: "#E879B9" },
  { id: "default", name: "Default", color: "#173D38" },
  { id: "fundador", name: "? ? ?", color: "#E11D48", locked: true },
];

//Componente
export default function MyProfile() {
  const navigate = useNavigate();
  const { user, profile, refetchProfile } = useAuth();
  const { theme: currentTheme, setTheme: setCurrentTheme } = useTheme();
  //prettier-ignore
  const { uploadPhoto, deletePhoto, updatePhotoFocal, uploadVideo, deleteVideo, uploading, 
  limits: photoLimits, refreshLimits, } = usePhotos(user?.id);
  const [tab, setTab] = useState("info");
  //prettier-ignore
  const [form, setForm] = useState({ name: "", tagline: "", bio: "", city: "", birth_date: "",});
  const [photos, setPhotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  //prettier-ignore
  const [nameInfo, setNameInfo] = useState({ changes_left: 2, can_change: true, });
  const [errors, setErrors] = useState({});
  const [quoteIndex, setQuoteIndex] = useState(0);
  // Banner de perfil incompleto + escape
  const [searchParams, setSearchParams] = useSearchParams();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  useDiscovery("visit_profile");

  const showBlockBanner =
    !bannerDismissed &&
    (searchParams.get("blocked") === "1" ||
      searchParams.get("fromOnboarding") === "1");

  const [interestsList, setInterestsList] = useState([]);
  const [interestsSelected, setInterestsSelected] = useState([]);
  const [questionsList, setQuestionsList] = useState([]);
  const [myAnswers, setMyAnswers] = useState([]);
  const [realCounts, setRealCounts] = useState({
    interests: 0,
    questions: 0,
    answers: 0,
  });

  // Modal de elegir pregunta
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSlotIndex, setPickerSlotIndex] = useState(null);
  const [pickerSearch, setPickerSearch] = useState("");

  // Modal de elegir intereses
  const [interestsPickerOpen, setInterestsPickerOpen] = useState(false);
  const [interestsSearch, setInterestsSearch] = useState("");

  // Modal de detalles (orientación, hijos, altura, etc.)
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [adjustPhotoIndex, setAdjustPhotoIndex] = useState(null);

  const [detailsForm, setDetailsForm] = useState({
    sexual_orientation: null,
    marital_status: null,
    has_kids: null,
    personality: null,
    smokes: null,
    drinks: null,
    religion: null,
    height_cm: null,
    languages: [],
  });

  const fileInputRefs = {
    1: useRef(null),
    2: useRef(null),
    3: useRef(null),
    4: useRef(null),
    5: useRef(null),
    6: useRef(null),
  };
  const videoInputRef = useRef(null);

  // ============ CARGA ============
  useEffect(() => {
    if (!profile) return;
    setForm({
      name: profile.name || "",
      tagline: profile.tagline || "",
      bio: profile.bio || "",
      city: profile.city || "",
      birth_date: profile.birth_date || "",
    });

    // Cargar detalles del perfil
    setDetailsForm({
      sexual_orientation: profile.sexual_orientation || null,
      marital_status: profile.marital_status || null,
      has_kids: profile.has_kids || null,
      personality: profile.personality || null,
      smokes: profile.smokes || null,
      drinks: profile.drinks || null,
      religion: profile.religion || null,
      height_cm: profile.height_cm || null,
      languages: profile.languages || [],
    });
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("photos")
      .select("*")
      .eq("user_id", user.id)
      .order("position")
      .then(({ data }) => setPhotos(data || []));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("can_change_name", { p_user_id: user.id }).then(({ data }) => {
      if (data) setNameInfo(data);
    });
  }, [user]);

  useEffect(() => {
    supabase
      .from("interests")
      .select("*")
      .order("name")
      .then(({ data }) => {
        setInterestsList(data || []);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("get_my_interests").then(({ data }) => {
      if (Array.isArray(data)) setInterestsSelected(data);
    });
  }, [user]);

  useEffect(() => {
    supabase
      .from("questions")
      .select("*")
      .eq("active", true)
      .then(({ data }) => {
        setQuestionsList(data || []);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("get_my_answers").then(({ data }) => {
      if (Array.isArray(data)) setMyAnswers(data);
    });
  }, [user]);

  // Recargar los counts reales (para la barra de completitud)
  const refreshCounts = async () => {
    const { data } = await supabase.rpc("get_my_counts");
    if (data && !data.error) setRealCounts(data);
  };

  useEffect(() => {
    if (user) refreshCounts();
  }, [user, interestsSelected, myAnswers]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // ============ COMPLETITUD ============
  const completeness = useMemo(() => {
    const items = [];

    const photosCount = Math.min(photos.length, 3);
    items.push({
      label: "Fotos",
      done: photosCount >= 1,
      count: `${photosCount}/3`,
      current: photosCount,
      target: 3,
    });

    const basicFilled = [
      form.name,
      form.tagline,
      form.bio,
      form.city,
      form.birth_date,
    ].filter(Boolean).length;
    items.push({
      label: "Información básica",
      done: basicFilled === 5,
      count: `${basicFilled}/5`,
      current: basicFilled,
      target: 5,
    });

    const interestsCount = Math.min(realCounts.interests || 0, 5);
    items.push({
      label: "Intereses",
      done: interestsCount >= 3,
      count: `${interestsCount}/5`,
      current: interestsCount,
      target: 5,
    });

    // Solo contar preguntas VISIBLES (is_displayed = true), no solo respondidas
    const displayedQuestionsCount = myAnswers.filter(
      (a) => a.is_displayed && a.answer && a.answer.trim().length >= 3,
    ).length;
    const questionsCount = Math.min(displayedQuestionsCount, 3);
    items.push({
      label: "Preguntas",
      done: questionsCount >= 3,
      count: `${questionsCount}/3`,
      current: questionsCount,
      target: 3,
    });

    const totalTargets = items.reduce((s, i) => s + i.target, 0);
    const totalDone = items.reduce((s, i) => s + i.current, 0);
    const percent = Math.round((totalDone / totalTargets) * 100);

    return { items, percent };
  }, [photos, form, realCounts, myAnswers]);

  // Toast celebratorio al llegar al 100% (una sola vez)
  useEffect(() => {
    if (completeness.percent !== 100) return;
    if (celebrated) return;

    const key = `nook_celebrated_100_${user?.id}`;
    if (localStorage.getItem(key)) {
      setCelebrated(true);
      return;
    }

    // Esperar un momento para que se vea el cambio visual primero
    const timeout = setTimeout(() => {
      setFeedback({
        message: "¡Perfil completo! Ahora conectas mejor 🚀",
        type: "ok",
        duration: 6000,
      });
      localStorage.setItem(key, "1");
      setCelebrated(true);
      // Limpiar cache para que el bloqueo se libere en toda la app
      invalidateCompletionCache();
    }, 500);

    return () => clearTimeout(timeout);
  }, [completeness.percent, celebrated, user?.id]);

  //  Respuestas visibles actuales (máx 3), en orden
  const visibleAnswers = useMemo(() => {
    const visible = myAnswers.filter((a) => a.is_displayed);
    // Ordenar por question_id para que sea estable
    return visible.sort((a, b) => a.question_id - b.question_id);
  }, [myAnswers]);

  // Lista de preguntas filtrada por búsqueda para el modal
  const filteredPickerQuestions = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    if (!q) return questionsList;
    return questionsList.filter((question) =>
      question.text?.toLowerCase().includes(q),
    );
  }, [questionsList, pickerSearch]);

  // Intereses agrupados por categoría (si existe) o lista plana
  const groupedInterests = useMemo(() => {
    const q = interestsSearch.trim().toLowerCase();

    const filtered = q
      ? interestsList.filter((i) => i.name?.toLowerCase().includes(q))
      : interestsList;

    // Si no hay columna category, devolvemos una sola sección
    const hasCategory = filtered.some((i) => i.category);

    if (!hasCategory) {
      return [{ name: "Todos", items: filtered }];
    }

    // Agrupar por categoría
    const groups = new Map();
    filtered.forEach((interest) => {
      const cat = interest.category || "Otros";
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(interest);
    });

    return Array.from(groups.entries()).map(([name, items]) => ({
      name,
      items,
    }));
  }, [interestsList, interestsSearch]);

  // ============ HANDLERS ============
  const showToast = (message, type = "ok") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleFileChange = async (e, position) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadPhoto(file, position);
      const { data } = await supabase
        .from("photos")
        .select("*")
        .eq("user_id", user.id)
        .order("position");
      setPhotos(data || []);
      showToast("Foto actualizada", "ok");
      invalidateCompletionCache();
    } catch (err) {
      showToast(err.message, "error");
    }
    e.target.value = "";
  };

  const handleDeletePhoto = async (position, url) => {
    if (!confirm("¿Eliminar esta foto?")) return;
    try {
      await deletePhoto(position, url);
      setPhotos((prev) => prev.filter((p) => p.position !== position));
      showToast("Foto eliminada", "ok");
      invalidateCompletionCache();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Guardar ajuste de punto focal
  const handleSaveFocalPoint = async (focalPoint) => {
    if (adjustPhotoIndex === null) return;
    const photo = photos.find((p) => p.position === adjustPhotoIndex);
    if (!photo) return;

    try {
      await updatePhotoFocal(photo.position, focalPoint);

      // Actualizar state local
      setPhotos((prev) =>
        prev.map((p) =>
          p.position === photo.position ? { ...p, focal_point: focalPoint } : p,
        ),
      );

      showToast("Foto ajustada", "ok");
      setAdjustPhotoIndex(null);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // === VIDEO HANDLERS ===
  const handleVideoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadVideo(file);
      await refetchProfile();
      showToast("Video subido con éxito 🎥", "ok");
    } catch (err) {
      showToast(err.message, "error");
    }
    e.target.value = "";
  };

  const handleDeleteVideo = async () => {
    if (!confirm("¿Eliminar tu video de presentación?")) return;
    try {
      await deleteVideo(profile.video_url);
      await refetchProfile();
      showToast("Video eliminado", "ok");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Navegar al tab que falta primero
  const handleCompletarPerfil = () => {
    const missing = completeness.items.find((i) => !i.done);
    if (!missing) return;

    const tabMap = {
      Fotos: "fotos",
      "Información básica": "info",
      Intereses: "intereses",
      Preguntas: "preguntas",
    };

    setTab(tabMap[missing.label] || "info");

    // Limpiar el parámetro de la URL
    setSearchParams({}, { replace: true });
    setBannerDismissed(true);
  };

  // Explorar primero (escape progresivo)
  const handleExplorarPrimero = () => {
    const result = activateEscape();
    if (!result) {
      showToast(
        "Ya usaste tus escapes. Completa tu perfil para seguir usando Nook.",
        "error",
      );
      return;
    }

    invalidateCompletionCache();

    const msg = result.restricted
      ? `Modo exploración activado por ${result.hours}h. Solo puedes ver, no interactuar.`
      : `Modo exploración activado por ${result.hours}h. ¡Disfruta!`;
    showToast(msg, "ok");

    // Esperar un momento para que se vea el toast antes de navegar
    setTimeout(() => {
      navigate("/feed");
    }, 800);
  };

  // Toggle idioma en el modal de detalles
  const handleToggleLanguage = (lang) => {
    setDetailsForm((prev) => {
      const langs = prev.languages || [];
      return {
        ...prev,
        languages: langs.includes(lang)
          ? langs.filter((l) => l !== lang)
          : [...langs, lang],
      };
    });
  };

  //  Guardar detalles del perfil
  const handleSaveDetails = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("users")
      .update({
        sexual_orientation: detailsForm.sexual_orientation,
        marital_status: detailsForm.marital_status,
        has_kids: detailsForm.has_kids,
        personality: detailsForm.personality,
        smokes: detailsForm.smokes,
        drinks: detailsForm.drinks,
        religion: detailsForm.religion,
        height_cm: detailsForm.height_cm,
        languages: detailsForm.languages || [],
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    await refetchProfile();
    invalidateCompletionCache();
    showToast("Detalles guardados", "ok");
    setDetailsOpen(false);
  };

  // Cuenta los detalles que tiene guardados (para el card Info)
  const detailsFilledCount = useMemo(() => {
    return [
      detailsForm.sexual_orientation,
      detailsForm.marital_status,
      detailsForm.has_kids,
      detailsForm.personality,
      detailsForm.smokes,
      detailsForm.drinks,
      detailsForm.religion,
      detailsForm.height_cm,
      detailsForm.languages?.length > 0 ? "yes" : null,
    ].filter(Boolean).length;
  }, [detailsForm]);

  const handleSave = async () => {
    const errs = {};
    const nameCheck = validateName(form.name);
    if (!nameCheck.valid) errs.name = nameCheck.error;
    const tagCheck = validateTagline(form.tagline);
    if (!tagCheck.valid) errs.tagline = tagCheck.error;
    const bioCheck = validateBio(form.bio);
    if (!bioCheck.valid) errs.bio = bioCheck.error;
    if (form.city && !isValidCity(form.city)) {
      errs.city = "Debes elegir una ciudad de la lista";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      showToast("Revisa los errores", "error");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("users")
      .update({
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        bio: form.bio.trim(),
        city: form.city.trim(),
      })
      .eq("id", user.id);

    if (error) {
      showToast(error.message, "error");
    } else {
      await refetchProfile();
      const { data } = await supabase.rpc("can_change_name", {
        p_user_id: user.id,
      });
      if (data) setNameInfo(data);
      showToast("Cambios guardados", "ok");
      invalidateCompletionCache();
    }
    setSaving(false);
  };

  // Toggle interés desde el modal
  const handleToggleInterest = (interestId) => {
    setInterestsSelected((prev) => {
      if (prev.includes(interestId)) {
        return prev.filter((i) => i !== interestId);
      }
      if (prev.length >= 5) {
        showToast("Máximo 5 intereses", "error");
        return prev;
      }
      return [...prev, interestId];
    });
  };

  // Quitar interés desde los chips de arriba
  const handleRemoveInterest = (interestId) => {
    setInterestsSelected((prev) => prev.filter((i) => i !== interestId));
  };

  const handleSaveInterests = async () => {
    if (interestsSelected.length < 3) {
      showToast("Elige al menos 3 intereses", "error");
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc("save_my_interests", {
      p_interest_ids: interestsSelected,
    });
    setSaving(false);
    if (error) showToast(error.message, "error");
    else {
      showToast("Intereses guardados", "ok");
      refreshCounts();
      invalidateCompletionCache();
    }
  };

  //  Abrir el modal para elegir/reemplazar pregunta en un slot
  const handleOpenPicker = (slotIndex) => {
    setPickerSlotIndex(slotIndex);
    setPickerSearch("");
    setPickerOpen(true);
  };

  //  Confirmar elección de pregunta para el slot
  const handlePickQuestion = (questionId) => {
    const slotIndex = pickerSlotIndex;
    if (slotIndex === null) return;

    // Verificar que no esté ya en uso en otro slot
    const alreadyUsed = visibleAnswers.some(
      (a, i) => i !== slotIndex && a.question_id === questionId,
    );
    if (alreadyUsed) {
      showToast("Esa pregunta ya está en uso", "error");
      return;
    }

    setMyAnswers((prev) => {
      let next = [...prev];

      // 1. Desactivar la que estaba en este slot (si había)
      const currentSlot = visibleAnswers[slotIndex];
      if (currentSlot) {
        next = next.map((a) =>
          a.question_id === currentSlot.question_id
            ? { ...a, is_displayed: false }
            : a,
        );
      }

      // 2. Activar o agregar la nueva
      const existing = next.find((a) => a.question_id === questionId);
      if (existing) {
        next = next.map((a) =>
          a.question_id === questionId ? { ...a, is_displayed: true } : a,
        );
      } else {
        next.push({
          question_id: questionId,
          answer: "",
          is_displayed: true,
        });
      }

      return next;
    });

    setPickerOpen(false);
    setPickerSlotIndex(null);
  };

  // Vaciar un slot (quitar la pregunta visible)
  const handleClearSlot = (slotIndex) => {
    const current = visibleAnswers[slotIndex];
    if (!current) return;

    if (!confirm("¿Quitar esta pregunta de tu perfil?")) return;

    setMyAnswers((prev) =>
      prev.map((a) =>
        a.question_id === current.question_id
          ? { ...a, is_displayed: false }
          : a,
      ),
    );
  };

  //  Actualizar la respuesta de una pregunta visible
  const handleUpdateAnswer = (questionId, text) => {
    setMyAnswers((prev) => {
      const exists = prev.find((a) => a.question_id === questionId);
      if (exists) {
        return prev.map((a) =>
          a.question_id === questionId ? { ...a, answer: text } : a,
        );
      }
      return [
        ...prev,
        { question_id: questionId, answer: text, is_displayed: true },
      ];
    });
  };
  const handleSetFeatured = async (answerObj) => {
    if (!answerObj?.question_id) return;

    // Buscar el id real del answer (puede no existir si nunca se guardó)
    const existing = myAnswers.find(
      (a) => a.question_id === answerObj.question_id && a.id,
    );

    if (!existing?.id) {
      showToast(
        "Guarda tu respuesta primero y luego márcala como destacada",
        "error",
      );
      return;
    }

    // Si ya está featured → desmarcar
    if (existing.is_featured) {
      const { error } = await supabase.rpc("unset_featured_answer");
      if (error) {
        showToast(error.message, "error");
        return;
      }
      setMyAnswers((prev) =>
        prev.map((a) =>
          a.question_id === answerObj.question_id
            ? { ...a, is_featured: false }
            : a,
        ),
      );
      showToast("Respuesta desmarcada", "ok");
      return;
    }

    // Marcar como featured (desmarca las demás)
    const { error } = await supabase.rpc("set_featured_answer", {
      p_answer_id: existing.id,
    });

    if (error) {
      showToast(error.message, "error");
      return;
    }

    setMyAnswers((prev) =>
      prev.map((a) => ({
        ...a,
        is_featured: a.question_id === answerObj.question_id,
      })),
    );
    showToast("⭐ Respuesta destacada", "ok");
  };

  const handleSaveAnswers = async () => {
    const valid = myAnswers.filter(
      (a) => a.is_displayed && a.answer?.trim().length >= 3,
    );

    if (valid.length === 0) {
      showToast("Responde al menos una pregunta", "error");
      return;
    }

    setSaving(true);
    const { error } = await supabase.rpc("save_my_answers", {
      p_answers: valid,
    });
    setSaving(false);

    if (error) {
      showToast(error.message, "error");
    } else {
      showToast("Respuestas guardadas", "ok");
      refreshCounts();
      invalidateCompletionCache();

      const { data } = await supabase.rpc("get_my_answers");
      if (Array.isArray(data)) setMyAnswers(data);
    }
  };

  const currentQuote = QUOTES[quoteIndex];

  if (!profile) return null;

  return (
    <AppLayout>
      {/* Banner de perfil incompleto */}
      {showBlockBanner && completeness.percent < 75 && (
        <div className="max-w-295 mx-auto mt-2 mb-3 px-2">
          <div className="relative rounded-2xl border-2 border-accent/40 bg-linear-to-br from-accent/10 to-accent/5 p-5">
            <button
              onClick={() => {
                setBannerDismissed(true);
                setSearchParams({}, { replace: true });
              }}
              className="absolute top-3 right-3 w-7 h-7 rounded-full hover:bg-bg-alt flex items-center justify-center transition-colors"
              title="Cerrar"
            >
              <X size={14} className="text-text-tertiary" />
            </button>

            <div className="flex items-start gap-4 pr-8">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
                <Sparkles size={22} className="text-bg" strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-[16px] font-bold text-text-primary">
                    Termina tu perfil para empezar a conectar
                  </h2>
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-accent text-bg">
                    {completeness.percent}%
                  </span>
                </div>
                <p className="text-[12.5px] text-text-secondary leading-relaxed mb-4">
                  Con un perfil completo apareces más en el feed, recibes
                  mejores matches y tienes más de qué hablar. Te falta poco,
                  ¡dale!
                </p>

                <div className="flex gap-2.5 flex-wrap">
                  <button
                    onClick={handleCompletarPerfil}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-bg text-[13px] font-bold hover:opacity-90 transition-opacity shadow-soft"
                  >
                    <Sparkles size={14} />
                    Completar perfil
                  </button>
                  {hasEscapesAvailable() && (
                    <button
                      onClick={handleExplorarPrimero}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-transparent border border-border text-text-secondary text-[12.5px] font-medium hover:bg-bg-alt hover:text-text-primary transition-colors"
                    >
                      {(() => {
                        const next = getNextEscapeConfig();
                        const used = getEscapeCount();
                        if (!next) return "Sin escapes disponibles";
                        return `Explorar primero (${next.hours}h${next.restricted ? " · solo ver" : ""}) · ${used + 1}/3`;
                      })()}
                    </button>
                  )}
                </div>

                {/* Lista mini de qué falta */}
                {completeness.items.filter((i) => !i.done).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-accent/20">
                    {completeness.items
                      .filter((i) => !i.done)
                      .map((item, i) => (
                        <span
                          key={i}
                          className="text-[10.5px] px-2 py-1 rounded-full bg-bg-surface border border-border text-text-secondary"
                        >
                          {item.label} · {item.count}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="profile-page">
        <div className="profile-page__bg-quote profile-page__bg-quote--left">
          Las mejores conexiones nacen de ser tú mismo.
          <span className="heart">♡</span>
        </div>
        <div className="profile-page__bg-quote profile-page__bg-quote--right">
          Aquí empieza algo bonito...
          <span className="heart">♡</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4 lg:gap-6 max-w-295 mx-auto px-0.5 w-full">
          {/* Columna izquierda */}
          <div>
            {/* Header */}
            <div className="profile-page__header flex-wrap gap-3">
              {photos.find((p) => p.position === 1)?.url ? (
                <img
                  src={photos.find((p) => p.position === 1).url}
                  alt="Yo"
                  className="profile-page__avatar"
                  style={{
                    objectPosition: (() => {
                      const p1 = photos.find((p) => p.position === 1);
                      return p1?.focal_point
                        ? `${p1.focal_point.x}% ${p1.focal_point.y}%`
                        : "50% 50%";
                    })(),
                  }}
                />
              ) : (
                <div className="profile-page__avatar profile-page__avatar--placeholder">
                  {profile?.name?.[0] || "?"}
                </div>
              )}

              <div className="profile-page__header-info min-w-0 flex-1">
                <h1 className="profile-page__header-title">Mi perfil</h1>
                <p className="profile-page__header-subtitle truncate">
                  Cuéntale al mundo quién eres
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <PiBadge pi={profile?.pi || 0} size="sm" />
                  {profile?.vip_level && (
                    <span className="text-[10.5px] font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                      VIP {profile.vip_level}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => navigate(`/u/${user?.id}`)}
                className="profile-page__preview-btn hidden sm:flex"
              >
                <Eye size={14} />
                Vista previa
              </button>
            </div>

            {/* Tabs */}
            <div
              className="flex gap-1 p-1.5 bg-bg-alt rounded-2xl mb-5 w-full max-w-full overflow-x-auto"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <button
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[12px] font-medium whitespace-nowrap transition-all ${
                  tab === "info"
                    ? "bg-bg-surface text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
                onClick={() => setTab("info")}
              >
                <User size={14} /> Perfil
              </button>

              <button
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[12px] font-medium whitespace-nowrap transition-all ${
                  tab === "fotos"
                    ? "bg-bg-surface text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
                onClick={() => setTab("fotos")}
              >
                <Camera size={14} /> Fotos
              </button>

              <button
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[12px] font-medium whitespace-nowrap transition-all ${
                  tab === "intereses"
                    ? "bg-bg-surface text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
                onClick={() => setTab("intereses")}
              >
                <Heart size={14} /> Intereses
                {interestsSelected.length > 0 && (
                  <span className="min-w-4 h-4 px-1 rounded-full bg-accent text-bg text-[9.5px] font-bold flex items-center justify-center">
                    {interestsSelected.length}
                  </span>
                )}
              </button>

              <button
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[12px] font-medium whitespace-nowrap transition-all ${
                  tab === "preguntas"
                    ? "bg-bg-surface text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
                onClick={() => setTab("preguntas")}
              >
                <HelpCircle size={14} /> Preguntas
                {myAnswers.length > 0 && (
                  <span className="min-w-4 h-4 px-1 rounded-full bg-accent text-bg text-[9.5px] font-bold flex items-center justify-center">
                    {myAnswers.length}
                  </span>
                )}
              </button>
            </div>

            {/* === TAB INFO === */}
            {tab === "info" && (
              <div className="profile-card">
                <div className="profile-card__header">
                  <div className="profile-card__header-title">
                    Información básica
                  </div>
                </div>

                <div className="profile-field">
                  <div className="profile-field__grid">
                    <div>
                      <label className="profile-field__label">
                        Nombre
                        <span
                          className={`profile-field__hint ${!nameInfo.can_change ? "profile-field__hint--warn" : ""}`}
                        >
                          {nameInfo.changes_left} cambio
                          {nameInfo.changes_left !== 1 ? "s" : ""} disponible
                          {nameInfo.changes_left !== 1 ? "s" : ""}
                        </span>
                      </label>
                      <div className="profile-field__input-wrap">
                        <User size={15} className="profile-field__input-icon" />
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          maxLength={40}
                          disabled={!nameInfo.can_change}
                          placeholder="Tu nombre o alias"
                          className={`profile-field__input ${errors.name ? "profile-field__input--error" : ""}`}
                        />
                      </div>
                      {errors.name && (
                        <div className="profile-field__feedback profile-field__feedback--error">
                          <AlertCircle size={11} /> {errors.name}
                        </div>
                      )}
                      {!nameInfo.can_change && !errors.name && (
                        <div className="profile-field__feedback profile-field__feedback--warn">
                          <Lock size={11} /> Alcanzaste el límite de 2 cambios
                          al mes
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="profile-field__label">Ciudad</label>
                      <div className="profile-field__input-wrap">
                        <MapPin
                          size={15}
                          className="profile-field__input-icon"
                        />
                        <input
                          type="text"
                          list="myprofile-cities"
                          value={form.city}
                          onChange={(e) => handleChange("city", e.target.value)}
                          maxLength={30}
                          placeholder="¿En qué ciudad estás?"
                          className={`profile-field__input ${errors.city ? "profile-field__input--error" : ""}`}
                        />
                        <datalist id="myprofile-cities">
                          {COLOMBIAN_CITIES.map((c) => (
                            <option key={c} value={c} />
                          ))}
                        </datalist>
                      </div>
                      {errors.city && (
                        <div className="profile-field__feedback profile-field__feedback--error">
                          <AlertCircle size={11} /> {errors.city}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="profile-field">
                  <label className="profile-field__label">
                    Fecha de nacimiento
                    <span className="profile-field__hint">🔒 Bloqueada</span>
                  </label>
                  <div className="profile-field__input-wrap">
                    <Calendar size={15} className="profile-field__input-icon" />
                    <input
                      type="date"
                      value={form.birth_date}
                      disabled
                      className="profile-field__input"
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label className="profile-field__label">
                    Tagline
                    <span className="profile-field__hint">
                      {form.tagline.length}/25
                    </span>
                  </label>
                  <div className="profile-field__input-wrap">
                    <Sparkles size={15} className="profile-field__input-icon" />
                    <input
                      type="text"
                      value={form.tagline}
                      onChange={(e) => handleChange("tagline", e.target.value)}
                      maxLength={25}
                      placeholder="Una frase que te describa"
                      className={`profile-field__input ${errors.tagline ? "profile-field__input--error" : ""}`}
                    />
                  </div>
                  {errors.tagline && (
                    <div className="profile-field__feedback profile-field__feedback--error">
                      <AlertCircle size={11} /> {errors.tagline}
                    </div>
                  )}
                </div>

                <div className="profile-field">
                  <label className="profile-field__label">
                    Bio
                    <span className="profile-field__hint">
                      {form.bio.length}/500
                    </span>
                  </label>
                  <div className="profile-field__input-wrap">
                    <FileText
                      size={15}
                      className="profile-field__input-icon"
                      style={{ top: 18, transform: "none" }}
                    />
                    <textarea
                      value={form.bio}
                      onChange={(e) => handleChange("bio", e.target.value)}
                      maxLength={500}
                      rows={5}
                      placeholder="Cuéntale a los demás quién eres..."
                      className={`profile-field__textarea ${errors.bio ? "profile-field__textarea--error" : ""}`}
                    />
                  </div>
                  {errors.bio ? (
                    <div className="profile-field__feedback profile-field__feedback--error">
                      <AlertCircle size={11} /> {errors.bio}
                    </div>
                  ) : (
                    <div className="profile-field__feedback profile-field__feedback--info">
                      <Check size={11} /> Sin enlaces, redes sociales ni números
                      de teléfono
                    </div>
                  )}
                </div>

                {/* Bloque de Detalles */}
                <div className="mt-6 pt-6 border-t border-border-soft">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Settings2 size={15} className="text-text-secondary" />
                      <span className="text-[13px] font-bold text-text-primary">
                        Detalles de tu perfil
                      </span>
                    </div>
                    {detailsFilledCount > 0 && (
                      <span className="text-[10.5px] text-text-tertiary font-medium">
                        {detailsFilledCount} completado
                        {detailsFilledCount === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>

                  {/* Chips con los detalles que ya tiene */}
                  {detailsFilledCount > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {detailsForm.sexual_orientation &&
                        detailsForm.sexual_orientation !==
                          "prefiero_no_decir" && (
                          <DetailChip
                            label={
                              SEXUAL_ORIENTATION[detailsForm.sexual_orientation]
                            }
                          />
                        )}
                      {detailsForm.marital_status &&
                        detailsForm.marital_status !== "prefiero_no_decir" && (
                          <DetailChip
                            label={MARITAL_STATUS[detailsForm.marital_status]}
                          />
                        )}
                      {detailsForm.has_kids &&
                        detailsForm.has_kids !== "prefiero_no_decir" && (
                          <DetailChip label={HAS_KIDS[detailsForm.has_kids]} />
                        )}
                      {detailsForm.personality &&
                        detailsForm.personality !==
                          "prefiero_no_etiquetarme" && (
                          <DetailChip
                            label={PERSONALITY[detailsForm.personality]}
                          />
                        )}
                      {detailsForm.smokes &&
                        detailsForm.smokes !== "prefiero_no_decir" &&
                        detailsForm.smokes !== "no" && (
                          <DetailChip label={SMOKES[detailsForm.smokes]} />
                        )}
                      {detailsForm.drinks &&
                        detailsForm.drinks !== "prefiero_no_decir" &&
                        detailsForm.drinks !== "no" && (
                          <DetailChip label={DRINKS[detailsForm.drinks]} />
                        )}
                      {detailsForm.religion &&
                        detailsForm.religion !== "prefiero_no_decir" && (
                          <DetailChip label={RELIGION[detailsForm.religion]} />
                        )}
                      {detailsForm.height_cm && (
                        <DetailChip
                          label={formatHeight(detailsForm.height_cm)}
                        />
                      )}
                      {detailsForm.languages?.length > 0 &&
                        detailsForm.languages.map((lang) => (
                          <DetailChip key={lang} label={lang} />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-5 border-2 border-dashed border-border rounded-xl mb-4">
                      <div className="text-2xl mb-1.5">🎯</div>
                      <div className="text-[12px] text-text-secondary">
                        Aún no has agregado detalles
                      </div>
                      <div className="text-[10.5px] text-text-tertiary mt-0.5">
                        Ayudan a que te conozcan mejor
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setDetailsOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-bg-alt hover:bg-bg-surface hover:border-accent transition-colors text-[12.5px] font-semibold text-text-primary"
                  >
                    <Settings2 size={13} />
                    {detailsFilledCount > 0
                      ? "Editar detalles"
                      : "Agregar detalles"}
                  </button>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full mt-5 py-3 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{
                    background: "var(--color-accent)",
                    color: "var(--color-on-accent)",
                    border: "none",
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />{" "}
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check size={14} /> Guardar cambios
                    </>
                  )}
                </button>
              </div>
            )}

            {/* === TAB FOTOS === */}
            {tab === "fotos" && (
              <div className="profile-card">
                <div className="profile-card__header">
                  <div className="profile-card__header-title">
                    <Camera size={16} /> Mis fotos
                  </div>
                  <span className="profile-card__counter">
                    <Camera size={10} /> {photos.length}/
                    {photoLimits?.max_photos || 3}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 w-full">
                  {[1, 2, 3, 4, 5, 6].map((pos) => {
                    const photo = photos.find((p) => p.position === pos);
                    const isLocked =
                      pos > 3 && (!photoLimits || photoLimits.pi < 3000);

                    return (
                      <div
                        key={pos}
                        className="relative aspect-square rounded-xl overflow-hidden bg-bg-alt min-w-0"
                      >
                        {photo ? (
                          <>
                            <img
                              src={photo.url}
                              alt={`Foto ${pos}`}
                              style={{
                                objectPosition: photo.focal_point
                                  ? `${photo.focal_point.x}% ${photo.focal_point.y}%`
                                  : "50% 50%",
                              }}
                            />

                            {/* Botón ajustar */}
                            <button
                              onClick={() => setAdjustPhotoIndex(pos)}
                              className="profile-photo__adjust"
                              title="Ajustar encuadre"
                            >
                              <Move size={12} />
                            </button>

                            <button
                              onClick={() => handleDeletePhoto(pos, photo.url)}
                              className="profile-photo__delete"
                              title="Eliminar foto"
                            >
                              <Trash2 size={12} />
                            </button>
                            {pos === 1 && (
                              <span className="profile-photo__badge">
                                Principal
                              </span>
                            )}
                          </>
                        ) : isLocked ? (
                          <button
                            onClick={() =>
                              showToast(
                                `Te faltan ${photoLimits?.pi_needed_photos?.toLocaleString("es-CO") || 3000} PI para desbloquear esta foto`,
                                "error",
                              )
                            }
                            className="profile-photo--locked"
                            title="Requiere 3000 PI"
                          >
                            <Lock size={16} />
                            <span className="text-[9px] font-bold">
                              3000 PI
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => fileInputRefs[pos].current?.click()}
                            disabled={uploading}
                            className="profile-photo--empty"
                          >
                            {uploading ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <>
                                <Plus size={18} />
                                <span>Agregar foto</span>
                              </>
                            )}
                          </button>
                        )}
                        <input
                          ref={fileInputRefs[pos]}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleFileChange(e, pos)}
                          className="hidden"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* VIDEO DE PRESENTACIÓN */}
                <div className="mt-6 pt-6 border-t border-border-soft">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-text-primary">
                        Video de presentación
                      </span>
                      <span className="text-[10px] text-text-tertiary">
                        15 segundos máx.
                      </span>
                    </div>
                    {profile?.video_url && (
                      <span className="text-[10px] text-accent-hover font-semibold">
                        ✓ Subido
                      </span>
                    )}
                  </div>

                  {profile?.video_url ? (
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-md">
                      <video
                        src={profile.video_url}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      />
                      <button
                        onClick={handleDeleteVideo}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-error transition-colors"
                        title="Eliminar video"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : photoLimits?.can_add_video ? (
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full max-w-md aspect-video rounded-2xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition-colors flex flex-col items-center justify-center gap-3 text-text-tertiary hover:text-accent disabled:opacity-50"
                    >
                      {uploading ? (
                        <Loader2 size={24} className="animate-spin" />
                      ) : (
                        <>
                          <div className="text-3xl">🎥</div>
                          <div className="text-[12px] font-semibold">
                            Sube tu video de presentación
                          </div>
                          <div className="text-[10px] text-center max-w-60 leading-snug">
                            MP4, MKV o WEBM · Máx. 15 segundos · 25MB
                          </div>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        showToast(
                          `Te faltan ${photoLimits?.pi_needed_video?.toLocaleString("es-CO") || 5000} PI para desbloquear el video`,
                          "error",
                        )
                      }
                      className="w-full max-w-md aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors"
                      style={{
                        borderColor: "rgba(251, 191, 36, 0.4)",
                        background:
                          "linear-gradient(140deg, rgba(251, 191, 36, 0.06), rgba(251, 191, 36, 0.02))",
                        color: "#B8850F",
                      }}
                    >
                      <Lock size={24} />
                      <div className="text-[12px] font-bold">5000 PI</div>
                      <div className="text-[10px] text-center max-w-55 opacity-80 leading-snug">
                        Necesitas 5000 PI para desbloquear el video de
                        presentación
                      </div>
                    </button>
                  )}

                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/x-matroska,video/webm"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* === TAB INTERESES === */}
            {tab === "intereses" && (
              <div className="profile-card">
                <div className="profile-card__header">
                  <div className="profile-card__header-title">
                    <Heart size={16} /> Tus intereses
                  </div>
                  <span className="profile-card__counter">
                    <Heart size={10} /> {interestsSelected.length} / 5
                  </span>
                </div>

                <p className="text-[12px] text-text-secondary mb-5">
                  Elige entre 3 y 5 intereses. Aparecerán en tu perfil para
                  conectar con gente afín ✨
                </p>

                {/* Chips de los seleccionados */}
                {interestsSelected.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {interestsSelected.map((id) => {
                      const interest = interestsList.find((i) => i.id === id);
                      if (!interest) return null;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full bg-accent text-bg font-semibold"
                        >
                          <span>{interest.emoji}</span>
                          {interest.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveInterest(id)}
                            className="w-4 h-4 rounded-full bg-bg/20 hover:bg-bg/40 flex items-center justify-center transition-colors ml-0.5"
                            title="Quitar"
                          >
                            <X size={9} strokeWidth={3} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-border rounded-xl mb-4">
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="text-[12.5px] text-text-secondary mb-0.5">
                      Aún no has elegido tus intereses
                    </div>
                    <div className="text-[11px] text-text-tertiary">
                      Elige al menos 3 para conectar mejor
                    </div>
                  </div>
                )}

                {/* Botón para abrir el modal */}
                <button
                  type="button"
                  onClick={() => {
                    setInterestsSearch("");
                    setInterestsPickerOpen(true);
                  }}
                  disabled={interestsSelected.length >= 5}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-bg-alt hover:bg-bg-surface hover:border-accent transition-colors text-[13px] font-semibold text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={14} />
                  {interestsSelected.length >= 5
                    ? "Máximo alcanzado (5)"
                    : interestsSelected.length === 0
                      ? "Elegir intereses"
                      : "Agregar más"}
                </button>

                <button
                  onClick={handleSaveInterests}
                  disabled={saving || interestsSelected.length < 3}
                  className="w-full mt-5 py-3 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{
                    background: "var(--color-accent)",
                    color: "var(--color-on-accent)",
                    border: "none",
                  }}
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  Guardar intereses
                </button>
              </div>
            )}

            {/* === TAB PREGUNTAS === */}
            {tab === "preguntas" && (
              <div className="profile-card">
                <div className="profile-card__header">
                  <div className="profile-card__header-title">
                    <HelpCircle size={16} /> Tus respuestas
                  </div>
                  <span className="profile-card__counter">
                    <Check size={10} />
                    {visibleAnswers.length} / 3 visibles
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-accent/8 border border-accent/25 mb-5">
                  <div className="flex items-start gap-2.5">
                    <Sparkles
                      size={14}
                      className="text-accent-hover shrink-0 mt-0.5"
                    />
                    <div>
                      <div className="text-[12.5px] font-bold text-text-primary mb-0.5">
                        Tus respuestas son tu foto
                      </div>
                      <p className="text-[11.5px] text-text-secondary leading-relaxed">
                        Como las fotos están ocultas hasta el match, lo único
                        que los demás ven de ti es lo que dices. Elige 3
                        preguntas y destaca la que mejor te represente ⭐
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[0, 1, 2].map((slotIndex) => {
                    const answerObj = visibleAnswers[slotIndex];
                    const question = answerObj
                      ? questionsList.find(
                          (q) => q.id === answerObj.question_id,
                        )
                      : null;

                    // Slot vacío
                    if (!answerObj || !question) {
                      return (
                        <button
                          key={`slot-empty-${slotIndex}`}
                          type="button"
                          onClick={() => handleOpenPicker(slotIndex)}
                          className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-bg-alt flex items-center justify-center shrink-0">
                            <Plus size={14} className="text-text-tertiary" />
                          </div>
                          <div className="flex-1">
                            <div className="text-[12.5px] font-medium text-text-secondary">
                              Elegir una{" "}
                              {slotIndex === 0
                                ? "primera"
                                : slotIndex === 1
                                  ? "segunda"
                                  : "tercera"}{" "}
                              pregunta
                            </div>
                            <div className="text-[10.5px] text-text-tertiary">
                              Aparecerá en tu perfil público
                            </div>
                          </div>
                        </button>
                      );
                    }

                    // Slot con pregunta
                    return (
                      <div
                        key={`slot-${answerObj.question_id}`}
                        className={`border rounded-xl p-3.5 transition-colors ${
                          answerObj.is_featured
                            ? "border-amber-300 bg-amber-50/50"
                            : "border-border bg-bg-surface"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            {answerObj.is_featured && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 text-[9px] font-bold uppercase tracking-wider mb-1">
                                <Star size={8} className="fill-amber-900" />
                                Destacada en el Feed
                              </div>
                            )}
                            <div className="text-[12px] font-semibold text-text-primary leading-snug">
                              {question.text}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleSetFeatured(answerObj)}
                              className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                                answerObj.is_featured
                                  ? "text-amber-500 bg-amber-100"
                                  : "text-text-tertiary hover:text-amber-500 hover:bg-amber-50"
                              }`}
                              title={
                                answerObj.is_featured
                                  ? "Quitar de destacada"
                                  : "Marcar como destacada"
                              }
                            >
                              <Star
                                size={12}
                                className={
                                  answerObj.is_featured ? "fill-amber-500" : ""
                                }
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenPicker(slotIndex)}
                              className="text-[10px] font-medium px-2 py-1 rounded-md text-accent-hover hover:bg-accent/10 transition-colors"
                              title="Cambiar pregunta"
                            >
                              Cambiar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleClearSlot(slotIndex)}
                              className="w-6 h-6 rounded-md flex items-center justify-center text-text-tertiary hover:text-error hover:bg-error/10 transition-colors"
                              title="Quitar"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>

                        <textarea
                          value={answerObj.answer || ""}
                          onChange={(e) =>
                            handleUpdateAnswer(
                              answerObj.question_id,
                              e.target.value,
                            )
                          }
                          maxLength={30}
                          rows={2}
                          placeholder="Tu respuesta..."
                          className="profile-field__textarea profile-field__textarea--plain"
                        />
                        <div className="profile-field__feedback profile-field__feedback--info">
                          {(answerObj.answer || "").length} / 30{" "}
                          {/* Se limito un poco el espacio de caracteres permitidos */}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleSaveAnswers}
                  disabled={saving}
                  className="w-full mt-5 py-3 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{
                    background: "var(--color-accent)",
                    color: "var(--color-on-accent)",
                    border: "none",
                  }}
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  Guardar respuestas
                </button>
              </div>
            )}
          </div>

          {/* Columna derecha */}
          <aside className="profile-side">
            {completeness.percent < 100 ? (
              <div className="profile-progress">
                <div className="profile-progress__header">
                  <div className="profile-progress__ring">
                    <svg width="60" height="60" viewBox="0 0 60 60">
                      <circle
                        cx="30"
                        cy="30"
                        r="26"
                        className="profile-progress__ring-bg"
                      />
                      <circle
                        cx="30"
                        cy="30"
                        r="26"
                        className="profile-progress__ring-fill"
                        strokeDasharray={2 * Math.PI * 26}
                        strokeDashoffset={
                          2 * Math.PI * 26 * (1 - completeness.percent / 100)
                        }
                      />
                    </svg>
                    <div className="profile-progress__percent">
                      {completeness.percent}%
                    </div>
                  </div>
                  <div>
                    <div className="profile-progress__title">Tu perfil</div>
                    <div className="profile-progress__subtitle">
                      {completeness.percent}% completo
                    </div>
                  </div>
                </div>

                <div className="profile-progress__list">
                  {completeness.items.map((item, i) => (
                    <div
                      key={i}
                      className={`profile-progress__item ${item.done ? "profile-progress__item--done" : ""}`}
                    >
                      <div
                        className={`profile-progress__check ${item.done ? "profile-progress__check--done" : "profile-progress__check--pending"}`}
                      >
                        {item.done && <Check size={11} strokeWidth={3} />}
                      </div>
                      <span className="profile-progress__item-label">
                        {item.label}
                      </span>
                      <span className="profile-progress__item-count">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Perfil completo — reemplaza el progreso con un badge celebratorio
              <div className="profile-progress profile-progress--complete">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <Check size={24} strokeWidth={3} className="text-bg" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-bold text-text-primary mb-0.5">
                      ¡Perfil completo! ✨
                    </div>
                    <div className="text-[11.5px] text-text-secondary leading-snug">
                      Ya estás listo para conectar.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="profile-tip">
              <div className="profile-tip__icon">
                <Lightbulb size={14} />
              </div>
              <p className="profile-tip__text">
                Un perfil completo recibe hasta{" "}
                <strong>3 veces más visitas</strong>.
              </p>
            </div>

            <div className="profile-quote">
              <div className="profile-quote__header">
                <MessageCircle size={14} /> Consejos de la comunidad
              </div>
              <p className="profile-quote__text">"{currentQuote.text}"</p>
              <p className="profile-quote__author">— {currentQuote.author}</p>
              <div className="profile-quote__dots">
                {QUOTES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setQuoteIndex(i)}
                    className={`profile-quote__dot ${i === quoteIndex ? "profile-quote__dot--active" : ""}`}
                    aria-label={`Quote ${i + 1}`}
                  />
                ))}
              </div>
            </div>
            <MyEventArchives />
          </aside>
        </div>
      </div>

      {feedback && (
        <div className={`profile-toast profile-toast--${feedback.type}`}>
          {feedback.type === "ok" ? (
            <Check size={14} />
          ) : (
            <AlertCircle size={14} />
          )}
          {feedback.message}
        </div>
      )}

      {/* Modal: elegir pregunta */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-300 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => {
            setPickerOpen(false);
            setPickerSlotIndex(null);
            setPickerSearch("");
          }}
        >
          <div
            className="bg-bg-surface rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90vh] sm:max-h-[80vh] flex flex-col overflow-hidden shadow-elevated animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-soft shrink-0">
              <div>
                <div className="text-[14px] font-bold text-text-primary">
                  Elige una pregunta
                </div>
                <div className="text-[11px] text-text-tertiary">
                  Aparecerá en tu perfil público
                </div>
              </div>
              <button
                onClick={() => {
                  setPickerOpen(false);
                  setPickerSlotIndex(null);
                  setPickerSearch("");
                }}
                className="w-7 h-7 rounded-full hover:bg-bg-alt flex items-center justify-center transition-colors"
              >
                <X size={14} className="text-text-tertiary" />
              </button>
            </div>

            {/* Búsqueda */}
            <div className="p-3 border-b border-border-soft shrink-0">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Buscar pregunta..."
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 bg-bg-alt border border-border rounded-lg text-[12px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Lista de preguntas */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2">
              {filteredPickerQuestions.length === 0 ? (
                <div className="text-center py-8 text-[12px] text-text-tertiary">
                  No hay preguntas con "{pickerSearch}"
                </div>
              ) : (
                filteredPickerQuestions.map((q) => {
                  const inUse = visibleAnswers.some(
                    (a) => a.question_id === q.id,
                  );
                  const inCurrentSlot =
                    pickerSlotIndex !== null &&
                    visibleAnswers[pickerSlotIndex]?.question_id === q.id;

                  return (
                    <button
                      key={q.id}
                      onClick={() => handlePickQuestion(q.id)}
                      disabled={inUse && !inCurrentSlot}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-start gap-2.5 ${
                        inUse && !inCurrentSlot
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-bg-alt"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${
                          inUse ? "border-accent bg-accent" : "border-border"
                        }`}
                      >
                        {inUse && (
                          <Check
                            size={10}
                            strokeWidth={3}
                            className="text-bg"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] text-text-primary leading-snug">
                          {q.text}
                        </div>
                        {inUse && !inCurrentSlot && (
                          <div className="text-[10px] text-text-tertiary mt-0.5">
                            Ya está en uso
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: elegir intereses */}
      {interestsPickerOpen && (
        <div
          className="fixed inset-0 z-300 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => {
            setInterestsPickerOpen(false);
            setInterestsSearch("");
          }}
        >
          <div
            className="bg-bg-surface rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-elevated animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-soft shrink-0">
              <div>
                <div className="text-[14px] font-bold text-text-primary">
                  Elige tus intereses
                </div>
                <div className="text-[11px] text-text-tertiary">
                  {interestsSelected.length} de 5 seleccionados
                </div>
              </div>
              <button
                onClick={() => {
                  setInterestsPickerOpen(false);
                  setInterestsSearch("");
                }}
                className="w-7 h-7 rounded-full hover:bg-bg-alt flex items-center justify-center transition-colors"
              >
                <X size={14} className="text-text-tertiary" />
              </button>
            </div>

            {/* Búsqueda */}
            <div className="p-3 border-b border-border-soft shrink-0">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                />
                <input
                  type="text"
                  value={interestsSearch}
                  onChange={(e) => setInterestsSearch(e.target.value)}
                  placeholder="Buscar interés..."
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 bg-bg-alt border border-border rounded-lg text-[12px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Lista agrupada */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2">
              {groupedInterests.every((g) => g.items.length === 0) ? (
                <div className="text-center py-8 text-[12px] text-text-tertiary">
                  No hay intereses con "{interestsSearch}"
                </div>
              ) : (
                groupedInterests.map((group) => {
                  if (group.items.length === 0) return null;
                  return (
                    <div key={group.name} className="mb-3">
                      {group.name !== "Todos" && (
                        <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-3 py-2">
                          {group.name}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5 px-2">
                        {group.items.map((interest) => {
                          const selected = interestsSelected.includes(
                            interest.id,
                          );
                          const atMax =
                            interestsSelected.length >= 5 && !selected;

                          return (
                            <button
                              key={interest.id}
                              type="button"
                              onClick={() => handleToggleInterest(interest.id)}
                              disabled={atMax}
                              className={`text-[11.5px] px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                                selected
                                  ? "bg-accent text-bg border-accent font-semibold"
                                  : atMax
                                    ? "bg-bg-alt/50 border-border/50 text-text-tertiary/50 cursor-not-allowed"
                                    : "bg-bg-alt border-border text-text-secondary hover:border-accent/40 hover:text-text-primary"
                              }`}
                            >
                              <span>{interest.emoji}</span>
                              {interest.name}
                              {selected && <Check size={10} strokeWidth={3} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer con acción */}
            <div className="p-3 border-t border-border-soft shrink-0">
              <button
                type="button"
                onClick={() => {
                  setInterestsPickerOpen(false);
                  setInterestsSearch("");
                }}
                disabled={interestsSelected.length < 3}
                className="w-full py-2.5 rounded-xl bg-accent text-bg text-[12.5px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {interestsSelected.length < 3
                  ? `Elige al menos ${3 - interestsSelected.length} más`
                  : "Listo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: detalles del perfil */}
      {detailsOpen && (
        <div
          className="fixed inset-0 z-300 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDetailsOpen(false)}
        >
          <div
            className="bg-bg-surface rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-elevated animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-soft shrink-0">
              <div>
                <div className="text-[14px] font-bold text-text-primary">
                  Detalles de tu perfil
                </div>
                <div className="text-[11px] text-text-tertiary">
                  Todo es opcional. Solo se muestra lo que completes.
                </div>
              </div>
              <button
                onClick={() => setDetailsOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-bg-alt flex items-center justify-center transition-colors"
              >
                <X size={14} className="text-text-tertiary" />
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
              {/* Orientación sexual */}
              <DetailSelect
                label="Orientación sexual"
                value={detailsForm.sexual_orientation}
                onChange={(v) =>
                  setDetailsForm((p) => ({ ...p, sexual_orientation: v }))
                }
                options={SEXUAL_ORIENTATION}
              />

              {/* Estado civil */}
              <DetailSelect
                label="Estado civil"
                value={detailsForm.marital_status}
                onChange={(v) =>
                  setDetailsForm((p) => ({ ...p, marital_status: v }))
                }
                options={MARITAL_STATUS}
              />

              {/* Hijos */}
              <DetailSelect
                label="Hijos"
                value={detailsForm.has_kids}
                onChange={(v) => setDetailsForm((p) => ({ ...p, has_kids: v }))}
                options={HAS_KIDS}
              />

              {/* Personalidad */}
              <DetailSelect
                label="Personalidad"
                value={detailsForm.personality}
                onChange={(v) =>
                  setDetailsForm((p) => ({ ...p, personality: v }))
                }
                options={PERSONALITY}
              />

              {/* Fuma */}
              <DetailSelect
                label="Fuma"
                value={detailsForm.smokes}
                onChange={(v) => setDetailsForm((p) => ({ ...p, smokes: v }))}
                options={SMOKES}
              />

              {/* Bebe */}
              <DetailSelect
                label="Bebe"
                value={detailsForm.drinks}
                onChange={(v) => setDetailsForm((p) => ({ ...p, drinks: v }))}
                options={DRINKS}
              />

              {/* Religión */}
              <DetailSelect
                label="Religión"
                value={detailsForm.religion}
                onChange={(v) => setDetailsForm((p) => ({ ...p, religion: v }))}
                options={RELIGION}
              />

              {/* Altura */}
              <div>
                <label className="text-[11px] font-semibold text-text-primary mb-1.5 block">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  min={100}
                  max={250}
                  value={detailsForm.height_cm || ""}
                  onChange={(e) =>
                    setDetailsForm((p) => ({
                      ...p,
                      height_cm: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    }))
                  }
                  placeholder="Ej: 172"
                  className="w-full px-3 py-2.5 bg-bg-alt border border-border rounded-xl text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
                />
                {detailsForm.height_cm && (
                  <p className="text-[10.5px] text-text-tertiary mt-1.5">
                    Se mostrará como:{" "}
                    <span className="text-text-primary font-medium">
                      {formatHeight(detailsForm.height_cm)}
                    </span>
                  </p>
                )}
              </div>

              {/* Idiomas */}
              <div>
                <label className="text-[11px] font-semibold text-text-primary mb-2 block">
                  Idiomas
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGES.map((lang) => {
                    const selected = detailsForm.languages?.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleToggleLanguage(lang)}
                        className={`text-[11.5px] px-3 py-1.5 rounded-full border transition-all ${
                          selected
                            ? "bg-accent text-bg border-accent font-semibold"
                            : "bg-bg-alt border-border text-text-secondary hover:border-accent/40"
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer con acciones */}
            <div className="p-3 border-t border-border-soft shrink-0 flex gap-2">
              <button
                type="button"
                onClick={() => setDetailsOpen(false)}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-bg-alt text-text-primary text-[12.5px] font-semibold hover:bg-border transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveDetails}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-accent text-bg text-[12.5px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    Guardar detalles
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: ajustar foto */}
      {adjustPhotoIndex !== null &&
        (() => {
          const photo = photos.find((p) => p.position === adjustPhotoIndex);
          if (!photo) return null;
          return (
            <PhotoAdjustModal
              photoUrl={photo.url}
              initialFocal={photo.focal_point || { x: 50, y: 50 }}
              aspectRatio="square"
              onSave={handleSaveFocalPoint}
              onClose={() => setAdjustPhotoIndex(null)}
            />
          );
        })()}
    </AppLayout>
  );
}

function DetailChip({ label }) {
  if (!label) return null;
  return (
    <span className="inline-flex items-center text-[11px] px-2.5 py-1 rounded-full bg-bg-alt border border-border text-text-secondary">
      {label}
    </span>
  );
}

function DetailSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-text-primary mb-1.5 block">
        {label}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full px-3 py-2.5 bg-bg-alt border border-border rounded-xl text-[13px] text-text-primary focus:outline-none focus:border-accent cursor-pointer"
      >
        <option value="">— Sin especificar —</option>
        {Object.entries(options).map(([key, lbl]) => (
          <option key={key} value={key}>
            {lbl}
          </option>
        ))}
      </select>
    </div>
  );
}
