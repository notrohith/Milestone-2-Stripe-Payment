
import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { HeroSection } from '../components/HeroSection';
import { InfoHighlights } from '../components/InfoHighlights';
import { HowItWorks } from '../components/HowItWorks';
import { CTASection } from '../components/CTASection';

export default function LandingPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F5F5DC] flex flex-col font-sans text-foreground antialiased">
            {/* Navbar */}
            <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 pt-16">
                <HeroSection />
                <InfoHighlights />
                <HowItWorks />
                <CTASection />

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-6xl mx-auto px-8">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="font-bold text-lg mb-4">CoRide</h3>
                                <p className="text-gray-400 text-sm">
                                    Smarter travel through shared journeys.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Platform</h4>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li><button className="hover:text-white transition-colors">How It Works</button></li>
                                    <li><button className="hover:text-white transition-colors">For Riders</button></li>
                                    <li><button className="hover:text-white transition-colors">For Drivers</button></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Company</h4>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li><button className="hover:text-white transition-colors">About Us</button></li>
                                    <li><button className="hover:text-white transition-colors">Contact</button></li>
                                    <li><button className="hover:text-white transition-colors">Careers</button></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Legal</h4>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
                                    <li><button className="hover:text-white transition-colors">Terms of Service</button></li>
                                    <li><button className="hover:text-white transition-colors">Cookie Policy</button></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                            <p>© 2026 CoRide. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
