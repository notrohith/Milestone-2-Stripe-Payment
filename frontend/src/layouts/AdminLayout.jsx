import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, UserCheck, Car, User, LogOut, Menu } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';

const AdminLayout = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const NavItem = ({ to, icon: Icon, label }) => (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
            }
        >
            <Icon className="w-5 h-5" />
            {label}
        </NavLink>
    );

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                    CoRide Admin
                </h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" end />
                <div className="pt-4 pb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    User Management
                </div>
                <NavItem to="/admin/users" icon={Users} label="All Users" />
                <NavItem to="/admin/pending" icon={UserCheck} label="Pending Users" />
                <NavItem to="/admin/drivers" icon={Car} label="Drivers" />
                <NavItem to="/admin/passengers" icon={User} label="Passengers" />
            </nav>
            <div className="p-4 border-t space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => navigate('/profile')}>
                    <User className="w-5 h-5" />
                    My Profile
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 border-r bg-card">
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <div className="max-w-[100vw] flex-1 flex flex-col">
                <header className="md:hidden h-16 border-b bg-card flex items-center px-4 justify-between">
                    <span className="font-bold text-lg">CoRide Admin</span>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-64">
                            <SidebarContent />
                        </SheetContent>
                    </Sheet>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-muted/20">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
