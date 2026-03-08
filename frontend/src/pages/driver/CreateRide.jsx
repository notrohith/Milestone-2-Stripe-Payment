import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateRideNavbar } from '../../components/CreateRideNavbar';
import RideMap from '../../components/driver/RideMap';
import {
    MapPin,
    Calendar,
    Clock,
    Car,
    Users,
    IndianRupee,
    Plus,
    Sparkles,
    TrendingUp,
    Info,
    Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { LocationAutocomplete } from '../../components/ui/LocationAutocomplete';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosClient';
import toast from 'react-hot-toast';

export default function CreateRidePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Form State
    const [sourceCity, setSourceCity] = useState('');
    const [destCity, setDestCity] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [departureTime, setDepartureTime] = useState('');
    const [vehicleId, setVehicleId] = useState('');
    const [totalSeats, setTotalSeats] = useState('');
    const [pickupPoints, setPickupPoints] = useState(['', '', '', '']);
    const [dropPoints, setDropPoints] = useState(['', '', '', '']);
    const [baseFare, setBaseFare] = useState('50');
    const [pricePerKm, setPricePerKm] = useState('12');
    const [acAvailable, setAcAvailable] = useState(false);
    const [luggageAllowed, setLuggageAllowed] = useState(false);
    const [genderPreference, setGenderPreference] = useState('any');

    // Vehicle state — loaded from Supabase
    const [vehicles, setVehicles] = useState([]);

    // Map & Loading State
    const [isLoading, setIsLoading] = useState(false);
    const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
    const [startCoords, setStartCoords] = useState(null);
    const [destCoords, setDestCoords] = useState(null);
    const [routePolyline, setRoutePolyline] = useState([]);
    const [estimatedDistance, setEstimatedDistance] = useState(0);
    const [pickupCoords, setPickupCoords] = useState([]);
    const [dropCoords, setDropCoords] = useState([]);

    // Load vehicles for the current user via Backend API (bypasses Supabase REST CORS/525 errors)
    useEffect(() => {
        if (!user?.email) return;
        const fetchVehicles = async () => {
            try {
                const res = await api.get(`/api/vehicles?email=${encodeURIComponent(user.email)}`);
                const vList = res.data || [];
                setVehicles(vList);
                if (vList && vList.length > 0) setVehicleId(String(vList[0].id));
            } catch (e) {
                console.warn('Vehicle backend fetch error:', e.message);
            }
        };
        fetchVehicles();
    }, [user]);

    // Geocoding function using Nominatim with strict rate limiting (1 req/sec)
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

    // Calculate Routing
    const calculateRoute = useCallback(async (start, end) => {
        if (!start || !end) return;
        setIsCalculatingRoute(true);
        try {
            // OSRM requires lon,lat format
            const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`);
            const data = await res.json();

            if (data.code === 'Ok' && data.routes.length > 0) {
                const route = data.routes[0];

                // OSRM GeoJSON coords are [lon, lat], Leaflet needs [lat, lon]
                const coords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                setRoutePolyline(coords);

                // Distance is in meters, convert to km
                setEstimatedDistance(route.distance / 1000);
            } else {
                setRoutePolyline([]);
                setEstimatedDistance(0);
            }
        } catch (error) {
            console.error('Routing error:', error);
            toast.error("Failed to calculate route.");
            setRoutePolyline([]);
        } finally {
            setIsCalculatingRoute(false);
        }
    }, []);

    // Effect to trigger geocoding and routing when cities change (debounced)
    useEffect(() => {
        const timer = setTimeout(async () => {
            let sCoords = startCoords;
            let dCoords = destCoords;

            if (sourceCity && sourceCity.length > 2) {
                const coords = await geocodeCity(sourceCity);
                if (coords) {
                    sCoords = coords;
                    setStartCoords(coords);
                }
            } else {
                sCoords = null;
                setStartCoords(null);
            }

            if (destCity && destCity.length > 2) {
                const coords = await geocodeCity(destCity);
                if (coords) {
                    dCoords = coords;
                    setDestCoords(coords);
                }
            } else {
                dCoords = null;
                setDestCoords(null);
            }

            if (sCoords && dCoords) {
                calculateRoute(sCoords, dCoords);
            } else {
                setRoutePolyline([]);
                setEstimatedDistance(0);
            }
        }, 1000); // 1 second debounce

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sourceCity, destCity, calculateRoute]);

    // Geocode pickup/drop points as user types (debounced)
    useEffect(() => {
        const timer = setTimeout(async () => {
            const pCoords = await Promise.all(
                pickupPoints.map(p => p.trim().length > 2 ? geocodeCity(p) : Promise.resolve(null))
            );
            setPickupCoords(pCoords.filter(Boolean));

            const dCoords = await Promise.all(
                dropPoints.map(p => p.trim().length > 2 ? geocodeCity(p) : Promise.resolve(null))
            );
            setDropCoords(dCoords.filter(Boolean));
        }, 1200);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pickupPoints, dropPoints]);

    const calculateEarnings = () => {
        const base = parseFloat(baseFare) || 0;
        const perKm = parseFloat(pricePerKm) || 0;
        const distance = estimatedDistance || 0;
        const seats = parseInt(totalSeats) || 0;
        const pricePerSeat = base + (perKm * distance);
        return pricePerSeat * (seats > 0 ? seats : 4); // Fallback to 4 for preview if none selected
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!sourceCity || !destCity || !departureDate || !departureTime || !vehicleId || !totalSeats) {
            toast.error("Please fill in all required fields (Cities, Date, Time, Vehicle, Seats).");
            return;
        }

        if (!user) {
            toast.error("Please log in to publish a ride.");
            navigate('/login');
            return;
        }

        setIsLoading(true);

        try {
            // Format ISO datetime string: YYYY-MM-DDTHH:mm:00
            const startTimeStr = `${departureDate}T${departureTime}:00`;

            const base = parseFloat(baseFare) || 0;
            const perKm = parseFloat(pricePerKm) || 0;
            const finalPricePerSeat = base + (perKm * estimatedDistance);

            const payload = {
                sourceCity,
                destinationCity: destCity,
                startTime: startTimeStr,
                pricePerSeat: finalPricePerSeat,
                totalSeats: parseInt(totalSeats),
                vehicleId,
                driverEmail: user.email,    // used by backend to look up driver — no JWT needed
                pickupPoints: pickupPoints.filter(p => p.trim() !== ''),
                dropPoints: dropPoints.filter(p => p.trim() !== ''),
                hasAc: acAvailable,
                luggageAllowed,
                genderPreference,
                distanceKm: estimatedDistance
            };

            await api.post('/api/rides', payload);

            toast.success("Ride published successfully!");
            navigate('/my-rides');

        } catch (error) {
            console.error("Error publishing ride:", error);
            const msg = error.response?.data?.message || "Failed to publish ride. Please check connection.";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            <CreateRideNavbar />

            <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Publish a Ride</h1>
                                <p className="text-gray-600">Share your journey and split the costs</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left Column - Form */}
                        <div className="space-y-6">
                            {/* Route Details Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
                                <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-purple-600" />
                                    Route Details
                                </h2>

                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start-city" className="text-gray-700">Starting City</Label>
                                        <div className="relative">
                                            <LocationAutocomplete
                                                id="start-city"
                                                value={sourceCity}
                                                onChange={setSourceCity}
                                                placeholder="e.g. Chennai"
                                                className="border-purple-200 focus:border-purple-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="dest-city" className="text-gray-700">Destination City</Label>
                                        <div className="relative">
                                            <LocationAutocomplete
                                                id="dest-city"
                                                value={destCity}
                                                onChange={setDestCity}
                                                placeholder="e.g. Pune"
                                                className="border-purple-200 focus:border-purple-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="departure-date" className="text-gray-700">Departure Date</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                            <Input
                                                id="departure-date"
                                                type="date"
                                                min={new Date().toISOString().split('T')[0]}
                                                value={departureDate}
                                                onChange={(e) => setDepartureDate(e.target.value)}
                                                className="pl-10 border-purple-200 focus:border-purple-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="departure-time" className="text-gray-700">Departure Time</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                            <Input
                                                id="departure-time"
                                                type="time"
                                                value={departureTime}
                                                onChange={(e) => setDepartureTime(e.target.value)}
                                                className="pl-10 border-purple-200 focus:border-purple-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="vehicle" className="text-gray-700">Select Vehicle</Label>
                                        <div className="relative">
                                            <Car className="absolute left-3 top-3 w-4 h-4 text-gray-400 z-10" />
                                            <Select value={vehicleId} onValueChange={setVehicleId}>
                                                <SelectTrigger className="pl-10 border-purple-200">
                                                    <SelectValue placeholder={vehicles.length === 0 ? 'No vehicles registered' : 'Choose vehicle'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {vehicles.length === 0 && (
                                                        <SelectItem value="none" disabled>Register a vehicle first</SelectItem>
                                                    )}
                                                    {vehicles.map(v => (
                                                        <SelectItem key={v.id} value={String(v.id)}>
                                                            {v.company} {v.model} ({v.registrationNumber})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="seats" className="text-gray-700">Available Seats</Label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400 z-10" />
                                            <Select value={totalSeats} onValueChange={setTotalSeats}>
                                                <SelectTrigger className="pl-10 border-purple-200">
                                                    <SelectValue placeholder="Select seats" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">1 Seat</SelectItem>
                                                    <SelectItem value="2">2 Seats</SelectItem>
                                                    <SelectItem value="3">3 Seats</SelectItem>
                                                    <SelectItem value="4">4 Seats</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Waypoints Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
                                <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-purple-600" />
                                    Waypoints (Required)
                                </h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-gray-700 font-semibold">4 Required Pickup Points</Label>
                                        {pickupPoints.map((point, index) => (
                                            <div key={`pickup-${index}`} className="relative">
                                                <LocationAutocomplete
                                                    placeholder="e.g. Landmark, Street"
                                                    value={point}
                                                    onChange={(val) => {
                                                        const newPoints = [...pickupPoints];
                                                        newPoints[index] = val;
                                                        setPickupPoints(newPoints);
                                                    }}
                                                    cityBias={sourceCity}
                                                    className="border-purple-200 focus:border-purple-400"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-gray-700 font-semibold">4 Required Drop Points</Label>
                                        {dropPoints.map((point, index) => (
                                            <div key={`drop-${index}`} className="relative">
                                                <LocationAutocomplete
                                                    placeholder="e.g. Landmark, Street"
                                                    value={point}
                                                    onChange={(val) => {
                                                        const newPoints = [...dropPoints];
                                                        newPoints[index] = val;
                                                        setDropPoints(newPoints);
                                                    }}
                                                    cityBias={destCity}
                                                    className="border-purple-200 focus:border-purple-400"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Pricing & Preferences Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
                                <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                                    <IndianRupee className="w-5 h-5 text-purple-600" />
                                    Pricing & Preferences
                                </h2>

                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="base-fare" className="text-gray-700">Base Fare (₹)</Label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                            <Input
                                                id="base-fare"
                                                type="number"
                                                value={baseFare}
                                                onChange={(e) => setBaseFare(e.target.value)}
                                                className="pl-10 border-purple-200 focus:border-purple-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="price-per-km" className="text-gray-700">Price Per KM (₹)</Label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                            <Input
                                                id="price-per-km"
                                                type="number"
                                                value={pricePerKm}
                                                onChange={(e) => setPricePerKm(e.target.value)}
                                                className="pl-10 border-purple-200 focus:border-purple-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="ac-available"
                                            checked={acAvailable}
                                            onCheckedChange={(checked) => setAcAvailable(checked)}
                                            className="border-purple-300"
                                        />
                                        <Label htmlFor="ac-available" className="text-gray-700 cursor-pointer">
                                            AC Available
                                        </Label>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="luggage-allowed"
                                            checked={luggageAllowed}
                                            onCheckedChange={(checked) => setLuggageAllowed(checked)}
                                            className="border-purple-300"
                                        />
                                        <Label htmlFor="luggage-allowed" className="text-gray-700 cursor-pointer">
                                            Luggage Allowed
                                        </Label>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="gender-pref" className="text-gray-700">Gender Preference</Label>
                                        <Select value={genderPreference} onValueChange={setGenderPreference}>
                                            <SelectTrigger className="border-purple-200">
                                                <SelectValue placeholder="Any" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="any">Any</SelectItem>
                                                <SelectItem value="male">Male Only</SelectItem>
                                                <SelectItem value="female">Female Only</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Price Distribution */}
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                            PRICE DISTRIBUTION
                                            {isCalculatingRoute && <Loader2 className="w-4 h-4 animate-spin text-purple-500" />}
                                        </h3>
                                        {!estimatedDistance && (
                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                                select valid locations
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Base Fare:</span>
                                            <span className="font-semibold text-gray-900">₹{baseFare}.00</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Price per km:</span>
                                            <span className="font-semibold text-gray-900">₹{pricePerKm}.00 / km</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Estimated Distance:</span>
                                            <span className="font-semibold text-gray-900">{estimatedDistance.toFixed(1)} km</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-purple-200">
                                            <span className="text-gray-600">Price per Seat (Est.):</span>
                                            <span className="font-semibold text-orange-600 text-lg">
                                                ₹{(parseFloat(baseFare) + (parseFloat(pricePerKm) * estimatedDistance)).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-purple-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5 text-green-600" />
                                                <span className="font-semibold text-gray-900">Total Possible Earning:</span>
                                            </div>
                                            <span className="font-bold text-green-600 text-2xl">
                                                ₹{calculateEarnings().toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 text-right">for {totalSeats || 4} seats</p>
                                    </div>
                                </div>
                            </div>

                            {/* Publish Button */}
                            <Button
                                size="lg"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-lg text-lg py-6"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5 mr-2" />
                                        Publish Ride
                                    </>
                                )}
                            </Button>

                            {/* Info Card */}
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                <div className="flex gap-3">
                                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-blue-900">
                                        <p className="font-semibold mb-1">Quick Tips:</p>
                                        <ul className="space-y-1 text-blue-800">
                                            <li>• Set competitive pricing to attract more riders</li>
                                            <li>• Add clear pickup and drop points for convenience</li>
                                            <li>• Keep your vehicle details up to date</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Map */}
                        <div className="lg:sticky lg:top-24 h-[600px] lg:h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
                            <RideMap
                                startCoords={startCoords}
                                destCoords={destCoords}
                                pickupCoords={pickupCoords}
                                dropCoords={dropCoords}
                                routePolyline={routePolyline}
                            />
                        </div>
                    </div>

                    {/* Visual Strip */}
                    <div className="mt-16 grid md:grid-cols-3 gap-6">
                        <div className="relative overflow-hidden rounded-2xl shadow-lg group">
                            <ImageWithFallback
                                src="https://images.unsplash.com/photo-1642167177659-4ae9ff6eaec3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBpbnRlcmlvciUyMGRhc2hib2FyZCUyMGRyaXZlcnxlbnwxfHx8fDE3NzIzNzgwNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                                alt="Comfortable ride"
                                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent flex items-end p-6">
                                <div className="text-white">
                                    <h3 className="font-bold text-lg mb-1">Comfortable Journey</h3>
                                    <p className="text-sm text-purple-100">Modern, well-maintained vehicles</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl shadow-lg group">
                            <ImageWithFallback
                                src="https://images.unsplash.com/photo-1759658697066-806f46b83e95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdod2F5JTIwcm9hZCUyMGpvdXJuZXklMjB0cmF2ZWx8ZW58MXx8fHwxNzcyMzc4MDc2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                                alt="Safe routes"
                                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-pink-900/80 to-transparent flex items-end p-6">
                                <div className="text-white">
                                    <h3 className="font-bold text-lg mb-1">Safe Routes</h3>
                                    <p className="text-sm text-pink-100">Verified and optimized paths</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl shadow-lg group">
                            <ImageWithFallback
                                src="https://images.unsplash.com/photo-1722956672182-579c0c25e467?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBhc3NlbmdlcnMlMjBjYXJwb29sJTIwZnJpZW5kc3xlbnwxfHx8fDE3NzIzNzgwNzd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                                alt="Happy riders"
                                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent flex items-end p-6">
                                <div className="text-white">
                                    <h3 className="font-bold text-lg mb-1">Meet New People</h3>
                                    <p className="text-sm text-purple-100">Connect with fellow travelers</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
