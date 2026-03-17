import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export const VisualStrip = () => {
    return (
        <div
            className="relative py-20 overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, hsl(267,100%,55%) 0%, hsl(295,100%,52%) 40%, hsl(328,100%,59%) 70%, hsl(15,100%,60%) 100%)',
            }}
        >
            {/* Animated shine overlay */}
            <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                style={{ skewX: '-20deg' }}
            />

            {/* Dot grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="container mx-auto px-4 relative z-10 text-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <Quote size={40} className="mx-auto mb-4 opacity-60" />
                    <h3 className="text-2xl md:text-4xl font-extrabold mb-4 max-w-3xl mx-auto leading-tight">
                        "The best way to get around the city without breaking the bank."
                    </h3>
                    <p className="text-lg opacity-80 font-medium tracking-wide">— Modern Commuter Magazine</p>
                </motion.div>
            </div>
        </div>
    );
};
