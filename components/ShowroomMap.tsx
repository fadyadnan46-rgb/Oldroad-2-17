import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Location } from '../types';

interface ShowroomMapProps {
  showrooms: Location[];
}

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Custom icon for user location
const userIcon = L.divIcon({
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #2196F3;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    "></div>
  `,
  iconSize: [32, 32],
  className: 'user-location-icon',
});

// Custom icon for showrooms
const createShowroomIcon = (isNearest: boolean) => {
  return L.divIcon({
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${isNearest ? '#FFD700' : '#DC2626'};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      ">${isNearest ? '⭐' : '🏪'}</div>
    `,
    iconSize: [32, 32],
    className: 'showroom-icon',
  });
};

const ShowroomMap: React.FC<ShowroomMapProps> = ({ showrooms }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestShowroom, setNearestShowroom] = useState<Location | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([43.6629, -79.3957]); // Default to Toronto
  const [error, setError] = useState<string | null>(null);

  // Get user location and find nearest showroom
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLoc = { lat: latitude, lng: longitude };
          setUserLocation(userLoc);
          setMapCenter([latitude, longitude]);

          // Find nearest showroom
          if (showrooms.length > 0) {
            let nearest = showrooms[0];
            let minDistance = Infinity;

            showrooms.forEach(showroom => {
              if (showroom.latitude && showroom.longitude) {
                const distance = calculateDistance(
                  latitude,
                  longitude,
                  showroom.latitude,
                  showroom.longitude
                );
                if (distance < minDistance) {
                  minDistance = distance;
                  nearest = showroom;
                }
              }
            });

            setNearestShowroom(nearest);
          }
        },
        () => {
          // Default to first showroom location if geolocation fails
          if (showrooms.length > 0 && showrooms[0].latitude && showrooms[0].longitude) {
            setMapCenter([showrooms[0].latitude, showrooms[0].longitude]);
            setNearestShowroom(showrooms[0]);
          }
          setError('Unable to get your location. Showing showroom locations.');
        }
      );
    }
  }, [showrooms]);

  const showroomsWithCoords = showrooms.filter(s => s.latitude && s.longitude);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="font-semibold">Your Location</div>
            </Popup>
          </Marker>
        )}

        {/* Showroom markers */}
        {showroomsWithCoords.map(showroom => {
          const isNearest = nearestShowroom?.id === showroom.id;
          return (
            <Marker
              key={showroom.id}
              position={[showroom.latitude!, showroom.longitude!]}
              icon={createShowroomIcon(isNearest)}
            >
              <Popup>
                <div className="min-w-max">
                  <div className="font-bold text-sm">{showroom.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{showroom.address}</div>
                  <div className="text-xs font-semibold text-gray-700 mt-2">{showroom.phone}</div>
                  {isNearest && (
                    <div className="text-xs bg-red-600 text-white px-2 py-1 mt-2 rounded font-bold text-center">
                      ⭐ Nearest Showroom
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {error && (
        <div className="absolute top-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-sm text-xs font-bold z-[400]">
          {error}
        </div>
      )}
    </div>
  );
};

export default ShowroomMap;
