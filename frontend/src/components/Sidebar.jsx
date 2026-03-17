import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import {
    Home, Search, Car, Map, User, LogOut, LogIn, UserPlus, Zap, Shield
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, onClick, accent }) => (
    <Link
        to={to}
        onClick={onClick}
        className="flex items-center gap-4 px-4 py-3 rounded-xl font-semibold text-base transition-all duration-200 group hover:bg-primary/10 hover:text-primary text-muted-foreground"
    >
        <div
            className="h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110"
            style={accent ? {
                background: 'linear-gradient(135deg, hsl(267,100%,61%,0.15) 0%, hsl(328,100%,59%,0.15) 100%)',
            } : { background: 'hsl(240,10%,96%)' }}
        >
            <Icon size={18} className={accent ? 'text-primary' : 'text-muted-foreground group-hover:text-primary transition-colors'} />
        </div>
        <span className="group-hover:text-primary transition-colors">{label}</span>
    </Link>
);

export const Sidebar = ({ isOpen, onClose }) => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const isDriver = user?.role?.toUpperCase() === 'DRIVER';
    const isRider = user?.role?.toUpperCase() === 'RIDER' || user?.role?.toUpperCase() === 'PASSENGER';

    const handleLogout = async () => {
        await signOut();
        onClose();
        navigate('/login');
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="left" className="p-0 w-[300px] border-r border-border/50 bg-background/95 backdrop-blur-2xl">
                {/* Header */}
                <div
                    className="px-6 pt-8 pb-6 border-b border-border/40"
                    style={{
                        background: 'linear-gradient(135deg, hsl(267,100%,61%,0.08) 0%, hsl(328,100%,59%,0.05) 100%)',
                    }}
                >
                    <SheetHeader>
                        <SheetTitle asChild>
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg"
                                    style={{ background: 'linear-gradient(135deg, hsl(267,100%,61%) 0%, hsl(328,100%,59%) 100%)' }}
                                >
                                    <Car size={20} className="text-white" />
                                </div>
                                <span
                                    className="text-2xl font-extrabold tracking-tight"
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
                        </SheetTitle>
                        {user && (
                            <SheetDescription className="text-left mt-2">
                                <span className="text-xs text-muted-foreground font-medium truncate block">{user.email}</span>
                                <span
                                    className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full"
                                    style={{
                                        background: 'hsl(267,100%,61%,0.12)',
                                        color: 'hsl(267,100%,61%)',
                                    }}
                                >
                                    {user.role || 'Member'}
                                </span>
                            </SheetDescription>
                        )}
                        {!user && (
                            <SheetDescription className="text-left mt-1 text-xs text-muted-foreground">
                                Navigate through the application.
                            </SheetDescription>
                        )}
                    </SheetHeader>
                </div>

                {/* Nav Links */}
                <div className="py-4 px-3 flex flex-col space-y-1 overflow-y-auto flex-1">
                    <NavItem to="/" icon={Home} label="Home" onClick={onClose} />
                    <NavItem to="/search" icon={Search} label="Search Rides" onClick={onClose} accent />

                    {user && (
                        <>
                            <NavItem to="/my-rides" icon={Map} label="My Rides" onClick={onClose} />

                            {isDriver && (
                                <>
                                    <NavItem to="/create-ride" icon={Zap} label="Create Ride" onClick={onClose} accent />
                                    <NavItem to="/driver/dashboard" icon={Shield} label="Driver Hub" onClick={onClose} />
                                </>
                            )}
                            {isRider && (
                                <NavItem to="/rider/dashboard" icon={Shield} label="Rider Hub" onClick={onClose} />
                            )}
                            <NavItem to="/profile" icon={User} label="Profile" onClick={onClose} />
                        </>
                    )}
                </div>

                {/* Footer Auth Actions */}
                <div className="px-4 pb-8 pt-4 border-t border-border/40">
                    {!user ? (
                        <motion.div className="flex flex-col gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Link to="/login" onClick={onClose}>
                                <Button variant="outline" className="w-full rounded-xl h-11 font-semibold border-2 border-primary/30 hover:bg-primary/10 hover:border-primary transition-all">
                                    <LogIn size={16} className="mr-2" />
                                    Login
                                </Button>
                            </Link>
                            <Link to="/signup" onClick={onClose}>
                                <Button
                                    className="w-full rounded-xl h-11 font-bold text-white border-0"
                                    style={{ background: 'linear-gradient(135deg, hsl(267,100%,61%) 0%, hsl(328,100%,59%) 100%)' }}
                                >
                                    <UserPlus size={16} className="mr-2" />
                                    Sign Up Free
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-semibold transition-all duration-200 group"
                        >
                            <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                                <LogOut size={18} className="text-red-500" />
                            </div>
                            Logout
                        </button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};
