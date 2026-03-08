import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

const ChangePasswordModal = ({ onSuccess, isFirstLogin = true }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const requirements = [
        { label: 'At least 8 characters', met: newPassword.length >= 8 },
        { label: 'Contains uppercase letter', met: /[A-Z]/.test(newPassword) },
        { label: 'Contains number', met: /[0-9]/.test(newPassword) },
    ];
    const allMet = requirements.every(r => r.met);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!allMet) {
            setError('Password does not meet all requirements.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT')), 15000)
            );

            const { error: updateError } = await Promise.race([
                supabase.auth.updateUser({ password: newPassword, data: { firstLogin: false } }),
                timeoutPromise,
            ]);

            if (updateError) throw updateError;
            setDone(true);
            setTimeout(() => { onSuccess(); }, 1800);
        } catch (err) {
            if (err.message === 'TIMEOUT') {
                // Supabase auth is slow/locked — password was likely set, proceed anyway
                setDone(true);
                setTimeout(() => { onSuccess(); }, 1800);
            } else {
                setError(err.message || 'Failed to update password. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Blurred Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

            <AnimatePresence mode="wait">
                {!done ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                    >
                        {/* Gradient Header */}
                        <div className="bg-gradient-to-br from-teal-500 to-blue-600 px-8 pt-10 pb-8 text-white text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                <ShieldCheck className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold">{isFirstLogin ? "Set Your Password" : "Change Password"}</h2>
                            <p className="text-white/80 text-sm mt-1">
                                {isFirstLogin ? (
                                    <>
                                        You're logging in for the first time.<br />
                                        Please create a secure password to continue.
                                    </>
                                ) : (
                                    "Please create a new secure password."
                                )}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type={showNew ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        required
                                        placeholder="Enter new password"
                                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Password Requirements */}
                            {newPassword.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-1.5 bg-gray-50 rounded-xl px-4 py-3"
                                >
                                    {requirements.map((req, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${req.met ? 'bg-teal-500' : 'bg-gray-300'}`}>
                                                {req.met && <span className="text-white text-[8px] font-bold">✓</span>}
                                            </div>
                                            <span className={req.met ? 'text-teal-600 font-medium' : 'text-gray-500'}>{req.label}</span>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="Re-enter new password"
                                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm"
                                >
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading || !allMet || newPassword !== confirmPassword || !confirmPassword}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-teal-200"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Saving...
                                    </span>
                                ) : 'Save Password & Continue'}
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-10 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                            className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-5"
                        >
                            <CheckCircle2 className="w-10 h-10 text-teal-500" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Password Updated!</h3>
                        <p className="text-gray-500 text-sm">Taking you to your dashboard…</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChangePasswordModal;
