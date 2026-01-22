import { LucideIcon } from "lucide-react";

/**
 * StatsCard Component - Neo Brutalism Style
 * Hiển thị một thống kê với icon, giá trị và label
 */
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
}: StatsCardProps) => {
  return (
    <div
      className="bg-white border-4 border-black p-6"
      style={{ boxShadow: "8px 8px 0px 0px #000" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-600 uppercase mb-1">
            {title}
          </p>
          <p className="text-3xl font-black text-black mb-2">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {trend && (
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 font-bold text-xs ${trend.isPositive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
                }`}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
        <div className="bg-yellow-100 p-3 border-4 border-black">
          <Icon className="w-6 h-6 text-black" strokeWidth={3} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;

