import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search as SearchIcon, MapPin, X, ArrowLeft } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import Badges from '../components/discover/Badges'
import { useSearch } from '../hooks/useSearch'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const { results, loading, error } = useSearch(query)

  // Sincronizar URL con el query
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length >= 2) {
      setSearchParams({ q: trimmed }, { replace: true })
    } else if (trimmed.length === 0 && searchParams.get('q')) {
      setSearchParams({}, { replace: true })
    }
  }, [query])

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto pb-6">
          {/* Header con buscador */}
          <div className="sticky top-0 z-10 bg-bg pt-1 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-full hover:bg-bg-alt flex items-center justify-center transition-colors"
              >
                <ArrowLeft size={16} className="text-text-secondary" />
              </button>
              <h1 className="text-lg font-bold text-text-primary">Buscar</h1>
            </div>

            <div className="relative">
              <SearchIcon
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar personas, intereses, ciudades..."
                autoFocus
                className="w-full pl-10 pr-10 py-2.5 bg-bg-surface border border-border rounded-xl text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent transition-colors"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-bg-alt hover:bg-border flex items-center justify-center transition-colors"
                >
                  <X size={11} className="text-text-secondary" />
                </button>
              )}
            </div>
          </div>

          {/* Contenido */}
          {query.trim().length < 2 && (
            <div className="text-center py-16">
              <SearchIcon size={32} className="text-text-tertiary mx-auto mb-3" />
              <p className="text-[13px] text-text-secondary mb-1">
                Escribe al menos 2 letras
              </p>
              <p className="text-[11px] text-text-tertiary">
                Busca por nombre, ciudad o algo de la bio
              </p>
            </div>
          )}

          {query.trim().length >= 2 && loading && (
            <div className="text-center py-16">
              <div className="text-text-secondary text-[13px]">Buscando...</div>
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="text-error text-[12px]">{error}</p>
            </div>
          )}

          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[13px] text-text-secondary">
                No encontramos a nadie con "{query}"
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] text-text-tertiary mb-2">
                {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
              </p>
              {results.map((user) => (
                <SearchResultCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

function SearchResultCard({ user }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/u/${user.id}`)}
      className="w-full flex items-center gap-3 p-3 bg-bg-surface border border-border rounded-xl hover:bg-bg-alt hover:border-accent/40 transition-all text-left"
    >
      {/* Foto */}
      <div className="shrink-0">
        {user.main_photo ? (
          <img
            src={user.main_photo}
            alt={user.name}
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-bg-alt flex items-center justify-center text-text-tertiary text-[16px]">
            {user.name?.[0] || '?'}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <div className="text-[13px] font-semibold text-text-primary truncate">
            {user.name}
            {user.age ? `, ${user.age}` : ''}
          </div>
        </div>

        {user.tagline && (
          <p className="text-[11px] text-text-secondary italic truncate mb-1">
            "{user.tagline}"
          </p>
        )}

        <div className="flex items-center gap-2 mb-1.5">
          {user.city && (
            <div className="flex items-center gap-1 text-[10px] text-text-tertiary">
              <MapPin size={9} />
              {user.city}
            </div>
          )}
        </div>

        <Badges profile={user} />
      </div>
    </button>
  )
}