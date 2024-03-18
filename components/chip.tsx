import React from "react";

interface ChipProps {
  label: string;
  color?: "red" | "green" | "gray";
}

export default function Chip({ label, color = "gray" }: ChipProps) {
  const getColorClass = () => {
    switch (color) {
      case "red":
        return "bg-red-100 text-red-800";
      case "green":
        return "bg-green-100 text-green-800";
      case "gray":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getColorClass()} mr-2 mb-2`}
    >
      {label}
    </span>
  );
}
