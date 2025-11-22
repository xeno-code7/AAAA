import React from "react";
import { TrendingUp, Award } from "lucide-react";

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
            className={`
      inline-flex items-center gap-1 
      px-2 py-0.5 
      text-xs font-medium 
      rounded-full 
      ${variants[variant]}
    `}
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

export function CategoryBadge({ label }) {
    return <Badge variant="category">{label}</Badge>;
}

export default Badge;
