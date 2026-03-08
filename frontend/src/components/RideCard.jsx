import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Users, Shield, Luggage, Wind } from 'lucide-react';
import { Button } from './ui/button';

export function RideCard({ ride }) {
    const navigate = useNavigate();
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Support both backend model fields and mock data fields
    const driverName = ride.driver?.name || ride.driverName || 'Driver';
    const driverAvatar = ride.driver?.avatar || ride.avatar || null;
    const driverRating = ride.driver?.rating || ride.rating || 4.5;
    const driverTrips = ride.driver?.trips || ride.trips || 0;
    const isVerified = ride.driver?.verified ?? ride.verified ?? false;

    const from = ride.sourceCity || ride.from || '';
    const to = ride.destinationCity || ride.to || '';
    const price = ride.pricePerSeat || ride.price || 0;
    const seatsAvailable = ride.availableSeats ?? ride.seatsAvailable ?? 0;
    const startTime = ride.startTime || ride.date || '';
    const pickupPointsRaw = ride.pickupPoints || [];
    const pickupPoints = typeof pickupPointsRaw === 'string'
        ? pickupPointsRaw.split('|').filter(p => p.trim())
        : pickupPointsRaw;
    const dropPointsRaw = ride.dropPoints || [];
    const dropPoints = typeof dropPointsRaw === 'string'
        ? dropPointsRaw.split('|').filter(p => p.trim())
        : dropPointsRaw;
    const vehicleModel = ride.driver?.vehicle?.model || ride.vehicle?.model || ride.vehicleModel || '';
    const vehicleCompany = ride.driver?.vehicle?.company || ride.vehicle?.company || '';
    const vehicleColor = ride.driver?.vehicle?.color || ride.vehicle?.color || ride.vehicleColor || '';
    const vehicleImage = ride.driver?.vehicle?.imageUrls?.[0] || ride.vehicle?.imageUrls?.[0] || null;

    const hasAc = ride.amenities?.ac ?? ride.hasAc ?? false;
    const hasLuggage = ride.amenities?.luggage ?? ride.luggageAllowed ?? false;

    return (
        <div onClick={() => navigate(`/rides/${ride.id}`)} className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
            <div className="p-6">
                {/* Driver Info */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                        {driverAvatar ? (
                            <img src={driverAvatar} alt={driverName} className="w-full h-full object-cover" />
                        ) : (
                            driverName.charAt(0)
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{driverName}</h3>
                            {isVerified && (
                                <Shield className="w-4 h-4 text-blue-500" />
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                {Number(driverRating).toFixed(1)}
                            </span>
                            {driverTrips > 0 && (
                                <span>{driverTrips} trips</span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-purple-600">₹{Math.round(Number(price))}</span>
                        <p className="text-xs text-gray-500">per seat</p>
                    </div>
                </div>

                {/* Route */}
                <div className="flex items-start gap-3 mb-4">
                    <div className="flex flex-col items-center gap-1 pt-1">
                        <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-200"></div>
                        <div className="w-0.5 h-8 bg-gradient-to-b from-green-400 to-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-200"></div>
                    </div>
                    <div className="flex-1 space-y-3">
                        <div>
                            <p className="font-medium text-gray-900">{from}</p>
                            <p className="text-xs text-gray-500">{formatTime(startTime)} • {formatDate(startTime)}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{to}</p>
                        </div>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                        <Users className="w-3 h-3" />
                        {seatsAvailable} seats left
                    </span>
                    {vehicleModel && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                            🚗 {vehicleCompany} {vehicleModel} {vehicleColor && `(${vehicleColor})`}
                        </span>
                    )}
                    {hasAc && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                            <Wind className="w-3 h-3" /> AC
                        </span>
                    )}
                    {hasLuggage && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium">
                            <Luggage className="w-3 h-3" /> Luggage
                        </span>
                    )}
                </div>

                {/* Pickup & Drop Points */}
                {(pickupPoints.length > 0 || dropPoints.length > 0) && (
                    <div className="mb-4 space-y-3">
                        {pickupPoints.length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold text-green-600 mb-1.5 uppercase tracking-widest pl-1">Pickup Points</p>
                                <div className="space-y-1.5">
                                    {pickupPoints.map((point, index) => (
                                        <div key={`pickup-${index}`} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-green-50/70 border border-green-100/50">
                                            <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">{index + 1}</div>
                                            <span className="text-xs text-gray-700 font-medium truncate">{point}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {dropPoints.length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold text-red-600 mb-1.5 uppercase tracking-widest pl-1">Drop Points</p>
                                <div className="space-y-1.5">
                                    {dropPoints.map((point, index) => (
                                        <div key={`drop-${index}`} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-red-50/70 border border-red-100/50">
                                            <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">{index + 1}</div>
                                            <span className="text-xs text-gray-700 font-medium truncate">{point}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Vehicle Image */}
                {vehicleImage && (
                    <div className="mb-4 rounded-xl overflow-hidden h-32 relative group-hover:shadow-md transition-shadow duration-300">
                        <img src={vehicleImage} alt={`${vehicleCompany} ${vehicleModel}`} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                            <span className="text-white text-sm font-medium drop-shadow-md capitalize">🚗 {vehicleCompany} {vehicleModel}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 flex items-center justify-between border-t border-purple-100">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${seatsAvailable > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                    }`}>
                    {seatsAvailable > 0 ? 'Available' : 'Full'}
                </span>
                <Button
                    size="sm"
                    disabled={seatsAvailable === 0}
                    onClick={(e) => { e.stopPropagation(); navigate(`/rides/${ride.id}`); }}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-md"
                >
                    Book Now
                </Button>
            </div>
        </div>
    );
}

export default RideCard;
