import React, { useEffect } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon path (webpack issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const TILE_URL = process.env.REACT_APP_TILE_URL ||
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

// Color-coded icons
const makeIcon = (color) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const icons = {
    green: makeIcon('green'),
    red: makeIcon('red'),
    blue: makeIcon('blue'),
    orange: makeIcon('orange'),
    violet: makeIcon('violet'),
};

// Auto-fit bounds when markers change
const FitBounds = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        const valid = points.filter(p => p && p[0] && p[1]);
        if (valid.length >= 2) {
            map.fitBounds(valid, { padding: [40, 40], maxZoom: 13 });
        }
    }, [points, map]);
    return null;
};

const RideMap = ({
    startCoords,
    destCoords,
    pickupCoords = [],
    dropCoords = [],
    liveMarker = null,
    routePolyline = [],
}) => {
    const allPoints = [startCoords, destCoords, ...pickupCoords, ...dropCoords].filter(Boolean);

    return (
        <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%', borderRadius: '12px' }}
            zoomControl={true}
        >
            <TileLayer
                url={TILE_URL}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                maxZoom={19}
            />

            {allPoints.length >= 2 && <FitBounds points={allPoints} />}

            {/* Route polyline */}
            {routePolyline.length > 0 && (
                <Polyline positions={routePolyline} color="#f97316" weight={4} opacity={0.8} dashArray="6 4" />
            )}

            {/* Straight-line fallback when no route */}
            {routePolyline.length === 0 && startCoords && destCoords && (
                <Polyline positions={[startCoords, ...pickupCoords.filter(Boolean), ...dropCoords.filter(Boolean), destCoords]} color="#94a3b8" weight={3} opacity={0.5} dashArray="8 5" />
            )}

            {/* Start marker */}
            {startCoords && (
                <Marker position={startCoords} icon={icons.green}>
                    <Popup>📍 Starting Point</Popup>
                </Marker>
            )}

            {/* Destination marker */}
            {destCoords && (
                <Marker position={destCoords} icon={icons.red}>
                    <Popup>🏁 Destination</Popup>
                </Marker>
            )}

            {/* Pickup markers */}
            {pickupCoords.filter(Boolean).map((coords, i) => (
                <Marker key={`pickup-${i}`} position={coords} icon={icons.blue}>
                    <Popup>🔵 Pickup Point {i + 1}</Popup>
                </Marker>
            ))}

            {/* Drop markers */}
            {dropCoords.filter(Boolean).map((coords, i) => (
                <Marker key={`drop-${i}`} position={coords} icon={icons.orange}>
                    <Popup>🟠 Drop Point {i + 1}</Popup>
                </Marker>
            ))}

            {/* Live GPS marker */}
            {liveMarker && (
                <Marker position={[liveMarker.lat, liveMarker.lng]} icon={icons.violet}>
                    <Popup>🚗 Live Position</Popup>
                </Marker>
            )}

            {/* Map Legend */}
            <div style={{
                position: 'absolute', top: 10, right: 10, zIndex: 1000,
                background: 'white', padding: '10px 14px', borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.15)', fontSize: '12px',
                fontFamily: 'sans-serif', lineHeight: '1.8',
            }}>
                {[
                    { color: '#22c55e', label: 'Start' },
                    { color: '#ef4444', label: 'Destination' },
                    { color: '#3b82f6', label: 'Pickups' },
                    { color: '#f97316', label: 'Drops' },
                ].map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: color, display: 'inline-block' }} />
                        <span style={{ color: '#374151' }}>{label}</span>
                    </div>
                ))}
            </div>
        </MapContainer>
    );
};

export default RideMap;
