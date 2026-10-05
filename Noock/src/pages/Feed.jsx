// src/pages/Feed.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import DiscoverCard from "../components/discover/DiscoverCard";
import { useFeed } from "../hooks/useFeed";
import { supabase } from "../lib/supabase";
import ProfileDetails from "../components/discover/ProfileDetails";
import { useSound } from "../hooks/useSound";
import { useCanInteract } from "../hooks/useCanInteract";
import { useAuth } from "../hooks/useAuth";
import DailyLoginBanner from "../components/daily/DailyLoginBanner";
import { useDiscovery } from "../hooks/useDiscovery";
import NewsBanner from "../components/feed/NewsBanner";
import { useSwipeLimit } from "../hooks/useSwipeLimit";
import SwipeCounter from "../components/discover/SwipeCounter";
import NoSwipesModal from "../components/discover/NoSwipesModal";

//Componente
export default function Feed() {
  const navigate = useNavigate();
  const { play } = useSound();
  const { user, profile } = useAuth();
  const { profiles, loading, error, refetch } = useFeed(10);
  const { canInteract, reason: blockReason } = useCanInteract(
    user?.id,
    profile?.onboarding_completed,
    profile?.role === "founder",
  );

  // 🔄 Fase 9 — Swipe limit
  const { canSwipe, swipesLeft, maxSwipes, resetAt, recordSwipe } =
    useSwipeLimit();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [matched, setMatched] = useState(null);
  const [toast, setToast] = useState(null);

  const currentProfile = profiles[currentIndex] || null;
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [noSwipesOpen, setNoSwipesOpen] = useState(false); // Fase 9

  useDiscovery("visit_feed");

  // Cerrar sheet al cambiar de perfil
  useEffect(() => {
    setDetailsSheetOpen(false);
  }, [currentIndex]);

  // Escuchar matches nuevos (para la otra persona)
  useEffect(() => {
    const handleMatch = async (e) => {
      const { matchId, otherUserId } = e.detail;
      const found = profiles.find((p) => p.id === otherUserId);
      if (found) {
        setMatched({ profile: found, matchId });
      } else {
        refetch();
      }
    };
    window.addEventListener("nook-match", handleMatch);
    return () => window.removeEventListener("nook-match", handleMatch);
  }, [profiles, refetch]);

  // Cargar favoritos
  useEffect(() => {
    const loadFavorites = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("favorites")
        .select("target_id")
        .eq("user_id", user.id);

      if (data) {
        setFavoritedIds(new Set(data.map((f) => f.target_id)));
      }
    };
    loadFavorites();
  }, []);

  // Auto-ocultar toast
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timeout);
  }, [toast]);

  // ============================================
  // Fase 11 — "Hablar primero" (no consume swipe)
  // ============================================
  const handleStartBlindChat = async () => {
    if (!currentProfile || processing) return;
    if (!canInteract) {
      setToast({
        type: "error",
        message:
          blockReason === "readonly"
            ? "Estás en modo exploración. Completa tu perfil para interactuar."
            : "Completa tu perfil para interactuar.",
      });
      return;
    }

    setProcessing(true);

    // 1. Like silencioso (registra interés, no bloquea el flujo)
    const { data: likeData, error: likeErr } = await supabase.rpc("send_like", {
      target_user_id: currentProfile.id,
    });

    if (likeErr) {
      console.warn("Like silencioso falló:", likeErr.message);
    }

    // 2. Si con ese like ya hubo match → overlay y no abrimos blind
    if (likeData?.matched) {
      play("match");
      setMatched({
        profile: currentProfile,
        matchId: likeData.match_id,
      });
      setProcessing(false);
      return;
    }

    // 3. Iniciar cita a ciegas
    const { data: blindData, error: blindErr } = await supabase.rpc(
      "start_blind_chat",
      { target_user_id: currentProfile.id },
    );

    setProcessing(false);

    if (blindErr || blindData?.error) {
      console.warn(
        "No pudimos iniciar la cita a ciegas:",
        blindErr?.message || blindData?.error,
      );
      setToast({
        type: "error",
        message:
          "No pudimos iniciar la cita a ciegas. Vuelve a intentarlo en un momento.",
      });
      return;
    }

    const chatId = blindData?.chat_id;
    if (chatId) {
      play("blind_chat");
      navigate(`/blind/${chatId}`);
    } else {
      navigate("/messages");
    }
  };

  // ============================================
  // Fase 9 — "No me interesa" (consume swipe)
  // ============================================
  const handlePass = async () => {
    if (!currentProfile || processing) return;
    if (!canInteract) {
      setToast({
        type: "error",
        message:
          blockReason === "readonly"
            ? "Estás en modo exploración. Completa tu perfil para interactuar."
            : "Completa tu perfil para interactuar.",
      });
      return;
    }

    // 🚫 Gate de swipes
    if (!canSwipe) {
      setNoSwipesOpen(true);
      return;
    }

    setProcessing(true);

    const { error } = await supabase.rpc("send_pass", {
      target_user_id: currentProfile.id,
    });

    if (error) {
      console.error("🚨 NOOK-403: Error enviando pass", error);
    }

    // ✅ Registrar swipe
    await recordSwipe();

    setProcessing(false);
    setCurrentIndex((prev) => prev + 1);
  };

  // Favorito (NO consume swipe)
  const handleToggleFavorite = async () => {
    if (!currentProfile) return;
    if (!canInteract) {
      setToast({
        type: "error",
        message: "Completa tu perfil para guardar perfiles.",
      });
      return;
    }

    const { data, error } = await supabase.rpc("toggle_favorite", {
      p_target_id: currentProfile.id,
    });

    if (error) {
      console.error("🚨 NOOK-502: Error toggle favorito", error);
      return;
    }

    setFavoritedIds((prev) => {
      const next = new Set(prev);
      if (data?.favorited) next.add(currentProfile.id);
      else next.delete(currentProfile.id);
      return next;
    });
  };

  // Reporte (NO consume swipe)
  const handleReport = async (reason) => {
    if (!currentProfile) return;

    const { error } = await supabase.rpc("panic_from_profile", {
      p_target_id: currentProfile.id,
      p_reason: reason,
    });

    if (error) {
      console.error("🚨 NOOK-403: Error reportando", error);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-text-secondary text-[13px]">
            Cargando perfiles...
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center flex-col gap-3">
          <DailyLoginBanner />
          <div className="text-text-primary text-[14px] font-medium">
            Algo salió mal
          </div>
          <div className="text-text-secondary text-[12px]">{error}</div>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-accent text-bg rounded-lg text-[12px] font-medium"
          >
            Reintentar
          </button>
        </div>
      </AppLayout>
    );
  }

  if (!currentProfile) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center flex-col gap-2">
          <div className="text-5xl mb-2">🎭</div>
          <div className="text-text-primary text-[15px] font-bold">
            No hay más perfiles por ahora
          </div>
          <p className="text-text-secondary text-[12px] text-center max-w-xs">
            Vuelve más tarde, la comunidad está creciendo.
          </p>
          <button
            onClick={refetch}
            className="mt-3 px-4 py-2 bg-accent text-bg rounded-lg text-[12px] font-medium"
          >
            Reintentar
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* 🔔 Overlay flotante Fase 5 */}
      <NewsBanner />
      {/* TOAST flotante */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-200 w-[calc(100%-32px)] max-w-sm animate-in">
          <div
            className={`rounded-2xl shadow-2xl px-4 py-3 text-[12.5px] font-semibold text-center ${
              toast.type === "error"
                ? "bg-error text-white"
                : "bg-ink text-cream"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {matched && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setMatched(null)}
        >
          <div
            className="bg-bg-surface rounded-3xl p-6 max-w-md w-full shadow-elevated animate-in text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-3">💚</div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              ¡Hay conexión!
            </h2>
            <p className="text-[13px] text-text-secondary mb-5">
              Tú y {matched.profile.name} se gustaron mutuamente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigate("/messages");
                  setMatched(null);
                }}
                className="flex-1 py-3 bg-accent text-bg rounded-xl font-medium text-[13px] hover:opacity-90 transition-opacity"
              >
                Enviar mensaje
              </button>
              <button
                onClick={() => setMatched(null)}
                className="flex-1 py-3 border border-border text-text-primary rounded-xl font-medium text-[13px] hover:bg-bg-alt transition-colors"
              >
                Seguir explorando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal sin swipes (Fase 9) */}
      <NoSwipesModal
        open={noSwipesOpen}
        profile={currentProfile}
        resetAt={resetAt}
        onClose={() => setNoSwipesOpen(false)}
      />

      {/* Desktop: 2 columnas | Móvil: solo card */}
      <div className="h-full w-full flex items-center justify-center p-2 md:p-4 min-h-0 overflow-hidden">
        <div className="w-full max-w-5xl h-full max-h-205 grid grid-cols-1 md:grid-cols-[1.1fr_1fr] grid-rows-1 gap-3 md:gap-4 min-h-0">
          {/* Columna izquierda: contador + card */}
          <div className="min-h-0 h-full flex flex-col gap-2">
            <div className="shrink-0">
              <SwipeCounter
                swipesLeft={swipesLeft}
                maxSwipes={maxSwipes}
                resetAt={resetAt}
              />
            </div>

            <div className="flex-1 min-h-0">
              <DiscoverCard
                profile={currentProfile}
                onStartBlindChat={handleStartBlindChat}
                onPass={handlePass}
                onSave={handleToggleFavorite}
                onReport={handleReport}
                onShowDetails={() => setDetailsSheetOpen(true)}
                isFavorited={favoritedIds.has(currentProfile.id)}
                disabled={processing}
              />
            </div>
          </div>

          {/* Detalles solo en desktop */}
          <div className="hidden md:block min-h-0 h-full">
            <ProfileDetails profile={currentProfile} />
          </div>
        </div>
      </div>

      {/* Sheet de detalles (solo móvil) */}
      {detailsSheetOpen && (
        <div className="md:hidden fixed inset-0 z-150 bg-bg flex flex-col">
          <div className="flex items-center gap-3 p-3 border-b border-border-soft shrink-0">
            <button
              onClick={() => setDetailsSheetOpen(false)}
              className="w-9 h-9 rounded-full hover:bg-bg-alt flex items-center justify-center transition-colors"
            >
              <ArrowLeft size={18} className="text-text-primary" />
            </button>
            <span className="text-[14px] font-bold text-text-primary">
              Sobre {currentProfile.name?.split(" ")[0]}
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <ProfileDetails profile={currentProfile} />
          </div>
        </div>
      )}
    </AppLayout>
  );
}
