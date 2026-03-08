import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Users, UserPlus, ShieldCheck, UserX } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabaseAdmin } from '../../supabaseClient';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, blocked: 0 });
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data, error } = await supabaseAdmin
                    .from('users')
                    .select('id, name, email, role, status, created_at')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const rows = data || [];
                const norm = (s) => (s || '').toLowerCase();

                setStats({
                    total: rows.length,
                    pending: rows.filter(u => norm(u.status) === 'pending').length,
                    approved: rows.filter(u => norm(u.status) === 'approved').length,
                    blocked: rows.filter(u => ['blocked', 'rejected'].includes(norm(u.status))).length,
                });

                // Top 4 most recently registered
                setRecentUsers(rows.slice(0, 4).map(u => ({
                    name: u.name || '(No name)',
                    email: u.email,
                    role: u.role || 'RIDER',
                    date: u.created_at ? u.created_at.split('T')[0] : '',
                    status: u.status ? u.status.charAt(0).toUpperCase() + u.status.slice(1).toLowerCase() : 'Pending',
                })));
            } catch (e) {
                console.error('Failed to load dashboard stats', e);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const chartData = [
        { name: 'Drivers', value: 0, color: '#3b82f6' },
        { name: 'Riders', value: 0, color: '#8b5cf6' },
        { name: 'Pending', value: stats.pending, color: '#f59e0b' },
        { name: 'Approved', value: stats.approved, color: '#10b981' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                <p className="text-muted-foreground">Manage users and applications.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '—' : stats.total}</div>
                        <p className="text-xs text-muted-foreground">Registered on platform</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                        <UserPlus className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '—' : stats.pending}</div>
                        <p className="text-xs text-muted-foreground">Action required</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved Users</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '—' : stats.approved}</div>
                        <p className="text-xs text-muted-foreground">Active on platform</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Blocked/Rejected</CardTitle>
                        <UserX className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '—' : stats.blocked}</div>
                        <p className="text-xs text-muted-foreground">Terminated accounts</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>User Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Registrations */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recently Registered</CardTitle>
                        <CardDescription>Latest users joining the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-sm text-muted-foreground">Loading…</p>
                        ) : recentUsers.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No users yet.</p>
                        ) : (
                            <div className="space-y-6">
                                {recentUsers.map((user, i) => (
                                    <div className="flex items-center" key={i}>
                                        <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs ${user.role === 'DRIVER' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {user.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                        <div className="ml-auto flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${user.status === 'Approved' ? 'bg-green-500'
                                                    : user.status === 'Pending' ? 'bg-amber-500'
                                                        : 'bg-red-500'
                                                }`} />
                                            <span className="text-xs text-muted-foreground">{user.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
