import { useState } from "react";
import { MapPin, Sparkles, Heart, ChevronDown, ChevronUp } from "lucide-react";
import Badges from "./Badges";
import ProfileAttributes from "./ProfileAttributes";
import PiBadge from "../ui/PiBadge";

export default function ProfileDetails({ profile }) {
  const [expanded, setExpanded] = useState(false);

  if (!profile) return null;

  const isFounder = profile.role === "founder";
  const hearts = profile.hearts ?? 3;
  const answers = profile.answers || [];
  const interests = profile.interests || [];

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
          <p className="text-[12px] text-text-secondary italic mb-2">
            "{profile.tagline}"
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <PiBadge pi={profile.pi || 0} size="sm" />
        </div>

        <div className="flex items-center gap-1 text-[11px] text-text-tertiary">
          <MapPin size={11} />
          <span>{profile.city || "Sin ciudad"}</span>
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
        {profile.bio && (
          <p className="text-[12.5px] text-text-primary leading-relaxed">
            {profile.bio}
          </p>
        )}

        {!expanded && (answers.length > 0 || interests.length > 0) && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-border rounded-xl text-[12px] font-medium text-text-secondary hover:bg-bg-alt hover:text-text-primary transition-colors"
          >
            Descubrir más
            <ChevronDown size={14} />
          </button>
        )}

        {expanded && (
          <>
            <ProfileAttributes profile={profile} />
            {answers.length > 0 && (
              <div>
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles size={10} className="text-accent" />
                  Sus respuestas
                </div>
                <div className="space-y-3">
                  {answers.map((a, i) => (
                    <div
                      key={i}
                      className="bg-bg-alt rounded-xl p-3 border border-border-soft"
                    >
                      <div className="text-[10px] text-text-tertiary italic mb-1 leading-snug">
                        {a.question}
                      </div>
                      <div className="text-[12.5px] text-text-primary leading-relaxed">
                        {a.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {interests.length > 0 && (
              <div>
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2">
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

            <button
              onClick={() => setExpanded(false)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] text-text-tertiary hover:text-text-primary transition-colors"
            >
              Ver menos
              <ChevronUp size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
