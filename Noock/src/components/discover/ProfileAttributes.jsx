import {
  Heart,
  Users,
  Baby,
  Cigarette,
  Wine,
  Languages as LangIcon,
  Ruler,
  Sparkles as SparkIcon,
  Church,
  Star,
  User,
} from "lucide-react";
import {
  GENDER_INTERNAL,
  SEXUAL_ORIENTATION,
  MARITAL_STATUS,
  HAS_KIDS,
  SMOKES,
  DRINKS,
  PERSONALITY,
  RELIGION,
  getZodiac,
  formatHeight,
} from "../../lib/profileLabels";

export default function ProfileAttributes({ profile }) {
  if (!profile) return null;

  const items = [];

  // Género
  const genderKey = profile.gender_internal || profile.gender;
  const genderLabel = GENDER_INTERNAL[genderKey];
  if (genderLabel && genderKey !== "prefiero_no_decir") {
    items.push({
      icon: User,
      label: genderLabel,
    });
  }

  // Orientación sexual
  if (
    profile.sexual_orientation &&
    profile.sexual_orientation !== "prefiero_no_decir"
  ) {
    items.push({
      icon: Heart,
      label: SEXUAL_ORIENTATION[profile.sexual_orientation],
      subtle: true,
    });
  }

  // Estado civil
  if (
    profile.marital_status &&
    profile.marital_status !== "prefiero_no_decir"
  ) {
    items.push({
      icon: Users,
      label: MARITAL_STATUS[profile.marital_status],
    });
  }

  // Hijos
  if (profile.has_kids && profile.has_kids !== "prefiero_no_decir") {
    items.push({
      icon: Baby,
      label: HAS_KIDS[profile.has_kids],
    });
  }

  // Personalidad
  if (
    profile.personality &&
    profile.personality !== "prefiero_no_etiquetarme"
  ) {
    items.push({
      icon: SparkIcon,
      label: PERSONALITY[profile.personality],
    });
  }

  // Fuma
  if (
    profile.smokes &&
    profile.smokes !== "prefiero_no_decir" &&
    profile.smokes !== "no"
  ) {
    items.push({
      icon: Cigarette,
      label: SMOKES[profile.smokes],
    });
  }

  // Bebe
  if (
    profile.drinks &&
    profile.drinks !== "prefiero_no_decir" &&
    profile.drinks !== "no"
  ) {
    items.push({
      icon: Wine,
      label: DRINKS[profile.drinks],
    });
  }

  // Religión
  if (profile.religion && profile.religion !== "prefiero_no_decir") {
    items.push({
      icon: Church,
      label: RELIGION[profile.religion],
    });
  }

  // Altura
  if (profile.height_cm) {
    items.push({
      icon: Ruler,
      label: formatHeight(profile.height_cm),
    });
  }

  // Idiomas
  if (profile.languages?.length > 0) {
    items.push({
      icon: LangIcon,
      label: profile.languages.join(" · "),
    });
  }

  // Zodiaco (se calcula desde birth_date)
  const zodiac = getZodiac(profile.birth_date);
  if (zodiac) {
    items.push({
      icon: Star,
      label: `${zodiac.emoji} ${zodiac.name}`,
      subtle: true,
    });
  }

  if (items.length === 0) return null;

  return (
    <div>
      <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2">
        Detalles
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border ${
                item.subtle
                  ? "bg-transparent border-border-soft text-text-tertiary"
                  : "bg-bg-alt border-border text-text-secondary"
              }`}
            >
              <Icon size={10} className="shrink-0" />
              {item.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
