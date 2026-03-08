import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreateRideNavbar } from '../../components/CreateRideNavbar';
import RideMap from '../../components/driver/RideMap';
import {
    MapPin,
    Clock,
    Calendar,
    Star,
    Users,
    Shield,
    Wind,
    Luggage,
    IndianRupee,
    ArrowLeft,
    Car,
    Loader2,
    Route,
    UserCheck,
    Send,
    CheckCircle2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosClient';
import toast from 'react-hot-toast';

let lastGeocodeTime = 0;
const geocodeCity = async (cityName) => {
    if (!cityName) return null;

    // Enforce 1000ms delay between consecutive Nominatim requests
    const now = Date.now();
    const timeSinceLast = now - lastGeocodeTime;
    if (timeSinceLast < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLast));
    }
    lastGeocodeTime = Date.now();

    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1&accept-language=en&email=contact@ridewithme.com`);
        const data = await res.json();
        if (data && data.length > 0) {
            return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
    } catch (err) {
        console.error('Geocoding error:', err);
    }
    return null;
};

export default function RideDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ride, setRide] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [hasRequested, setHasRequested] = useState(false);

    // Map state
    const [startCoords, setStartCoords] = useState(null);
    const [destCoords, setDestCoords] = useState(null);
    const [routePolyline, setRoutePolyline] = useState([]);

    useEffect(() => {
        loadRide();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadRide = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/api/rides/${id}`);
            setRide(res.data);
            // Geocode cities for the map
            if (res.data.sourceCity) geocodeAndRoute(res.data.sourceCity, res.data.destinationCity);
        } catch (err) {
            console.error('Error loading ride:', err);
            toast.error('Failed to load ride details');
        } finally {
            setIsLoading(false);
        }
    };


    const geocodeAndRoute = useCallback(async (source, dest) => {
        const sCoords = await geocodeCity(source);
        const dCoords = await geocodeCity(dest);
        if (sCoords) setStartCoords(sCoords);
        if (dCoords) setDestCoords(dCoords);

        if (sCoords && dCoords) {
            try {
                const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${sCoords[1]},${sCoords[0]};${dCoords[1]},${dCoords[0]}?overview=full&geometries=geojson`);
                const data = await res.json();
                if (data.code === 'Ok' && data.routes.length > 0) {
                    const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                    setRoutePolyline(coords);
                }
            } catch (err) {
                console.error('Routing error:', err);
            }
        }
    }, []);

    const handleJoinRide = async () => {
        if (!user) {
            toast.error('Please log in to book a ride');
            navigate('/login');
            return;
        }
        setIsJoining(true);
        try {
            await api.post(`/api/rides/${id}/join`);
            setHasRequested(true);
            toast.success('Ride request sent! The driver will be notified. 🚀');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Failed to send request';
            // If already joined, treat it as "already requested"
            if (typeof msg === 'string' && msg.toLowerCase().includes('already')) {
                setHasRequested(true);
                toast('You have already requested this ride.', { icon: 'ℹ️' });
            } else {
                toast.error(typeof msg === 'string' ? msg : 'Failed to send request');
            }
        } finally {
            setIsJoining(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const pickupPoints = ride?.pickupPoints ? ride.pickupPoints.split('|').filter(p => p.trim()) : [];
    const dropPoints = ride?.dropPoints ? ride.dropPoints.split('|').filter(p => p.trim()) : [];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
                <CreateRideNavbar />
                <div className="flex items-center justify-center pt-32">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                </div>
            </div>
        );
    }

    if (!ride) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
                <CreateRideNavbar />
                <div className="flex flex-col items-center justify-center pt-32">
                    <Car className="w-16 h-16 text-gray-300 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">Ride not found</h2>
                    <Button onClick={() => navigate('/search')} className="mt-4">Back to Search</Button>
                </div>
            </div>
        );
    }

    const driverName = ride.driver?.name || ride.driver?.email || 'Driver';

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            <CreateRideNavbar />

            <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/search')}
                        className="mb-6 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Search
                    </Button>

                    <div className="grid lg:grid-cols-5 gap-8">
                        {/* Left Column - Details */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Route Header Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                            {ride.sourceCity} → {ride.destinationCity}
                                        </h1>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(ride.startTime)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {formatTime(ride.startTime)}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ride.availableSeats > 0
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                        }`}>
                                        {ride.availableSeats > 0 ? `${ride.availableSeats} Seats Left` : 'Full'}
                                    </span>
                                </div>

                                {/* Route Visual */}
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center gap-1 pt-1">
                                        <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-200"></div>
                                        <div className="w-0.5 h-12 bg-gradient-to-b from-green-400 to-red-400"></div>
                                        <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-200"></div>
                                    </div>
                                    <div className="flex-1 space-y-5">
                                        <div>
                                            <p className="font-semibold text-gray-900 text-lg">{ride.sourceCity}</p>
                                            <p className="text-sm text-gray-500">Departure at {formatTime(ride.startTime)}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-lg">{ride.destinationCity}</p>
                                            {ride.distanceKm && (
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Route className="w-3 h-3" /> {ride.distanceKm.toFixed(1)} km estimated
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Driver Info Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
                                <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                                    <UserCheck className="w-5 h-5 text-purple-600" />
                                    Driver
                                </h2>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xl">
                                        {driverName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg">{driverName}</h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                4.8
                                            </span>
                                            <Shield className="w-4 h-4 text-blue-500" />
                                            <span className="text-blue-600 text-xs font-medium">Verified</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pickup & Drop Points */}
                            {(pickupPoints.length > 0 || dropPoints.length > 0) && (
                                <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
                                    <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-purple-600" />
                                        Pickup & Drop Points
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {pickupPoints.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-3">Pickup Points</h3>
                                                <div className="space-y-2">
                                                    {pickupPoints.map((point, i) => (
                                                        <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50 border border-green-100">
                                                            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">{i + 1}</div>
                                                            <span className="text-sm text-gray-800">{point.trim()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {dropPoints.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-3">Drop Points</h3>
                                                <div className="space-y-2">
                                                    {dropPoints.map((point, i) => (
                                                        <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-100">
                                                            <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">{i + 1}</div>
                                                            <span className="text-sm text-gray-800">{point.trim()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Amenities & Preferences */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
                                <h2 className="text-lg font-semibold mb-4 text-gray-900">Ride Features</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className={`flex flex-col items-center p-3 rounded-xl border ${ride.hasAc ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                        <Wind className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-medium">AC</span>
                                        <span className="text-xs">{ride.hasAc ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className={`flex flex-col items-center p-3 rounded-xl border ${ride.luggageAllowed ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                        <Luggage className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-medium">Luggage</span>
                                        <span className="text-xs">{ride.luggageAllowed ? 'Allowed' : 'No'}</span>
                                    </div>
                                    <div className="flex flex-col items-center p-3 rounded-xl border bg-purple-50 border-purple-200 text-purple-700">
                                        <Users className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-medium">Seats</span>
                                        <span className="text-xs">{ride.availableSeats}/{ride.totalSeats}</span>
                                    </div>
                                    <div className="flex flex-col items-center p-3 rounded-xl border bg-pink-50 border-pink-200 text-pink-700">
                                        <UserCheck className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-medium">Gender</span>
                                        <span className="text-xs capitalize">{ride.genderPreference || 'Any'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Map & Booking */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Map */}
                            <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden h-[350px]">
                                <RideMap
                                    startCoords={startCoords}
                                    destCoords={destCoords}
                                    routePolyline={routePolyline}
                                />
                            </div>

                            {/* Fare Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
                                <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                                    <IndianRupee className="w-5 h-5 text-purple-600" />
                                    Fare Details
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Price per Seat</span>
                                        <span className="text-2xl font-bold text-purple-600">
                                            ₹{Math.round(Number(ride.pricePerSeat))}
                                        </span>
                                    </div>
                                    {ride.distanceKm && (
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Estimated Distance</span>
                                            <span>{ride.distanceKm.toFixed(1)} km</span>
                                        </div>
                                    )}
                                    {ride.distanceKm && (
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Rate per km</span>
                                            <span>≈ ₹{(Number(ride.pricePerSeat) / ride.distanceKm).toFixed(1)}/km</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Available Seats</span>
                                        <span>{ride.availableSeats} of {ride.totalSeats}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-purple-100">
                                    {hasRequested ? (
                                        /* Success state — request sent */
                                        <div className="w-full rounded-xl py-4 bg-green-50 border-2 border-green-200 flex flex-col items-center gap-2 text-green-700">
                                            <CheckCircle2 className="w-7 h-7 text-green-500" />
                                            <span className="font-bold text-base">Request Sent!</span>
                                            <p className="text-xs text-green-600 text-center px-4">
                                                The driver has been notified. You'll receive an email once they approve your request.
                                            </p>
                                            <button
                                                onClick={() => navigate('/my-rides')}
                                                className="mt-2 text-xs font-semibold text-purple-600 hover:text-purple-800 underline"
                                            >
                                                View in My Rides →
                                            </button>
                                        </div>
                                    ) : (
                                        <Button
                                            size="lg"
                                            onClick={handleJoinRide}
                                            disabled={isJoining || ride.availableSeats === 0}
                                            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-lg text-lg py-6"
                                        >
                                            {isJoining ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Sending Request…
                                                </>
                                            ) : ride.availableSeats === 0 ? (
                                                'Ride is Full'
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5 mr-2" />
                                                    Request to Join — ₹{Math.round(Number(ride.pricePerSeat))}
                                                </>
                                            )}
                                        </Button>
                                    )}

                                    {!hasRequested && (
                                        <p className="text-center text-xs text-gray-400 mt-3">
                                            Payment is only required after the driver approves your request
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Vehicle Info */}
                            {ride.driver?.vehicle ? (
                                <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
                                    <h2 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                                        <Car className="w-5 h-5 text-purple-600" />
                                        Vehicle Details
                                    </h2>
                                    <div className="flex flex-col gap-3">
                                        <div>
                                            <p className="text-gray-900 font-bold capitalize text-lg">{ride.driver.vehicle.company} {ride.driver.vehicle.model}</p>
                                            <p className="text-gray-500 text-sm uppercase">{ride.driver.vehicle.registrationNumber}</p>
                                        </div>
                                        {ride.driver.vehicle.imageUrls && ride.driver.vehicle.imageUrls.length > 0 && (
                                            <div className="mt-2 overflow-hidden rounded-xl h-40">
                                                <img src={ride.driver.vehicle.imageUrls[0]} alt={`${ride.driver.vehicle.company} ${ride.driver.vehicle.model}`} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : ride.vehicleId ? (
                                <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
                                    <h2 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                                        <Car className="w-5 h-5 text-purple-600" />
                                        Vehicle
                                    </h2>
                                    <p className="text-gray-700 font-medium capitalize">{ride.vehicleId.replace(/-/g, ' ')}</p>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
