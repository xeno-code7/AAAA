import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    GripVertical,
    Edit2,
    Trash2,
    Eye,
    Image as ImageIcon,
} from "lucide-react";
import { TrendingBadge, PopularBadge } from "./Badge";
import { useLanguage } from "../contexts/LanguageContext";

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

                <p className="text-blue-600 font-bold text-sm mt-0.5">
                    Rp {item.price.toLocaleString("id-ID")}
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
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                title={t.editItem}
                            >
                                <Edit2 size={12} className="text-blue-500" />
                            </button>
                            <button
                                onClick={() => onDelete(item.id)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
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

// Simple version without drag (for customer view)
export function MenuCardSimple({ item, onClick }) {
    const { t } = useLanguage();

    const isPopular = item.views > 80 && item.views <= 150;
    const isTrending = item.views > 150;

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl border overflow-hidden cursor-pointer hover:shadow-md active:scale-95 transition-all"
        >
            <div className="relative h-24 bg-gradient-to-br from-gray-100 to-gray-200">
                {item.photo ? (
                    <img
                        src={item.photo}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={24} className="text-gray-300" />
                    </div>
                )}

                <div className="absolute top-1.5 left-1.5">
                    {isTrending && <TrendingBadge label={t.trending} />}
                    {isPopular && <PopularBadge label={t.popularItem} />}
                </div>
            </div>

            <div className="p-2.5">
                <h3 className="font-medium text-sm text-gray-900 truncate">
                    {item.name}
                </h3>
                <p className="text-blue-600 font-bold text-sm mt-0.5">
                    Rp {item.price.toLocaleString("id-ID")}
                </p>
            </div>
        </div>
    );
}

export default MenuCard;
