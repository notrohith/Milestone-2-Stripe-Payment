
import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { HeroSection } from '../components/HeroSection';
import { InfoHighlights } from '../components/InfoHighlights';
import { HowItWorks } from '../components/HowItWorks';
import { CTASection } from '../components/CTASection';
import { VisualStrip } from '../components/VisualStrip';
import { RiderDriverSection } from '../components/RiderDriverSection';
import { Car, Github, Twitter, Instagram } from 'lucide-react';

export default function LandingPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans text-foreground antialiased relative selection:bg-primary/30 selection:text-foreground">
            {/* Subtle noise texture overlay for premium feel */}
            <div
                className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.025]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Navbar */}
            <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 pt-20">
                <HeroSection />
                <InfoHighlights />
                <VisualStrip />
                <HowItWorks />
                <RiderDriverSection />
                <CTASection />

                {/* Premium Footer */}
                <footer className="border-t border-border/40 relative overflow-hidden">
                    {/* Footer bg glow */}
                    <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] blur-[100px] opacity-20 pointer-events-none"
                        style={{ background: 'linear-gradient(90deg, hsl(267,100%,61%) 0%, hsl(328,100%,59%) 100%)' }}
                    />

                    <div className="container mx-auto px-8 py-16 relative z-10">
                        <div className="grid md:grid-cols-4 gap-12 mb-12">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-9 w-9 rounded-xl flex items-center justify-center"
                                        style={{ background: 'linear-gradient(135deg, hsl(267,100%,61%) 0%, hsl(328,100%,59%) 100%)' }}
                                    >
                                        <Car size={18} className="text-white" />
                                    </div>
                                    <span
                                        className="text-xl font-extrabold tracking-tight"
                                        style={{
                                            backgroundImage: 'linear-gradient(135deg, hsl(267,100%,61%) 0%, hsl(328,100%,59%) 100%)',
                                            WebkitBackgroundClip: 'text',
                                            backgroundClip: 'text',
                                            color: 'transparent',
                                        }}
                                    >
                                        CoRide
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Smarter travel through shared journeys. Build connections, save money, reduce your footprint.
                                </p>
                                <div className="flex gap-3 pt-2">
                                    {[Twitter, Instagram, Github].map((Icon, i) => (
                                        <button
                                            key={i}
                                            className="h-9 w-9 rounded-xl border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                                        >
                                            <Icon size={16} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-foreground mb-5 text-sm uppercase tracking-widest">Platform</h4>
                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    {['How It Works', 'For Riders', 'For Drivers', 'Pricing'].map((item) => (
                                        <li key={item}>
                                            <button className="hover:text-primary transition-colors duration-200 text-left">{item}</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-foreground mb-5 text-sm uppercase tracking-widest">Company</h4>
                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    {['About Us', 'Blog', 'Contact', 'Careers'].map((item) => (
                                        <li key={item}>
                                            <button className="hover:text-primary transition-colors duration-200 text-left">{item}</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-foreground mb-5 text-sm uppercase tracking-widest">Legal</h4>
                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Safety'].map((item) => (
                                        <li key={item}>
                                            <button className="hover:text-primary transition-colors duration-200 text-left">{item}</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                            <p>© 2026 CoRide. All rights reserved.</p>
                            <p className="flex items-center gap-1">
                                Made with <span className="text-red-500 mx-1">♥</span> for smarter commuters
                            </p>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
