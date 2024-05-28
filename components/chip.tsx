import React from "react";

interface ChipProps {
  label: string;
  color?: "red" | "green" | "gray" | "yellow";
  className?: string;
  onClick?: () => void;
  border?: boolean;
}

export default function Chip({
  label,
  color = "gray",
  className,
  onClick,
  border = false,
}: ChipProps) {
  const getColorClass = () => {
    switch (color) {
      case "red":
        return "bg-red-100 text-red-800";
      case "green":
        return "bg-green-100 text-green-800";
      case "yellow":
        return "bg-yellow-100 text-yellow-800";
      case "gray":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBorderClass = () => {
    if (!border) return "";

    switch (color) {
      case "red":
        return "border-2 border-red-400";
      case "green":
        return "border-2 border-green-400";
      case "yellow":
        return "border-2 border-yellow-400";
      case "gray":
      default:
        return "border-2 border-gray-400";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getColorClass()} ${getBorderClass()} ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {label}
    </span>
  );
}
