import { Zap, Droplets, Paintbrush, HardHat, Sparkles, Wrench, Wind, Truck, Home, MoreHorizontal, Scissors, Car, Camera, Smartphone, Waves, BedDouble, BookOpen, GraduationCap } from "lucide-react";

const iconMap = {
  electrician: Zap,
  plumber: Droplets,
  painter: Paintbrush,
  builder: HardHat,
  cleaner: Sparkles,
  mechanic: Wrench,
  barber: Scissors,
  car_workshop: Car,
  cctv_installation: Camera,
  phone_repair: Smartphone,
  appliance_repair: Waves,
  ac_repair: Wind,
  moving_help: Truck,
  home_repair: Home,
  car_towing: Truck,
  heavy_vehicle_rental: Truck,
  housekeeping: BedDouble,
  language_courses: BookOpen,
  tutoring: GraduationCap,
  other: MoreHorizontal,
};

const colorMap = {
  electrician: "bg-yellow-100 text-yellow-700",
  plumber: "bg-blue-100 text-blue-700",
  painter: "bg-purple-100 text-purple-700",
  builder: "bg-orange-100 text-orange-700",
  cleaner: "bg-emerald-100 text-emerald-700",
  mechanic: "bg-slate-100 text-slate-700",
  barber: "bg-pink-100 text-pink-700",
  car_workshop: "bg-zinc-100 text-zinc-700",
  cctv_installation: "bg-gray-100 text-gray-700",
  phone_repair: "bg-sky-100 text-sky-700",
  appliance_repair: "bg-teal-100 text-teal-700",
  ac_repair: "bg-cyan-100 text-cyan-700",
  moving_help: "bg-indigo-100 text-indigo-700",
  home_repair: "bg-rose-100 text-rose-700",
  car_towing: "bg-amber-100 text-amber-700",
  heavy_vehicle_rental: "bg-lime-100 text-lime-700",
  housekeeping: "bg-orange-100 text-orange-700",
  language_courses: "bg-violet-100 text-violet-700",
  tutoring: "bg-blue-100 text-blue-700",
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