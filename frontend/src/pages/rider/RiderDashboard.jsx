import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { MapPin, TrendingUp, Clock, CreditCard, Plus } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';

const RiderDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex flex-col h-screen bg-muted/30 overflow-hidden">
            <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

            <div className="flex flex-1 overflow-hidden pt-16">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col overflow-y-auto">
                    <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
                        <div className="hidden md:flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Rider Hub</h2>
                                <p className="text-gray-500">Control panel for your rides and payments.</p>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                                Active Rider
                            </Badge>
                        </div>

                        {/* Payment Methods Section */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Payment Methods</h3>
                                <Button size="sm" variant="outline" className="gap-2 border-dashed border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors">
                                    <Plus className="w-4 h-4" />
                                    Add Payment Method
                                </Button>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Mock payment method 1 */}
                                <div className="relative group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden p-5">
                                    <div className="absolute top-0 right-0 p-3">
                                        <Badge className="bg-green-100 text-green-700">Primary</Badge>
                                    </div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        <div className="pr-12">
                                            <h4 className="font-bold text-gray-900">Visa</h4>
                                            <p className="text-xs text-gray-500 font-mono tracking-wide">**** **** **** 4242</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 border-t pt-3 mt-2 border-dashed">
                                        <div>
                                            <span className="block text-[10px] uppercase font-semibold text-gray-300">Expires</span>
                                            <span className="font-medium text-gray-700 truncate">12/28</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[10px] uppercase font-semibold text-gray-300">Name</span>
                                            <span className="font-medium text-gray-700">John Doe</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-400 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-500 transition-all cursor-pointer group min-h-[160px]">
                                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-white group-hover:shadow-sm transition-colors">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    <p className="font-medium text-sm">Add New Card</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Statistics */}
                            <Card className="lg:col-span-1 h-full border-none shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-card dark:to-card">
                                <CardHeader>
                                    <CardTitle className="text-foreground">Recent Spendings</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-gray-900 dark:text-foreground">₹8,450.00</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 text-xs font-medium text-red-600 bg-red-50 w-fit px-2 py-1 rounded-full">
                                        <TrendingUp className="w-3 h-3" />
                                        +12% this month
                                    </div>

                                    <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-200">
                                        <p className="text-xs font-medium text-white/80 uppercase mb-1">Rider Rating</p>
                                        <h4 className="text-3xl font-bold mb-2">4.92 ★</h4>
                                        <p className="text-[10px] text-white/80 mb-4">Top 5% of all riders</p>

                                        <p className="text-xs font-medium text-white/80 uppercase mb-1">Rides Taken</p>
                                        <h4 className="text-2xl font-bold mb-4">48 Trips</h4>

                                        <div className="w-full bg-black/20 rounded-full h-1.5 mb-2 overflow-hidden">
                                            <div className="bg-white h-full rounded-full w-[85%]"></div>
                                        </div>
                                        <p className="text-[10px] text-white/80">3 rides to Elite Rider status</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Ride History Section */}
                            <Card className="lg:col-span-2 border-none shadow-md bg-white dark:bg-card">
                                <CardHeader>
                                    <CardTitle className="text-foreground">Ride History</CardTitle>
                                    <CardDescription>Log of your past journeys</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="bg-white dark:bg-card rounded-xl overflow-hidden">
                                        {[
                                            { dest: "Tech Park, HSR Layout", time: "Today, 08:30 AM", amount: "₹350.00", status: "Completed", rating: "5.0 ★" },
                                            { dest: "Kempegowda Intl Airport", time: "Yesterday, 2:15 PM", amount: "₹1,250.00", status: "Completed", rating: "4.8 ★" },
                                            { dest: "Phoenix Marketcity", time: "Oct 24, 6:00 PM", amount: "₹420.00", status: "Completed", rating: "5.0 ★" },
                                            { dest: "Indiranagar 100ft Road", time: "Oct 20, 9:15 PM", amount: "₹280.00", status: "Cancelled", rating: "N/A" }
                                        ].map((ride, i) => (
                                            <div key={i} className="flex items-center p-4 border-b dark:border-border last:border-0 hover:bg-slate-50 dark:hover:bg-muted transition-colors">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 ${ride.status === 'Cancelled' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <h5 className="font-bold text-gray-900 dark:text-foreground text-sm truncate">{ride.dest}</h5>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ride.time}</span>
                                                        <span className="font-medium text-amber-600">{ride.rating}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold ${ride.status === 'Cancelled' ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-foreground'}`}>
                                                        {ride.amount}
                                                    </p>
                                                    <p className={`text-[10px] uppercase font-bold ${ride.status === 'Cancelled' ? 'text-red-400' : 'text-green-500'}`}>
                                                        {ride.status}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="p-3 text-center border-t">
                                            <button className="text-xs font-bold text-blue-600 hover:underline">See Full Log</button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default RiderDashboard;
