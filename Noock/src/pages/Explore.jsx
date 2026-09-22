import { useState } from 'react'
import { MapPin, CheckCircle2, SlidersHorizontal } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'

const mockProfiles = [
  { id: 1, name: 'Camila', age: 24, city: 'Bogotá', distance: 2, verified: true, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80', interests: ['Música', 'Café'] },
  { id: 2, name: 'Andrés', age: 27, city: 'Bogotá', distance: 4, verified: true, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80', interests: ['Viajes', 'Cine'] },
  { id: 3, name: 'Isabella', age: 25, city: 'Bogotá', distance: 3, verified: true, photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80', interests: ['Arte', 'Naturaleza'] },
  { id: 4, name: 'Mateo', age: 29, city: 'Bogotá', distance: 5, verified: false, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80', interests: ['Deporte', 'Música'] },
  { id: 5, name: 'Sofía', age: 26, city: 'Bogotá', distance: 6, verified: true, photo: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&q=80', interests: ['Libros', 'Cocina'] },
  { id: 6, name: 'Sebastián', age: 28, city: 'Bogotá', distance: 7, verified: true, photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80', interests: ['Tecnología', 'Viajes'] },
  { id: 7, name: 'Valeria', age: 23, city: 'Bogotá', distance: 4, verified: true, photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80', interests: ['Fotografía', 'Yoga'] },
  { id: 8, name: 'Daniel', age: 26, city: 'Bogotá', distance: 8, verified: false, photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80', interests: ['Cine', 'Café'] },
  { id: 9, name: 'Laura', age: 24, city: 'Bogotá', distance: 3, verified: true, photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80', interests: ['Música', 'Baile'] },
  { id: 10, name: 'Felipe', age: 30, city: 'Bogotá', distance: 9, verified: true, photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&q=80', interests: ['Astronomía', 'Libros'] },
  { id: 11, name: 'Mariana', age: 25, city: 'Bogotá', distance: 5, verified: true, photo: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&q=80', interests: ['Arte', 'Viajes'] },
  { id: 12, name: 'Julián', age: 27, city: 'Bogotá', distance: 6, verified: true, photo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=600&q=80', interests: ['Deporte', 'Cocina'] },
]

export default function Explore() {
  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <AppLayout>
      <div className="h-full flex flex-col gap-4">
        {/* Header de la página */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-text-primary mb-0.5">
              Explorar
            </h1>
            <p className="text-[12px] text-text-secondary">
              Personas cerca de ti que comparten tus intereses
            </p>
          </div>

          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-bg-surface border border-border rounded-lg text-[12px] font-medium text-text-primary hover:bg-bg-alt transition-colors"
          >
            <SlidersHorizontal size={14} />
            Filtros
          </button>
        </div>

        {/* Grid de perfiles — scroll interno */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="grid grid-cols-4 gap-3 pb-4">
            {mockProfiles.map((profile) => (
              <ProfileGridCard key={profile.id} profile={profile} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function ProfileGridCard({ profile }) {
  return (
    <button className="relative rounded-xl overflow-hidden aspect-[3/4] group text-left">
      <img
        src={profile.photo}
        alt={profile.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

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
          {profile.name}, {profile.age}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-white/85 mb-1.5">
          <MapPin size={9} />
          {profile.distance} km
        </div>
        <div className="flex flex-wrap gap-1">
          {profile.interests.slice(0, 2).map((interest) => (
            <span
              key={interest}
              className="text-[9px] px-1.5 py-0.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}