import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Car, MapPin, Calendar, Users, IndianRupee, Check, X,
    Clock, ChevronDown, ChevronUp, Star, Shield, Route,
    Wind, Luggage, UserCheck, Loader2, Plus, CreditCard,
    Search, CheckCircle2, XCircle, Hourglass, Download, Receipt
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { Button } from "../components/ui/button";
import { StripePaymentModal } from "../components/ui/StripePaymentModal";
import { ReceiptModal } from "../components/ReceiptModal";
import { RateDriverModal } from "../components/RateDriverModal";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosClient";

const statusColors = {
    CREATED: "bg-blue-100 text-blue-700 border-blue-200",
    OPEN: "bg-indigo-100 text-indigo-700 border-indigo-200",
    STARTED: "bg-green-100 text-green-700 border-green-200",
    COMPLETED: "bg-gray-100 text-gray-700 border-gray-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels = {
    CREATED: "Scheduled",
    OPEN: "Open",
    STARTED: "Ongoing",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
};

const participantStatusColors = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PAYMENT_PENDING: "bg-orange-100 text-orange-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-500",
};

const participantStatusLabels = {
    PENDING: "Pending",
    PAYMENT_PENDING: "Awaiting Payment",
    APPROVED: "Seat Confirmed",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
};

export default function MyRidesPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const userRole = user?.role?.toLowerCase() || "rider";

    const [rides, setRides] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("scheduled");

    // Modal states
    const [paymentModal, setPaymentModal] = useState({ open: false, booking: null });
    const [receiptModal, setReceiptModal] = useState({ open: false, booking: null });
    const [rateModal, setRateModal] = useState({ open: false, booking: null });

    // Track which bookings have been rated
    const [ratedBookings, setRatedBookings] = useState(() => {
        try {
            const stored = localStorage.getItem('coride_rated_bookings');
            return stored ? JSON.parse(stored) : [];
        } catch (_) { return []; }
    });

    useEffect(() => {
        if (!user?.email) return;
        if (userRole === "driver") {
            fetchRides();
        } else {
            fetchBookings();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // ── Driver: fetch rides ────────────────────────────────────────────────────
    const fetchRides = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/rides/my-rides');
            const formatted = data.map(r => ({
                id: r.id,
                source: r.sourceCity,
                destination: r.destinationCity,
                startTime: r.startTime,
                pricePerSeat: r.pricePerSeat,
                availableSeats: r.availableSeats,
                totalSeats: r.totalSeats,
                status: r.status,
                hasAc: r.hasAc,
                luggageAllowed: r.luggageAllowed,
                distanceKm: r.distanceKm,
                genderPreference: r.genderPreference,
                participants: r.participants || [],
                driver: r.driver,
            }));
            formatted.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
            setRides(formatted);
        } catch (error) {
            console.error("Error fetching rides:", error);
            toast.error("Failed to load rides");
        } finally {
            setLoading(false);
        }
    };

    // ── Rider: fetch bookings ──────────────────────────────────────────────────
    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/rides/my-bookings');
            setBookings(data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            toast.error("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    // ── Driver actions ─────────────────────────────────────────────────────────
    const handleApprove = async (rideId, participantId) => {
        try {
            await api.post(`/api/rides/${rideId}/participants/${participantId}/approve`);
            toast.success("Rider approved! Confirmation email sent.");
            fetchRides();
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to approve rider");
        }
    };

    const handleReject = async (rideId, participantId) => {
        try {
            await api.post(`/api/rides/${rideId}/participants/${participantId}/reject`);
            toast.success("Rider rejected.");
            fetchRides();
        } catch (e) {
            toast.error("Failed to reject rider");
        }
    };

    const handleStartRide = async (rideId) => {
        try {
            await api.patch(`/api/rides/${rideId}/status`, { status: "STARTED" });
            toast.success("Ride started! Have a safe journey 🚗");
            fetchRides();
        } catch (e) {
            toast.error("Failed to start ride");
        }
    };

    const handleCompleteRide = async (rideId) => {
        try {
            await api.patch(`/api/rides/${rideId}/status`, { status: "COMPLETED" });
            toast.success("Ride completed! Great job 🏁");
            fetchRides();
        } catch (e) {
            toast.error("Failed to complete ride");
        }
    };

    const handleCancelRide = async (rideId) => {
        if (!window.confirm('Are you sure you want to cancel this ride? All riders will be notified.')) return;
        try {
            await api.patch(`/api/rides/${rideId}/status`, { status: "CANCELLED" });
            toast.success("Ride cancelled.");
            fetchRides();
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to cancel ride");
        }
    };

    const handleCancelBooking = async (rideId, participantId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await api.post(`/api/rides/${rideId}/participants/${participantId}/cancel`);
            toast.success("Booking cancelled.");
            fetchBookings();
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to cancel booking");
        }
    };

    // ── Payment success handler ────────────────────────────────────────────────
    const handlePaymentSuccess = (booking) => {
        setPaymentModal({ open: false, booking: null });
        toast.success("Payment successful! Your seat is confirmed 🎉");
        fetchBookings();
        // Automatically open receipt after 600ms
        setTimeout(() => {
            setReceiptModal({ open: true, booking });
        }, 600);
    };

    // ── Booking has been rated ─────────────────────────────────────────────────
    const handleRatingSubmitted = (booking, rating) => {
        const updatedRated = [...ratedBookings, booking.participantId];
        setRatedBookings(updatedRated);
        localStorage.setItem('coride_rated_bookings', JSON.stringify(updatedRated));
    };

    // ── Driver tabs ────────────────────────────────────────────────────────────
    const driverTabs = [
        { id: "scheduled", label: "Scheduled", statuses: ["CREATED", "OPEN"] },
        { id: "ongoing", label: "Ongoing", statuses: ["STARTED"] },
        { id: "completed", label: "Completed", statuses: ["COMPLETED"] },
        { id: "cancelled", label: "Cancelled", statuses: ["CANCELLED"] },
    ];

    const currentTab = driverTabs.find(t => t.id === activeTab);
    const filteredRides = rides.filter(r => currentTab?.statuses.includes(r.status));

    // ── Rider booking groupings ────────────────────────────────────────────────
    const paymentPendingBookings = bookings.filter(b => b.status === "PAYMENT_PENDING");
    const approvedBookings = bookings.filter(b => b.status === "APPROVED");
    const pendingBookings = bookings.filter(b => b.status === "PENDING");
    const rejectedBookings = bookings.filter(b => b.status === "REJECTED");
    const cancelledBookings = bookings.filter(b => b.status === "CANCELLED");

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                <Car className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">My Rides</h1>
                                <p className="text-gray-500 text-sm">
                                    {userRole === "driver" ? "Manage your offered rides" : "Track your booked rides"}
                                </p>
                            </div>
                        </div>
                        {userRole === "driver" && (
                            <Button
                                onClick={() => navigate("/create-ride")}
                                className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-lg"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                New Ride
                            </Button>
                        )}
                        {userRole !== "driver" && (
                            <Button
                                onClick={() => navigate("/search")}
                                variant="outline"
                                className="border-purple-200 text-purple-600 hover:bg-purple-50"
                            >
                                <Search className="w-4 h-4 mr-2" />
                                Find Rides
                            </Button>
                        )}
                    </div>

                    {/* ── DRIVER VIEW ── */}
                    {userRole === "driver" && (
                        <>
                            {/* Tabs */}
                            <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-md border border-purple-100 mb-8 w-fit">
                                {driverTabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                                            ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-purple-50"
                                            }`}
                                    >
                                        {tab.label}
                                        {tab.id === "scheduled" && rides.filter(r => tab.statuses.includes(r.status)).length > 0 && (
                                            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/30" : "bg-purple-100 text-purple-700"}`}>
                                                {rides.filter(r => tab.statuses.includes(r.status)).length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
                                    <p className="text-gray-500">Loading your rides...</p>
                                </div>
                            ) : filteredRides.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl border border-purple-100 shadow-lg">
                                    <div className="w-16 h-16 rounded-full bg-purple-50 mx-auto mb-4 flex items-center justify-center">
                                        <Car className="w-8 h-8 text-purple-300" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No {activeTab} rides</h3>
                                    <p className="text-gray-400 text-sm">
                                        {activeTab === "scheduled" && userRole === "driver"
                                            ? "Create a new ride to get started."
                                            : "Nothing here yet."}
                                    </p>
                                    {activeTab === "scheduled" && userRole === "driver" && (
                                        <Button onClick={() => navigate("/create-ride")} className="mt-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
                                            Create a Ride
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {filteredRides.map((ride) => (
                                        <DriverRideCard
                                            key={ride.id}
                                            ride={ride}
                                            onApprove={handleApprove}
                                            onReject={handleReject}
                                            onStart={handleStartRide}
                                            onComplete={handleCompleteRide}
                                            onCancelRide={handleCancelRide}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── RIDER VIEW ── */}
                    {userRole !== "driver" && (
                        <>
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
                                    <p className="text-gray-500">Loading your bookings...</p>
                                </div>
                            ) : bookings.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl border border-purple-100 shadow-lg">
                                    <div className="w-16 h-16 rounded-full bg-purple-50 mx-auto mb-4 flex items-center justify-center">
                                        <Car className="w-8 h-8 text-purple-300" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No bookings yet</h3>
                                    <p className="text-gray-400 text-sm mb-4">Find a ride and request to join!</p>
                                    <Button onClick={() => navigate("/search")} className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
                                        Search Rides
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Approved — Driver OK, awaiting payment */}
                                    {paymentPendingBookings.length > 0 && (
                                        <section>
                                            <div className="flex items-center gap-2 mb-4">
                                                <CreditCard className="w-5 h-5 text-orange-500" />
                                                <h2 className="text-lg font-bold text-gray-800">Driver Approved — Pay to Confirm</h2>
                                                <span className="ml-1 bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">{paymentPendingBookings.length}</span>
                                            </div>
                                            <div className="space-y-4">
                                                {paymentPendingBookings.map(b => (
                                                    <RiderBookingCard
                                                        key={b.participantId}
                                                        booking={b}
                                                        onPay={() => setPaymentModal({ open: true, booking: b })}
                                                        onCancel={() => handleCancelBooking(b.ride?.id, b.participantId)}
                                                    />
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Fully confirmed (paid) */}
                                    {approvedBookings.length > 0 && (
                                        <section>
                                            <div className="flex items-center gap-2 mb-4">
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                <h2 className="text-lg font-bold text-gray-800">Confirmed Rides</h2>
                                                <span className="ml-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">{approvedBookings.length}</span>
                                            </div>
                                            <div className="space-y-4">
                                                {approvedBookings.map(b => (
                                                    <RiderBookingCard
                                                        key={b.participantId}
                                                        booking={b}
                                                        onDownloadReceipt={() => setReceiptModal({ open: true, booking: b })}
                                                        onRateDriver={
                                                            b.ride?.status === 'COMPLETED' && !ratedBookings.includes(b.participantId)
                                                                ? () => setRateModal({ open: true, booking: b })
                                                                : null
                                                        }
                                                        hasRated={ratedBookings.includes(b.participantId)}
                                                    />
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Pending */}
                                    {pendingBookings.length > 0 && (
                                        <section>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Hourglass className="w-5 h-5 text-yellow-500" />
                                                <h2 className="text-lg font-bold text-gray-800">Awaiting Driver Approval</h2>
                                                <span className="ml-1 bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingBookings.length}</span>
                                            </div>
                                            <div className="space-y-4">
                                                {pendingBookings.map(b => (
                                                    <RiderBookingCard
                                                        key={b.participantId}
                                                        booking={b}
                                                        onCancel={() => handleCancelBooking(b.ride?.id, b.participantId)}
                                                    />
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Rejected */}
                                    {rejectedBookings.length > 0 && (
                                        <section>
                                            <div className="flex items-center gap-2 mb-4">
                                                <XCircle className="w-5 h-5 text-red-400" />
                                                <h2 className="text-lg font-bold text-gray-800">Declined</h2>
                                                <span className="ml-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{rejectedBookings.length}</span>
                                            </div>
                                            <div className="space-y-4">
                                                {rejectedBookings.map(b => (
                                                    <RiderBookingCard key={b.participantId} booking={b} />
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Cancelled */}
                                    {cancelledBookings.length > 0 && (
                                        <section>
                                            <div className="flex items-center gap-2 mb-4">
                                                <XCircle className="w-5 h-5 text-gray-400" />
                                                <h2 className="text-lg font-bold text-gray-800">Cancelled</h2>
                                                <span className="ml-1 bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">{cancelledBookings.length}</span>
                                            </div>
                                            <div className="space-y-4">
                                                {cancelledBookings.map(b => (
                                                    <RiderBookingCard key={b.participantId} booking={b} />
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Stripe Payment Modal */}
            {paymentModal.open && paymentModal.booking && (
                <StripePaymentModal
                    isOpen={paymentModal.open}
                    onClose={() => setPaymentModal({ open: false, booking: null })}
                    amount={Math.round(Number(paymentModal.booking.fareAtBooking || 0))}
                    driverName={paymentModal.booking.ride?.driver?.name || paymentModal.booking.ride?.driver?.email || 'Driver'}
                    rideId={paymentModal.booking.ride?.id}
                    participantId={paymentModal.booking.participantId}
                    onSuccess={() => handlePaymentSuccess(paymentModal.booking)}
                />
            )}

            {/* Receipt Modal */}
            <ReceiptModal
                isOpen={receiptModal.open}
                onClose={() => setReceiptModal({ open: false, booking: null })}
                booking={receiptModal.booking}
            />

            {/* Rate Driver Modal */}
            <RateDriverModal
                isOpen={rateModal.open}
                onClose={() => setRateModal({ open: false, booking: null })}
                booking={rateModal.booking}
                onSubmitted={(rating) => {
                    if (rateModal.booking) handleRatingSubmitted(rateModal.booking, rating);
                }}
            />
        </div>
    );
}

// ── Rider Booking Card ─────────────────────────────────────────────────────────
function RiderBookingCard({ booking, onPay, onDownloadReceipt, onRateDriver, hasRated, onCancel }) {
    const ride = booking.ride;
    const status = booking.status;
    const rideStatus = ride?.status;

    const formatDate = (dt) => {
        if (!dt) return '';
        return new Date(dt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };
    const formatTime = (dt) => {
        if (!dt) return '';
        return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const statusConfig = {
        PENDING: { label: 'Awaiting Driver Approval', className: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Hourglass className="w-3.5 h-3.5" /> },
        PAYMENT_PENDING: { label: 'Pay to Confirm Seat', className: 'bg-orange-100 text-orange-700 border-orange-200', icon: <CreditCard className="w-3.5 h-3.5" /> },
        APPROVED: { label: 'Seat Confirmed ✓', className: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
        REJECTED: { label: 'Declined', className: 'bg-red-100 text-red-600 border-red-200', icon: <XCircle className="w-3.5 h-3.5" /> },
        CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500 border-gray-200', icon: <XCircle className="w-3.5 h-3.5" /> },
    };

    const sc = statusConfig[status] || statusConfig.PENDING;

    return (
        <div className={`bg-white rounded-2xl shadow-md border overflow-hidden transition-all duration-300 ${status === 'APPROVED' ? 'border-green-200 shadow-green-50' : 'border-purple-100'}`}>
            <div className="p-5">
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            {ride?.sourceCity} → {ride?.destinationCity}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(ride?.startTime)}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(ride?.startTime)}</span>
                            {rideStatus && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusColors[rideStatus] || 'bg-gray-100 text-gray-500'}`}>
                                    {statusLabels[rideStatus] || rideStatus}
                                </span>
                            )}
                        </div>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${sc.className}`}>
                        {sc.icon}
                        {sc.label}
                    </span>
                </div>

                {/* Driver + Fare */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {(ride?.driver?.name || "D").charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{ride?.driver?.name || ride?.driver?.email || 'Driver'}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 4.8
                                <Shield className="w-3 h-3 text-blue-500 ml-1" />
                                <span className="text-blue-500">Verified</span>
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-black text-purple-600">₹{Math.round(Number(booking.fareAtBooking || 0))}</p>
                        <p className="text-xs text-gray-400">per seat</p>
                    </div>
                </div>

                {/* Pay Now button */}
                {status === 'PAYMENT_PENDING' && onPay && (
                    <div className="mt-4 pt-4 border-t border-orange-100">
                        <div className="bg-orange-50 rounded-xl p-3 mb-3 text-sm text-orange-700 font-medium flex items-center gap-2">
                            <CreditCard className="w-4 h-4 shrink-0" />
                            The driver has approved your request! Complete payment to secure your seat.
                        </div>
                        <button
                            onClick={onPay}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-200 flex items-center justify-center gap-2 transition-all hover:shadow-purple-300 hover:scale-[1.01] active:scale-[0.99]"
                        >
                            <CreditCard className="w-5 h-5" />
                            Pay ₹{Math.round(Number(booking.fareAtBooking || 0))} to Confirm Seat
                        </button>
                    </div>
                )}

                {/* Approved state with receipt + rate driver */}
                {status === 'APPROVED' && (
                    <div className="mt-4 pt-4 border-t border-green-100 space-y-3">
                        <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700 font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            Your seat is confirmed and payment is complete. Enjoy the ride!
                        </div>

                        {/* Action row */}
                        <div className="flex gap-2">
                            {/* Download Receipt */}
                            {onDownloadReceipt && (
                                <button
                                    onClick={onDownloadReceipt}
                                    className="flex-1 flex items-center justify-center gap-2 border border-purple-200 text-purple-700 hover:bg-purple-50 font-semibold py-2.5 rounded-xl text-sm transition-all hover:scale-[1.02]"
                                >
                                    <Receipt className="w-4 h-4" />
                                    Receipt
                                </button>
                            )}

                            {/* Rate Driver — only after ride COMPLETED */}
                            {onRateDriver && !hasRated && (
                                <button
                                    onClick={onRateDriver}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-md shadow-yellow-200 hover:scale-[1.02]"
                                >
                                    <Star className="w-4 h-4 fill-white" />
                                    Rate Driver
                                </button>
                            )}
                            {hasRated && (
                                <div className="flex-1 flex items-center justify-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 font-semibold py-2.5 rounded-xl text-sm">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    Rated
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {status === 'PENDING' && (
                    <div className="mt-4 pt-4 border-t border-yellow-100">
                        <p className="text-sm text-yellow-700 bg-yellow-50 rounded-xl p-3 flex items-center gap-2">
                            <Hourglass className="w-4 h-4 shrink-0" />
                            Waiting for the driver to review your request. You'll receive an email once approved.
                        </p>
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                className="mt-3 w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 font-semibold py-2.5 rounded-xl text-sm transition-all"
                            >
                                <XCircle className="w-4 h-4" />
                                Cancel Request
                            </button>
                        )}
                    </div>
                )}

                {status === 'REJECTED' && (
                    <div className="mt-4 pt-4 border-t border-red-100">
                        <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3 flex items-center gap-2">
                            <XCircle className="w-4 h-4 shrink-0" />
                            The driver has declined your request. Try searching for another ride.
                        </p>
                    </div>
                )}

                {status === 'CANCELLED' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                            <XCircle className="w-4 h-4 shrink-0" />
                            You cancelled this booking.
                        </p>
                    </div>
                )}

                {status === 'PAYMENT_PENDING' && onCancel && (
                    <div className="mt-2">
                        <button
                            onClick={onCancel}
                            className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 font-semibold py-2.5 rounded-xl text-sm transition-all"
                        >
                            <XCircle className="w-4 h-4" />
                            Cancel Request
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Driver Ride Card ───────────────────────────────────────────────────────────
function DriverRideCard({ ride, onApprove, onReject, onStart, onComplete, onCancelRide }) {
    const [expanded, setExpanded] = useState(false);
    const [processingParticipantId, setProcessingParticipantId] = useState(null);
    const pendingCount = ride.participants?.filter(p => p.status === "PENDING").length || 0;

    const formatDate = (dt) => {
        if (!dt) return '';
        return new Date(dt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };
    const formatTime = (dt) => {
        if (!dt) return '';
        return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const handleApproveClick = async (rideId, participantId) => {
        if (processingParticipantId) return;
        setProcessingParticipantId(participantId);
        try { await onApprove(rideId, participantId); }
        finally { setProcessingParticipantId(null); }
    };

    const handleRejectClick = async (rideId, participantId) => {
        if (processingParticipantId) return;
        setProcessingParticipantId(participantId);
        try { await onReject(rideId, participantId); }
        finally { setProcessingParticipantId(null); }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
                            {(ride.driver?.name || "D").charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{ride.driver?.name || "You"}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                <span>4.8</span>
                                <Shield className="w-3 h-3 text-blue-500" />
                                <span className="text-blue-600">Verified</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">₹{Math.round(Number(ride.pricePerSeat || 0))}</p>
                        <p className="text-xs text-gray-400">per seat</p>
                    </div>
                </div>

                <div className="flex items-start gap-3 mb-4">
                    <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                        <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-200" />
                        <div className="w-0.5 h-8 bg-gradient-to-b from-green-400 to-red-400" />
                        <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-200" />
                    </div>
                    <div className="flex-1 space-y-3">
                        <div>
                            <p className="font-semibold text-gray-900">{ride.source}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />{formatTime(ride.startTime)} · {formatDate(ride.startTime)}
                            </p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{ride.destination}</p>
                            {ride.distanceKm && (
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                    <Route className="w-3 h-3" />{ride.distanceKm.toFixed(1)} km
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[ride.status] || statusColors.OPEN}`}>
                        {statusLabels[ride.status] || ride.status}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                        <Users className="w-3 h-3" />
                        {ride.availableSeats}/{ride.totalSeats} seats
                    </span>
                    {ride.hasAc && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                            <Wind className="w-3 h-3" /> AC
                        </span>
                    )}
                    {ride.luggageAllowed && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium">
                            <Luggage className="w-3 h-3" /> Luggage
                        </span>
                    )}
                    {pendingCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-semibold animate-pulse">
                            <UserCheck className="w-3 h-3" /> {pendingCount} pending
                        </span>
                    )}
                </div>

                <div className="flex gap-2">
                    {(ride.status === "CREATED" || ride.status === "OPEN") && (
                        <Button
                            onClick={() => onStart(ride.id)}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white"
                        >
                            Start Ride
                        </Button>
                    )}
                    {ride.status === "STARTED" && (
                        <Button
                            onClick={() => onComplete(ride.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                            Complete Ride
                        </Button>
                    )}
                    {ride.status === "COMPLETED" && (
                        <Button variant="outline" disabled className="flex-1 text-gray-500">
                            Completed
                        </Button>
                    )}
                    {ride.status === "CANCELLED" && (
                        <Button variant="outline" disabled className="flex-1 text-red-400">
                            Cancelled
                        </Button>
                    )}
                    {(ride.status === "CREATED" || ride.status === "OPEN" || ride.status === "STARTED") && (
                        <Button
                            variant="outline"
                            onClick={() => onCancelRide(ride.id)}
                            className="border-red-200 text-red-500 hover:bg-red-50 px-3"
                            title="Cancel Ride"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => setExpanded(!expanded)}
                        className="border-purple-200 text-purple-600 hover:bg-purple-50 px-3"
                    >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-purple-100 bg-gradient-to-b from-purple-50/30 to-pink-50/20 p-6 space-y-6">
                    <div>
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Ride Details</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white rounded-xl p-3 border border-purple-100 text-center shadow-sm">
                                <IndianRupee className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                                <p className="text-xs text-gray-400">Price/Seat</p>
                                <p className="font-bold text-gray-900">₹{Math.round(ride.pricePerSeat || 0)}</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-purple-100 text-center shadow-sm">
                                <Users className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                                <p className="text-xs text-gray-400">Seats Left</p>
                                <p className="font-bold text-gray-900">{ride.availableSeats}/{ride.totalSeats}</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-purple-100 text-center shadow-sm">
                                <Calendar className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                                <p className="text-xs text-gray-400">Date</p>
                                <p className="font-bold text-gray-900 text-xs">{formatDate(ride.startTime)}</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-purple-100 text-center shadow-sm">
                                <UserCheck className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                                <p className="text-xs text-gray-400">Gender Pref</p>
                                <p className="font-bold text-gray-900 capitalize">{ride.genderPreference || "Any"}</p>
                            </div>
                        </div>
                    </div>

                    {ride.participants && ride.participants.length > 0 ? (
                        <div>
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4 text-purple-500" />
                                Booking Requests ({ride.participants.length})
                            </h4>
                            <div className="space-y-3">
                                {ride.participants.map(p => (
                                    <div key={p.id} className="bg-white rounded-xl border border-purple-100 shadow-sm overflow-hidden">
                                        <div className="flex items-center justify-between p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg shrink-0">
                                                    {(p.rider?.name || "R").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{p.rider?.name || "Unknown Rider"}</p>
                                                    <p className="text-xs text-gray-400">{p.rider?.email || ""}</p>
                                                    {p.rider?.phoneNumber && (
                                                        <p className="text-xs text-gray-400">📞 {p.rider.phoneNumber}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${participantStatusColors[p.status] || "bg-gray-100 text-gray-600"}`}>
                                                    {participantStatusLabels[p.status] || p.status}
                                                </span>
                                                {p.status === "PENDING" && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleApproveClick(ride.id, p.id)}
                                                            disabled={processingParticipantId === p.id}
                                                            className="w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center text-white shadow-md transition-transform hover:scale-110"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectClick(ride.id, p.id)}
                                                            disabled={processingParticipantId === p.id}
                                                            className="w-8 h-8 rounded-full border border-red-300 hover:bg-red-50 flex items-center justify-center text-red-500 transition-transform hover:scale-110"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {(p.rider?.gender || p.rider?.dateOfBirth) && (
                                            <div className="border-t border-purple-50 px-4 py-2 flex gap-4 bg-purple-50/30">
                                                {p.rider?.gender && (
                                                    <span className="text-xs text-gray-500">
                                                        <span className="font-semibold text-gray-600">Gender: </span>
                                                        <span className="capitalize">{p.rider.gender}</span>
                                                    </span>
                                                )}
                                                {p.rider?.dateOfBirth && (
                                                    <span className="text-xs text-gray-500">
                                                        <span className="font-semibold text-gray-600">DOB: </span>
                                                        {new Date(p.rider.dateOfBirth).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-white rounded-xl border border-dashed border-purple-200">
                            <MapPin className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">No booking requests yet</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
