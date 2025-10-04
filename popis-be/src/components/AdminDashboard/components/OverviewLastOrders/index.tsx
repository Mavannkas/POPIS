'use client'

import L from 'leaflet'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import './styles.scss'
import { Event } from '@/payload-types'

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
})
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false,
})
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false })

// Fix Leaflet default marker icon issue
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export const OverviewLastOrders = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events?limit=50')
        const data = await response.json()
        console.log(data.docs)
        const eventsWithLocation = data.docs?.filter(
          (event: Event) => event.location?.lat && event.location?.lng,
        )
        console.log(eventsWithLocation)
        setEvents(eventsWithLocation || [])
      } catch (error) {
        console.error('Error fetching events:', error)
      }
    }

    void fetchEvents()
  }, [])

  const defaultCenter: [number, number] = [50.0647, 19.945] // Kraków
  const eventsForList = events.slice(0, 5)

  return (
    <div className="events-map">
      <div className="events-map__header">
        <h3 className="events-map__title">Wydarzenia w okolicy</h3>
      </div>
      <div className="events-map__content">
        {/* Leaflet Map */}
        <div className="events-map__map">
          {isClient && typeof window !== 'undefined' && (
            <MapContainer
              center={defaultCenter}
              zoom={12}
              style={{ height: '100%', width: '100%', borderRadius: 'var(--style-radius-s)' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {events.map((event) => (
                <Marker
                  key={event.id}
                  position={[event.location!.lat!, event.location!.lng!]}
                  icon={icon}
                  eventHandlers={{
                    click: () => setSelectedEvent(event.id),
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: '150px' }}>
                      <strong>{event.title}</strong>
                      {event.location?.address && (
                        <p style={{ margin: '4px 0' }}>{event.location.address}</p>
                      )}
                      <p style={{ margin: '4px 0', fontSize: '0.875rem' }}>
                        {new Date(event.startDate).toLocaleDateString('pl-PL')} o{' '}
                        {new Date(event.startDate).toLocaleTimeString('pl-PL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Events List */}
        <div className="events-map__list">
          {eventsForList.length === 0 && (
            <p className="events-map__empty">Brak wydarzeń z lokalizacją</p>
          )}
          {eventsForList.map((event) => (
            <div
              key={event.id}
              className={`events-map__event ${selectedEvent === event.id ? 'events-map__event--selected' : ''}`}
              onClick={() => setSelectedEvent(event.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedEvent(event.id)
                }
              }}
            >
              <div className="events-map__event-content">
                <h4 className="events-map__event-title">{event.title}</h4>
                <p className="events-map__event-location">
                  {event.location?.address || 'Brak adresu'}
                </p>
                <div className="events-map__event-meta">
                  <span>
                    📅 {new Date(event.startDate).toLocaleDateString('pl-PL')} o{' '}
                    {new Date(event.startDate).toLocaleTimeString('pl-PL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
