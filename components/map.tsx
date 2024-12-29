'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function Map() {
  useEffect(() => {
    const map = L.map('map').setView([40.416775, -3.703790], 6)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    return () => {
      map.remove()
    }
  }, [])

  return <div id="map" className="h-60 w-full" />
}

