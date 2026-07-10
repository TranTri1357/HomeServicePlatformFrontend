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

/** Body for POST/PUT /api/customer/addresses. */
export interface AddressInput {
  addressLine: string;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}
