import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../config/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'admin' | 'user' | null
    const [loading, setLoading] = useState(true);

    const fetchUserRole = async (userId) => {
        try {
            const { data, error } = await supabase
                .from("user_profiles")
                .select("role")
                .eq("id", userId)
                .single();

            if (error) {
                console.error("Fetch role error:", error);
                setUserRole("user"); // Default role
                return "user";
            }

            const role = data?.role || "user";
            setUserRole(role);
            return role;
        } catch (err) {
            console.error("Fetch role error:", err);
            setUserRole("user");
            return "user";
        }
    };

    useEffect(() => {
        // Check current session
        const checkSession = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                
                if (session?.user) {
                    setUser(session.user);
                    await fetchUserRole(session.user.id);
                } else {
                    setUser(null);
                    setUserRole(null);
                }
            } catch (err) {
                console.error("Session check error:", err);
                setUser(null);
                setUserRole(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state changed:", event, session?.user?.email);
            
            if (session?.user) {
                setUser(session.user);
                const role = await fetchUserRole(session.user.id);
                console.log("User role set to:", role);
            } else {
                setUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email, password, name, role = "user") => {
        try {
            // Sign up with metadata
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { 
                    data: { 
                        name,
                        role  // Pass role in metadata for trigger
                    } 
                },
            });

            if (error) throw error;

            // Wait for trigger to create profile
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Verify profile was created
            if (data.user) {
                const { data: profile, error: profileError } = await supabase
                    .from("user_profiles")
                    .select("*")
                    .eq("id", data.user.id)
                    .single();

                if (profileError || !profile) {
                    // Trigger didn't work, create manually
                    console.warn("Auto profile creation failed, creating manually");
                    await supabase
                        .from("user_profiles")
                        .insert({
                            id: data.user.id,
                            email,
                            name,
                            role,
                        });
                }
            }

            return { data, error: null };
        } catch (err) {
            return { data: null, error: err };
        }
    };

    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Immediately fetch and set role
            if (data.user) {
                await fetchUserRole(data.user.id);
            }

            return { data, error: null };
        } catch (err) {
            return { data: null, error: err };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setUserRole(null);
    };

    const isAdmin = userRole === "admin";
    const isUser = userRole === "user";
    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider
            value={{
                user,
                userRole,
                loading,
                isAdmin,
                isUser,
                isAuthenticated,
                signUp,
                signIn,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}

export default AuthContext;