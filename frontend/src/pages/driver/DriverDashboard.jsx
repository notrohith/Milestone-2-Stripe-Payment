import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Plus, Car, TrendingUp, Clock } from 'lucide-react';
import { AddVehicleModal, ViewVehicleModal } from '../../components/driver/VehicleModals';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { supabaseAdmin } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const DriverDashboard = () => {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const mapVehicle = (v) => ({
        id: v.id,
        make: v.company,
        model: v.model,
        number: v.registration_number,
        rcNumber: v.rc_number,
        expiry: v.insurance_number || 'N/A',
        status: 'Verified',
        dbRecord: v
    });

    useEffect(() => {
        const fetchVehicles = async () => {
            if (user?.email) {
                try {
                    const { data: userArr } = await supabaseAdmin
                        .from('users')
                        .select('id')
                        .eq('email', user.email)
                        .limit(1);

                    const userId = userArr?.[0]?.id;
                    if (!userId) {
                        setIsLoadingVehicles(false);
                        return;
                    }

                    // Fetch vehicles
                    const { data: vehicleData } = await supabaseAdmin
                        .from('vehicles')
                        .select('*')
                        .eq('user_id', userId);

                    if (vehicleData && vehicleData.length > 0) {
                        // Fetch images from vehicle_images table for each vehicle
                        const vehicleIds = vehicleData.map(v => v.id);
                        const { data: imageData } = await supabaseAdmin
                            .from('vehicle_images')
                            .select('vehicle_id, image_url')
                            .in('vehicle_id', vehicleIds);

                        // Group images by vehicle_id
                        const imageMap = {};
                        (imageData || []).forEach(img => {
                            if (!imageMap[img.vehicle_id]) imageMap[img.vehicle_id] = [];
                            imageMap[img.vehicle_id].push(img.image_url);
                        });

                        const mapped = vehicleData.map(v => mapVehicle({ ...v, image_urls: imageMap[v.id] || [] }));
                        setVehicles(mapped);
                    }
                } catch (err) {
                    console.error('Failed to fetch vehicles', err);
                } finally {
                    setIsLoadingVehicles(false);
                }
            } else {
                setIsLoadingVehicles(false);
            }
        };

        fetchVehicles();
    }, [user?.email]);

    const handleAddVehicle = async (newVehicle) => {
        try {
            const { data: userArr } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('email', user.email)
                .limit(1);

            const userId = userArr?.[0]?.id;
            if (!userId) throw new Error('Your profile was not found in the database. Please contact support.');

            const vehicleToInsert = {
                company: newVehicle.make,
                model: newVehicle.model,
                registration_number: newVehicle.number,
                rc_number: newVehicle.rcNumber,
                insurance_number: newVehicle.expiry,
                year_of_model: parseInt(newVehicle.year || new Date().getFullYear()),
                has_ac: newVehicle.hasAc || false,
                audio_system: newVehicle.audioSystem || 'Basic',
                km_driven: parseInt(newVehicle.kmDriven || 0),
                color: newVehicle.color || 'Unknown',
                user_id: userId
            };

            const { data, error } = await supabaseAdmin
                .from('vehicles')
                .insert([vehicleToInsert])
                .select();

            if (error) throw error;

            const inserted = data[0];

            // Insert images into vehicle_images table if any were uploaded
            const imageUrls = newVehicle.imageUrls || [];
            if (imageUrls.length > 0) {
                const imageRows = imageUrls.map(url => ({
                    vehicle_id: inserted.id,
                    image_url: url
                }));
                await supabaseAdmin.from('vehicle_images').insert(imageRows);
            }

            toast.success('Vehicle registered successfully and approved!');
            setVehicles([...vehicles, mapVehicle({ ...inserted, image_urls: imageUrls })]);

        } catch (err) {
            console.error('Failed to register vehicle', err);
            toast.error('Failed to register vehicle: ' + err.message);
        }
    };

    const handleViewVehicle = (vehicle) => {
        setSelectedVehicle(vehicle);
        setIsViewModalOpen(true);
    };

    return (
        <div className="flex flex-col h-screen bg-[#F5F5DC] overflow-hidden">
            <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

            <div className="flex flex-1 overflow-hidden pt-16">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col overflow-y-auto">
                    <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
                        <div className="hidden md:flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Driver Hub</h2>
                                <p className="text-gray-500">Control panel for your trips and cars.</p>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1 flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                Verified Partner
                            </Badge>
                        </div>

                        {/* Registered Cars Section */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Registered Cars</h3>
                                <Button onClick={() => setIsAddModalOpen(true)} size="sm" variant="outline" className="gap-2 border-dashed border-gray-300 hover:border-orange-500 hover:text-orange-600 transition-colors">
                                    <Plus className="w-4 h-4" />
                                    Register New Car
                                </Button>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {isLoadingVehicles ? (
                                    <div className="p-8 text-center text-gray-400 col-span-3">Loading vehicles...</div>
                                ) : vehicles.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 col-span-3">
                                        <Car className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p className="font-medium">No vehicles registered yet.</p>
                                        <p className="text-sm mt-1">Click "Register New Car" to add your vehicle.</p>
                                    </div>
                                ) : vehicles.map((vehicle) => (
                                    <div key={vehicle.id} className="relative group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden" onClick={() => handleViewVehicle(vehicle)}>
                                        {/* Car Image */}
                                        <div className="h-36 w-full bg-slate-100 overflow-hidden">
                                            {vehicle.dbRecord?.image_urls && vehicle.dbRecord.image_urls.length > 0 ? (
                                                <img src={vehicle.dbRecord.image_urls[0]} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Car className="w-12 h-12 text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shadow-sm">{vehicle.status}</Badge>
                                        </div>

                                        <div className="p-4">
                                            <h4 className="font-bold text-gray-900 text-lg">{vehicle.make} {vehicle.model}</h4>
                                            <p className="text-xs text-gray-500 font-mono tracking-wide mb-2">{vehicle.number}</p>

                                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 border-t pt-3 mt-2 border-dashed">
                                                <div>
                                                    <span className="block text-[10px] uppercase font-semibold text-gray-300">Color</span>
                                                    <span className="font-medium text-gray-700">{vehicle.dbRecord?.color || 'N/A'}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-[10px] uppercase font-semibold text-gray-300">Year</span>
                                                    <span className="font-medium text-gray-700">{vehicle.dbRecord?.year_of_model || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] uppercase font-semibold text-gray-300">KM Driven</span>
                                                    <span className="font-medium text-gray-700">{vehicle.dbRecord?.km_driven != null ? `${vehicle.dbRecord.km_driven} km` : 'N/A'}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-[10px] uppercase font-semibold text-gray-300">AC</span>
                                                    <span className={`font-medium ${vehicle.dbRecord?.has_ac ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {vehicle.dbRecord?.has_ac ? 'Yes' : 'No'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-400 hover:border-orange-200 hover:bg-orange-50/50 hover:text-orange-500 transition-all cursor-pointer group min-h-[160px]" onClick={() => setIsAddModalOpen(true)}>
                                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-white group-hover:shadow-sm transition-colors">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    <p className="font-medium text-sm">Register Another Vehicle</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Statistics */}
                            <Card className="lg:col-span-1 h-full border-none shadow-lg bg-gradient-to-br from-white to-slate-50">
                                <CardHeader>
                                    <CardTitle>Daily Income</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-gray-900">₹850.00</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 text-xs font-medium text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full">
                                        <TrendingUp className="w-3 h-3" />
                                        +5% vs yesterday
                                    </div>

                                    <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200">
                                        <p className="text-xs font-medium text-white/80 uppercase mb-1">Driver Status</p>
                                        <h4 className="text-2xl font-bold mb-4">Gold Tier</h4>

                                        <div className="w-full bg-black/20 rounded-full h-1.5 mb-2 overflow-hidden">
                                            <div className="bg-white h-full rounded-full w-[70%]"></div>
                                        </div>
                                        <p className="text-[10px] text-white/80">15 rides to Platinum status</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Trip History Section */}
                            <Card className="lg:col-span-2 border-none shadow-md">
                                <CardHeader>
                                    <CardTitle>Trip History</CardTitle>
                                    <CardDescription>Log of your completed journeys</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="bg-white rounded-xl overflow-hidden">
                                        {[1, 2, 3].map((ride, i) => (
                                            <div key={i} className="flex items-center p-4 border-b last:border-0 hover:bg-slate-50 transition-colors">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-gray-400 mr-4">
                                                    IMG
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-bold text-gray-900 text-sm">{i === 0 ? 'Office Drop - Tech Park' : i === 1 ? 'Airport Pickup' : 'Mall Visit - Weekend'}</h5>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                        <Clock className="w-3 h-3" /> {i === 0 ? 'Today, 09:00 AM' : 'Yesterday, 8:45 PM'}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-green-600">+{i === 1 ? '₹450.00' : '₹200.00'}</p>
                                                    <p className="text-[10px] uppercase font-bold text-gray-400">Completed</p>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="p-3 text-center border-t">
                                            <button className="text-xs font-bold text-orange-600 hover:underline">See Full Log</button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Modals */}
                        <AddVehicleModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddVehicle} />
                        <ViewVehicleModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} vehicle={selectedVehicle} />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
