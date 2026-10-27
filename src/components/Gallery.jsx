import { useReducer, useState, useCallback, useMemo } from 'react'
import { useFetchPhotos } from '../hooks/useFetchPhotos'

const FAVOURITES_KEY = 'favouritePhotos'

function favouritesReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE': {
      const exists = state.includes(action.id)
      const next = exists
        ? state.filter((id) => id !== action.id)
        : [...state, action.id]
      try {
        localStorage.setItem(FAVOURITES_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    }
    default:
      return state
  }
}

function initFavourites() {
  try {
    const raw = localStorage.getItem(FAVOURITES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export default function Gallery() {
  const { photos, loading, error } = useFetchPhotos()
  const [favourites, dispatch] = useReducer(favouritesReducer, [], initFavourites)
  const [query, setQuery] = useState('')
  const [likedId, setLikedId] = useState(null)

  const handleSearch = useCallback((e) => {
    setQuery(e.target.value)
  }, [])

  const filteredPhotos = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return photos
    return photos.filter((photo) =>
      photo.author.toLowerCase().includes(q)
    )
  }, [photos, query])

  const toggleFavourite = useCallback((id) => {
    if (!favourites.includes(id)) {
      setLikedId(id)
      setTimeout(() => setLikedId(null), 400)
    }
    dispatch({ type: 'TOGGLE', id })
  }, [favourites])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-pink-50 to-pink-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-pink-50 to-pink-100">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-pink-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4 text-pink-600">Photo Gallery</h1>
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search by author..."
          className="w-full mb-6 px-4 py-2 border border-pink-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white/80"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => {
            const isFav = favourites.includes(photo.id)
            return (
              <div key={photo.id} className="border border-pink-100 rounded-lg overflow-hidden shadow-sm bg-white/70 backdrop-blur">
                <img
                  src={photo.download_url}
                  alt={photo.author}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="flex items-center justify-between p-3">
                  <span className="text-sm font-medium truncate">{photo.author}</span>
                  <button
                    type="button"
                    onClick={() => toggleFavourite(photo.id)}
                    aria-label="toggle favourite"
                    className="text-xl"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className={`h-6 w-6 ${isFav ? 'fill-pink-500 stroke-pink-500' : 'fill-none stroke-pink-400'} ${likedId === photo.id ? 'heart-pop' : ''}`}
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21s-6.716-4.35-9.193-7.05C.87 11.64 1 8.5 3.2 6.6 5.4 4.7 8.5 5 10.5 7l1.5 1.5L13.5 7c2-2 5.1-2.3 7.3-.4 2.2 1.9 2.33 5.04.4 7.35C18.716 16.65 12 21 12 21z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


