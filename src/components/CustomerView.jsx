import React, { useState } from "react";
import { Search, ShoppingCart, X, Minus, Plus } from "lucide-react";
import { MenuCardSimple } from "./MenuCard";
import { useLanguage } from "../contexts/LanguageContext";

const CATEGORIES = ["all", "food", "drink", "snack", "dessert", "other"];

export function CustomerView({ items, settings, onIncrementViews, onBack }) {
    const { t } = useLanguage();

    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [showCart, setShowCart] = useState(false);

    // Filter items
    const filteredItems = items
        .filter(
            (item) =>
                selectedCategory === "all" || item.category === selectedCategory
        )
        .filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => a.order - b.order);

    // Cart functions
    const addToCart = (item) => {
        onIncrementViews(item.id);

        setCart((prev) => {
            const existing = prev.find((c) => c.id === item.id);
            if (existing) {
                return prev.map((c) =>
                    c.id === item.id ? { ...c, qty: c.qty + 1 } : c
                );
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const updateQty = (id, delta) => {
        setCart((prev) => {
            return prev
                .map((item) => {
                    if (item.id === id) {
                        const newQty = item.qty + delta;
                        return newQty > 0 ? { ...item, qty: newQty } : item;
                    }
                    return item;
                })
                .filter((item) => item.qty > 0);
        });
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((c) => c.id !== id));
    };

    const clearCart = () => setCart([]);

    // Calculate totals
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
    );

    // WhatsApp order
    const orderViaWhatsApp = () => {
        const itemsList = cart
            .map(
                (item) =>
                    `- ${item.name} x${item.qty} (Rp ${(
                        item.price * item.qty
                    ).toLocaleString("id-ID")})`
            )
            .join("\n");

        const message = `${t.orderMessage}

${itemsList}

${t.totalPrice}: Rp ${totalPrice.toLocaleString("id-ID")}`;

        const waUrl = `https://wa.me/${
            settings.whatsappNumber
        }?text=${encodeURIComponent(message)}`;
        window.open(waUrl, "_blank");
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            )}
                            <div>
                                <h1 className="text-xl font-bold">
                                    {settings.storeName}
                                </h1>
                                <p className="text-blue-100 text-xs">
                                    {t.tagline}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t.searchPlaceholder}
                            className="w-full pl-10 pr-4 py-2.5 bg-white text-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-white/50"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="px-4 pb-4">
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`
                  px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-all
                  ${
                      selectedCategory === cat
                          ? "bg-white text-blue-600"
                          : "bg-white/20 text-white hover:bg-white/30"
                  }
                `}
                            >
                                {cat === "all" ? t.allCategories : t[cat]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Menu Grid */}
            <div className="p-4">
                {filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">{t.noResults}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {filteredItems.map((item) => (
                            <MenuCardSimple
                                key={item.id}
                                item={item}
                                onClick={() => addToCart(item)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Cart Bar */}
            {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg animate-slideUp">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-xs text-gray-500">
                                    {totalItems} item
                                </p>
                                <p className="font-bold text-lg">
                                    Rp {totalPrice.toLocaleString("id-ID")}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowCart(!showCart)}
                                    className="px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
                                >
                                    {showCart ? "Hide" : "View"} Cart
                                </button>
                                <button
                                    onClick={orderViaWhatsApp}
                                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-600 transition-colors"
                                >
                                    <ShoppingCart size={18} />
                                    {t.orderViaWA}
                                </button>
                            </div>
                        </div>

                        {/* Cart Items */}
                        {showCart && (
                            <div className="border-t pt-3 mt-3 max-h-48 overflow-y-auto">
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between py-2 border-b last:border-0"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Rp{" "}
                                                {item.price.toLocaleString(
                                                    "id-ID"
                                                )}{" "}
                                                x {item.qty}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    updateQty(item.id, -1)
                                                }
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="text-sm font-medium w-6 text-center">
                                                {item.qty}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    updateQty(item.id, 1)
                                                }
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                <Plus size={14} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    removeFromCart(item.id)
                                                }
                                                className="p-1 hover:bg-gray-100 rounded text-red-500"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={clearCart}
                                    className="w-full mt-2 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomerView;
