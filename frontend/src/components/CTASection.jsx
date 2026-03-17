import React from 'react';
import { Button } from './ui/button';
import { Apple, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

export const CTASection = () => {
    return (
        <section className="py-24 bg-gradient-to-t from-background via-primary/5 to-background border-t border-border/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[length:32px_32px]" />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="container mx-auto px-4 text-center relative z-10"
            >
                <div className="max-w-3xl mx-auto space-y-8 bg-card border border-border/50 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] -z-10" />

                    <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">Ready to ride?</h2>
                    <p className="text-xl text-muted-foreground">
                        Download the CoRide app today and get your first ride free. Available on iOS and Android.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Button size="lg" className="h-14 px-8 rounded-full text-lg w-full sm:w-auto shadow-lg shadow-primary/30 hover:scale-105 transition-transform duration-300">
                            <Apple className="mr-2 h-6 w-6" />
                            App Store
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg w-full sm:w-auto border-border bg-background/50 backdrop-blur-md hover:bg-muted hover:scale-105 transition-transform duration-300 group">
                            <Smartphone className="mr-2 h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
                            <span className="text-foreground group-hover:text-primary transition-colors">Google Play</span>
                        </Button>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground pt-4">
                        Rated <span className="text-amber-500">4.9/5 stars</span> by over 50,000 users.
                    </p>
                </div>
            </motion.div>
        </section>
    );
};
