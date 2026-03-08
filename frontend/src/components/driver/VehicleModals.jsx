import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Car, X, CheckCircle, Upload } from 'lucide-react';
import { supabaseAdmin } from '../../supabaseClient';

export const AddVehicleModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        number: '',
        rcNumber: '',
        expiry: '',
        color: '',
        year: new Date().getFullYear().toString(),
        hasAc: false,
        audioSystem: '',
        kmDriven: '0',
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 4);
        setImageFiles(files);
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const uploadImages = async () => {
        const urls = [];
        for (const file of imageFiles) {
            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
            const { data, error } = await supabaseAdmin.storage
                .from('vehicle-images')
                .upload(fileName, file);
            if (error) {
                console.error('Upload error:', error);
                continue;
            }
            const { data: urlData } = supabaseAdmin.storage
                .from('vehicle-images')
                .getPublicUrl(data.path);
            if (urlData?.publicUrl) urls.push(urlData.publicUrl);
        }
        return urls;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            let imageUrls = [];
            if (imageFiles.length > 0) {
                imageUrls = await uploadImages();
            }
            onAdd({ ...formData, imageUrls });
            onClose();
            setFormData({ make: '', model: '', number: '', rcNumber: '', expiry: '', color: '', year: new Date().getFullYear().toString(), hasAc: false, audioSystem: '', kmDriven: '0' });
            setImageFiles([]);
            setImagePreviews([]);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[520px] p-0 bg-white rounded-3xl border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-white p-6">
                    <DialogHeader className="mb-6 text-center">
                        <div className="mx-auto bg-orange-100 p-3 rounded-full mb-3 w-fit">
                            <Car className="w-6 h-6 text-orange-600" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-gray-900">Register a Vehicle</DialogTitle>
                        <p className="text-xs text-gray-500">Provide details to list your car. It will be auto-approved instantly.</p>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="make" className="text-xs font-semibold text-gray-500">Manufacturer *</Label>
                                <Input id="make" name="make" placeholder="e.g. Toyota" className="bg-slate-50 border-slate-200" value={formData.make} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model" className="text-xs font-semibold text-gray-500">Model *</Label>
                                <Input id="model" name="model" placeholder="e.g. Camry" className="bg-slate-50 border-slate-200" value={formData.model} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="number" className="text-xs font-semibold text-gray-500">License Plate No. *</Label>
                                <Input id="number" name="number" placeholder="e.g. KA-01-AB-1234" className="bg-slate-50 border-slate-200" value={formData.number} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rcNumber" className="text-xs font-semibold text-gray-500">RC Number *</Label>
                                <Input id="rcNumber" name="rcNumber" placeholder="RC Number" className="bg-slate-50 border-slate-200" value={formData.rcNumber} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="color" className="text-xs font-semibold text-gray-500">Color *</Label>
                                <Input id="color" name="color" placeholder="e.g. White" className="bg-slate-50 border-slate-200" value={formData.color} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="year" className="text-xs font-semibold text-gray-500">Year *</Label>
                                <Input id="year" name="year" type="number" placeholder="e.g. 2021" className="bg-slate-50 border-slate-200" value={formData.year} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="kmDriven" className="text-xs font-semibold text-gray-500">KM Driven</Label>
                                <Input id="kmDriven" name="kmDriven" type="number" placeholder="e.g. 25000" className="bg-slate-50 border-slate-200" value={formData.kmDriven} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="audioSystem" className="text-xs font-semibold text-gray-500">Audio System</Label>
                                <Input id="audioSystem" name="audioSystem" placeholder="Basic / Premium / None" className="bg-slate-50 border-slate-200" value={formData.audioSystem} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expiry" className="text-xs font-semibold text-gray-500">Insurance / Registration Valid Until *</Label>
                            <Input id="expiry" name="expiry" type="date" className="bg-slate-50 border-slate-200 block w-full" value={formData.expiry} onChange={handleChange} required />
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <input type="checkbox" name="hasAc" id="hasAc" checked={formData.hasAc} onChange={handleChange} className="h-4 w-4 rounded" />
                            <Label htmlFor="hasAc" className="text-sm font-medium text-gray-700 cursor-pointer">Has Air Conditioning (AC)</Label>
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-500">Car Images (up to 4)</Label>
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-orange-300 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="car-images"
                                />
                                <label htmlFor="car-images" className="cursor-pointer flex flex-col items-center gap-2">
                                    <Upload className="w-6 h-6 text-gray-400" />
                                    <span className="text-xs text-gray-500">Click to upload images</span>
                                </label>
                            </div>
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mt-2">
                                    {imagePreviews.map((src, i) => (
                                        <div key={i} className="aspect-square rounded-lg overflow-hidden border border-slate-200">
                                            <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            Vehicle will be automatically approved upon submission.
                        </div>

                        <Button type="submit" disabled={isUploading} className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl py-6 mt-2 shadow-lg shadow-orange-200">
                            {isUploading ? 'Uploading...' : 'Submit Car Details'}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const ViewVehicleModal = ({ isOpen, onClose, vehicle }) => {
    if (!vehicle) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white rounded-3xl">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            Car Information
                        </DialogTitle>
                        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    {/* Header card */}
                    <div className="flex items-center gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="h-16 w-16 rounded-xl bg-white border flex items-center justify-center shadow-sm">
                            <Car className="w-8 h-8 text-slate-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{vehicle.make} {vehicle.model}</h3>
                            <p className="text-sm font-semibold text-gray-500 font-mono tracking-wide">{vehicle.number}</p>
                            <Badge className="mt-1 bg-green-100 text-green-700 hover:bg-green-100">{vehicle.status}</Badge>
                        </div>
                    </div>

                    {/* Vehicle Images */}
                    {vehicle.dbRecord?.image_urls && vehicle.dbRecord.image_urls.length > 0 ? (
                        <div className="mb-6">
                            <Label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 block">Car Images</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {vehicle.dbRecord.image_urls.slice(0, 4).map((url, i) => (
                                    <div key={i} className="aspect-square rounded-lg border border-slate-200 overflow-hidden">
                                        <img src={url} alt={`Vehicle ${i + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6">
                            <Label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 block">Car Images</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="aspect-square rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                        <Car className="w-6 h-6 text-slate-300" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Make</p>
                            <p className="font-semibold text-gray-900">{vehicle.make}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Model</p>
                            <p className="font-semibold text-gray-900">{vehicle.model}</p>
                        </div>
                        <div className="col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">License Plate</p>
                            <p className="font-semibold text-gray-900 tracking-wider">{vehicle.number}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">RC No.</p>
                            <p className="text-xs font-semibold text-gray-900 break-all">{vehicle.rcNumber}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Insurance / Expiry</p>
                            <p className="font-semibold text-gray-900">{vehicle.expiry}</p>
                        </div>
                        {vehicle.dbRecord?.color && (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Color</p>
                                <p className="font-semibold text-gray-900">{vehicle.dbRecord.color}</p>
                            </div>
                        )}
                        {vehicle.dbRecord?.year_of_model && (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Year</p>
                                <p className="font-semibold text-gray-900">{vehicle.dbRecord.year_of_model}</p>
                            </div>
                        )}
                        {vehicle.dbRecord?.km_driven != null && (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">KM Driven</p>
                                <p className="font-semibold text-gray-900">{vehicle.dbRecord.km_driven} km</p>
                            </div>
                        )}
                        {vehicle.dbRecord?.audio_system && (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Audio System</p>
                                <p className="font-semibold text-gray-900">{vehicle.dbRecord.audio_system}</p>
                            </div>
                        )}
                        <div className="col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                            <p className="text-[10px] uppercase font-bold text-gray-400">Air Conditioning</p>
                            <Badge className={vehicle.dbRecord?.has_ac ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                                {vehicle.dbRecord?.has_ac ? 'Yes' : 'No'}
                            </Badge>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t flex justify-end">
                        <Button variant="outline" onClick={onClose}>Close</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
