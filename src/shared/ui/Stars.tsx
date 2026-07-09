import { Star } from "lucide-react";

interface StarsProps {
  rating: number;
  size?: "sm" | "md";
}

export function Stars({ rating, size = "sm" }: StarsProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${size === "sm" ? "w-3 h-3" : "w-4 h-4"} ${
            s <= Math.floor(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-gray-200 fill-gray-200"
          }`}
        />
      ))}
    </div>
  );
}
