import * as Icons from "lucide-react";
import { ServiceItem } from "@/data/services";

interface ServiceCardProps {
  service: ServiceItem;
  onAdd: (service: ServiceItem) => void;
}

const iconMap: Record<string, keyof typeof Icons> = {
  Sofa: "Sofa",
  Square: "Square",
  Armchair: "Armchair",
  ChefHat: "ChefHat",
  BedDouble: "BedDouble",
  AirVent: "AirVent",
  Car: "Car",
  Circle: "Circle",
  Baby: "Baby",
  Layers: "Layers",
  ShoppingCart: "ShoppingCart",
  Box: "Box",
  Plane: "Plane",
  Church: "Church",
  Lamp: "Lamp",
  Smile: "Smile",
  Sparkles: "Sparkles",
  Droplets: "Droplets",
};

const isUrl = (str: string) =>
  str.startsWith("http://") || str.startsWith("https://") || str.startsWith("/");

const ServiceCard = ({ service, onAdd }: ServiceCardProps) => {
  const showImage = service.icon && isUrl(service.icon);
  const iconName = !showImage ? (iconMap[service.icon] || "Box") : "Box";
  const IconComponent = !showImage
    ? (Icons[iconName] as React.ComponentType<{ className?: string; strokeWidth?: number }>)
    : null;

  return (
    <button
      onClick={() => onAdd(service)}
      className="group flex flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-primary hover:shadow-xl hover:-translate-y-1 active:scale-95"
    >
      {showImage ? (
        <img
          src={service.icon}
          alt={service.name}
          className="h-14 w-14 object-contain transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        IconComponent && <IconComponent className="h-14 w-14 text-primary transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
      )}
      <span className="text-[14px] font-extrabold tracking-wide text-slate-800 uppercase text-center mt-2">{service.name}</span>
    </button>
  );
};

export default ServiceCard;
