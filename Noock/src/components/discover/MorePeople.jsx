import { MapPin } from 'lucide-react'

export default function MorePeople({ people, onSeeAll }) {
  if (!people?.length) return null

  return (
    <section className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-1.5 shrink-0">
        <h3 className="text-[13px] font-bold text-text-primary">
          Más personas como tú
        </h3>
        <button
          onClick={onSeeAll}
          className="text-[11px] text-text-secondary hover:text-text-primary transition-colors"
        >
          Ver todas →
        </button>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-5 gap-2.5">
        {people.map((person) => {
          const photo = person.photos?.[0]?.url || ''
          return (
            <button
              key={person.id}
              className="relative rounded-lg overflow-hidden h-full group text-left"
            >
              {photo ? (
                <img
                  src={photo}
                  alt={person.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-bg-alt" />
              )}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-2 text-white">
                <div className="text-[11px] font-semibold mb-0.5 truncate">
                  {person.name}
                  {person.age ? `, ${person.age}` : ''}
                </div>
                <div className="flex items-center gap-1 text-[9px] text-white/85">
                  <MapPin size={8} />
                  {person.city || 'Bogotá'}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}