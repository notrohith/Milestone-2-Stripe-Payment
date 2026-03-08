import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCar, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';

const RoleSelection = () => {
    const { updateProfile } = useAuth();
    const navigate = useNavigate();

    const handleRoleSelect = async (role) => {
        try {
            await updateProfile({ role });
            navigate('/complete-profile');
        } catch (error) {
            console.error("Error updating role:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-4xl w-full">
                <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">How do you want to use RideWithMe?</h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Rider Card */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white p-8 rounded-2xl shadow-xl cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all"
                        onClick={() => handleRoleSelect('RIDER')}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-blue-100 p-6 rounded-full mb-6">
                                <FaUser className="text-5xl text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4">I want to Ride</h2>
                            <p className="text-gray-600">
                                Find rides, save money, and travel comfortably with verified drivers.
                            </p>
                        </div>
                    </motion.div>

                    {/* Driver Card */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white p-8 rounded-2xl shadow-xl cursor-pointer border-2 border-transparent hover:border-yellow-500 transition-all"
                        onClick={() => handleRoleSelect('DRIVER')}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-yellow-100 p-6 rounded-full mb-6">
                                <FaCar className="text-5xl text-yellow-600" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4">I want to Drive</h2>
                            <p className="text-gray-600">
                                Offer rides, cover your travel costs, and meet new people.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
