/** A saved customer address — GET /api/customer/addresses. */
export interface CustomerAddress {
  addressId: number;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  addressLine: string;
  isDefault: boolean;
  latitude: number;
  longitude: number;
}
