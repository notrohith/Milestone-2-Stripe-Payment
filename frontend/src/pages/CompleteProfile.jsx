import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { syncUser } from '../api/rideApi';

const CompleteProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Common fields
    const [formData, setFormData] = useState({
        name: user?.user_metadata?.name || user?.user_metadata?.full_name || '',
        email: user?.email || '',
        phoneNumber: '',
        profilePhotoUrl: user?.user_metadata?.avatar_url || '',
        // Driver specific
        dateOfBirth: '',
        gender: '',
    });

    const isDriver = user?.role === 'DRIVER';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Sync to Supabase Metadata (Optional, but good for persistence)
            // await updateProfile({ ...formData }); // Implement if needed in AuthContext for metadata updates

            // 2. Sync to Backend
            await syncUser({
                id: user.id,
                email: formData.email,
                role: user.role,
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                profilePhotoUrl: formData.profilePhotoUrl,
                dateOfBirth: isDriver ? formData.dateOfBirth : null,
                gender: isDriver ? formData.gender : null
            });

            navigate('/');
        } catch (error) {
            console.error("Profile update failed", error);
            alert("Failed to save profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Complete your Profile
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {isDriver ? "Drivers need to provide a few more details for verification." : "Let's get you ready for your first ride."}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">

                        {/* Full Name */}
                        <div className="mb-4">
                            <label htmlFor="name" className="sr-only">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Full Name (as per ID)"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="mb-4">
                            <label htmlFor="phoneNumber" className="sr-only">Phone Number</label>
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Phone Number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Email (Read Only) */}
                        <div className="mb-4">
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                disabled
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-500 bg-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Email"
                                value={formData.email}
                            />
                        </div>

                        {/* Profile Photo URL */}
                        <div className="mb-4">
                            <label htmlFor="profilePhotoUrl" className="sr-only">Profile Photo URL</label>
                            <input
                                id="profilePhotoUrl"
                                name="profilePhotoUrl"
                                type="text"
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Profile Photo URL (optional)"
                                value={formData.profilePhotoUrl}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Driver Specific Fields */}
                        {isDriver && (
                            <>
                                <div className="mb-4">
                                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                    <input
                                        id="dateOfBirth"
                                        name="dateOfBirth"
                                        type="date"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="gender" className="sr-only">Gender</label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                        value={formData.gender}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {loading ? 'Saving...' : 'Complete Registration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;
