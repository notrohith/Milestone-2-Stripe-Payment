import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, Ban, CheckCircle, Trash2, Eye } from 'lucide-react';
import UserDetailsModal from '../../components/admin/UserDetailsModal';
import { approveUserWithEmail, rejectUser } from '../../api/authApi';
import { toast } from 'sonner';
import { supabaseAdmin } from '../../supabaseClient';

const UserManagement = ({ filterStatus, filterRole }) => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabaseAdmin
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mapped = (data || []).map(u => ({
                id: u.id,
                name: u.name || '(No name)',
                email: u.email,
                role: u.role || 'RIDER',
                // Normalize: DB stores 'PENDING', display as 'Pending'
                status: u.status
                    ? u.status.charAt(0).toUpperCase() + u.status.slice(1).toLowerCase()
                    : 'Pending',
                joined: u.created_at ? u.created_at.split('T')[0] : '',
                phone: u.phone_number || '',
                address: u.address || '',
                gender: u.gender || '',
                date_of_birth: u.date_of_birth || '',
                aadhar_card_url: u.aadhar_card_url || null,
                pan_card_url: u.pan_card_url || null,
                driving_license_url: u.driving_license_url || null,
            }));
            setUsers(mapped);
        } catch (error) {
            console.error('Failed to fetch users from Supabase', error);
            toast.error('Failed to load users: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAction = async (userId, action, user) => {
        // Optimistic update
        setUsers(prev => prev.map(u =>
            u.id === userId
                ? { ...u, status: action === 'approve' ? 'Approved' : action === 'reject' ? 'Blocked' : u.status }
                : u
        ));

        try {
            if (action === 'approve') {
                const { tempPassword } = await approveUserWithEmail(userId, user.email, user.name, user.role);
                toast.success(
                    `✅ ${user.name} approved! Temp Password: ${tempPassword}`,
                    {
                        duration: 8000,
                    }
                );
                alert(`User Approved!\n\nSince the local backend email server may be down, please give this temporary password to the user:\n\n${tempPassword}`);
                // Refresh to get updated status from DB
                await fetchUsers();
            }
            if (action === 'reject') {
                await rejectUser(userId);
                toast.success(`${user.name} has been rejected.`);
                await fetchUsers();
            }
        } catch (e) {
            console.error(e);
            toast.error('Action failed: ' + (e.message || 'Unknown error'));
            // Revert optimistic update
            setUsers(prev => prev.map(u =>
                u.id === userId
                    ? { ...u, status: 'Pending' }
                    : u
            ));
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            const { error } = await supabaseAdmin.from('users').delete().eq('id', userId);
            if (error) {
                toast.error('Delete failed: ' + error.message);
            } else {
                setUsers(prev => prev.filter(u => u.id !== userId));
                toast.success('User deleted.');
            }
        }
    };

    const openModal = (user) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus ? user.status === filterStatus : true;

        // Handle the case where the frontend link says "PASSENGER" but DB says "RIDER"
        const matchesRole = filterRole
            ? (filterRole === "PASSENGER" ? (user.role === "PASSENGER" || user.role === "RIDER") : user.role === filterRole)
            : true;

        return matchesSearch && matchesStatus && matchesRole;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {filterRole
                            ? `${filterRole.charAt(0) + filterRole.slice(1).toLowerCase()}s`
                            : filterStatus
                                ? `${filterStatus} Users`
                                : 'All Users'}
                    </h2>
                    <p className="text-muted-foreground">Manage user accounts and permissions.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search users..."
                            className="pl-8 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading users...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No users found.</div>
                    ) : (
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Name</th>
                                        <th className="px-6 py-4 font-medium">Role</th>
                                        <th className="px-6 py-4 font-medium">Email</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="bg-white border-b hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                                                {user.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={user.role === 'ADMIN' ? 'default' : user.role === 'DRIVER' ? 'secondary' : 'outline'}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    className={`${user.status === 'Approved'
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200'
                                                        : user.status === 'Pending'
                                                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200'
                                                            : 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200'
                                                        }`}
                                                    variant="outline"
                                                >
                                                    {user.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {user.status === 'Pending' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                                            onClick={() => handleAction(user.id, 'approve', user)}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span className="sr-only">Approve</span>
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                                                        onClick={() => handleAction(user.id, 'reject', user)}
                                                    >
                                                        <Ban className="h-4 w-4" />
                                                        <span className="sr-only">Block</span>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() => handleDelete(user.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Delete</span>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => openModal(user)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        <span className="sr-only">View</span>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <UserDetailsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} user={selectedUser} />
        </div>
    );
};

export default UserManagement;
