import { Zap, Droplets, Paintbrush, HardHat, Sparkles, Wrench, Hammer, Wind, Truck, Home, MoreHorizontal } from "lucide-react";

const iconMap = {
  electrician: Zap,
  plumber: Droplets,
  painter: Paintbrush,
  builder: HardHat,
  cleaner: Sparkles,
  mechanic: Wrench,
  carpenter: Hammer,
  ac_repair: Wind,
  moving_help: Truck,
  home_repair: Home,
  other: MoreHorizontal,
};

const colorMap = {
  electrician: "bg-yellow-100 text-yellow-700",
  plumber: "bg-blue-100 text-blue-700",
  painter: "bg-purple-100 text-purple-700",
  builder: "bg-orange-100 text-orange-700",
  cleaner: "bg-emerald-100 text-emerald-700",
  mechanic: "bg-slate-100 text-slate-700",
  carpenter: "bg-amber-100 text-amber-700",
  ac_repair: "bg-cyan-100 text-cyan-700",
  moving_help: "bg-indigo-100 text-indigo-700",
  home_repair: "bg-rose-100 text-rose-700",
  other: "bg-gray-100 text-gray-700",
};

export default function CategoryIcon({ category, size = "w-10 h-10", iconSize = "w-5 h-5" }) {
  const Icon = iconMap[category] || MoreHorizontal;
  const colors = colorMap[category] || "bg-gray-100 text-gray-700";
  
  return (
    <div className={`${size} rounded-xl ${colors} flex items-center justify-center`}>
      <Icon className={iconSize} />
    </div>
  );
}