import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import PiBadge from "../components/ui/PiBadge";
import {
  User,
  MapPin,
  Calendar,
  Sparkles,
  FileText,
  Camera,
  Trash2,
  Plus,
  Eye,
  Loader2,
  Check,
  AlertCircle,
  Lightbulb,
  MessageCircle,
  Lock,
  Heart,
  HelpCircle,
  Palette,
  ChevronRight,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../hooks/useAuth";
import { usePhotos } from "../hooks/usePhotos";
import {
  validateBio,
  validateName,
  validateTagline,
} from "../lib/profileValidation";
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

export default function MyProfile() {
  const navigate = useNavigate();
  const { user, profile, refetchProfile } = useAuth();
  const { theme: currentTheme, setTheme: setCurrentTheme } = useTheme();
  const {
    uploadPhoto,
    deletePhoto,
    uploadVideo,
    deleteVideo,
    uploading,
    limits: photoLimits,
    refreshLimits,
  } = usePhotos(user?.id);

  const [tab, setTab] = useState("info");
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    bio: "",
    city: "",
    birth_date: "",
  });
  const [photos, setPhotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [nameInfo, setNameInfo] = useState({
    changes_left: 2,
    can_change: true,
  });
  const [errors, setErrors] = useState({});
  const [quoteIndex, setQuoteIndex] = useState(0);

  const [interestsList, setInterestsList] = useState([]);
  const [interestsSelected, setInterestsSelected] = useState([]);
  const [questionsList, setQuestionsList] = useState([]);
  const [myAnswers, setMyAnswers] = useState([]);
  const [realCounts, setRealCounts] = useState({
    interests: 0,
    questions: 0,
    answers: 0,
  });

  // Acordeón de preguntas
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [initializedExpansion, setInitializedExpansion] = useState(false);

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

  // Inicializar expansión: abrir preguntas respondidas por defecto
  useEffect(() => {
    if (initializedExpansion || questionsList.length === 0) return;

    const answeredIds = new Set(
      myAnswers
        .filter((a) => a.answer?.trim().length >= 3)
        .map((a) => a.question_id),
    );

    setExpandedQuestions(answeredIds);
    setInitializedExpansion(true);
  }, [questionsList, myAnswers, initializedExpansion]);

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
    }
    setSaving(false);
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
    }
  };

  const handleSaveAnswers = async () => {
    const valid = myAnswers.filter((a) => a.answer?.trim().length >= 3);

    if (valid.length === 0) {
      showToast("Responde al menos una pregunta", "error");
      return;
    }

    const displayedCount = valid.filter((a) => a.is_displayed).length;
    if (displayedCount > 3) {
      showToast("Solo puedes mostrar 3 respuestas", "error");
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

      const { data } = await supabase.rpc("get_my_answers");
      if (Array.isArray(data)) setMyAnswers(data);
    }
  };

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

    const questionsCount = Math.min(realCounts.questions || 0, 3);
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
  }, [photos, form, realCounts]);

  // Ordenar preguntas: visibles primero, luego respondidas, luego vacías
  const sortedQuestions = useMemo(() => {
    return [...questionsList].sort((a, b) => {
      const aAns = myAnswers.find((ans) => ans.question_id === a.id);
      const bAns = myAnswers.find((ans) => ans.question_id === b.id);

      const aDisplayed = aAns?.is_displayed ? 1 : 0;
      const bDisplayed = bAns?.is_displayed ? 1 : 0;
      if (aDisplayed !== bDisplayed) return bDisplayed - aDisplayed;

      const aAnswered = aAns?.answer?.trim().length >= 3 ? 1 : 0;
      const bAnswered = bAns?.answer?.trim().length >= 3 ? 1 : 0;
      if (aAnswered !== bAnswered) return bAnswered - aAnswered;

      return 0;
    });
  }, [questionsList, myAnswers]);

  const currentQuote = QUOTES[quoteIndex];

  if (!profile) return null;

  return (
    <AppLayout>
      <div className="profile-page">
        <div className="profile-page__bg-quote profile-page__bg-quote--left">
          Las mejores conexiones nacen de ser tú mismo.
          <span className="heart">♡</span>
        </div>
        <div className="profile-page__bg-quote profile-page__bg-quote--right">
          Aquí empieza algo bonito...
          <span className="heart">♡</span>
        </div>

        <div className="profile-page__grid">
          {/* Columna izquierda */}
          <div>
            {/* Header */}
            <div className="profile-page__header">
              {photos.find((p) => p.position === 1)?.url ? (
                <img
                  src={photos.find((p) => p.position === 1).url}
                  alt="Yo"
                  className="profile-page__avatar"
                />
              ) : (
                <div className="profile-page__avatar profile-page__avatar--placeholder">
                  {profile?.name?.[0] || "?"}
                </div>
              )}

              <div className="profile-page__header-info">
                <h1 className="profile-page__header-title">Mi perfil</h1>
                <p className="profile-page__header-subtitle">
                  Cuéntale al mundo quién eres
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <PiBadge pi={profile?.pi || 0} size="sm" />
                  {profile?.vip_level && (
                    <span className="text-[10.5px] font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                      VIP {profile.vip_level}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => navigate(`/u/${user?.id}`)}
                className="profile-page__preview-btn"
              >
                <Eye size={14} />
                Vista previa
              </button>
            </div>

            {/* Tabs */}
            <div className="profile-editor__tabs">
              <button
                className={`profile-editor__tab ${tab === "info" ? "profile-editor__tab--active" : ""}`}
                onClick={() => setTab("info")}
              >
                <User size={14} /> Perfil
              </button>
              <button
                className={`profile-editor__tab ${tab === "fotos" ? "profile-editor__tab--active" : ""}`}
                onClick={() => setTab("fotos")}
              >
                <Camera size={14} /> Fotos
              </button>
              <button
                className={`profile-editor__tab ${tab === "intereses" ? "profile-editor__tab--active" : ""}`}
                onClick={() => setTab("intereses")}
              >
                <Heart size={14} /> Intereses
                {interestsSelected.length > 0 && (
                  <span className="profile-editor__tab-count">
                    {interestsSelected.length}
                  </span>
                )}
              </button>
              <button
                className={`profile-editor__tab ${tab === "preguntas" ? "profile-editor__tab--active" : ""}`}
                onClick={() => setTab("preguntas")}
              >
                <HelpCircle size={14} /> Preguntas
                {myAnswers.length > 0 && (
                  <span className="profile-editor__tab-count">
                    {myAnswers.length}
                  </span>
                )}
              </button>
              <button
                className={`profile-editor__tab ${tab === "tema" ? "profile-editor__tab--active" : ""}`}
                onClick={() => setTab("tema")}
              >
                <Palette size={14} /> Tema
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
                      {form.tagline.length}/60
                    </span>
                  </label>
                  <div className="profile-field__input-wrap">
                    <Sparkles size={15} className="profile-field__input-icon" />
                    <input
                      type="text"
                      value={form.tagline}
                      onChange={(e) => handleChange("tagline", e.target.value)}
                      maxLength={60}
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

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full mt-5 py-3 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{
                    background: "var(--color-accent)",
                    color: "var(--color-ink-soft)",
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

                <div className="profile-photos">
                  {[1, 2, 3, 4, 5, 6].map((pos) => {
                    const photo = photos.find((p) => p.position === pos);
                    const isLocked =
                      pos > 3 && (!photoLimits || photoLimits.pi < 3000);

                    return (
                      <div key={pos} className="profile-photo">
                        {photo ? (
                          <>
                            <img src={photo.url} alt={`Foto ${pos}`} />
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
                          <div className="text-[10px] text-center max-w-[240px] leading-snug">
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
                      <div className="text-[10px] text-center max-w-[220px] opacity-80 leading-snug">
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
                    <Heart size={10} /> {interestsSelected.length} seleccionados
                  </span>
                </div>

                <p className="text-[12px] text-text-secondary mb-4">
                  Elige mínimo 3. Aparecerán en tu perfil para conectar con
                  gente afín.
                </p>

                <div className="flex flex-wrap gap-2">
                  {interestsList.map((interest) => {
                    const selected = interestsSelected.includes(interest.id);
                    return (
                      <button
                        key={interest.id}
                        type="button"
                        onClick={() =>
                          setInterestsSelected((prev) =>
                            prev.includes(interest.id)
                              ? prev.filter((i) => i !== interest.id)
                              : [...prev, interest.id],
                          )
                        }
                        className={`text-[12px] px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                          selected
                            ? "bg-accent text-bg border-accent font-semibold"
                            : "bg-bg-alt border-border text-text-secondary hover:border-accent/40"
                        }`}
                      >
                        <span>{interest.emoji}</span>
                        {interest.name}
                        {selected && <Check size={11} strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleSaveInterests}
                  disabled={saving || interestsSelected.length < 3}
                  className="w-full mt-6 py-3 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{
                    background: "var(--color-accent)",
                    color: "var(--color-ink-soft)",
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
                    {myAnswers.filter((a) => a.is_displayed).length} / 3
                    visibles
                  </span>
                </div>

                <p className="text-[12px] text-text-secondary mb-4">
                  Responde las preguntas que quieras. Solo{" "}
                  <strong>3 se mostrarán</strong> en tu perfil — las que marques
                  con ✓.
                </p>

                {/* Botón expandir/colapsar todo */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] text-text-tertiary">
                    {expandedQuestions.size} de {sortedQuestions.length}{" "}
                    abiertas
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (expandedQuestions.size === sortedQuestions.length) {
                        setExpandedQuestions(new Set());
                      } else {
                        setExpandedQuestions(
                          new Set(sortedQuestions.map((q) => q.id)),
                        );
                      }
                    }}
                    className="text-[11px] text-accent-hover font-medium hover:underline"
                  >
                    {expandedQuestions.size === sortedQuestions.length
                      ? "Colapsar todas"
                      : "Expandir todas"}
                  </button>
                </div>

                <div className="space-y-2">
                  {sortedQuestions.map((q) => {
                    const answerObj = myAnswers.find(
                      (a) => a.question_id === q.id,
                    );
                    const answer = answerObj?.answer || "";
                    const isDisplayed = answerObj?.is_displayed || false;
                    const isAnswered = answer.trim().length >= 3;
                    const displayCount = myAnswers.filter(
                      (a) => a.is_displayed,
                    ).length;
                    const canCheck =
                      isAnswered && (isDisplayed || displayCount < 3);
                    const isExpanded = expandedQuestions.has(q.id);

                    const toggleExpand = () => {
                      setExpandedQuestions((prev) => {
                        const next = new Set(prev);
                        if (next.has(q.id)) next.delete(q.id);
                        else next.add(q.id);
                        return next;
                      });
                    };

                    return (
                      <div
                        key={q.id}
                        className={`border rounded-xl transition-colors ${
                          isExpanded
                            ? "border-border bg-bg-surface"
                            : "border-border-soft bg-bg-surface/60 hover:bg-bg-surface"
                        }`}
                      >
                        {/* Header clickeable */}
                        <button
                          type="button"
                          onClick={toggleExpand}
                          className="w-full flex items-start gap-3 p-3 text-left"
                        >
                          <div
                            className={`mt-0.5 shrink-0 transition-transform duration-200 ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          >
                            <ChevronRight
                              size={14}
                              className="text-text-tertiary"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="text-[12.5px] font-medium text-text-primary leading-snug mb-1">
                              {q.text}
                            </div>

                            {!isExpanded && isAnswered && (
                              <div className="text-[11.5px] text-text-secondary truncate italic">
                                "{answer}"
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-1.5">
                              {isDisplayed && (
                                <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-accent text-bg">
                                  ✓ Visible
                                </span>
                              )}
                              {isAnswered && !isDisplayed && (
                                <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-full bg-bg-alt text-text-tertiary">
                                  Respondida
                                </span>
                              )}
                              {!isAnswered && (
                                <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-full bg-bg-alt text-text-tertiary">
                                  Sin responder
                                </span>
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Body expandible */}
                        {isExpanded && (
                          <div className="px-3 pb-3 pl-10">
                            {isAnswered && (
                              <div className="flex justify-end mb-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMyAnswers((prev) =>
                                      prev.map((a) =>
                                        a.question_id === q.id
                                          ? {
                                              ...a,
                                              is_displayed: !a.is_displayed,
                                            }
                                          : a,
                                      ),
                                    );
                                  }}
                                  disabled={!canCheck}
                                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                                    isDisplayed
                                      ? "bg-accent text-bg border-accent"
                                      : canCheck
                                        ? "bg-transparent border-border text-text-tertiary hover:border-accent hover:text-accent-hover"
                                        : "bg-transparent border-border/40 text-text-tertiary/40 cursor-not-allowed"
                                  }`}
                                  title={
                                    isDisplayed
                                      ? "Visible en tu perfil"
                                      : canCheck
                                        ? "Marcar como visible"
                                        : "Ya tienes 3 visibles"
                                  }
                                >
                                  {isDisplayed ? (
                                    <span className="flex items-center gap-1">
                                      <Check size={10} strokeWidth={3} />
                                      Visible
                                    </span>
                                  ) : (
                                    "Mostrar en perfil"
                                  )}
                                </button>
                              </div>
                            )}

                            <textarea
                              value={answer}
                              onChange={(e) => {
                                const text = e.target.value;
                                setMyAnswers((prev) => {
                                  const exists = prev.find(
                                    (a) => a.question_id === q.id,
                                  );
                                  if (exists) {
                                    return prev.map((a) =>
                                      a.question_id === q.id
                                        ? { ...a, answer: text }
                                        : a,
                                    );
                                  }
                                  return [
                                    ...prev,
                                    {
                                      question_id: q.id,
                                      answer: text,
                                      is_displayed: false,
                                    },
                                  ];
                                });
                              }}
                              maxLength={150}
                              rows={2}
                              placeholder="Tu respuesta..."
                              className="profile-field__textarea"
                              style={{ minHeight: "60px" }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="profile-field__feedback profile-field__feedback--info">
                              {answer.length} / 150
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleSaveAnswers}
                  disabled={saving}
                  className="w-full mt-6 py-3 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{
                    background: "var(--color-accent)",
                    color: "var(--color-ink-soft)",
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

            {/* === TAB TEMA === */}
            {tab === "tema" && (
              <div className="profile-card">
                <div className="profile-card__header">
                  <div className="profile-card__header-title">
                    <Palette size={16} /> Tema de la app
                  </div>
                </div>
                <p className="text-[12px] text-text-secondary mb-4">
                  Elige el color que más te represente. Se aplica en toda la app
                  y se guarda en tu cuenta.
                </p>

                <div className="grid grid-cols-4 gap-2.5">
                  {THEMES.map((theme) => {
                    const isLocked = theme.locked;
                    const isSelected = currentTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        disabled={isLocked}
                        onClick={() => {
                          if (isLocked) return;
                          setCurrentTheme(theme.id);
                        }}
                        className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                          isLocked
                            ? "border-border/40 bg-bg-alt/30 cursor-not-allowed opacity-50"
                            : isSelected
                              ? "border-text-primary bg-bg-alt"
                              : "border-border hover:border-text-secondary hover:bg-bg-alt/50"
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-full border-2 relative flex items-center justify-center"
                          style={{
                            backgroundColor: theme.color,
                            borderColor: isSelected ? "#1A1A1A" : "transparent",
                            filter: isLocked ? "grayscale(100%)" : "none",
                          }}
                        >
                          {isLocked && (
                            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-[14px] drop-shadow-md">
                              ✕
                            </span>
                          )}
                          {isSelected && !isLocked && (
                            <Check
                              size={14}
                              className="text-white drop-shadow"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-medium ${isLocked ? "text-text-tertiary" : "text-text-secondary"}`}
                        >
                          {theme.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha */}
          <aside className="profile-side">
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
    </AppLayout>
  );
}
