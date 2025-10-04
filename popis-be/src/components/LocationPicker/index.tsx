'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useField } from '@payloadcms/ui'

// Dynamically import map components to avoid SSR issues
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => <div className="map-loading">Ładowanie mapy...</div>,
})

interface LocationPickerProps {
  path?: string
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ path }) => {
  // The path from the UI field is the parent group 'location'
  const basePath = 'location'

  const { value: lat, setValue: setLat } = useField<number>({ path: `${basePath}.lat` })
  const { value: lng, setValue: setLng } = useField<number>({ path: `${basePath}.lng` })
  const { value: address } = useField<string>({ path: `${basePath}.address` })
  const { value: city } = useField<string>({ path: `${basePath}.city` })

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Geocode address when it changes
  useEffect(() => {
    if (!address || !city) return

    const fullAddress = `${address}, ${city}, Polska`

    // Use Nominatim (OpenStreetMap) for geocoding
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&countrycodes=pl&limit=1`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setLat(parseFloat(data[0].lat))
          setLng(parseFloat(data[0].lon))
        }
      })
      .catch((err) => console.error('Geocoding error:', err))
  }, [address, city])

  // Auto-search when user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=pl&limit=5`,
        )
        const data = await response.json()
        setSearchResults(data)
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setIsSearching(false)
      }
    }, 500) // Debounce 500ms

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleSelectResult = (result: any) => {
    setLat(parseFloat(result.lat))
    setLng(parseFloat(result.lon))
    setSearchResults([])
    setSearchQuery('')
  }

  const handleMapClick = (newLat: number, newLng: number) => {
    setLat(newLat)
    setLng(newLng)
  }

  return (
    <div className="location-picker">
      <div className="location-search">
        <div className="field-type text">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Wyszukaj lokalizację..."
            className=""
          />
          {isSearching && <span style={{ fontSize: '12px', color: '#666' }}>Szukam...</span>}
        </div>

        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="search-result-item"
                onClick={() => handleSelectResult(result)}
              >
                {result.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="map-info">
        <p>
          {lat && lng ? (
            <>
              Wybrana lokalizacja: {lat.toFixed(6)}, {lng.toFixed(6)}
            </>
          ) : (
            <>Kliknij na mapę lub wyszukaj lokalizację</>
          )}
        </p>
      </div>

      <MapView
        lat={lat || 52.2297} // Default: Warsaw
        lng={lng || 21.0122}
        onMapClick={handleMapClick}
      />
    </div>
  )
}
