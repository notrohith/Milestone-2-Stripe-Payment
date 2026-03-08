import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { FileText, MapPin, Mail, Phone, Hash, Car } from 'lucide-react';
import { supabaseAdmin } from '../../supabaseClient';

const UserDetailsModal = ({ isOpen, onClose, user }) => {
    const [vehicle, setVehicle] = useState(null);
    const [loadingVehicle, setLoadingVehicle] = useState(false);

    useEffect(() => {
        if (isOpen && user && user.role === 'DRIVER') {
            const fetchVehicle = async () => {
                setLoadingVehicle(true);
                try {
                    const { data, error } = await supabaseAdmin
                        .from('vehicles')
                        .select('*')
                        .eq('user_id', user.id)
                        .maybeSingle();
                    if (!error && data) {
                        setVehicle(data);
                    }
                } catch (err) {
                    console.error('Failed to load vehicle data', err);
                } finally {
                    setLoadingVehicle(false);
                }
            };
            fetchVehicle();
        } else {
            setVehicle(null);
        }
    }, [isOpen, user]);

    // If no user is selected, don't render
    if (!user && !isOpen) return null;

    // Randomize some values for "random values" requirement to flesh out UI stats that don't exist yet
    const randomRating = (3.5 + Math.random() * 1.5).toFixed(1);

    const displayUser = {
        name: user?.name || "User",
        email: user?.email || "No email",
        phone: user?.phone_number || "+91 Not Provided",
        role: user?.role || 'PASSENGER',
        status: user?.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase() : 'Pending',
        id: user?.id || 'UNKNOWN',
        joined: user?.created_at ? user.created_at.split('T')[0] : "2024-05-15",
        address: user?.address || "Address not provided",
        aadhar: user?.aadhar_card_url,
        pan: user?.pan_card_url,
        license: user?.driving_license_url,
        education: {
            highSchool: "St. Joseph's",
            secondary: "City PU College",
            undergrad: "Tech Institute of India"
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-0 overflow-hidden rounded-xl">
                {/* Custom Header Design */}
                <div className="bg-slate-50 p-6 border-b flex items-start justify-between sticky top-0 z-10">
                    <div className="flex gap-5 items-center">
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold border-2 shadow-sm ${displayUser.role === 'DRIVER' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-blue-50 border-blue-200 text-blue-600'
                            }`}>
                            {displayUser.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{displayUser.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={displayUser.role === 'DRIVER' ? 'default' : 'outline'} className={`${displayUser.role === 'DRIVER' ? 'bg-orange-500 hover:bg-orange-600' : 'text-blue-600 border-blue-200'
                                    }`}>
                                    {displayUser.role}
                                </Badge>
                                <span className="text-xs text-muted-foreground">ID: {displayUser.id.substring(0, 8)}...</span>
                            </div>
                        </div>
                    </div>
                    <Badge variant="outline" className={`px-4 py-1.5 text-sm font-semibold rounded-full ${displayUser.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : displayUser.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {displayUser.status}
                    </Badge>
                </div>

                <div className="p-6 grid md:grid-cols-2 gap-8">
                    {/* Column 1 */}
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Contact Details</h4>
                            <div className="space-y-4">
                                <div className="flex items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-gray-400 mr-3 shadow-sm border">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs text-gray-500">Email Address</p>
                                        <p className="text-sm font-medium text-gray-900 truncate">{displayUser.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-gray-400 mr-3 shadow-sm border">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Mobile Number</p>
                                        <p className="text-sm font-medium text-gray-900">{displayUser.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-start p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-gray-400 mr-3 shadow-sm border shrink-0">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Residence</p>
                                        <p className="text-sm font-medium text-gray-900 leading-relaxed">
                                            {displayUser.address}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Account Overview</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
                                    <p className="text-xs text-muted-foreground">Member Since</p>
                                    <p className="text-lg font-bold text-gray-800">{displayUser.joined}</p>
                                </div>
                                <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
                                    <p className="text-xs text-muted-foreground">Rating</p>
                                    <p className="text-lg font-bold text-yellow-600 flex items-center gap-1">
                                        {randomRating} ★
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Identity Verification Docs</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border rounded-xl p-2 bg-slate-50 flex flex-col group">
                                    <p className="text-xs font-semibold text-gray-500 mb-2 px-1">Aadhar Card</p>
                                    <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden border">
                                        {displayUser.aadhar ? (
                                            <a href={displayUser.aadhar} target="_blank" rel="noreferrer">
                                                <img src={displayUser.aadhar} alt="Aadhar" className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer" />
                                            </a>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                                <FileText className="w-6 h-6 mb-1 opacity-50" />
                                                <span className="text-[10px]">Not Provided</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="border rounded-xl p-2 bg-slate-50 flex flex-col group">
                                    <p className="text-xs font-semibold text-gray-500 mb-2 px-1">PAN Card</p>
                                    <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden border">
                                        {displayUser.pan ? (
                                            <a href={displayUser.pan} target="_blank" rel="noreferrer">
                                                <img src={displayUser.pan} alt="PAN" className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer" />
                                            </a>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                                <Hash className="w-6 h-6 mb-1 opacity-50" />
                                                <span className="text-[10px]">Not Provided</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Driver Specific Section */}
                        {displayUser.role === 'DRIVER' && (
                            <div className="border-t pt-6 mt-4">
                                <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Car className="w-4 h-4" /> Driver & Vehicle Details
                                </h4>

                                <div className="space-y-4">
                                    {/* Driving License */}
                                    <div className="border rounded-xl p-2 bg-orange-50/50 flex flex-col group border-orange-100">
                                        <p className="text-xs font-semibold text-orange-700 mb-2 px-1">Driving License</p>
                                        <div className="relative h-32 bg-gray-200 rounded-lg overflow-hidden border">
                                            {displayUser.license ? (
                                                <a href={displayUser.license} target="_blank" rel="noreferrer">
                                                    <img src={displayUser.license} alt="License" className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer" />
                                                </a>
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                                    <FileText className="w-6 h-6 mb-1 opacity-50" />
                                                    <span className="text-[10px]">Not Provided</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Vehicle Info Box */}
                                    <div className="bg-slate-50 border rounded-xl p-4">
                                        {loadingVehicle ? (
                                            <p className="text-sm text-muted-foreground animate-pulse">Loading vehicle details...</p>
                                        ) : vehicle ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Make & Model</p>
                                                        <p className="font-semibold text-gray-900">{vehicle.company} {vehicle.model}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Registration No</p>
                                                        <p className="font-semibold text-gray-900">{vehicle.registration_number}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Year</p>
                                                        <p className="font-medium text-gray-800">{vehicle.year_of_model || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Color</p>
                                                        <p className="font-medium text-gray-800">{vehicle.color}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <p className="text-xs text-gray-500">Features</p>
                                                        <div className="flex gap-2 mt-1">
                                                            {vehicle.has_ac && <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">AC</Badge>}
                                                            {vehicle.audio_system && <Badge variant="secondary">{vehicle.audio_system}</Badge>}
                                                            <Badge variant="outline">{vehicle.km_driven} km driven</Badge>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Vehicle Images */}
                                                {vehicle.image_urls && vehicle.image_urls.length > 0 && (
                                                    <div className="pt-2 border-t mt-2">
                                                        <p className="text-xs font-semibold text-gray-500 mb-2">Vehicle Photos</p>
                                                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                                            {vehicle.image_urls.map((url, idx) => (
                                                                <a key={idx} href={url} target="_blank" rel="noreferrer" className="shrink-0">
                                                                    <div className="w-24 h-24 rounded-lg overflow-hidden border shadow-sm">
                                                                        <img src={url} alt={`Vehicle front ${idx}`} className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                                                                    </div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-amber-600">No vehicle data found for this driver.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-4 border-t bg-slate-50 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground ml-2 flex-1">Registration documents are securely stored.</p>
                    <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">Close Details</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UserDetailsModal;
