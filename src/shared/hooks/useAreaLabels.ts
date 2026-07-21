import { useEffect, useMemo, useState } from "react";
import { fetchDistricts, fetchProvinces } from "@/services/vnAddress";


export function useAreaLabels(provinceCodes: (string | null | undefined)[]) {
  const [provinces, setProvinces] = useState<Map<string, string>>(new Map());
  const [districts, setDistricts] = useState<Map<string, string>>(new Map());

  
  const wanted = useMemo(
    () => Array.from(new Set(provinceCodes.filter((c): c is string => !!c))).sort(),
    [provinceCodes],
  );
  const wantedKey = wanted.join(",");

  useEffect(() => {
    let alive = true;
    fetchProvinces()
      .then((list) => {
        if (alive) setProvinces(new Map(list.map((p) => [p.code, p.name])));
      })
      .catch(() => {
        
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!wantedKey) return;
    let alive = true;
    Promise.all(
      wantedKey.split(",").map((code) =>
        fetchDistricts(code).catch(() => []),
      ),
    ).then((lists) => {
      if (!alive) return;
      setDistricts((prev) => {
        const next = new Map(prev);
        for (const list of lists) for (const d of list) next.set(d.code, d.name);
        return next;
      });
    });
    return () => {
      alive = false;
    };
  }, [wantedKey]);

  
  return function areaLabel(
    provinceCode: string | null | undefined,
    districtCode: string | null | undefined,
  ): string | null {
    const parts = [
      districtCode ? districts.get(districtCode) : null,
      provinceCode ? provinces.get(provinceCode) : null,
    ].filter(Boolean);
    return parts.length ? parts.join(", ") : null;
  };
}
