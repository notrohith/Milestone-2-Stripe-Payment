
import React from 'react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';

export const Sidebar = ({ isOpen, onClose }) => {
    const { user, signOut } = useAuth();

    const isDriver = user?.role?.toUpperCase() === 'DRIVER';
    const isRider = user?.role?.toUpperCase() === 'RIDER' || user?.role?.toUpperCase() === 'PASSENGER';

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription>
                        Navigate through the application.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-4 flex flex-col space-y-4">
                    <Link to="/" onClick={onClose} className="block text-lg hover:text-primary transition-colors">Home</Link>
                    {user && (
                        <>
                            <Link to="/my-rides" onClick={onClose} className="block text-lg hover:text-primary transition-colors">My Rides</Link>
                            {isDriver && (
                                <>
                                    <Link to="/create-ride" onClick={onClose} className="block text-lg hover:text-primary transition-colors">Create Ride</Link>
                                    <Link to="/driver/dashboard" onClick={onClose} className="block text-lg hover:text-primary transition-colors">Driver Hub</Link>
                                </>
                            )}
                            {isRider && (
                                <Link to="/rider/dashboard" onClick={onClose} className="block text-lg hover:text-primary transition-colors">Rider Hub</Link>
                            )}
                            <Link to="/profile" onClick={onClose} className="block text-lg hover:text-primary transition-colors">Profile</Link>
                        </>
                    )}
                    <Link to="/search" onClick={onClose} className="block text-lg hover:text-primary transition-colors">Search Rides</Link>

                    {!user ? (
                        <div className="pt-4 border-t border-border flex flex-col gap-2">
                            <Link to="/login" onClick={onClose}>
                                <Button variant="outline" className="w-full">Login</Button>
                            </Link>
                            <Link to="/signup" onClick={onClose}>
                                <Button className="w-full">Sign Up</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="pt-4 border-t border-border">
                            <button onClick={() => { signOut(); onClose(); }} className="block text-lg text-red-500 hover:text-red-600 transition-colors w-full text-left">Logout</button>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};
