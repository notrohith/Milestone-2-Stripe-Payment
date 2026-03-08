import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaShieldAlt, FaWallet, FaBolt, FaArrowRight } from "react-icons/fa";

const Home = () => {
    const { user } = useAuth();
    const [showRestrictModal, setShowRestrictModal] = useState(false);

    const fadeInUp = {
        hidden: { opacity: 0, y: 60 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div className="flex flex-col min-h-screen font-sans">
            {/* Hero Section */}
            <div className="relative bg-gray-900 text-white py-32 px-6 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                        alt="Background"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900"></div>
                </div>

                <div className="container mx-auto relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight"
                    >
                        Travel Together, <span className="text-blue-500">Save Together</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-gray-300"
                    >
                        The most reliable carpooling platform. Connect with verified drivers and riders for a seamless journey.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="flex flex-col sm:flex-row justify-center gap-4"
                    >
                        <Link to="/search" className="group bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2 transform hover:scale-105">
                            Find a Ride <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        {!user && (
                            <Link to="/signup" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-gray-900 transition-all shadow-lg transform hover:scale-105">
                                Join Now
                            </Link>
                        )}
                        {user && (
                            user.role === 'DRIVER' ? (
                                <Link to="/create-ride" className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-lg transform hover:scale-105">
                                    Offer a Ride
                                </Link>
                            ) : (
                                <button
                                    onClick={() => setShowRestrictModal(true)}
                                    className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-lg transform hover:scale-105"
                                >
                                    Offer a Ride
                                </button>
                            )
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Rider Restriction Modal */}
            <AnimatePresence>
                {showRestrictModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center"
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRestrictModal(false)} />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.3 }}
                            className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                        >
                            <div className="bg-red-50 p-6 flex flex-col items-center justify-center border-b border-red-100">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <FaShieldAlt className="text-3xl text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 text-center">Action Restricted</h3>
                            </div>
                            <div className="p-6 text-center space-y-4">
                                <p className="text-gray-600 leading-relaxed">
                                    Your account is registered as a <span className="font-bold text-gray-800">Rider</span>.
                                    Rider profiles are configured strictly to join rides, not offer them.
                                </p>
                                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border">
                                    If you wish to offer rides, please sign up again using a different email address as a <span className="font-semibold">Driver</span>.
                                </p>
                                <div className="pt-2">
                                    <button
                                        onClick={() => setShowRestrictModal(false)}
                                        className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
                                    >
                                        I Understand
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Features Section */}
            <section className="py-24 bg-white relative z-20 -mt-10 rounded-t-3xl shadow-2xl mx-4 md:mx-0">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose RideWithMe?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Experience the future of commuting with features designed for your comfort and safety.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Safe & Secure */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            transition={{ delay: 0.2 }}
                            className="bg-gray-50 p-10 rounded-2xl shadow-sm hover:shadow-xl transition-shadow text-center group"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <FaShieldAlt className="text-4xl" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-800">Safe & Secure</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Verified profiles, government ID checks, and real-time ride tracking ensure your safety at every mile.
                            </p>
                        </motion.div>

                        {/* Affordable */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            transition={{ delay: 0.4 }}
                            className="bg-gray-50 p-10 rounded-2xl shadow-sm hover:shadow-xl transition-shadow text-center group"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                                <FaWallet className="text-4xl" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-800">Affordable</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Share costs and save up to 50% on every trip. Transparent pricing with no hidden fees.
                            </p>
                        </motion.div>

                        {/* Fast & Convenient */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            transition={{ delay: 0.6 }}
                            className="bg-gray-50 p-10 rounded-2xl shadow-sm hover:shadow-xl transition-shadow text-center group"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                <FaBolt className="text-4xl" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-800">Fast & Convenient</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Instant booking and diverse route options make your daily commute faster and easier than ever.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* How It Works - Visual Refresh */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-gray-800 mb-12">How It Works</h2>
                    </motion.div>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-10 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0 transform -translate-y-1/2"></div>

                        {[
                            { step: "01", title: "Create Account", desc: "Sign up and verify your identity in seconds." },
                            { step: "02", title: "Find or Offer", desc: "Search for a ride or post your own route." },
                            { step: "03", title: "Ride & Save", desc: "Travel comfortably and split the costs." }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeInUp}
                                transition={{ delay: index * 0.2 }}
                                className="bg-white p-8 rounded-xl shadow-lg relative z-10 w-full md:w-1/3 text-center border-b-4 border-blue-500"
                            >
                                <div className="text-6xl font-black text-blue-200 mb-4">{item.step}</div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900">{item.title}</h3>
                                <p className="text-gray-500">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
