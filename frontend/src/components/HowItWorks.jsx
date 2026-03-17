import React from 'react';
import { Search, UserCheck, Car, Smile } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
    {
        icon: Search,
        title: "Request",
        description: "Enter your destination and find a ride that suits your schedule."
    },
    {
        icon: UserCheck,
        title: "Match",
        description: "Connect with a verified driver heading your way."
    },
    {
        icon: Car,
        title: "Ride",
        description: "Hop in and enjoy a comfortable, shared journey."
    },
    {
        icon: Smile,
        title: "Rate",
        description: "Share your experience to help keep our community high-quality."
    }
];

export const HowItWorks = () => {
    return (
        <section className="py-24 bg-gradient-to-b from-background to-secondary/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[length:32px_32px]" />
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">How It Works</h2>
                    <p className="text-muted-foreground">Get moving in four simple steps.</p>
                </div>

                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        visible: { transition: { staggerChildren: 0.2 } }
                    }}
                    className="grid md:grid-cols-4 gap-8 relative"
                >
                    {/* Connector Line (Desktop Only) */}
                    <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 -z-10" />

                    {steps.map((step, index) => (
                        <motion.div 
                            key={index}
                            className="flex flex-col items-center text-center group cursor-pointer"
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                            }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="w-24 h-24 rounded-full bg-background border-4 border-muted group-hover:border-primary shrink-0 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-300 flex items-center justify-center mb-6 z-10 relative overflow-hidden">
                                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/20 transition-colors" />
                                <step.icon className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors relative z-10" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-foreground">{step.title}</h3>
                            <p className="text-muted-foreground text-sm max-w-[200px]">{step.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
