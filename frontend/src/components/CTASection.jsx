
import React from 'react';
import { Button } from './ui/button';
import { Apple, Smartphone } from 'lucide-react';

export const CTASection = () => {
    return (
        <section className="py-24 bg-[#F5F5DC] border-t border-border">
            <div className="container mx-auto px-4 text-center">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Ready to ride?</h2>
                    <p className="text-xl text-muted-foreground">
                        Download the CoRide app today and get your first ride free. Available on iOS and Android.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Button size="lg" className="h-14 px-8 rounded-full text-lg w-full sm:w-auto">
                            <Apple className="mr-2 h-6 w-6" />
                            App Store
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg w-full sm:w-auto hover:bg-muted">
                            <Smartphone className="mr-2 h-6 w-6" />
                            Google Play
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground pt-4">
                        Rated 4.9/5 stars by over 50,000 users.
                    </p>
                </div>
            </div>
        </section>
    );
};
