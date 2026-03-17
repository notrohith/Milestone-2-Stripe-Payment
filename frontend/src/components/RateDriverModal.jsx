import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '../api/axiosClient';

const RATING_LABELS = ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];

export function RateDriverModal({ isOpen, onClose, booking, onSubmitted }) {
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen || !booking) return null;

    const ride = booking.ride;
    const driverName = ride?.driver?.name || ride?.driver?.email || 'Driver';

    const handleSubmit = async () => {
        if (rating === 0) { toast.error('Please select a star rating'); return; }
        setSubmitting(true);
        try {
            // Call backend to rate driver — triggers RATING_RECEIVED notification
            await api.post(`/api/rides/${ride.id}/participants/${booking.participantId}/rate`, {
                rating,
                review,
            });
            setSubmitted(true);
            toast.success(`Thanks! You gave ${driverName} ${rating} ★`);
            setTimeout(() => {
                onSubmitted?.(rating);
                onClose();
                setSubmitted(false);
                setRating(0);
                setReview('');
            }, 1500);
        } catch (err) {
            console.error('Failed to submit rating:', err);
            const msg = err.response?.data?.message || err.response?.data || 'Failed to submit rating';
            toast.error(typeof msg === 'string' ? msg : 'Failed to submit rating');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={(e) => e.target === e.currentTarget && onClose()}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-purple-600 to-pink-500 px-6 pt-6 pb-10 text-white text-center">
                            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-full">
                                <X size={18} />
                            </button>
                            <div className="w-16 h-16 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-3">
                                <span className="text-3xl">🚗</span>
                            </div>
                            <h2 className="text-xl font-extrabold">How was your ride?</h2>
                            <p className="text-purple-100 text-sm mt-1">Rate your experience with <strong className="text-white">{driverName}</strong></p>
                        </div>

                        {/* Dashed divider bump */}
                        <div className="relative -mt-5 flex justify-center">
                            <div className="w-20 h-10 bg-white rounded-t-full shadow-inner" />
                        </div>

                        <div className="px-8 pt-2 pb-8 space-y-5">
                            {submitted ? (
                                <div className="flex flex-col items-center py-6 gap-3">
                                    <div className="text-5xl">🎉</div>
                                    <p className="font-bold text-gray-800 text-lg">Thanks for your feedback!</p>
                                    <p className="text-gray-400 text-sm text-center">Your rating helps improve the CoRide community.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Stars */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <motion.button
                                                    key={star}
                                                    whileHover={{ scale: 1.25 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setRating(star)}
                                                    onMouseEnter={() => setHovered(star)}
                                                    onMouseLeave={() => setHovered(0)}
                                                    className="focus:outline-none"
                                                >
                                                    <Star
                                                        size={40}
                                                        className={`transition-colors duration-150 ${
                                                            star <= (hovered || rating)
                                                                ? 'text-yellow-400 fill-yellow-400'
                                                                : 'text-gray-200'
                                                        }`}
                                                    />
                                                </motion.button>
                                            ))}
                                        </div>
                                        {(hovered || rating) > 0 && (
                                            <motion.p
                                                key={hovered || rating}
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-sm font-bold text-purple-600"
                                            >
                                                {RATING_LABELS[hovered || rating]}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Route summary */}
                                    <div className="bg-purple-50 rounded-xl p-3 text-center text-sm text-gray-600">
                                        <span className="font-semibold text-gray-800">{ride?.sourceCity}</span>
                                        <span className="text-gray-400 mx-2">→</span>
                                        <span className="font-semibold text-gray-800">{ride?.destinationCity}</span>
                                    </div>

                                    {/* Review text */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                                            Add a comment (optional)
                                        </label>
                                        <textarea
                                            value={review}
                                            onChange={(e) => setReview(e.target.value)}
                                            placeholder="Tell us about your experience..."
                                            rows={3}
                                            className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 placeholder-gray-300 transition-all"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting || rating === 0}
                                        className={`w-full py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                                            rating === 0
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-lg shadow-purple-200 hover:scale-[1.01]'
                                        }`}
                                    >
                                        {submitting ? (
                                            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                                                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
                                            </svg>
                                        ) : (
                                            <>
                                                <Star size={16} className="fill-white" />
                                                Submit Rating
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center text-xs text-gray-400">You can only rate once per ride</p>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
