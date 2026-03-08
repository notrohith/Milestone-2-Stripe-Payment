
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { toast } from "sonner";

/**
 * Navbar component updated to match the new design while preserving authentication logic.
 * Accepts `onToggleSidebar` prop for mobile/sidebar interaction.
 */
const Navbar = ({ onToggleSidebar }) => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

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
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border h-16 flex items-center px-4 md:px-8 justify-between">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleSidebar}>
                    <Menu className="h-6 w-6" />
                </Button>
                <Link to="/" className="flex items-center gap-2">
                    {/* Custom Car Icon based on user request - Simple side profile outline */}
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                        <path d="M19 17H5C3.89543 17 3 16.1046 3 15V11C3 9.34315 4.34315 8 6 8H7L9 5H15L17 8H18C19.6569 8 21 9.34315 21 11V15C21 16.1046 20.1046 17 19 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M7 17V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M17 17V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5 11H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-2xl font-extrabold tracking-tight text-primary">CoRide</span>
                </Link>
            </div>

            <div className="hidden md:flex items-center gap-8">
                <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
                <button onClick={() => handleAuthNavigation('/search')} className="text-sm font-medium hover:text-primary transition-colors bg-transparent border-none cursor-pointer">Find a Ride</button>
                {user?.role === 'DRIVER' && (
                    <button onClick={() => handleAuthNavigation('/create-ride')} className="text-sm font-medium hover:text-primary transition-colors bg-transparent border-none cursor-pointer">Offer a Ride</button>
                )}

                {!user ? (
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
                        <Link to="/signup">
                            <Button>Sign Up</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 border-l border-border pl-4">
                        <Link to="/my-rides" className="text-sm font-medium hover:text-primary transition-colors">My Rides</Link>
                        {(user.role === 'RIDER' || user.role === 'PASSENGER') ? (
                            <Link to="/rider/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Rider Hub</Link>
                        ) : user.role === 'DRIVER' ? (
                            <Link to="/driver/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Driver Hub</Link>
                        ) : null}
                        <Link to="/profile" className="text-sm font-medium hover:text-primary transition-colors">Profile</Link>
                        <span className="text-sm text-muted-foreground hidden lg:inline-block">{user.email}</span>
                        <Button variant="destructive" size="sm" onClick={handleLogout}>Logout</Button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export { Navbar }; // Named export to match App.tsx provided code
