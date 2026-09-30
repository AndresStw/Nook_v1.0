import { MapPin, Sparkles, Heart } from "lucide-react";
import Badges from "./Badges";
import ProfileAttributes from "./ProfileAttributes";
import PiBadge from "../ui/PiBadge";
import { GENDER_INTERNAL } from "../../lib/profileLabels";

//Componente
export default function ProfileDetails({ profile }) {
  if (!profile) return null;

  const isFounder = profile.role === "founder";
  const hearts = profile.hearts ?? 3;
  const answers = profile.answers || [];
  const interests = profile.interests || [];

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

      {/* Insignias + Corazones (el fundador no tiene corazones) */}
      <div className="px-5 py-3.5 border-b border-border-soft shrink-0 flex items-center justify-between">
        <Badges profile={profile} />

        {!isFounder && (
          <div
            title="Nook premia el respeto."
            className="flex items-center gap-1 cursor-help"
          >
            {[1, 2, 3].map((i) => (
              <Heart
                key={i}
                size={13}
                className={
                  i <= hearts
                    ? "text-accent fill-accent"
                    : "text-text-tertiary/30"
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Contenido con scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
        {/* Biografía en cajita contenida */}
        {profile.bio && (
          <div>
            <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2 font-semibold">
              Sobre mí
            </div>
            <div className="bg-bg-alt rounded-2xl p-4 border border-border-soft shadow-xs">
              <p className="text-[12.5px] text-text-primary leading-relaxed break-words whitespace-pre-wrap">
                {profile.bio}
              </p>
            </div>
          </div>
        )}

        {/* Las 3 preguntas y respuestas */}
        {answers.length > 0 && (
          <div>
            <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2.5 flex items-center gap-1 font-semibold">
              <Sparkles size={11} className="text-accent" />
              Sus respuestas ({answers.length})
            </div>
            <div className="space-y-2.5">
              {answers.map((a, i) => (
                <div
                  key={i}
                  className="bg-bg-alt rounded-2xl p-3.5 border border-border-soft space-y-1 shadow-xs"
                >
                  <div className="text-[11px] font-semibold text-text-secondary leading-snug">
                    {a.question}
                  </div>
                  <div className="text-[13px] text-text-primary leading-relaxed break-words italic">
                    "{a.answer}"
                  </div>
                </div>
              ))}
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

        {/* Atributos / Detalles (Género, Altura, Signo, etc.) */}
        <ProfileAttributes profile={profile} />
      </div>
    </div>
  );
}
