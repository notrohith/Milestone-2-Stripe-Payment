import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import ChangePasswordModal from "../components/ChangePasswordModal";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const { signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
            // Logic for redirect handled by Auth Context / Supabase
        } catch (error) {
            alert(error.message);
        }
    };

    const login = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                alert(error.message);
                setLoading(false);
                return;
            }

            // Check if this is the user's first login via the returned user data
            const isFirstLogin = data?.user?.user_metadata?.firstLogin === true;

            if (isFirstLogin) {
                setLoading(false);
                setShowChangePassword(true);
                return;
            }

            // Redirect based on email
            if (email === 'rohith@corideadmin.com') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            alert('Login failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChanged = () => {
        setShowChangePassword(false);
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar onToggleSidebar={() => { }} />

            {/* First-Login Password Change Modal */}
            {showChangePassword && (
                <ChangePasswordModal onSuccess={handlePasswordChanged} />
            )}
            <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl mt-16"
                >
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome Back</h2>
                        <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={login}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div className="mb-4 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="text-gray-400" />
                                </div>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="mb-4 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div>
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <FcGoogle className="h-5 w-5 mr-2" />
                            Sign in with Google
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-gray-600">Don't have an account? </span>
                        <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign up
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default Login;
