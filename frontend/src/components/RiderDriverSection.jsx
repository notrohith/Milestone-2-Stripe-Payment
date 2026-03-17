
import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const RiderDriverSection = () => {
    return (
        <section className="py-24 bg-muted/20 overflow-hidden">
            <div className="container mx-auto px-4 space-y-32">
                {/* Driver Section */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="order-2 lg:order-1 relative"
                    >
                        <div className="aspect-square rounded-3xl bg-gradient-to-tr from-primary/20 to-secondary/20 absolute -inset-4 blur-2xl -z-10" />
                        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
                            <div className="aspect-video bg-muted rounded-lg mb-6 overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1000&auto=format&fit=crop"
                                    alt="Driver"
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="font-bold text-primary">S</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Sarah M.</p>
                                        <p className="text-xs text-muted-foreground">Top Rated Driver</p>
                                    </div>
                                </div>
                                <p className="text-sm italic text-muted-foreground">"I paid off my car loan in just 6 months driving with CoRide. The flexibility is unmatched."</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="order-1 lg:order-2 space-y-8"
                    >
                        <Badge variant="outline" className="px-4 py-1 text-base border-primary/20 text-primary bg-primary/5">For Drivers</Badge>
                        <h2 className="text-4xl font-bold tracking-tight">Turn your miles into money.</h2>
                        <p className="text-xl text-muted-foreground">
                            Set your own schedule, be your own boss. Whether you want to drive full-time or just on your commute, we make it easy to earn.
                        </p>
                        <ul className="space-y-4">
                            {['Keep 100% of your tips', 'Flexible hours', 'Instant payouts', '24/7 Support'].map((item, index) => (
                                <motion.li
                                    key={item}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + (index * 0.1) }}
                                    className="flex items-center gap-3"
                                >
                                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                                    <span className="text-lg">{item}</span>
                                </motion.li>
                            ))}
                        </ul>
                        <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">Start Driving</Button>
                    </motion.div>
                </div>

                {/* Rider Section */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <Badge variant="outline" className="px-4 py-1 text-base border-blue-500/20 text-blue-600 bg-blue-50">For Riders</Badge>
                        <h2 className="text-4xl font-bold tracking-tight">Get there for less.</h2>
                        <p className="text-xl text-muted-foreground">
                            Why pay for a whole car when you only need a seat? Save money and meet great people along the way.
                        </p>
                        <ul className="space-y-4">
                            {['Verified drivers', 'Real-time tracking', 'Split fare easily', 'Eco-friendly choice'].map((item, index) => (
                                <motion.li
                                    key={item}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + (index * 0.1) }}
                                    className="flex items-center gap-3"
                                >
                                    <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0" />
                                    <span className="text-lg">{item}</span>
                                </motion.li>
                            ))}
                        </ul>
                        <Button variant="outline" size="lg" className="rounded-full px-8 border-2 hover:bg-accent">Book a Ride</Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="aspect-square rounded-3xl bg-gradient-to-bl from-accent/20 to-primary/20 absolute -inset-4 blur-2xl -z-10" />
                        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
                            <div className="aspect-video bg-muted rounded-lg mb-6 overflow-hidden">
                                <img
                                    src="https://www.shutterstock.com/image-photo/carpool-ride-sharing-people-using-600nw-2440815479.jpg"
                                    alt="Carpool Ride Sharing"
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
