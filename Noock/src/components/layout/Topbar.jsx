import { Search, Bell, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TopBar({ user }) {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchValue.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`)
      setSearchValue('')
    }
  }

  return (
    <header className="flex items-center gap-4 px-5 py-3 shrink-0 w-full">
      <form onSubmit={handleSubmit} className="relative w-full max-w-3xl shrink-0">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Buscar personas, intereses, ciudades..."
          className="w-full pl-10 pr-4 py-2 bg-bg-surface border border-border rounded-lg text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent transition-colors"
        />
      </form>

      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
        <button className="w-8 h-8 rounded-full hover:bg-bg-alt flex items-center justify-center transition-colors">
          <Bell size={16} className="text-text-secondary" strokeWidth={1.8} />
        </button>
        <button className="w-8 h-8 rounded-full hover:bg-bg-alt flex items-center justify-center transition-colors">
          <MoreHorizontal
            size={16}
            className="text-text-secondary"
            strokeWidth={1.8}
          />
        </button>
        <button
          onClick={() => navigate('/me')}
          className="w-8 h-8 rounded-full overflow-hidden border border-border ml-1"
        >
          <img
            src={user?.avatar_url || "https://i.pravatar.cc/100?img=12"}
            alt="Yo"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </header>
  );
}