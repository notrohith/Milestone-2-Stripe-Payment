import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { X, Lock, Loader2, CheckCircle, Car } from 'lucide-react';
import api from '../../api/axiosClient';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// ── Inner form (needs to be inside <Elements>) ────────────────────────────────
function CheckoutForm({ amount, onSuccess, rideId, participantId }) {
    const stripe = useStripe();
    const elements = useElements();
    const [status, setStatus] = useState('idle'); // idle | processing | success | error
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setStatus('processing');
        setErrorMsg('');

        // 1. Confirm payment with Stripe
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required', // stay in-page; no redirect
        });

        if (error) {
            setStatus('error');
            setErrorMsg(error.message || 'Payment failed. Please try again.');
            return;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
            // 2. Tell our backend to flip participant → APPROVED and decrement seat
            try {
                await api.post(`/api/rides/${rideId}/participants/${participantId}/confirm-payment`);
            } catch (backendErr) {
                console.error('confirm-payment backend error:', backendErr);
                // Still show success to user since Stripe payment went through
            }

            setStatus('success');
            setTimeout(() => {
                onSuccess();
            }, 1800);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {status === 'success' ? (
                <div className="flex flex-col items-center py-8 gap-4 animate-in fade-in zoom-in-95">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900">Payment Successful!</h3>
                        <p className="text-gray-500 mt-1">Your seat is confirmed 🎉</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Stripe's universal Payment Element */}
                    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white p-4">
                        <PaymentElement
                            options={{
                                layout: 'tabs',
                            }}
                        />
                    </div>

                    {errorMsg && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                            <span className="font-semibold">⚠</span> {errorMsg}
                        </div>
                    )}

                    {/* Pay Button */}
                    <button
                        type="submit"
                        disabled={!stripe || status === 'processing'}
                        className={`w-full rounded-xl py-4 font-bold text-[17px] shadow-md transition-all focus:ring-4 outline-none flex items-center justify-center gap-2
                            ${status === 'processing'
                                ? 'bg-purple-400 text-white cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-lg shadow-purple-200 hover:shadow-purple-300'
                            }`}
                    >
                        {status === 'processing' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing…
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4" />
                                Pay ₹{amount} Securely
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                        <Lock className="w-3 h-3" />
                        256-bit SSL encryption · Powered by Stripe
                    </p>
                </>
            )}
        </form>
    );
}

// ── Main exported modal ───────────────────────────────────────────────────────
export function StripePaymentModal({ isOpen, onClose, amount, onSuccess, driverName, rideId, participantId }) {
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');

    useEffect(() => {
        if (!isOpen || !amount) return;

        setLoading(true);
        setFetchError('');
        setClientSecret('');

        api.post('/api/payments/create-intent', { amount: Math.round(amount), currency: 'inr' })
            .then(res => {
                setClientSecret(res.data.clientSecret);
            })
            .catch(err => {
                console.error('Failed to create payment intent:', err);
                setFetchError('Could not initialize payment. Please try again.');
            })
            .finally(() => setLoading(false));
    }, [isOpen, amount]);

    if (!isOpen) return null;

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#7c3aed',
            colorBackground: '#ffffff',
            colorText: '#1e293b',
            colorDanger: '#ef4444',
            fontFamily: '"Segoe UI", Arial, sans-serif',
            spacingUnit: '4px',
            borderRadius: '10px',
        },
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-[460px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-pink-500">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Car className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg leading-tight">Complete Payment</h3>
                            <p className="text-purple-100 text-sm">Ride with {driverName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-white">₹{amount}</span>
                        <button
                            onClick={onClose}
                            className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                        <p className="text-gray-500 text-sm">Setting up secure payment…</p>
                    </div>
                ) : fetchError ? (
                    <div className="p-6 text-center">
                        <p className="text-red-600 font-medium">{fetchError}</p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-6 py-2.5 bg-gray-100 rounded-lg text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                ) : clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                        <CheckoutForm
                            amount={Math.round(amount)}
                            onSuccess={onSuccess}
                            rideId={rideId}
                            participantId={participantId}
                        />
                    </Elements>
                ) : null}
            </div>
        </div>
    );
}
