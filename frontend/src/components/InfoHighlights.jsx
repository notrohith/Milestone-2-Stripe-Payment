
import React from 'react';
import { ShieldCheck, Wallet, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

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
        <section className="bg-[#F5F5DC] py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Why Choose CoRide?</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        We're not just another ride app. We're a community building a better way to move.
                    </p>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => (
                        <Card key={index} className="border-none shadow-md hover:shadow-xl transition-shadow duration-300 bg-card">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
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
                    ))}
                </div>
            </div>
        </section>
    );
};
