import { useEffect, useMemo, useState } from "react";
import { fetchDistricts, fetchProvinces } from "@/services/vnAddress";

/**
 * Đổi mã hành chính (GSO) sang tên đọc được — "Quận 1, TP. Hồ Chí Minh".
 *
 * Backend chỉ lưu/trả MÃ tỉnh/quận (không có bảng tên trong DB), tên nằm ở dataset công khai
 * provinces.open-api.vn mà `services/vnAddress` đã bọc sẵn kèm cache theo tiến trình. Hook này
 * chỉ điều phối: nạp danh sách tỉnh một lần, và nạp quận/huyện cho ĐÚNG những tỉnh đang xuất
 * hiện trong danh sách (thường chỉ 1 tỉnh vì danh sách thợ đã lọc cùng tỉnh với khách).
 *
 * Tra cứu tên là tiện ích hiển thị: lỗi mạng thì trả về null và caller chỉ việc ẩn dòng khu vực,
 * không chặn luồng đặt lịch.
 */
export function useAreaLabels(provinceCodes: (string | null | undefined)[]) {
  const [provinces, setProvinces] = useState<Map<string, string>>(new Map());
  const [districts, setDistricts] = useState<Map<string, string>>(new Map());

  // Chuỗi hoá để làm dependency ổn định — mảng mới mỗi lần render sẽ gây vòng lặp nạp.
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
        /* không tra được tên tỉnh thì thôi, UI ẩn dòng khu vực */
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

  /** "Quận 1, TP. Hồ Chí Minh" — bỏ qua phần chưa tra được; null nếu không có gì để hiện. */
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
