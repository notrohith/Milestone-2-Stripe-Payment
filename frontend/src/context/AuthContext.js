import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { syncUser } from "../api/rideApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Safety fallback: never let loading stay true forever
        const safetyTimeout = setTimeout(() => setLoading(false), 10000);

        // Check active session
        const getSession = async () => {
            // Give Supabase 8 seconds to respond (was 1s before — too short)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Session check timed out")), 8000)
            );

            try {
                const { data, error } = await Promise.race([
                    supabase.auth.getSession(),
                    timeoutPromise
                ]);

                if (error) throw error;
                if (data?.session?.user) {
                    let role = data.session.user.user_metadata?.role;
                    if (!role) {
                        try {
                            const dbPromise = supabase
                                .from('users')
                                .select('role')
                                .eq('email', data.session.user.email)
                                .single();
                            const timeoutPromise = new Promise((_, reject) =>
                                setTimeout(() => reject(new Error('DB role lookup timed out')), 5000)
                            );
                            const { data: dbUser } = await Promise.race([dbPromise, timeoutPromise]);
                            if (dbUser && dbUser.role) {
                                role = dbUser.role;
                            }
                        } catch (e) {
                            console.warn('Role DB lookup failed:', e.message);
                        }
                    }
                    setUser({ ...data.session.user, role });
                    setSession(data.session);
                }
            } catch (error) {
                if (error.message?.includes('timed out')) {
                    console.warn("Session check timed out — proceeding as logged out");
                } else {
                    console.error("Auth session error:", error);
                }
            } finally {
                clearTimeout(safetyTimeout);
                setLoading(false);
            }
        };

        getSession();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                let role = session.user.user_metadata?.role;

                if (!role) {
                    try {
                        const dbPromise = supabase
                            .from('users')
                            .select('role')
                            .eq('email', session.user.email)
                            .single();
                        const timeoutPromise = new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('DB role lookup timed out')), 5000)
                        );
                        const { data: dbUser } = await Promise.race([dbPromise, timeoutPromise]);
                        if (dbUser && dbUser.role) {
                            role = dbUser.role;
                        }
                    } catch (e) {
                        console.warn('Role DB lookup failed:', e.message);
                    }
                }

                setUser({ ...session.user, role });
                setSession(session);

                // Sync with backend on login
                // Only sync if role is set (meaning profile is somewhat complete) or let the CompleteProfile page handle the first sync
                if (role) {
                    syncUser({
                        id: session.user.id,
                        email: session.user.email,
                        name: session.user.user_metadata?.name || session.user.email,
                        role: role,
                        phoneNumber: session.user.user_metadata?.phoneNumber,
                        profilePhotoUrl: session.user.user_metadata?.avatar_url
                    }).catch(e => {
                        console.error("Failed to sync user to backend", e.message);
                    });
                }
            } else {
                setUser(null);
                setSession(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        console.log("Initiating Google Sign In...");
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) {
            console.error("Google Sign In Error:", error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            // Race Supabase signOut with a 1s timeout
            await Promise.race([
                supabase.auth.signOut(),
                new Promise(resolve => setTimeout(resolve, 1000))
            ]);
        } catch (error) {
            console.error("Sign out error:", error);
        } finally {
            setUser(null);
            setSession(null);
            localStorage.clear();
        }
    };

    const updateProfile = async (updates) => {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Profile update timed out. Please try again.")), 12000);
        });

        const { error } = await Promise.race([
            supabase.auth.updateUser({ data: updates }),
            timeoutPromise,
        ]);

        if (error) throw error;

        // Update local user state immediately
        setUser(prev => ({ ...prev, user_metadata: { ...prev.user_metadata, ...updates }, role: updates.role || prev.role }));
    };

    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        if (error) throw error;
        return { data, error };
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut, signInWithGoogle, updateProfile, signUp }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
