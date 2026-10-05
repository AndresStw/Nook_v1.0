// src/components/discover/ProfileDetails.jsx
import { MapPin, Sparkles, Star } from "lucide-react";
import Badges from "./Badges";
import ProfileAttributes from "./ProfileAttributes";
import PiBadge from "../ui/PiBadge";
import { GENDER_INTERNAL } from "../../lib/profileLabels";

//Componente
export default function ProfileDetails({ profile }) {
  if (!profile) return null;

  const isFounder = profile.role === "founder";
  const hearts = profile.hearts ?? 3;
  const rawAnswers = profile.answers || [];
  const interests = profile.interests || [];

  // Ordenar: featured primero, luego el resto
  const answers = [...rawAnswers].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return 0;
  });

  // Obtener etiqueta de género legible
  const genderKey = profile.gender_internal || profile.gender;
  const genderLabel =
    GENDER_INTERNAL[genderKey] ||
    (genderKey && genderKey !== "prefiero_no_decir" ? genderKey : null);

  return (
    <div
      className={`h-full flex flex-col bg-bg-surface border border-border rounded-2xl shadow-soft overflow-hidden ${
        isFounder ? "founder-card-aura border-amber-200" : ""
      }`}
    >
      {/* Header */}
      <div className="p-5 border-b border-border-soft shrink-0">
        <h2
          className={`text-[18px] font-bold leading-tight mb-1 ${
            isFounder ? "founder-name" : "text-text-primary"
          }`}
        >
          {profile.name}
          {profile.age ? `, ${profile.age}` : ""}
        </h2>

        {profile.tagline && (
          <p className="text-[12px] text-text-secondary italic mb-2 line-clamp-2">
            "{profile.tagline}"
          </p>
        )}

        <div className="flex items-center gap-2 mt-2">
          <PiBadge pi={profile.pi || 0} size="sm" />
        </div>

        <div className="flex items-center gap-2 text-[11px] text-text-tertiary mt-2 flex-wrap">
          <div className="flex items-center gap-1">
            <MapPin size={11} />
            <span>{profile.city || "Sin ciudad"}</span>
          </div>

          {genderLabel && (
            <>
              <span>·</span>
              <span className="font-medium text-text-secondary bg-bg-alt border border-border-soft px-2 py-0.5 rounded-full text-[10.5px]">
                {genderLabel}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Insignias + Corazones */}
      <div className="px-5 py-3.5 border-b border-border-soft shrink-0 flex items-center justify-between">
        <Badges profile={profile} />

        {!isFounder && (
          <div
            title="Nook premia el respeto."
            className="flex items-center gap-1 cursor-help"
          >
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`text-[13px] ${
                  i <= hearts ? "text-accent" : "text-text-tertiary/30"
                }`}
              >
                ♥
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Contenido con scroll — respuestas primero */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
        {/* ⭐ RESPUESTAS — van arriba porque son lo único visible pre-match */}
        {answers.length > 0 && (
          <div>
            <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2.5 flex items-center gap-1 font-semibold">
              <Sparkles size={11} className="text-accent" />
              Lo que dice ({answers.length})
            </div>
            <div className="space-y-3">
              {answers.map((a, i) => {
                const isFeatured = a.is_featured;
                return (
                  <div
                    key={i}
                    className={`rounded-2xl p-4 border shadow-xs ${
                      isFeatured
                        ? "bg-accent/5 border-accent/30"
                        : "bg-bg-alt border-border-soft"
                    }`}
                  >
                    {isFeatured && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent text-bg text-[9px] font-bold uppercase tracking-wider mb-2">
                        <Star size={8} className="fill-bg" />
                        Destacada
                      </div>
                    )}
                    <div className="text-[11px] font-semibold text-text-secondary leading-snug mb-1.5">
                      {a.question}
                    </div>
                    <div
                      className={`leading-relaxed wrap-break-word italic ${
                        isFeatured
                          ? "text-[14.5px] text-text-primary font-medium"
                          : "text-[13px] text-text-primary"
                      }`}
                    >
                      "{a.answer}"
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Intereses */}
        {interests.length > 0 && (
          <div>
            <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2 font-semibold">
              Intereses
            </div>
            <div className="flex flex-wrap gap-1.5">
              {interests.map((i, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2.5 py-1 bg-bg-alt border border-border rounded-full text-text-secondary"
                >
                  {i.emoji} {i.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Biografía — ahora va abajo */}
        {profile.bio && (
          <div>
            <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2 font-semibold">
              Sobre mí
            </div>
            <div className="bg-bg-alt rounded-2xl p-4 border border-border-soft shadow-xs">
              <p className="text-[12.5px] text-text-primary leading-relaxed wrap-break-word whitespace-pre-wrap">
                {profile.bio}
              </p>
            </div>
          </div>
        )}

        {/* Atributos */}
        <ProfileAttributes profile={profile} />
      </div>
    </div>
  );
}
