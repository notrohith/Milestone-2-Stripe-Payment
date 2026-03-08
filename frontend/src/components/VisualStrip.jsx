
import React from 'react';

export const VisualStrip = () => {
    return (
        <div className="relative py-20 bg-primary overflow-hidden">
            <div className="absolute inset-0 opacity-10 pattern-dots pattern-white pattern-bg-transparent pattern-size-4 pattern-opacity-100" />
            <div className="container mx-auto px-4 relative z-10 text-center text-primary-foreground">
                <h3 className="text-2xl md:text-4xl font-bold mb-4">
                    "The best way to get around the city without breaking the bank."
                </h3>
                <p className="text-lg opacity-90">— Modern Commuter Magazine</p>
            </div>
        </div>
    );
};
