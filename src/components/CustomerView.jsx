import React, { useState } from "react";
import {
    Search,
    ShoppingCart,
    X,
    Minus,
    Plus,
    MessageCircle,
    Trash2,
    Send,
    Store,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { MenuCardSimple } from "./MenuCard";
import { useLanguage } from "../contexts/LanguageContext";
import { encodeWA } from "../utils/waEncode";

const CATEGORIES = ["all", "food", "drink", "snack", "dessert", "other"];

export function CustomerView({ items, settings, onIncrementViews, onBack }) {
    const { t, lang } = useLanguage();

    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [showCart, setShowCart] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerNote, setCustomerNote] = useState("");
    const [tableNumber, setTableNumber] = useState("");
    const [orderType, setOrderType] = useState("dine-in"); // dine-in, takeaway, delivery
    const [showOrderForm, setShowOrderForm] = useState(false);

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
            return [...prev, { ...item, qty: 1, note: "" }];
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

    const updateItemNote = (id, note) => {
        setCart((prev) =>
            prev.map((item) => (item.id === id ? { ...item, note } : item))
        );
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((c) => c.id !== id));
    };

    const clearCart = () => {
        setCart([]);
        setShowCart(false);
        setShowOrderForm(false);
    };

    // Calculate totals
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
    );

    // Format currency
    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID").format(price);
    };

    // Get current date & time
    const getDateTime = () => {
        const now = new Date();
        const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        };
        return now.toLocaleDateString(
            lang === "id" ? "id-ID" : "en-US",
            options
        );
    };

    // Order type labels
    const orderTypeLabels = {
        "dine-in": lang === "id" ? "🍽 Makan di Tempat" : "🍽 Dine In",
        takeaway: lang === "id" ? "🥡 Bawa Pulang" : "🥡 Takeaway",
        delivery: lang === "id" ? "🚚 Delivery" : "🚚 Delivery",
    };

    // Generate WhatsApp message template
    const generateWhatsAppMessage = () => {
        const storeName = settings.storeName || "Store";
        const dateTime = getDateTime();

        // Header
        let message =
            lang === "id" ? `🛒 *PESANAN BARU*\n` : `🛒 *NEW ORDER*\n`;

        message += `━━━━━━━━━━━━━━━━━━\n`;
        message += `🏪 *${storeName}*\n`;
        message += `📅 ${dateTime}\n`;
        message += `━━━━━━━━━━━━━━━━━━\n\n`;

        // Customer info
        if (customerName) {
            message +=
                lang === "id"
                    ? `👤 *Nama:* ${customerName}\n`
                    : `👤 *Name:* ${customerName}\n`;
        }

        message += `📋 *${orderTypeLabels[orderType]}*\n`;

        if (orderType === "dine-in" && tableNumber) {
            message +=
                lang === "id"
                    ? `💺 *No. Meja:* ${tableNumber}\n`
                    : `💺 *Table No:* ${tableNumber}\n`;
        }

        message += `\n`;

        // Order items
        message +=
            lang === "id" ? `📝 *DETAIL PESANAN:*\n` : `📝 *ORDER DETAILS:*\n`;
        message += `━━━━━━━━━━━━━━━━━━\n`;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.qty;
            message += `\n${index + 1}. *${item.name}*\n`;
            message += `   ${item.qty}x @ Rp ${formatPrice(item.price)}\n`;
            message += `   = Rp ${formatPrice(itemTotal)}\n`;

            if (item.note) {
                message += `   📝 _${item.note}_\n`;
            }
        });

        message += `\n━━━━━━━━━━━━━━━━━━\n`;

        // Total
        message += `💰 *TOTAL: Rp ${formatPrice(
            totalPrice
        )}* (${totalItems} item)\n`;
        message += `━━━━━━━━━━━━━━━━━━\n`;

        // Additional notes
        if (customerNote) {
            message += `\n📌 *${
                lang === "id" ? "Catatan Tambahan" : "Additional Notes"
            }:*\n`;
            message += `${customerNote}\n`;
        }

        // Footer
        message += `\n━━━━━━━━━━━━━━━━━━\n`;
        message +=
            lang === "id"
                ? `🙏 Terima kasih telah memesan!\n`
                : `🙏 Thank you for ordering!\n`;
        message +=
            lang === "id"
                ? `_Pesan ini dikirim melalui BookletKu_`
                : `_Sent via BookletKu_`;

        return message;
    };

    // Send to WhatsApp
    const orderViaWhatsApp = () => {
        const stripVS16 = (text) => text.replace(/\uFE0F/g, "");
        const message = stripVS16(generateWhatsAppMessage());

        const phoneNumber = "6285157680550"; // TANPA +

        const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
            message
        )}`;

        window.open(waUrl, "_blank");
    };

    // Quick order (tanpa form detail)
    const quickOrder = () => {
        setShowOrderForm(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-40">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
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
                                <h1 className="text-xl font-bold flex items-center gap-2">
                                    <Store size={20} />
                                    {settings.storeName}
                                </h1>
                                <p className="text-green-100 text-xs">
                                    {t.tagline}
                                </p>
                            </div>
                        </div>

                        {/* Cart button in header */}
                        {cart.length > 0 && (
                            <button
                                onClick={() => setShowCart(!showCart)}
                                className="relative p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                            >
                                <ShoppingCart size={22} />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                    {totalItems}
                                </span>
                            </button>
                        )}
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
                          ? "bg-white text-green-600"
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
                        <p className="text-gray-500">
                            {t.noResults || "No items found"}
                        </p>
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

            {/* Floating Cart Button (Mobile) */}
            {cart.length > 0 && !showCart && (
                <button
                    onClick={() => setShowCart(true)}
                    className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all animate-bounce z-40"
                >
                    <ShoppingCart size={24} />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                        {totalItems}
                    </span>
                </button>
            )}

            {/* Cart Panel */}
            {showCart && cart.length > 0 && (
                <div
                    className="fixed inset-0 bg-black/50 z-50"
                    onClick={() => setShowCart(false)}
                >
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden animate-slideUp"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Cart Header */}
                        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <ShoppingCart
                                    size={20}
                                    className="text-green-600"
                                />
                                {lang === "id" ? "Keranjang" : "Cart"} (
                                {totalItems})
                            </h3>
                            <button
                                onClick={() => setShowCart(false)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="overflow-y-auto max-h-[50vh] p-4 space-y-3">
                            {cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-gray-50 rounded-xl p-3"
                                >
                                    <div className="flex gap-3">
                                        {/* Item Image */}
                                        {item.photo && (
                                            <img
                                                src={item.photo}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                        )}

                                        {/* Item Details */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 truncate">
                                                {item.name}
                                            </h4>
                                            <p className="text-green-600 font-bold text-sm">
                                                Rp {formatPrice(item.price)}
                                            </p>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <button
                                                    onClick={() =>
                                                        updateQty(item.id, -1)
                                                    }
                                                    className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg hover:bg-gray-100"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="font-medium w-8 text-center">
                                                    {item.qty}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQty(item.id, 1)
                                                    }
                                                    className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg hover:bg-gray-100"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        removeFromCart(item.id)
                                                    }
                                                    className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Item Note */}
                                    <input
                                        type="text"
                                        value={item.note || ""}
                                        onChange={(e) =>
                                            updateItemNote(
                                                item.id,
                                                e.target.value
                                            )
                                        }
                                        placeholder={
                                            lang === "id"
                                                ? "+ Tambah catatan (contoh: pedas, tanpa sayur)"
                                                : "+ Add note (e.g. spicy, no vegetables)"
                                        }
                                        className="w-full mt-2 px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Order Form */}
                        {showOrderForm && (
                            <div className="border-t p-4 bg-gray-50 space-y-3">
                                <h4 className="font-medium text-gray-900">
                                    {lang === "id"
                                        ? "📋 Detail Pesanan"
                                        : "📋 Order Details"}
                                </h4>

                                {/* Customer Name */}
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) =>
                                        setCustomerName(e.target.value)
                                    }
                                    placeholder={
                                        lang === "id"
                                            ? "Nama Anda"
                                            : "Your Name"
                                    }
                                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                />

                                {/* Order Type */}
                                <div className="flex gap-2">
                                    {Object.entries(orderTypeLabels).map(
                                        ([key, label]) => (
                                            <button
                                                key={key}
                                                onClick={() =>
                                                    setOrderType(key)
                                                }
                                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                                    orderType === key
                                                        ? "bg-green-500 text-white"
                                                        : "bg-white border hover:border-green-500"
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        )
                                    )}
                                </div>

                                {/* Table Number (for dine-in) */}
                                {orderType === "dine-in" && (
                                    <input
                                        type="text"
                                        value={tableNumber}
                                        onChange={(e) =>
                                            setTableNumber(e.target.value)
                                        }
                                        placeholder={
                                            lang === "id"
                                                ? "Nomor Meja"
                                                : "Table Number"
                                        }
                                        className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                )}

                                {/* Additional Note */}
                                <textarea
                                    value={customerNote}
                                    onChange={(e) =>
                                        setCustomerNote(e.target.value)
                                    }
                                    placeholder={
                                        lang === "id"
                                            ? "Catatan tambahan..."
                                            : "Additional notes..."
                                    }
                                    rows={2}
                                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                />
                            </div>
                        )}

                        {/* Cart Footer */}
                        <div className="sticky bottom-0 bg-white border-t p-4 space-y-3">
                            {/* Total */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        {lang === "id"
                                            ? "Total Pembayaran"
                                            : "Total Payment"}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        Rp {formatPrice(totalPrice)}
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        setShowOrderForm(!showOrderForm)
                                    }
                                    className="text-sm text-green-600 flex items-center gap-1"
                                >
                                    {showOrderForm ? (
                                        <ChevronDown size={16} />
                                    ) : (
                                        <ChevronUp size={16} />
                                    )}
                                    {lang === "id"
                                        ? "Detail Pesanan"
                                        : "Order Details"}
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={clearCart}
                                    className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    <Trash2
                                        size={20}
                                        className="text-gray-500"
                                    />
                                </button>
                                <button
                                    onClick={orderViaWhatsApp}
                                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
                                >
                                    <MessageCircle size={20} />
                                    {lang === "id"
                                        ? "Pesan via WhatsApp"
                                        : "Order via WhatsApp"}
                                    <Send size={16} />
                                </button>
                            </div>

                            {/* Clear Cart */}
                            <button
                                onClick={clearCart}
                                className="w-full py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                {lang === "id"
                                    ? "Kosongkan Keranjang"
                                    : "Clear Cart"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomerView;
