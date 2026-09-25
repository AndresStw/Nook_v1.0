import { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  CheckCircle2,
  SlidersHorizontal,
  X,
  Search,
  Sparkles,
  Flame,
  Users,
  Clock,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import { useExplore } from "../hooks/useExplore";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

const SORT_OPTIONS = [
  { id: "recent", label: "Recientes", icon: Clock },
  { id: "new", label: "Nuevos", icon: Sparkles },
  { id: "pi", label: "Top PI", icon: Flame },
];

export default function Explore() {
  const { profile } = useAuth();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [sort, setSort] = useState("recent");
  const [cities, setCities] = useState([]);
  const [interests, setInterests] = useState([]);

  const { users, loading, error, refetch } = useExplore({
    city: selectedCity,
    interestIds: selectedInterests,
    sort,
    limit: 100,
  });

  // Cargar catálogos
  useEffect(() => {
    supabase
      .from("interests")
      .select("*")
      .order("name")
      .then(({ data }) => setInterests(data || []));

    // Ciudades únicas de usuarios activos
    supabase
      .from("users")
      .select("city")
      .not("city", "is", null)
      .eq("banned", false)
      .eq("shadowbanned", false)
      .then(({ data }) => {
        const uniqueCities = [
          ...new Set((data || []).map((u) => u.city)),
        ].sort();
        setCities(uniqueCities);
      });
  }, []);

  // Agrupar usuarios
  const groups = useMemo(() => {
    const g = {
      activeNow: [],
      myCity: [],
      sharedInterests: [],
      newUsers: [],
      everyone: [],
    };

    users.forEach((u) => {
      let added = false;

      if (u.is_active) {
        g.activeNow.push(u);
        added = true;
      }
      if (u.is_my_city && profile?.city && u.city === profile.city) {
        g.myCity.push(u);
        added = true;
      }
      if (u.shared_interests_count >= 2) {
        g.sharedInterests.push(u);
        added = true;
      }
      if (u.is_new) {
        g.newUsers.push(u);
        added = true;
      }
      if (!added) {
        g.everyone.push(u);
      }
    });

    return g;
  }, [users, profile?.city]);

  const toggleInterest = (id) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const clearFilters = () => {
    setSelectedCity("");
    setSelectedInterests([]);
    setSort("recent");
  };

  const hasActiveFilters =
    selectedCity || selectedInterests.length > 0 || sort !== "recent";

  return (
    <AppLayout>
      <div className="h-full flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-text-primary mb-0.5">
              Explorar
            </h1>
            <p className="text-[12px] text-text-secondary">
              {users.length} {users.length === 1 ? "persona" : "personas"} cerca
              de ti
            </p>
          </div>

          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-[12px] font-medium transition-colors ${
              hasActiveFilters
                ? "bg-accent/10 border-accent text-accent-hover"
                : "bg-bg-surface border-border text-text-primary hover:bg-bg-alt"
            }`}
          >
            <SlidersHorizontal size={14} />
            Filtros
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            )}
          </button>
        </div>

        {/* Panel de filtros */}
        {filterOpen && (
          <div className="bg-bg-surface border border-border rounded-xl p-4 shrink-0">
            {/* Ciudad */}
            <div className="mb-4">
              <label className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold mb-2 block">
                Ciudad
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCity("")}
                  className={`text-[11px] px-3 py-1.5 rounded-full border transition-all ${
                    !selectedCity
                      ? "bg-accent text-bg border-accent font-semibold"
                      : "bg-bg-alt border-border text-text-secondary hover:border-accent/40"
                  }`}
                >
                  Todas
                </button>
                {cities.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCity(c)}
                    className={`text-[11px] px-3 py-1.5 rounded-full border transition-all ${
                      selectedCity === c
                        ? "bg-accent text-bg border-accent font-semibold"
                        : "bg-bg-alt border-border text-text-secondary hover:border-accent/40"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Intereses */}
            <div className="mb-4">
              <label className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold mb-2 block">
                Intereses ({selectedInterests.length} seleccionados)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {interests.map((int) => {
                  const selected = selectedInterests.includes(int.id);
                  return (
                    <button
                      key={int.id}
                      onClick={() => toggleInterest(int.id)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                        selected
                          ? "bg-accent text-bg border-accent font-semibold"
                          : "bg-bg-alt border-border text-text-secondary hover:border-accent/40"
                      }`}
                    >
                      {int.emoji} {int.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ordenar */}
            <div className="mb-4">
              <label className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold mb-2 block">
                Ordenar por
              </label>
              <div className="flex gap-2">
                {SORT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const selected = sort === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSort(opt.id)}
                      className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border transition-all ${
                        selected
                          ? "bg-accent text-bg border-accent font-semibold"
                          : "bg-bg-alt border-border text-text-secondary hover:border-accent/40"
                      }`}
                    >
                      <Icon size={11} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[11px] text-error font-medium hover:underline flex items-center gap-1"
              >
                <X size={11} />
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* Contenido */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {loading && (
            <div className="text-center py-12 text-text-tertiary text-[12px]">
              Cargando perfiles...
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-error text-[12px]">
              {error}
              <button
                onClick={refetch}
                className="block mx-auto mt-2 text-accent-hover underline text-[11px]"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && users.length === 0 && (
            <div className="text-center py-12">
              <Users size={32} className="text-text-tertiary mx-auto mb-3" />
              <p className="text-[13px] text-text-secondary mb-1">
                No hay perfiles con esos filtros
              </p>
              <p className="text-[11px] text-text-tertiary">
                Prueba quitando algún filtro
              </p>
            </div>
          )}

          {!loading && users.length > 0 && (
            <div className="space-y-6 pb-4">
              <Section
                title="🔥 Activos ahora"
                subtitle="Conectados en las últimas 24 horas"
                users={groups.activeNow}
              />
              <Section
                title={`📍 Cerca de ti${profile?.city ? ` en ${profile.city}` : ""}`}
                subtitle="Personas de tu ciudad"
                users={groups.myCity}
              />
              <Section
                title="💚 Con tus intereses"
                subtitle="Comparten 2 o más intereses contigo"
                users={groups.sharedInterests}
              />
              <Section
                title="✨ Recién llegados"
                subtitle="Se unieron en los últimos 7 días"
                users={groups.newUsers}
              />
              <Section
                title="👥 Todos"
                subtitle="El resto de la comunidad"
                users={groups.everyone}
              />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function Section({ title, subtitle, users }) {
  if (!users || users.length === 0) return null;

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-[14px] font-bold text-text-primary mb-0.5">
          {title}
          <span className="ml-2 text-[11px] font-normal text-text-tertiary">
            {users.length}
          </span>
        </h2>
        <p className="text-[11px] text-text-tertiary">{subtitle}</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {users.map((u) => (
          <ProfileGridCard key={u.id} profile={u} />
        ))}
      </div>
    </div>
  );
}

function ProfileGridCard({ profile }) {
  const mainPhoto = profile.photos?.[0]?.url;

  return (
    <button className="relative rounded-xl overflow-hidden aspect-[3/4] group text-left">
      {mainPhoto ? (
        <img
          src={mainPhoto}
          alt={profile.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="absolute inset-0 bg-bg-alt flex items-center justify-center text-text-tertiary text-[20px]">
          {profile.name?.[0] || "?"}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

      {/* Verificado */}
      {profile.verified && (
        <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white/95 backdrop-blur flex items-center justify-center">
          <CheckCircle2 size={14} className="text-text-primary" />
        </div>
      )}

      {/* Info */}
      <div className="absolute inset-x-0 bottom-0 p-3 text-white">
        <div className="text-[13px] font-semibold mb-0.5 truncate">
          {profile.name}
          {profile.age ? `, ${profile.age}` : ""}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-white/85 mb-1.5">
          <MapPin size={9} />
          {profile.city || "Sin ciudad"}
        </div>
        {profile.shared_interests_count > 0 && (
          <div className="text-[9px] px-1.5 py-0.5 bg-accent/30 backdrop-blur-sm border border-accent/40 rounded-full inline-block">
            💚 {profile.shared_interests_count} en común
          </div>
        )}
      </div>
    </button>
  );
}
