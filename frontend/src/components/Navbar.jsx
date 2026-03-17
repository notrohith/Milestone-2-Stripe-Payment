import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Menu, X, Car } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationBell } from "./NotificationBell";
import { DarkModeToggle } from "./DarkModeToggle";

const Navbar = ({ onToggleSidebar }) => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLogout = async () => {
        await signOut();
        navigate("/login");
    };

    const handleAuthNavigation = (path) => {
        if (!user) {
            navigate("/login");
        } else if (path === '/create-ride' && (user.role === 'PASSENGER' || user.role === 'RIDER')) {
            toast.error("Riders can't access Offer a ride");
        } else {
            navigate(path);
        }
        setMobileMenuOpen(false);
    };

    const navLinks = [
        { label: 'Home', path: '/', type: 'link' },
        { label: 'Find a Ride', path: '/search', type: 'action' },
        ...(user?.role === 'DRIVER' ? [{ label: 'Offer a Ride', path: '/create-ride', type: 'action' }] : []),
    ];

    const authLinks = user ? [
        { label: 'My Rides', path: '/my-rides', type: 'link' },
        ...(user.role === 'RIDER' || user.role === 'PASSENGER' ? [{ label: 'Rider Hub', path: '/rider/dashboard', type: 'link' }] : []),
        ...(user.role === 'DRIVER' ? [{ label: 'Driver Hub', path: '/driver/dashboard', type: 'link' }] : []),
        { label: 'Profile', path: '/profile', type: 'link' },
    ] : [];

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 h-20 flex items-center px-6 md:px-12 justify-between transition-all duration-300 ${
                    scrolled
                        ? 'bg-background/85 backdrop-blur-2xl shadow-lg shadow-black/5 border-b border-border/40'
                        : 'bg-transparent'
                }`}
            >
                {/* Left: Logo + Hamburger */}
                <div className="flex items-center gap-4">
                    {/* Hamburger — visible on ALL screens */}
                    <motion.button
                        whileHover={{ scale: 1.07 }}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => onToggleSidebar ? onToggleSidebar() : setMobileMenuOpen(!mobileMenuOpen)}
                        className="relative h-10 w-10 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/40 transition-all duration-200"
                        aria-label="Toggle menu"
                    >
                        <motion.span
                            animate={mobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                            className="block h-0.5 w-5 rounded-full bg-foreground transition-colors"
                        />
                        <motion.span
                            animate={mobileMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                            className="block h-0.5 w-5 rounded-full bg-foreground"
                        />
                        <motion.span
                            animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                            className="block h-0.5 w-5 rounded-full bg-foreground"
                        />
                    </motion.button>

                    <Link to="/" className="flex items-center gap-3 group">
                        <div
                            className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300"
                            style={{ background: 'linear-gradient(135deg, hsl(267,100%,61%) 0%, hsl(328,100%,59%) 100%)' }}
                        >
                            <Car size={20} className="text-white" />
                        </div>
                        <span
                            className="text-2xl font-extrabold tracking-tight hidden sm:block"
                            style={{
                                backgroundImage: 'linear-gradient(135deg, hsl(267,100%,61%) 0%, hsl(328,100%,59%) 100%)',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                color: 'transparent',
                            }}
                        >
                            CoRide
                        </span>
                    </Link>
                </div>

                {/* Center: Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map(({ label, path, type }) => (
                        type === 'link' ? (
                            <Link
                                key={label}
                                to={path}
                                className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-200 relative group"
                            >
                                {label}
                                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 rounded-full group-hover:w-full transition-all duration-300"
                                    style={{ background: 'linear-gradient(90deg, hsl(267,100%,61%), hsl(328,100%,59%))' }} />
                            </Link>
                        ) : (
                            <button
                                key={label}
                                onClick={() => handleAuthNavigation(path)}
                                className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-200 bg-transparent border-none cursor-pointer relative group"
                            >
                                {label}
                                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 rounded-full group-hover:w-full transition-all duration-300"
                                    style={{ background: 'linear-gradient(90deg, hsl(267,100%,61%), hsl(328,100%,59%))' }} />
                            </button>
                        )
                    ))}
                </div>

                {/* Right: Notification Bell + Auth actions */}
                <div className="flex items-center gap-3">
                    <DarkModeToggle />
                    {user && <NotificationBell />}
                    {!user ? (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="hidden md:block text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                                Login
                            </Link>
                            <Link to="/signup">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.96 }}
                                    className="rounded-full px-5 h-10 text-sm font-bold text-white border-0 shadow-lg transition-all duration-200"
                                    style={{
                                        background: 'linear-gradient(135deg, hsl(267,100%,61%) 0%, hsl(328,100%,59%) 100%)',
                                        boxShadow: '0 6px 24px -6px hsl(267,100%,61%,0.5)',
                                    }}
                                >
                                    Sign Up
                                </motion.button>
                            </Link>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-4">
                            {authLinks.map(({ label, path }) => (
                                <Link key={label} to={path} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                                    {label}
                                </Link>
                            ))}
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleLogout}
                                className="rounded-full font-semibold px-5 shadow-sm"
                            >
                                Logout
                            </Button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Mobile dropdown menu (fallback if no sidebar) */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-20 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-2xl border-b border-border/50 shadow-2xl px-6 py-6 flex flex-col gap-4"
                    >
                        {[...navLinks, ...authLinks].map(({ label, path, type }) => (
                            <button key={label} onClick={() => { handleAuthNavigation(path); setMobileMenuOpen(false); }}
                                className="text-base font-semibold text-left text-muted-foreground hover:text-primary transition-colors py-2">
                                {label}
                            </button>
                        ))}
                        {user ? (
                            <Button variant="destructive" className="w-full rounded-xl mt-2 font-semibold" onClick={handleLogout}>Logout</Button>
                        ) : (
                            <div className="flex flex-col gap-3 mt-2">
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full rounded-xl border-2 border-primary/30">Login</Button>
                                </Link>
                                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="w-full rounded-xl text-white border-0"
                                        style={{ background: 'linear-gradient(135deg, hsl(267,100%,61%) 0%, hsl(328,100%,59%) 100%)' }}>
                                        Sign Up Free
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export { Navbar };
