import { useState, useEffect, useCallback } from 'react';
import { CreateRideNavbar } from '../../components/CreateRideNavbar';
import { RideCard } from '../../components/RideCard';
import { LocationAutocomplete } from '../../components/ui/LocationAutocomplete';
import {
    MapPin,
    Calendar,
    Search,
    SlidersHorizontal,
    Sparkles,
    Users,
    IndianRupee,
    Star,
    TrendingDown,
    Loader2,
    Car
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Slider } from '../../components/ui/slider';
import api from '../../api/axiosClient';

export default function SearchRides() {
    const [fromCity, setFromCity] = useState('');
    const [toCity, setToCity] = useState('');
    const [travelDate, setTravelDate] = useState('');
    const [passengers, setPassengers] = useState('1');
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 20000]);
    const [sortBy, setSortBy] = useState('recommended');
    const [rides, setRides] = useState([]);
    const [filteredRides, setFilteredRides] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Filter states
    const [acFilter, setAcFilter] = useState(false);
    const [luggageFilter, setLuggageFilter] = useState(false);
    const [verifiedFilter, setVerifiedFilter] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    // Load all available rides on mount
    useEffect(() => {
        loadAllRides();
    }, []);

    const loadAllRides = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/api/rides/search', { params: { source: '', dest: '' } });
            setRides(res.data || []);
            setFilteredRides(res.data || []);
        } catch (err) {
            console.error('Error loading rides:', err);
            setRides([]);
            setFilteredRides([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setHasSearched(true);
        setIsLoading(true);

        try {
            const res = await api.get('/api/rides/search', {
                params: {
                    source: fromCity,
                    dest: toCity
                }
            });
            const results = res.data || [];
            setRides(results);
            applyFiltersAndSort(results);
        } catch (err) {
            console.error('Error searching rides:', err);
            setRides([]);
            setFilteredRides([]);
        } finally {
            setIsLoading(false);
        }
    };

    const applyFiltersAndSort = useCallback((ridesList) => {
        let filtered = [...ridesList];

        // Date filter
        if (travelDate) {
            filtered = filtered.filter(ride => {
                if (!ride.startTime) return false;
                const rideDate = ride.startTime.split('T')[0];
                return rideDate === travelDate;
            });
        }

        // Seat filter
        const minSeats = parseInt(passengers) || 1;
        filtered = filtered.filter(ride => (ride.availableSeats || 0) >= minSeats);

        // Price filter
        filtered = filtered.filter(ride => {
            const price = Number(ride.pricePerSeat) || 0;
            return price >= priceRange[0] && price <= priceRange[1];
        });

        // AC filter
        if (acFilter) {
            filtered = filtered.filter(ride => ride.hasAc);
        }

        // Luggage filter
        if (luggageFilter) {
            filtered = filtered.filter(ride => ride.luggageAllowed);
        }

        // Sort
        switch (sortBy) {
            case 'price-low':
                filtered.sort((a, b) => (Number(a.pricePerSeat) || 0) - (Number(b.pricePerSeat) || 0));
                break;
            case 'price-high':
                filtered.sort((a, b) => (Number(b.pricePerSeat) || 0) - (Number(a.pricePerSeat) || 0));
                break;
            case 'time':
                filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
                break;
            default:
                break;
        }

        setFilteredRides(filtered);
    }, [travelDate, passengers, priceRange, acFilter, luggageFilter, sortBy]);

    // Re-apply filters when filter state changes
    useEffect(() => {
        applyFiltersAndSort(rides);
    }, [rides, applyFiltersAndSort]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-background dark:via-background dark:to-background">
            <CreateRideNavbar />

            <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                <Search className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Find a Ride</h1>
                                <p className="text-gray-600">Discover rides that match your journey</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column - Search & Filters */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 sticky top-24">
                                <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-purple-600" />
                                    Search Details
                                </h2>

                                <form onSubmit={handleSearch} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="from-city" className="text-gray-700">From</Label>
                                        <LocationAutocomplete
                                            id="from-city"
                                            value={fromCity}
                                            onChange={setFromCity}
                                            placeholder="e.g. Chennai"
                                            className="border-purple-200 focus:border-purple-400"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="to-city" className="text-gray-700">To</Label>
                                        <LocationAutocomplete
                                            id="to-city"
                                            value={toCity}
                                            onChange={setToCity}
                                            placeholder="e.g. Pune"
                                            className="border-purple-200 focus:border-purple-400"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="travel-date" className="text-gray-700">Travel Date</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                            <Input
                                                id="travel-date"
                                                type="date"
                                                min={today}
                                                value={travelDate}
                                                onChange={(e) => setTravelDate(e.target.value)}
                                                className="pl-10 border-purple-200 focus:border-purple-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="passengers" className="text-gray-700">Passengers</Label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400 z-10" />
                                            <Select value={passengers} onValueChange={setPassengers}>
                                                <SelectTrigger className="pl-10 border-purple-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">1 Passenger</SelectItem>
                                                    <SelectItem value="2">2 Passengers</SelectItem>
                                                    <SelectItem value="3">3 Passengers</SelectItem>
                                                    <SelectItem value="4">4 Passengers</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-lg"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Searching...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-5 h-5 mr-2" />
                                                Search Rides
                                            </>
                                        )}
                                    </Button>
                                </form>

                                {/* Advanced Filters Toggle */}
                                <div className="mt-6 pt-6 border-t border-purple-100">
                                    <Button
                                        variant="outline"
                                        className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                                        {showFilters ? 'Hide' : 'Show'} Advanced Filters
                                    </Button>
                                </div>

                                {/* Advanced Filters */}
                                {showFilters && (
                                    <div className="mt-6 space-y-6 pt-6 border-t border-purple-100">
                                        <div className="space-y-3">
                                            <Label className="text-gray-700 font-semibold">Price Range</Label>
                                            <div className="px-2">
                                                <Slider
                                                    value={priceRange}
                                                    onValueChange={setPriceRange}
                                                    min={0}
                                                    max={20000}
                                                    step={50}
                                                    className="mb-3"
                                                />
                                                <div className="flex justify-between text-sm text-gray-600">
                                                    <span className="flex items-center">
                                                        <IndianRupee className="w-3 h-3" />
                                                        {priceRange[0]}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <IndianRupee className="w-3 h-3" />
                                                        {priceRange[1]}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-gray-700 font-semibold">Amenities</Label>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        id="ac-filter"
                                                        checked={acFilter}
                                                        onCheckedChange={setAcFilter}
                                                        className="border-purple-300"
                                                    />
                                                    <Label htmlFor="ac-filter" className="text-gray-700 cursor-pointer text-sm">
                                                        AC Available
                                                    </Label>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        id="luggage-filter"
                                                        checked={luggageFilter}
                                                        onCheckedChange={setLuggageFilter}
                                                        className="border-purple-300"
                                                    />
                                                    <Label htmlFor="luggage-filter" className="text-gray-700 cursor-pointer text-sm">
                                                        Luggage Allowed
                                                    </Label>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        id="verified-filter"
                                                        checked={verifiedFilter}
                                                        onCheckedChange={setVerifiedFilter}
                                                        className="border-purple-300"
                                                    />
                                                    <Label htmlFor="verified-filter" className="text-gray-700 cursor-pointer text-sm">
                                                        Verified Drivers Only
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-gray-700 font-semibold">Minimum Rating</Label>
                                            <Select defaultValue="4.0">
                                                <SelectTrigger className="border-purple-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="3.0">3.0 ⭐ & above</SelectItem>
                                                    <SelectItem value="4.0">4.0 ⭐ & above</SelectItem>
                                                    <SelectItem value="4.5">4.5 ⭐ & above</SelectItem>
                                                    <SelectItem value="4.8">4.8 ⭐ & above</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Ride Results */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Results Header */}
                            <div className="bg-white rounded-2xl shadow-lg p-4 border border-purple-100">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {isLoading ? 'Searching...' : `${filteredRides.length} Ride${filteredRides.length !== 1 ? 's' : ''} Available`}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {fromCity && toCity ? `${fromCity} to ${toCity}` : 'All available rides'}
                                            {travelDate && ` • ${new Date(travelDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="sort-by" className="text-sm text-gray-700 whitespace-nowrap">
                                            Sort by:
                                        </Label>
                                        <Select value={sortBy} onValueChange={setSortBy}>
                                            <SelectTrigger className="w-[180px] border-purple-200">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="recommended">
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles className="w-3 h-3" />
                                                        Recommended
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="price-low">
                                                    <div className="flex items-center gap-2">
                                                        <TrendingDown className="w-3 h-3" />
                                                        Price: Low to High
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="price-high">
                                                    <div className="flex items-center gap-2">
                                                        <IndianRupee className="w-3 h-3" />
                                                        Price: High to Low
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="rating">
                                                    <div className="flex items-center gap-2">
                                                        <Star className="w-3 h-3" />
                                                        Highest Rated
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="time">Earliest Departure</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Ride Cards */}
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
                                    <p className="text-gray-600">Searching for rides...</p>
                                </div>
                            ) : filteredRides.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-2xl border border-purple-100 shadow-lg">
                                    <div className="w-16 h-16 rounded-full bg-purple-50 mx-auto mb-4 flex items-center justify-center">
                                        <Car className="w-8 h-8 text-purple-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No rides found</h3>
                                    <p className="text-gray-500 text-sm mb-4">
                                        {hasSearched ? 'Try adjusting your search criteria or filters' : 'No rides are currently available. Check back later!'}
                                    </p>
                                    {hasSearched && (
                                        <Button
                                            variant="outline"
                                            onClick={() => { setFromCity(''); setToCity(''); setTravelDate(''); loadAllRides(); setHasSearched(false); }}
                                            className="border-purple-300 text-purple-600 hover:bg-purple-50"
                                        >
                                            Clear Search
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {filteredRides.map((ride) => (
                                        <RideCard key={ride.id} ride={ride} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
