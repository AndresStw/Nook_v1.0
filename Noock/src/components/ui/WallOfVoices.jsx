const voices = [
  { text: 'Me encanta que aquí las conversaciones importen. ♡', author: 'Laura', city: 'Bogotá', position: 'voice-1' },
  { text: 'A veces una buena conversación cambia tu día.', author: 'Mateo', city: 'Medellín', position: 'voice-2' },
  { text: 'Qué bonito encontrar un lugar donde ser uno mismo.', author: 'Sofi', city: 'Cali', position: 'voice-3' },
  { text: 'Las conexiones reales no necesitan filtros.', author: 'Dani', city: 'Bogotá', position: 'voice-4' },
  { text: 'Entré por curiosidad, me quedé por las conversaciones.', author: 'Vale', city: 'Medellín', position: 'voice-5' },
  { text: 'Ojalá más personas se conocieran así. ♡', author: 'Camila', city: 'Cali', position: 'voice-6' },
  { text: 'Aquí se siente diferente. Y eso me gusta.', author: 'Juan', city: 'Bogotá', position: 'voice-7' },
  { text: 'Una conexión bonita empieza escuchando.', author: 'Ale', city: 'Barranquilla', position: 'voice-8' },
]

export default function WallOfVoices() {
  return (
    <div className="nook-voices" aria-hidden="true">
      <div className="nook-voices__glow nook-voices__glow--one" />
      <div className="nook-voices__glow nook-voices__glow--two" />

      {voices.map((voice, index) => (
        <div
          key={voice.position}
          className={`nook-voice ${voice.position}`}
          style={{
            '--delay': `${index * -2.7}s`,
            '--duration': `${14 + (index % 4) * 2}s`,
          }}
        >
          <div className="nook-voice__header">
            <span className="nook-voice__avatar">{voice.author[0]}</span>
            <span>
              {voice.author} <span className="nook-voice__dot">·</span> {voice.city}
            </span>
          </div>
          <p>{voice.text}</p>
          <span className="nook-voice__heart">♡</span>
        </div>
      ))}
    </div>
  )
}