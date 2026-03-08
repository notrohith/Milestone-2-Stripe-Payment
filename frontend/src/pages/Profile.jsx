import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Mail, Phone, MapPin, Star, Car, Leaf, Edit, LogOut, Key, Users, Clock, ShieldCheck, TrendingDown, MapPinOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { supabaseAdmin } from '../supabaseClient';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { toast } from 'sonner';
import EditProfileModal from '../components/EditProfileModal';

const Profile = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [adminStats, setAdminStats] = useState({ totalDrivers: 0, totalRiders: 0, approvedUsers: 0, pendingUsers: 0 });
    const [dbUser, setDbUser] = useState(null);
    const [isDbLoading, setIsDbLoading] = useState(true);

    const { user: authUser, signOut } = useAuth();
    const navigate = useNavigate();

    // Determine role — prefer DB value, then auth context value (already fetched from DB by AuthContext)
    const isHardcodedAdmin = authUser?.email === 'rohith@corideadmin.com';
    const authRole = authUser?.role?.toUpperCase();
    const dbRole = dbUser?.role?.toUpperCase();
    // Use dbRole first (most reliable), then authRole (AuthContext already queried DB), then fallback
    const userRole = isHardcodedAdmin ? 'ADMIN' : (dbRole || authRole || 'RIDER');

    const isDriver = userRole === 'DRIVER';
    const isAdmin = userRole === 'ADMIN';

    const user = {
        name: dbUser?.name || authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'User',
        role: userRole,
        email: authUser?.email || 'user@example.com',
        phone: dbUser?.phone_number || authUser?.user_metadata?.phoneNumber || authUser?.phone || 'Not provided',
        address: dbUser?.address || authUser?.user_metadata?.address || 'Please update your address',
        memberSince: authUser?.created_at ? new Date(authUser.created_at).getFullYear() : '2024',
    };

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (authUser?.email) {
                setIsDbLoading(true);
                try {
                    const { data: rows } = await supabaseAdmin
                        .from('users')
                        .select('role, phone_number, address, name')
                        .eq('email', authUser.email)
                        .limit(1);
                    const data = rows?.[0];
                    if (data) setDbUser(data);
                } catch (err) {
                    console.error('Failed to fetch user details', err);
                } finally {
                    setIsDbLoading(false);
                }
            } else {
                setIsDbLoading(false);
            }
        };
        fetchUserDetails();
    }, [authUser?.email]);

    useEffect(() => {
        const fetchAdminStats = async () => {
            if (isAdmin) {
                try {
                    const { data, error } = await supabaseAdmin.from('users').select('role, status');
                    if (!error && data) {
                        setAdminStats({
                            totalDrivers: data.filter(u => u.role?.toUpperCase() === 'DRIVER').length,
                            totalRiders: data.filter(u => ['RIDER', 'PASSENGER'].includes(u.role?.toUpperCase())).length,
                            approvedUsers: data.filter(u => u.status?.toUpperCase() === 'APPROVED').length,
                            pendingUsers: data.filter(u => u.status?.toUpperCase() === 'PENDING').length,
                        });
                    }
                } catch (err) {
                    console.error('Failed to fetch admin stats', err);
                }
            }
        };
        fetchAdminStats();
    }, [isAdmin]);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    // Role badge color
    const roleBadgeStyle = isAdmin
        ? 'border-purple-200 text-purple-700 bg-purple-50'
        : isDriver
            ? 'border-blue-200 text-blue-700 bg-blue-50'
            : 'border-teal-200 text-teal-700 bg-teal-50';

    const headerGradient = isAdmin
        ? 'from-purple-500 to-indigo-600'
        : isDriver
            ? 'from-blue-500 to-indigo-500'
            : 'from-teal-400 to-cyan-500';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-foreground bg-background antialiased">
            <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {isDbLoading ? (
                <main className="flex-1 pt-16 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 text-gray-400">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
                        <p className="text-sm font-medium">Loading profile...</p>
                    </div>
                </main>
            ) : (
                <main className="flex-1 pt-16">
                    <div className="container mx-auto max-w-5xl py-8 px-4">
                        <div className="grid lg:grid-cols-12 gap-8">
                            {/* Left Column — Profile Card */}
                            <div className="lg:col-span-4 space-y-6">
                                <Card className="overflow-hidden border-none shadow-xl rounded-3xl">
                                    <div className={`h-32 bg-gradient-to-r ${headerGradient} relative`}>
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/5 rounded-full -ml-5 -mb-5"></div>
                                    </div>
                                    <div className="px-6 pb-6 relative">
                                        <div className="mt-6 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                                                <Badge variant="outline" className={`uppercase text-[10px] tracking-widest ${roleBadgeStyle}`}>
                                                    {user.role}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium">Member since {user.memberSince}</p>
                                        </div>

                                        <div className="mt-8 space-y-5">
                                            {/* Email */}
                                            <div className="flex items-center gap-3 text-sm hover:bg-slate-50 p-2 rounded-lg transition-colors -mx-2">
                                                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-400 font-semibold uppercase">Email</p>
                                                    <p className="text-gray-700 truncate">{user.email}</p>
                                                </div>
                                            </div>

                                            {/* Phone */}
                                            <div className="flex items-center gap-3 text-sm hover:bg-slate-50 p-2 rounded-lg transition-colors -mx-2">
                                                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-semibold uppercase">Mobile</p>
                                                    <p className="text-gray-700">{user.phone}</p>
                                                </div>
                                            </div>

                                            {/* Address */}
                                            <div className="flex items-start gap-3 text-sm hover:bg-slate-50 p-2 rounded-lg transition-colors -mx-2">
                                                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-semibold uppercase">Address</p>
                                                    <p className="text-gray-700 leading-snug">{user.address}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8">
                                            <Button className="w-full bg-gray-900 text-white hover:bg-gray-800" onClick={handleLogout}>
                                                <LogOut className="w-4 h-4 mr-2" />
                                                Logout
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Right Column — Stats + Actions */}
                            <div className="lg:col-span-8 space-y-8">
                                {/* Stats Grid */}
                                {isAdmin ? (
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <Users className="w-6 h-6 fill-current" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-gray-900">{adminStats.totalDrivers}</p>
                                                    <p className="text-sm text-gray-500">Registered Drivers</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                                    <Users className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-gray-900">{adminStats.totalRiders}</p>
                                                    <p className="text-sm text-gray-500">Registered Riders</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                                    <Clock className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-gray-900">{adminStats.pendingUsers}</p>
                                                    <p className="text-sm text-gray-500">Pending Approvals</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                    <ShieldCheck className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-gray-900">{adminStats.approvedUsers}</p>
                                                    <p className="text-sm text-gray-500">Verified Platform Users</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : isDriver ? (
                                    /* ===== DRIVER STATS ===== */
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                                    <Star className="w-6 h-6 fill-current" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-gray-900">4.9</p>
                                                    <p className="text-sm text-gray-500">Driver Rating</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <Car className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-gray-900">12</p>
                                                    <p className="text-sm text-gray-500">Rides Offered</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                    <Leaf className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-gray-900">120 kg</p>
                                                    <p className="text-sm text-gray-500">CO₂ Saved</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                    <TrendingDown className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-gray-900">100%</p>
                                                    <p className="text-sm text-gray-500">Response Rate</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* ===== RIDER STATS ===== */
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                                                    <MapPin className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-gray-900">48</p>
                                                    <p className="text-sm text-gray-500">Rides Taken</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                                    <Star className="w-6 h-6 fill-current" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-gray-900">4.92</p>
                                                    <p className="text-sm text-gray-500">Avg Rating Given</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow sm:col-span-2">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <MapPinOff className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-gray-900">₹8,450</p>
                                                    <p className="text-sm text-gray-500">Total Amount Paid</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowPasswordModal(true)}
                                        className="h-auto py-4 justify-start px-6 rounded-xl border-slate-200 hover:border-orange-200 hover:bg-orange-50 transition-all group"
                                    >
                                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center mr-4 group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <Key className="w-5 h-5 text-gray-600 group-hover:text-orange-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-900">Change Password</p>
                                            <p className="text-xs text-gray-500">Update your security credentials</p>
                                        </div>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => setShowEditProfileModal(true)}
                                        className="h-auto py-4 justify-start px-6 rounded-xl border-slate-200 hover:border-orange-200 hover:bg-orange-50 transition-all group"
                                    >
                                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center mr-4 group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <Edit className="w-5 h-5 text-gray-600 group-hover:text-orange-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-900">Edit Profile</p>
                                            <p className="text-xs text-gray-500">Modify your personal details</p>
                                        </div>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            )}

            {showPasswordModal && (
                <ChangePasswordModal
                    isFirstLogin={false}
                    onSuccess={() => {
                        setShowPasswordModal(false);
                        toast.success('Password updated successfully!');
                    }}
                />
            )}

            {showEditProfileModal && (
                <EditProfileModal
                    currentUser={user}
                    onClose={() => setShowEditProfileModal(false)}
                    onSuccess={(updatedFields) => {
                        setShowEditProfileModal(false);
                        toast.success('Profile updated successfully!');
                        // Re-fetch db user to reflect changes immediately
                        if (updatedFields) {
                            setDbUser(prev => prev ? { ...prev, ...updatedFields } : updatedFields);
                        }
                    }}
                />
            )}
        </div>
    );
};
export default Profile;
