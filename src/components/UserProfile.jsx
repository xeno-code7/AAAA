import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    Mail,
    ShoppingBag,
    ArrowLeft,
    LogOut,
    Globe,
    Package,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

export function UserProfile() {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { t, lang, toggleLang } = useLanguage();

    // Mock order history - in real app, fetch from Supabase
    const [orders] = useState([
        {
            id: 1,
            date: "2024-11-20",
            total: 85000,
            items: 4,
            status: "completed",
        },
        {
            id: 2,
            date: "2024-11-18",
            total: 45000,
            items: 2,
            status: "completed",
        },
        {
            id: 3,
            date: "2024-11-15",
            total: 120000,
            items: 6,
            status: "completed",
        },
    ]);

    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;

    const formatPrice = (p) => new Intl.NumberFormat("id-ID").format(p);
    const formatDate = (d) =>
        new Date(d).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

    const handleLogout = async () => {
        await signOut();
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => navigate("/")}
                        className="p-2 hover:bg-white/20 rounded-lg"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-bold">
                        {lang === "id" ? "Profil Saya" : "My Profile"}
                    </h1>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <User size={32} />
                    </div>
                    <div>
                        <p className="font-semibold text-lg">
                            {user?.user_metadata?.name || "User"}
                        </p>
                        <p className="text-green-100 text-sm flex items-center gap-1">
                            <Mail size={14} />
                            {user?.email || "user@example.com"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="p-4 -mt-4">
                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <ShoppingBag
                                    size={20}
                                    className="text-green-600"
                                />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {totalOrders}
                            </p>
                            <p className="text-xs text-gray-500">
                                {lang === "id"
                                    ? "Total Pesanan"
                                    : "Total Orders"}
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Package
                                    size={20}
                                    className="text-purple-600"
                                />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                Rp {formatPrice(totalSpent)}
                            </p>
                            <p className="text-xs text-gray-500">
                                {lang === "id"
                                    ? "Total Belanja"
                                    : "Total Spent"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order History */}
            <div className="p-4">
                <h2 className="font-semibold mb-3">
                    {lang === "id" ? "Riwayat Pesanan" : "Order History"}
                </h2>
                <div className="space-y-3">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-xl border p-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-medium">Order #{order.id}</p>
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                    {order.status === "completed"
                                        ? lang === "id"
                                            ? "Selesai"
                                            : "Completed"
                                        : order.status}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>{formatDate(order.date)}</span>
                                <span>{order.items} item</span>
                            </div>
                            <div className="mt-2 pt-2 border-t">
                                <p className="font-bold text-green-600">
                                    Rp {formatPrice(order.total)}
                                </p>
                            </div>
                        </div>
                    ))}

                    {orders.length === 0 && (
                        <div className="text-center py-8 bg-white rounded-xl border">
                            <ShoppingBag
                                size={40}
                                className="mx-auto text-gray-300 mb-2"
                            />
                            <p className="text-gray-500">
                                {lang === "id"
                                    ? "Belum ada pesanan"
                                    : "No orders yet"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Settings */}
            <div className="p-4">
                <h2 className="font-semibold mb-3">
                    {lang === "id" ? "Pengaturan" : "Settings"}
                </h2>
                <div className="bg-white rounded-xl border overflow-hidden">
                    <button
                        onClick={toggleLang}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                    >
                        <div className="flex items-center gap-3">
                            <Globe size={20} className="text-gray-500" />
                            <span>{lang === "id" ? "Bahasa" : "Language"}</span>
                        </div>
                        <span className="text-gray-500">
                            {lang === "id" ? "Indonesia" : "English"}
                        </span>
                    </button>
                    <hr />
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-4 text-red-600 hover:bg-red-50"
                    >
                        <LogOut size={20} />
                        <span>{lang === "id" ? "Keluar" : "Logout"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;
