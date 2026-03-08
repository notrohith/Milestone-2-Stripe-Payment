import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, DollarSign, MapPin, Users } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
// Navbar is handled by App.js layout

const mockRideDetails = {
    id: "1",
    source: "Mumbai",
    destination: "Pune",
    startTime: "2026-02-10T09:00:00",
    pricePerKm: 5,
    availableSeats: 2,
    totalSeats: 4,
    status: "scheduled",
    distance: 150,
};

const statusColors = {
    scheduled: "bg-blue-100 text-blue-700 border-blue-200",
    ongoing: "bg-green-100 text-green-700 border-green-200",
    completed: "bg-gray-100 text-gray-700 border-gray-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels = {
    scheduled: "Scheduled",
    ongoing: "Ongoing",
    completed: "Completed",
    cancelled: "Cancelled",
};

export default function RideDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [joinPoint, setJoinPoint] = useState("");
    const [dropPoint, setDropPoint] = useState("");
    const [showFare, setShowFare] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    const ride = mockRideDetails;
    const estimatedFare = ride.distance * ride.pricePerKm;

    const handleJoinRide = (e) => {
        e.preventDefault();
        setIsJoining(true);

        setTimeout(() => {
            setShowFare(true);
            setIsJoining(false);
            toast.success("Successfully joined the ride!");
        }, 800);
    };

    return (
        <div className="bg-background min-h-full">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Rides
                </Button>

                {/* Ride Summary Card */}
                <Card className="p-6 mb-6 border border-border">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold mb-2">Ride Details</h1>
                            <p className="text-sm text-muted-foreground">Ride ID: {ride.id}</p>
                        </div>
                        <Badge className={statusColors[ride.status]}>
                            {statusLabels[ride.status]}
                        </Badge>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-4 mb-6 p-4 bg-secondary/10 rounded-lg border">
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-1">From</p>
                            <p className="text-lg font-semibold">{ride.source}</p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-primary flex-shrink-0" />
                        <div className="flex-1 text-right">
                            <p className="text-sm text-muted-foreground mb-1">To</p>
                            <p className="text-lg font-semibold">{ride.destination}</p>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg border">
                            <Calendar className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-xs text-muted-foreground">Departure Time</p>
                                <p className="font-medium">{new Date(ride.startTime).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg border">
                            <DollarSign className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-xs text-muted-foreground">Price per km</p>
                                <p className="font-medium">₹{ride.pricePerKm}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg border">
                            <Users className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-xs text-muted-foreground">Available Seats</p>
                                <p className="font-medium">{ride.availableSeats} of {ride.totalSeats}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg border">
                            <MapPin className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-xs text-muted-foreground">Distance</p>
                                <p className="font-medium">{ride.distance} km</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Join Ride Form */}
                {!showFare ? (
                    <Card className="p-6 border border-border">
                        <h2 className="text-xl font-semibold mb-4">Join This Ride</h2>

                        <form onSubmit={handleJoinRide} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="joinPoint">Join Point</Label>
                                <Input
                                    id="joinPoint"
                                    type="text"
                                    placeholder="Enter your pickup location"
                                    value={joinPoint}
                                    onChange={(e) => setJoinPoint(e.target.value)}
                                    required
                                    className="bg-input-background"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dropPoint">Drop Point</Label>
                                <Input
                                    id="dropPoint"
                                    type="text"
                                    placeholder="Enter your drop-off location"
                                    value={dropPoint}
                                    onChange={(e) => setDropPoint(e.target.value)}
                                    required
                                    className="bg-input-background"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={ride.availableSeats === 0 || isJoining}
                            >
                                {isJoining ? "Joining..." : "Join Ride"}
                            </Button>

                            {ride.availableSeats === 0 && (
                                <p className="text-sm text-destructive text-center">
                                    This ride is fully booked
                                </p>
                            )}
                        </form>
                    </Card>
                ) : (
                    <Card className="p-6 border border-border bg-gradient-to-br from-green-50 to-teal-50">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
                                <DollarSign className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-semibold mb-2">Ride Joined Successfully!</h2>
                            <p className="text-muted-foreground mb-6">Your booking has been confirmed</p>

                            <div className="bg-white rounded-lg p-6 mb-6">
                                <p className="text-sm text-muted-foreground mb-2">Estimated Fare</p>
                                <p className="text-4xl font-bold text-green-600">₹{estimatedFare}</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {ride.distance} km × ₹{ride.pricePerKm}/km
                                </p>
                            </div>

                            <div className="text-left space-y-2 mb-6">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm"><strong>Pickup:</strong> {joinPoint}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm"><strong>Drop-off:</strong> {dropPoint}</span>
                                </div>
                            </div>

                            <Button onClick={() => navigate("/my-rides")} className="w-full">
                                View My Rides
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
