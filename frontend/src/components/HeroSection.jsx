import React from 'react';
import { Button } from './ui/button';
import { CheckCircle, Star, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import aestheticHighway from '../assets/aesthetic_highway_background.png'; // Image generation failed, using CSS fallback

// Floating Card Component
const FloatingCard = ({ icon: Icon, title, subtitle, className, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
        className={`absolute bg-white dark:bg-card p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-border/50 backdrop-blur-sm ${className}`}
    >
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Icon size={20} />
        </div>
        <div>
            <p className="font-bold text-sm text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
    </motion.div>
);

export const HeroSection = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleAuthNavigation = (path) => {
        if (!user) {
            navigate("/login");
        } else {
            navigate(path);
        }
    };

    return (
        <section className="relative overflow-hidden bg-[#F5F5DC] pt-20 pb-20 lg:pt-24 lg:pb-32 min-h-[90vh] flex items-center">
            {/* Aesthetic Highway Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[#F5F5DC]/80 z-10 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#F5F5DC] via-[#F5F5DC]/95 to-[#F5F5DC]/40 z-10" />
                {/* CSS Fallback using Unsplash image for aesthetic highway feel */}
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2613&auto=format&fit=crop')] bg-cover bg-center opacity-30 grayscale-[20%]"
                />
            </div>

            {/* Background Gradients (Subtle) */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0" />

            <div className="container mx-auto px-4 relative z-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Column: Text */}
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
                                Journey <span className="text-primary">Together</span>, <br />
                                Save <span className="text-accent">Together</span>.
                            </h1>
                            <p className="text-lg text-muted-foreground mb-8 text-pretty font-medium">
                                Connect with fellow travelers to cut costs, lower emissions, and enjoy the drive. Your daily commute, upgraded.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Button size="lg" onClick={() => handleAuthNavigation('/search')} className="rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                                    Find a Ride
                                </Button>
                                <Button variant="secondary" size="lg" onClick={() => handleAuthNavigation('/create-ride')} className="rounded-full px-8 h-12 text-base font-semibold">
                                    Offer a Ride
                                </Button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Images & Floating Cards */}
                    <div className="relative h-[600px] w-full hidden lg:block">
                        {/* Main Image Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 z-10"
                        >
                            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/50 bg-gray-100">
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-400">
                                    <img
                                        src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop"
                                        alt="People connecting"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Cards */}
                        <FloatingCard
                            icon={CheckCircle}
                            title="Verified Community"
                            subtitle="Safe travel"
                            className="top-10 -left-12 z-20"
                            delay={1.0}
                        />
                        <FloatingCard
                            icon={Leaf}
                            title="Save pollution"
                            subtitle="Reduce CO₂"
                            className="bottom-20 -left-6 z-30"
                            delay={1.2}
                        />
                        <FloatingCard
                            icon={Star}
                            title="4.9/5"
                            subtitle="Top Rated"
                            className="top-40 -right-8 z-20"
                            delay={1.4}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};
