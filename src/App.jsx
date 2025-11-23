import React from "react";
import { Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";

import { useAuth } from "./contexts/AuthContext";

// Pages
import { PublicMenu } from "./components/PublicMenu";
import { AdminDashboard } from "./components/AdminDashboard";
import { LoginPage } from "./components/LoginPage";
import { UserProfile } from "./components/UserProfile";
import { NotFound } from "./components/NotFound";

// Protected Route for Admin
function AdminRoute({ children }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;

    return children;
}

// Protected Route for Users
function UserRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return children;
}

// Redirect for /menu/:slug → /:slug
function RedirectMenuSlug() {
    const { slug } = useParams();
    return <Navigate to={`/${slug}`} replace />;
}

function App() {
    return (
        <Routes>
            {/* Public Menu */}
            <Route path="/" element={<PublicMenu />} />

            {/* Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Auto-redirect */}
            <Route path="/menu" element={<Navigate to="/" replace />} />
            <Route path="/menu/:slug" element={<Navigate to="/" replace />} />

            {/* Admin */}
            <Route
                path="/admin/*"
                element={
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                }
            />

            {/* User Profile */}
            <Route
                path="/profile"
                element={
                    <UserRoute>
                        <UserProfile />
                    </UserRoute>
                }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
