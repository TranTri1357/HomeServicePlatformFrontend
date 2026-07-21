import { lazy } from "react";
import { Loader2 } from "lucide-react";





export const TechnicianMap = lazy(() =>
  import("@/pages/Technician/TechnicianMap").then((m) => ({ default: m.TechnicianMap })),
);


export function ScreenFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
}
