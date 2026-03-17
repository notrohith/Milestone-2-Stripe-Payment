import React from 'react';
import { Button } from './ui/button';
import { CheckCircle, Star, Leaf, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Floating Card Component
const FloatingCard = ({ icon: Icon, title, subtitle, className, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay, type: 'spring', stiffness: 120 }}
        whileHover={{ scale: 1.07, y: -4 }}
        className={`absolute p-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl border ${className}`}
        style={{
            background: 'rgba(255,255,255,0.12)',
            borderColor: 'rgba(255,255,255,0.25)',
        }}
    >
        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, hsl(267,100%,61%) 0%, hsl(328,100%,59%) 100%)' }}>
            <Icon size={18} />
        </div>
        <div>
            <p className="font-bold text-sm text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
    </motion.div>
);

// Stats Badge Component
const StatBadge = ({ value, label, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay }}
        className="flex flex-col"
    >
        <span
            className="text-3xl font-extrabold"
            style={{
                backgroundImage: 'linear-gradient(135deg, hsl(267,100%,61%) 0%, hsl(328,100%,59%) 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
            }}
        >{value}</span>
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
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
        <section className="relative overflow-hidden bg-background pt-20 pb-20 lg:pt-28 lg:pb-32 min-h-[95vh] flex items-center">
            {/* Aesthetic Background Image via inline style to avoid CRA build issues */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url('/assets/aesthetic_ride.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.12,
                    filter: 'saturate(1.4) hue-rotate(10deg)',
                }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-background via-background/95 to-background/50" />

            {/* Glowing Orbs - animated */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.28, 0.15] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-20 right-10 lg:right-32 w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, hsl(267,100%,61%,0.4) 0%, transparent 70%)' }}
            />
            <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.22, 0.1] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, hsl(328,100%,59%,0.35) 0%, transparent 70%)' }}
            />
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.07, 0.15, 0.07] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[80px] pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, hsl(180,100%,40%,0.2) 0%, transparent 70%)' }}
            />

            <div className="container mx-auto px-4 relative z-20">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Column: Text */}
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            {/* Pill Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm font-semibold mb-6"
                                style={{
                                    background: 'hsl(267,100%,61%,0.1)',
                                    borderColor: 'hsl(267,100%,61%,0.25)',
                                    color: 'hsl(267,100%,61%)',
                                }}
                            >
                                <Zap size={14} style={{ color: 'hsl(328,100%,59%)' }} />
                                <span>The smarter way to commute</span>
                            </motion.div>

                            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6">
                                <span className="text-foreground">Journey </span>
                                <span
                                    style={{
                                        backgroundImage: 'linear-gradient(135deg, hsl(267,100%,61%) 0%, hsl(328,100%,59%) 100%)',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                    }}
                                >
                                    Together
                                </span>
                                <span className="text-foreground">, <br />Save </span>
                                <span
                                    style={{
                                        backgroundImage: 'linear-gradient(135deg, hsl(328,100%,59%) 0%, hsl(180,100%,40%) 100%)',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                    }}
                                >
                                    Together
                                </span>
                                <span className="text-foreground">.</span>
                            </h1>

                            <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
                                Connect with fellow travelers to cut costs, lower emissions, and enjoy the drive. Your daily commute,{' '}
                                <strong className="text-foreground font-semibold">upgraded</strong>.
                            </p>

                            <div className="flex flex-wrap gap-4 mb-12">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                    <Button
                                        size="lg"
                                        onClick={() => handleAuthNavigation('/search')}
                                        className="rounded-full px-8 h-14 text-base font-bold border-0 text-white group"
                                        style={{
                                            background: 'linear-gradient(135deg, hsl(267,100%,61%) 0%, hsl(328,100%,59%) 100%)',
                                            boxShadow: '0 10px 40px -10px hsl(267,100%,61%,0.6)',
                                        }}
                                    >
                                        Find a Ride
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => handleAuthNavigation('/create-ride')}
                                        className="rounded-full px-8 h-14 text-base font-bold border-2 bg-background/50 backdrop-blur-sm hover:bg-primary/10 transition-all duration-300"
                                        style={{ borderColor: 'hsl(267,100%,61%,0.35)' }}
                                    >
                                        Offer a Ride
                                    </Button>
                                </motion.div>
                            </div>

                            {/* Stats Row */}
                            <div className="flex items-center gap-10 pt-6 border-t border-border/50">
                                <StatBadge value="50K+" label="Happy Riders" delay={0.6} />
                                <div className="w-px h-10 bg-border/70" />
                                <StatBadge value="4.9★" label="Avg. Rating" delay={0.7} />
                                <div className="w-px h-10 bg-border/70" />
                                <StatBadge value="30%" label="Cost Saved" delay={0.8} />
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Image & Floating Cards */}
                    <div className="relative h-[600px] w-full hidden lg:block">
                        {/* Glow behind image */}
                        <div
                            className="absolute inset-8 rounded-[3rem] blur-2xl opacity-60"
                            style={{
                                background: 'linear-gradient(135deg, hsl(267,100%,61%,0.3) 0%, hsl(328,100%,59%,0.3) 100%)',
                            }}
                        />

                        {/* Main Image Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-0 z-10"
                        >
                            <div
                                className="relative w-full h-full rounded-[2.5rem] overflow-hidden border"
                                style={{
                                    borderColor: 'rgba(255,255,255,0.12)',
                                    boxShadow: '0 0 80px -20px rgba(139,92,246,0.7), 0 30px 60px -30px rgba(0,0,0,0.4)',
                                }}
                            >
                                <img
                                    src="/assets/aesthetic_ride.png"
                                    alt="Aesthetic Modern Journey"
                                    className="w-full h-full object-cover"
                                />
                                {/* Gradient overlay on image */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.45) 100%)',
                                    }}
                                />
                            </div>
                        </motion.div>

                        {/* Floating Cards */}
                        <FloatingCard
                            icon={CheckCircle}
                            title="Verified Community"
                            subtitle="Safe travel, always"
                            className="top-10 -left-14 z-20 w-56"
                            delay={1.0}
                        />
                        <FloatingCard
                            icon={Leaf}
                            title="Eco-Friendly"
                            subtitle="Reduce CO₂ together"
                            className="bottom-24 -left-8 z-30 w-52"
                            delay={1.2}
                        />
                        <FloatingCard
                            icon={Star}
                            title="4.9/5 Stars"
                            subtitle="Top Rated Platform"
                            className="top-36 -right-10 z-20 w-52"
                            delay={1.4}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};
