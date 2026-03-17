import React, { useRef } from 'react';
import { X, Download, CheckCircle, Car, MapPin, Calendar, IndianRupee, Shield, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ReceiptModal({ isOpen, onClose, booking }) {
    const receiptRef = useRef(null);

    if (!isOpen || !booking) return null;

    const ride = booking.ride;
    const amount = Math.round(Number(booking.fareAtBooking || 0));
    const driverName = ride?.driver?.name || ride?.driver?.email || 'Driver';
    const receiptId = `RCT-${booking.participantId || '000'}-${Date.now().toString(36).toUpperCase()}`;

    const formatDate = (dt) => {
        if (!dt) return '—';
        return new Date(dt).toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };
    const formatTime = (dt) => {
        if (!dt) return '—';
        return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const handleDownload = () => {
        const el = receiptRef.current;
        if (!el) return;

        // Build a printable HTML receipt as a data URI without html2canvas dependency
        const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>CoRide Receipt ${receiptId}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background:#f8f4ff; display:flex; justify-content:center; align-items:center; min-height:100vh; padding:24px; }
  .receipt { background:white; border-radius:20px; max-width:440px; width:100%; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.12); }
  .header { background:linear-gradient(135deg,#7c3aed,#ec4899); padding:28px 28px 24px; color:white; position:relative; }
  .logo { display:flex; align-items:center; gap:10px; margin-bottom:16px; }
  .logo-icon { background:rgba(255,255,255,0.2); border-radius:10px; width:38px; height:38px; display:flex; align-items:center; justify-content:center; font-size:20px; }
  .logo-text { font-size:22px; font-weight:900; }
  .checkmark { text-align:center; margin:8px 0 12px; }
  .checkmark-circle { width:64px; height:64px; background:rgba(255,255,255,0.2); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; font-size:36px; }
  .header h2 { font-size:20px; font-weight:700; text-align:center; }
  .header p { font-size:13px; opacity:0.85; text-align:center; margin-top:4px; }
  .amount-badge { background:rgba(255,255,255,0.15); border-radius:12px; padding:12px 20px; text-align:center; margin-top:16px; }
  .amount-badge span { font-size:38px; font-weight:900; }
  .amount-badge small { font-size:13px; opacity:0.8; display:block; margin-top:2px; }
  .body { padding:24px 28px; }
  .row { display:flex; justify-content:space-between; align-items:flex-start; padding:10px 0; border-bottom:1px solid #f0f0f4; }
  .row:last-child { border-bottom:none; }
  .row label { color:#888; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; }
  .row span { color:#1a1a2e; font-size:14px; font-weight:700; text-align:right; max-width:200px; }
  .footer { background:#f8f4ff; border-top:2px dashed #e0d7ff; padding:16px 28px; text-align:center; }
  .footer p { font-size:11px; color:#999; margin-top:4px; }
  .verified { display:inline-flex; align-items:center; gap:5px; background:#dcfce7; color:#16a34a; border-radius:20px; padding:4px 12px; font-size:12px; font-weight:700; margin-bottom:14px; }
</style>
</head>
<body>
<div class="receipt">
  <div class="header">
    <div class="logo"><div class="logo-icon">🚗</div><div class="logo-text">CoRide</div></div>
    <div class="checkmark">
      <div class="checkmark-circle">✓</div>
      <h2>Payment Successful</h2>
      <p>Your seat is confirmed!</p>
    </div>
    <div class="amount-badge">
      <span>₹${amount}</span>
      <small>Total Paid</small>
    </div>
  </div>
  <div class="body">
    <div style="text-align:center;margin-bottom:16px">
      <span class="verified">✓ Verified &amp; Secure</span>
    </div>
    <div class="row"><label>Receipt ID</label><span>${receiptId}</span></div>
    <div class="row"><label>Route</label><span>${ride?.sourceCity || '—'} → ${ride?.destinationCity || '—'}</span></div>
    <div class="row"><label>Date</label><span>${formatDate(ride?.startTime)}</span></div>
    <div class="row"><label>Departure</label><span>${formatTime(ride?.startTime)}</span></div>
    <div class="row"><label>Driver</label><span>${driverName}</span></div>
    <div class="row"><label>Payment Method</label><span>Stripe (Card)</span></div>
    <div class="row"><label>Status</label><span style="color:#16a34a">✓ Confirmed</span></div>
  </div>
  <div class="footer">
    <strong style="color:#7c3aed">CoRide</strong>
    <p>Thank you for riding with us. Have a safe journey!</p>
    <p style="margin-top:8px;color:#bbb">© 2026 CoRide · support@coride.app</p>
  </div>
</div>
</body>
</html>`;

        const blob = new Blob([receiptHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CoRide-Receipt-${receiptId}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
                        initial={{ opacity: 0, scale: 0.88, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 16 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="relative w-full max-w-[440px] bg-white rounded-2xl shadow-2xl overflow-hidden"
                        ref={receiptRef}
                    >
                        {/* Header gradient */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 pt-6 pb-8 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-white/90 text-sm font-semibold">
                                    <Car size={16} />
                                    CoRide
                                </div>
                                <button onClick={onClose} className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-1">
                                    <CheckCircle size={36} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-extrabold">Payment Successful</h2>
                                <p className="text-purple-100 text-sm">Your seat is confirmed!</p>
                                <div className="mt-3 bg-white/15 rounded-xl px-8 py-3 text-center">
                                    <p className="text-4xl font-black">₹{amount}</p>
                                    <p className="text-purple-100 text-xs mt-1">Total Paid</p>
                                </div>
                            </div>
                        </div>

                        {/* Dashed divider - receipt style */}
                        <div className="relative flex items-center">
                            <div className="absolute -left-4 w-8 h-8 bg-gray-100 rounded-full border-r-0 z-10" />
                            <div className="flex-1 border-t-2 border-dashed border-purple-200 mx-4" />
                            <div className="absolute -right-4 w-8 h-8 bg-gray-100 rounded-full border-l-0 z-10" />
                        </div>

                        {/* Details */}
                        <div className="px-6 py-5 space-y-3 bg-white">
                            {/* Receipt ID */}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 font-medium uppercase text-xs tracking-wide">Receipt ID</span>
                                <span className="font-mono font-bold text-purple-600 text-xs">{receiptId}</span>
                            </div>

                            {/* Route */}
                            <div className="flex items-start justify-between text-sm">
                                <span className="text-gray-400 font-medium uppercase text-xs tracking-wide flex items-center gap-1">
                                    <MapPin size={11} /> Route
                                </span>
                                <span className="font-bold text-gray-800 text-right">
                                    {ride?.sourceCity} → {ride?.destinationCity}
                                </span>
                            </div>

                            {/* Date & Time */}
                            <div className="flex items-start justify-between text-sm">
                                <span className="text-gray-400 font-medium uppercase text-xs tracking-wide flex items-center gap-1">
                                    <Calendar size={11} /> Date
                                </span>
                                <span className="font-bold text-gray-800 text-right text-xs">
                                    {formatDate(ride?.startTime)}<br />
                                    <span className="text-gray-500">{formatTime(ride?.startTime)}</span>
                                </span>
                            </div>

                            {/* Driver */}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 font-medium uppercase text-xs tracking-wide flex items-center gap-1">
                                    <User size={11} /> Driver
                                </span>
                                <span className="font-bold text-gray-800">{driverName}</span>
                            </div>

                            {/* Payment Method */}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 font-medium uppercase text-xs tracking-wide flex items-center gap-1">
                                    <IndianRupee size={11} /> Method
                                </span>
                                <span className="font-bold text-gray-800 flex items-center gap-1">
                                    <Shield size={11} className="text-green-500" /> Stripe · Card
                                </span>
                            </div>

                            <div className="border-t border-dashed border-purple-100 pt-3 flex items-center justify-between">
                                <span className="text-gray-400 font-medium uppercase text-xs tracking-wide">Status</span>
                                <span className="font-bold text-green-600 flex items-center gap-1">
                                    <CheckCircle size={13} /> Confirmed
                                </span>
                            </div>
                        </div>

                        {/* Footer with download */}
                        <div className="bg-purple-50 border-t-2 border-dashed border-purple-200 px-6 py-4">
                            <button
                                onClick={handleDownload}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-200 transition-all hover:shadow-purple-300 hover:scale-[1.01] active:scale-[0.99]"
                            >
                                <Download size={18} />
                                Download Receipt
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-2">Downloaded as an HTML file you can print or save as PDF</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
