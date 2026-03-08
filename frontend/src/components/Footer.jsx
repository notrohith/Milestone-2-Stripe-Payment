
const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-8 mt-12">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h3 className="text-xl font-bold mb-4">RideWithMe</h3>
                    <p className="text-gray-400">
                        Connecting drivers and riders for a sustainable, affordable, and friendly travel experience.
                        Join our community today.
                    </p>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-gray-400">
                        <li><a href="/" className="hover:text-white transition">Home</a></li>
                        <li><a href="/search" className="hover:text-white transition">Search Rides</a></li>
                        <li><a href="/login" className="hover:text-white transition">Login</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-4">Contact</h4>
                    <p className="text-gray-400">support@ridewithme.com</p>
                    <p className="text-gray-400">+91 9876543210</p>
                    <div className="mt-4 flex space-x-4">
                        {/* Placeholder Social Icons */}
                        <div className="w-8 h-8 bg-gray-600 rounded-full hover:bg-blue-500 transition cursor-pointer"></div>
                        <div className="w-8 h-8 bg-gray-600 rounded-full hover:bg-blue-400 transition cursor-pointer"></div>
                        <div className="w-8 h-8 bg-gray-600 rounded-full hover:bg-pink-500 transition cursor-pointer"></div>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} RideWithMe. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
