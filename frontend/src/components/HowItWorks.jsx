
import React from 'react';
import { Search, UserCheck, Car, Smile } from 'lucide-react';

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
        <section className="py-24 bg-[#F5F5DC]">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">How It Works</h2>
                    <p className="text-muted-foreground">Get moving in four simple steps.</p>
                </div>

                <div className="grid md:grid-cols-4 gap-8 relative">
                    {/* Connector Line (Desktop Only) */}
                    <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-border -z-10" />

                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center text-center group">
                            <div className="w-24 h-24 rounded-full bg-background border-4 border-muted group-hover:border-primary transition-colors duration-300 flex items-center justify-center mb-6 z-10">
                                <step.icon className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                            <p className="text-muted-foreground text-sm max-w-[200px]">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
