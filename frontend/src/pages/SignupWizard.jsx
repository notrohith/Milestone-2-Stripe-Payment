import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, uploadFile } from '../api/authApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Check, ChevronRight, ChevronLeft, User, Car, Clock, Mail } from 'lucide-react';
import { Navbar } from '../components/Navbar';

// Steps
const STEPS = [
    { id: 'role', title: 'Role' },
    { id: 'personal', title: 'Personal' },
    { id: 'address', title: 'Address' },
    { id: 'education', title: 'Education' },
    { id: 'documents', title: 'Documents' },
    { id: 'vehicle', title: 'Vehicle' }, // Only for Driver
];

const SignupWizard = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [duplicateError, setDuplicateError] = useState(null);
    const [isUploading, setIsUploading] = useState({ aadhar: false, pan: false, license: false, vehicleDetails: false });
    const [formData, setFormData] = useState({
        role: '', // 'RIDER' or 'DRIVER'
        email: '',
        // password: '', // Password removed as per request
        name: '', // first + last
        firstName: '',
        lastName: '',
        phoneNumber: '',
        dob: '',
        gender: '',

        address: '',

        education: {
            tenth: { institution: '', year: '', percentage: '' },
            twelfth: { institution: '', year: '', percentage: '' },
            graduation: { institution: '', year: '', percentage: '' },
        },

        documents: {
            aadhar: null,
            pan: null,
            license: null, // Driver only
        },

        vehicle: {
            company: '',
            model: '',
            regNo: '',
            rcNo: '',
            insuranceNo: '',
            year: '',
            hasAc: false,
            audioSystem: '',
            kmDriven: '',
            color: '',
            images: [],
        }
    });

    const steps = formData.role === 'RIDER'
        ? STEPS.filter(s => s.id !== 'vehicle')
        : STEPS;

    const handleNext = () => {
        // Simple validation for required fields could go here, 
        // but HTML5 'required' attribute works best with a form wrap.
        // Since we are using divs and onClick, we might want to check fields manually or rely on backend/later steps.
        // For now, adhering to "make the required fields mandatory" by adding the attribute for visual indication and potential form integration.
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    // File Upload Helper
    const handleFileUpload = async (section, field, file) => {
        if (!file) return;

        let uploadingKey = field;
        if (field === 'images') uploadingKey = 'vehicleDetails';

        setIsUploading(prev => ({ ...prev, [uploadingKey]: true }));
        try {
            const response = await uploadFile(file);
            const fileUrl = response.data; // URL returned from backend
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [field]: fileUrl }
            }));
        } catch (error) {
            console.error("File upload failed", error);
            alert("File upload failed: " + error.message);
        } finally {
            setIsUploading(prev => ({ ...prev, [uploadingKey]: false }));
        }
    };

    const handleSubmit = async () => {
        // Validate file uploads before sending backend request
        if (!formData.documents.aadhar || !formData.documents.pan) {
            alert("Please select and wait for your Aadhar and PAN cards to finish uploading.");
            return;
        }

        if (formData.role === 'DRIVER' && (!formData.documents.license || !formData.vehicle.images || formData.vehicle.images.length === 0)) {
            alert("Please ensure your driving license and at least one vehicle image are uploaded.");
            return;
        }

        try {
            // Logic adapted for no password: 
            // If using magic links, we'd call signInWithOtp. 
            // If just removing the UI but backend expects it, we might need a dummy or handle it elsewhere.
            // Assuming for now standard signup flow is modified or we just skip the auth part here for the wizard demo.
            // const { data: authData, error: authError } = await signUp(formData.email, "tempPassword123!"); // Example placeholder if needed

            // For now, proceeding with registration logic assuming auth is handled or redundant for this step

            // Prepare Request Object for Backend
            const backendRequest = {
                // id: authData?.user?.id || 'temp-id', // Placeholder
                email: formData.email,
                name: `${formData.firstName} ${formData.lastName}`,
                role: formData.role,
                phoneNumber: formData.phoneNumber,
                dateOfBirth: formData.dob,
                gender: formData.gender,
                address: formData.address,
                aadharCardUrl: formData.documents.aadhar,
                panCardUrl: formData.documents.pan,
                drivingLicenseUrl: formData.documents.license,

                educationDetails: [
                    { level: '10th', institutionName: formData.education.tenth.institution, passingYear: formData.education.tenth.year, percentage: formData.education.tenth.percentage },
                    { level: '12th', institutionName: formData.education.twelfth.institution, passingYear: formData.education.twelfth.year, percentage: formData.education.twelfth.percentage },
                    { level: 'Graduation', institutionName: formData.education.graduation.institution, passingYear: formData.education.graduation.year, percentage: formData.education.graduation.percentage },
                ],

                vehicleDetails: formData.role === 'DRIVER' ? {
                    company: formData.vehicle.company,
                    model: formData.vehicle.model,
                    registrationNumber: formData.vehicle.regNo,
                    rcNumber: formData.vehicle.rcNo,
                    insuranceNumber: formData.vehicle.insuranceNo,
                    yearOfModel: parseInt(formData.vehicle.year),
                    hasAc: formData.vehicle.hasAc,
                    audioSystem: formData.vehicle.audioSystem,
                    kmDriven: parseInt(formData.vehicle.kmDriven),
                    color: formData.vehicle.color,
                    imageUrls: formData.vehicle.images
                } : null
            };

            await registerUser(backendRequest);
            setShowPendingModal(true);

        } catch (error) {
            console.error("Registration failed", error);
            if (error.message.toLowerCase().includes('already registered')) {
                setDuplicateError({
                    title: "Email Already in Use",
                    message: "This email address is already associated with an existing account. You cannot sign up again as a Driver/Rider with the same email. Please use a different email or log in to your existing account."
                });
            } else {
                alert("Registration failed: " + error.message);
            }
        }
    };

    const renderStep = () => {
        const stepId = steps[currentStep].id;

        switch (stepId) {
            case 'role':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-center">I want to...</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Card
                                className={`cursor-pointer hover:border-teal-500 transition-all ${formData.role === 'RIDER' ? 'border-teal-500 ring-2 ring-teal-500/20' : ''}`}
                                onClick={() => handleChange('role', 'RIDER')}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-6">
                                    <User className="w-12 h-12 mb-2 text-teal-600" />
                                    <h3 className="font-semibold text-lg">Rider</h3>
                                </CardContent>
                            </Card>
                            <Card
                                className={`cursor-pointer hover:border-blue-500 transition-all ${formData.role === 'DRIVER' ? 'border-blue-500 ring-2 ring-blue-500/20' : ''}`}
                                onClick={() => handleChange('role', 'DRIVER')}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-6">
                                    <Car className="w-12 h-12 mb-2 text-blue-600" />
                                    <h3 className="font-semibold text-lg">Driver</h3>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );

            case 'personal':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name <span className="text-red-500">*</span></Label>
                                <Input required value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name <span className="text-red-500">*</span></Label>
                                <Input required value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email <span className="text-red-500">*</span></Label>
                            <Input required type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
                        </div>
                        {/* Password field removed */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date of Birth <span className="text-red-500">*</span></Label>
                                <Input required type="date" value={formData.dob} onChange={(e) => handleChange('dob', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Gender <span className="text-red-500">*</span></Label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                                    value={formData.gender}
                                    required
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Contact No <span className="text-red-500">*</span></Label>
                            <Input required type="tel" value={formData.phoneNumber} onChange={(e) => handleChange('phoneNumber', e.target.value)} />
                        </div>
                    </div>
                );

            case 'address':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Full Address <span className="text-red-500">*</span></Label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.address}
                                required
                                onChange={(e) => handleChange('address', e.target.value)}
                                placeholder="Street, City, State, Zip Code"
                            />
                        </div>
                    </div>
                );

            case 'education':
                return (
                    <div className="space-y-6">
                        {['tenth', 'twelfth', 'graduation'].map((level) => (
                            <div key={level} className="space-y-2 border-b pb-4">
                                <h4 className="font-semibold capitalize">{level === 'graduation' ? 'Graduation' : level + ' Standard'}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <Input required placeholder="Institution Name" value={formData.education[level].institution} onChange={(e) => setFormData(p => ({ ...p, education: { ...p.education, [level]: { ...p.education[level], institution: e.target.value } } }))} />
                                    <Input required placeholder="Passing Year" value={formData.education[level].year} onChange={(e) => setFormData(p => ({ ...p, education: { ...p.education, [level]: { ...p.education[level], year: e.target.value } } }))} />
                                    <Input required placeholder="Percentage" value={formData.education[level].percentage} onChange={(e) => setFormData(p => ({ ...p, education: { ...p.education, [level]: { ...p.education[level], percentage: e.target.value } } }))} />
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'documents':
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label>Aadhar Card <span className="text-red-500">*</span></Label>
                            <div className="flex items-center gap-2">
                                <Input required type="file" onChange={(e) => handleFileUpload('documents', 'aadhar', e.target.files[0])} disabled={isUploading.aadhar} />
                                {isUploading.aadhar && <span className="text-sm text-teal-600 animate-pulse">Uploading...</span>}
                                {formData.documents.aadhar && !isUploading.aadhar && <Check className="text-green-500 w-5 h-5" />}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>PAN Card <span className="text-red-500">*</span></Label>
                            <div className="flex items-center gap-2">
                                <Input required type="file" onChange={(e) => handleFileUpload('documents', 'pan', e.target.files[0])} disabled={isUploading.pan} />
                                {isUploading.pan && <span className="text-sm text-teal-600 animate-pulse">Uploading...</span>}
                                {formData.documents.pan && !isUploading.pan && <Check className="text-green-500 w-5 h-5" />}
                            </div>
                        </div>
                        {formData.role === 'DRIVER' && (
                            <div className="space-y-2">
                                <Label>Driving License <span className="text-red-500">*</span></Label>
                                <div className="flex items-center gap-2">
                                    <Input required type="file" onChange={(e) => handleFileUpload('documents', 'license', e.target.files[0])} disabled={isUploading.license} />
                                    {isUploading.license && <span className="text-sm text-teal-600 animate-pulse">Uploading...</span>}
                                    {formData.documents.license && !isUploading.license && <Check className="text-green-500 w-5 h-5" />}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'vehicle':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Company (Make) <span className="text-red-500">*</span></Label>
                                <Input required value={formData.vehicle.company} onChange={(e) => handleNestedChange('vehicle', 'company', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Model <span className="text-red-500">*</span></Label>
                                <Input required value={formData.vehicle.model} onChange={(e) => handleNestedChange('vehicle', 'model', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Registration No <span className="text-red-500">*</span></Label>
                                <Input required value={formData.vehicle.regNo} onChange={(e) => handleNestedChange('vehicle', 'regNo', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>RC Number <span className="text-red-500">*</span></Label>
                                <Input required value={formData.vehicle.rcNo} onChange={(e) => handleNestedChange('vehicle', 'rcNo', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Insurance No <span className="text-red-500">*</span></Label>
                                <Input required value={formData.vehicle.insuranceNo} onChange={(e) => handleNestedChange('vehicle', 'insuranceNo', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Year <span className="text-red-500">*</span></Label>
                                <Input required type="number" value={formData.vehicle.year} onChange={(e) => handleNestedChange('vehicle', 'year', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>KM Driven <span className="text-red-500">*</span></Label>
                                <Input required type="number" value={formData.vehicle.kmDriven} onChange={(e) => handleNestedChange('vehicle', 'kmDriven', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Color <span className="text-red-500">*</span></Label>
                                <Input required value={formData.vehicle.color} onChange={(e) => handleNestedChange('vehicle', 'color', e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Audio System</Label>
                            <Input value={formData.vehicle.audioSystem} onChange={(e) => handleNestedChange('vehicle', 'audioSystem', e.target.value)} />
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={formData.vehicle.hasAc} onChange={(e) => handleNestedChange('vehicle', 'hasAc', e.target.checked)} className="h-4 w-4" />
                            <Label>Has AC?</Label>
                        </div>

                        <div className="space-y-2">
                            <Label>Vehicle Images (Upload 4-5) <span className="text-red-500">*</span></Label>
                            <div className="flex items-center gap-2">
                                <Input required type="file" multiple disabled={isUploading.vehicleDetails} onChange={async (e) => {
                                    const files = Array.from(e.target.files);
                                    if (files.length === 0) return;

                                    setIsUploading(prev => ({ ...prev, vehicleDetails: true }));
                                    try {
                                        const urls = [];
                                        for (const file of files) {
                                            const res = await uploadFile(file);
                                            urls.push(res.data);
                                        }
                                        handleNestedChange('vehicle', 'images', urls);
                                    } catch (err) {
                                        console.error('Failed to upload vehicle images', err);
                                        alert('Vehicle images upload failed: ' + err.message);
                                    } finally {
                                        setIsUploading(prev => ({ ...prev, vehicleDetails: false }));
                                    }
                                }} />
                                {isUploading.vehicleDetails && <span className="text-sm text-teal-600 animate-pulse">Uploading...</span>}
                            </div>
                            {formData.vehicle.images.length > 0 && !isUploading.vehicleDetails && <span className="text-green-500 text-sm">{formData.vehicle.images.length} images uploaded</span>}
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar onToggleSidebar={() => { }} />

            {/* Pending Verification Modal */}
            <AnimatePresence>
                {showPendingModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center"
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.88, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
                        >
                            {/* Top gradient strip */}
                            <div className="h-2 w-full bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500" />

                            <div className="px-8 py-10 text-center">
                                {/* Animated Clock Icon */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                                    className="w-20 h-20 bg-gradient-to-br from-teal-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
                                >
                                    <Clock className="w-10 h-10 text-teal-500" />
                                </motion.div>

                                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                    Registration Submitted!
                                </h2>
                                <p className="text-gray-500 text-sm leading-relaxed mb-2">
                                    Please wait while we verify your account.
                                </p>
                                <div className="flex items-center justify-center gap-2 text-sm text-teal-600 font-medium bg-teal-50 rounded-xl px-4 py-3 mb-6">
                                    <Mail className="w-4 h-4" />
                                    <span>You'll receive an email once approved by our admin.</span>
                                </div>

                                {/* Animated dots */}
                                <div className="flex items-center justify-center gap-1.5 mb-8">
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            className="w-2.5 h-2.5 rounded-full bg-teal-400"
                                            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold text-sm hover:opacity-90 transition-all shadow-md shadow-teal-100"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="flex items-center justify-center min-h-screen p-4 pt-20">
                <Card className="max-w-2xl w-full border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
                        <CardDescription className="text-center">
                            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
                        </CardDescription>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
                            <motion.div
                                className="bg-teal-500 h-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                            />
                        </div>
                    </CardHeader>

                    <CardContent className="mt-4">
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleNext();
                        }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {renderStep()}
                                </motion.div>
                            </AnimatePresence>

                            <div className="flex justify-between mt-8 pt-6 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleBack}
                                    disabled={currentStep === 0}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={!formData.role && currentStep === 0}
                                    className="bg-teal-600 hover:bg-teal-700 text-white"
                                >
                                    {currentStep === steps.length - 1 || (currentStep === 2 && formData.role !== 'DRIVER') ? 'Submit' : 'Next'}
                                    {!(currentStep === steps.length - 1 || (currentStep === 2 && formData.role !== 'DRIVER')) && <ChevronRight className="w-4 h-4 ml-2" />}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Custom Error Modal for Duplicate Signups */}
                <AnimatePresence>
                    {duplicateError && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 10, opacity: 0 }}
                                className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden"
                            >
                                {/* Top Red Bar */}
                                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-orange-500" />

                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                        <Mail className="w-10 h-10 text-red-500" />
                                    </div>

                                    <h3 className="text-2xl font-bold mb-3 text-gray-900">{duplicateError.title}</h3>
                                    <p className="text-gray-600 mb-8 leading-relaxed text-center">
                                        {duplicateError.message}
                                    </p>

                                    <div className="w-full space-y-3">
                                        <Button
                                            type="button"
                                            onClick={() => setDuplicateError(null)}
                                            variant="outline"
                                            className="w-full h-12 text-lg font-medium border-gray-200 hover:bg-gray-50 rounded-xl"
                                        >
                                            Try Different Email
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => navigate('/login')}
                                            className="w-full h-12 text-lg font-medium bg-gray-900 text-white hover:bg-gray-800 rounded-xl shadow-md"
                                        >
                                            Go to Login
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SignupWizard;
