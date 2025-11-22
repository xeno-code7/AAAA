import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    GripVertical,
    Edit2,
    Trash2,
    Eye,
    Image as ImageIcon,
    Plus,
    TrendingUp,
    Award,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

// Badge Components
export function Badge({ children, variant = "default" }) {
    const variants = {
        default: "bg-gray-100 text-gray-800",
        popular:
            "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm",
        trending:
            "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm",
        category: "bg-blue-100 text-blue-700",
    };

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${variants[variant]}`}
        >
            {children}
        </span>
    );
}

export function PopularBadge({ label = "Popular" }) {
    return (
        <Badge variant="popular">
            <Award size={10} />
            {label}
        </Badge>
    );
}

export function TrendingBadge({ label = "Trending" }) {
    return (
        <Badge variant="trending">
            <TrendingUp size={10} />
            {label}
        </Badge>
    );
}

// Admin Menu Card (with drag & drop)
export function MenuCard({ item, onEdit, onDelete, isAdmin = true }) {
    const { t } = useLanguage();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1,
    };

    const isPopular = item.views > 80 && item.views <= 150;
    const isTrending = item.views > 150;

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID").format(price);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
        bg-white rounded-xl border overflow-hidden transition-all
        ${isDragging ? "shadow-2xl scale-105" : "hover:shadow-md"}
      `}
        >
            {/* Image */}
            <div className="relative h-28 bg-gradient-to-br from-gray-100 to-gray-200">
                {item.photo ? (
                    <img
                        src={item.photo}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                            e.target.style.display = "none";
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={32} className="text-gray-300" />
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-1.5 left-1.5">
                    {isTrending && <TrendingBadge label={t.trending} />}
                    {isPopular && <PopularBadge label={t.popularItem} />}
                </div>

                {/* Drag handle */}
                {isAdmin && (
                    <div
                        {...attributes}
                        {...listeners}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-white/90 rounded-lg cursor-grab active:cursor-grabbing hover:bg-white transition-colors"
                    >
                        <GripVertical size={14} className="text-gray-500" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-2.5">
                <h3
                    className="font-semibold text-gray-900 text-sm truncate"
                    title={item.name}
                >
                    {item.name}
                </h3>

                <p className="text-green-600 font-bold text-sm mt-0.5">
                    Rp {formatPrice(item.price)}
                </p>

                {item.description && (
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                        {item.description}
                    </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Eye size={10} />
                        {item.views} {t.views}
                    </span>

                    {isAdmin && (
                        <div className="flex gap-1">
                            <button
                                onClick={() => onEdit(item)}
                                className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                                title={t.editItem}
                            >
                                <Edit2 size={12} className="text-blue-500" />
                            </button>
                            <button
                                onClick={() => onDelete(item.id)}
                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                title={t.deleteItem}
                            >
                                <Trash2 size={12} className="text-red-500" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Customer Menu Card (simple, clickable)
export function MenuCardSimple({ item, onClick }) {
    const { t } = useLanguage();

    const isPopular = item.views > 80 && item.views <= 150;
    const isTrending = item.views > 150;

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID").format(price);
    };

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl border overflow-hidden cursor-pointer hover:shadow-lg active:scale-95 transition-all group"
        >
            {/* Image */}
            <div className="relative h-28 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {item.photo ? (
                    <img
                        src={item.photo}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                            e.target.style.display = "none";
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={32} className="text-gray-300" />
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-1.5 left-1.5">
                    {isTrending && <TrendingBadge label={t.trending} />}
                    {isPopular && <PopularBadge label={t.popularItem} />}
                </div>

                {/* Add to cart overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-green-500 text-white p-2 rounded-full shadow-lg">
                        <Plus size={20} />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {item.name}
                </h3>

                {item.description && (
                    <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">
                        {item.description}
                    </p>
                )}

                <div className="flex items-center justify-between mt-2">
                    <p className="text-green-600 font-bold">
                        Rp {formatPrice(item.price)}
                    </p>
                    <span className="text-xs text-gray-400 flex items-center gap-0.5">
                        <Eye size={10} />
                        {item.views}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default MenuCard;
