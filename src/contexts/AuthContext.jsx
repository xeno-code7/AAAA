import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../config/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'admin' | 'user' | null
    const [loading, setLoading] = useState(true);

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
                }
            } catch (err) {
                console.error("Session check error:", err);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user);
                await fetchUserRole(session.user.id);
            } else {
                setUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserRole = async (userId) => {
        try {
            const { data, error } = await supabase
                .from("user_profiles")
                .select("role")
                .eq("id", userId)
                .single();

            if (data) {
                setUserRole(data.role);
            } else {
                // Default role for new users
                setUserRole("user");
            }
        } catch (err) {
            console.error("Fetch role error:", err);
            setUserRole("user");
        }
    };

    const signUp = async (email, password, name, role = "user") => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { name } },
            });

            if (error) throw error;

            // Create user profile
            if (data.user) {
                await supabase.from("user_profiles").insert({
                    id: data.user.id,
                    email,
                    name,
                    role,
                });
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
