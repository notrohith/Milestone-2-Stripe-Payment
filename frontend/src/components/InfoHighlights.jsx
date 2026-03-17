import React from 'react';
import { ShieldCheck, Wallet, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { motion } from 'framer-motion';

const features = [
    {
        icon: ShieldCheck,
        title: "Verified Community",
        description: "Every driver and rider is verified with ID checks for your safety and peace of mind."
    },
    {
        icon: Wallet,
        title: "Cost Effective",
        description: "Save up to 50% on your daily commute compared to traditional rideshare services."
    },
    {
        icon: Users,
        title: "Social Connections",
        description: "Meet interesting people from your neighborhood and build your professional network."
    },
    {
        icon: Clock,
        title: "Save Time",
        description: "Use express lanes and optimized routes to get to your destination faster."
    }
];

export const InfoHighlights = () => {
    return (
        <section className="bg-background py-24 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Why Choose CoRide?</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        We're not just another ride app. We're a community building a better way to move.
                    </p>
                </div>

                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        visible: { transition: { staggerChildren: 0.1 } }
                    }}
                    className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {features.map((feature, index) => (
                        <motion.div 
                            key={index}
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                            }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        >
                            <Card className="border border-border/50 shadow-lg hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300 bg-card/80 backdrop-blur-xl h-full">
                                <CardHeader>
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary mb-4 shadow-inner border border-primary/10">
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
