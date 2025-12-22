import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

export interface PromoCode {
  id: number;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
  applicableTo: string;
  createdAt: string;
  updatedAt: string;
}

export const getActivePromos = async (limit?: number): Promise<PromoCode[]> => {
  const response = await axios.get(`${API_URL}/promo/active`, {
    params: { limit }
  });
  return response.data;
};

export const validatePromoCode = async (code: string): Promise<{ valid: boolean; promo?: PromoCode; message?: string }> => {
  const response = await axios.post(`${API_URL}/promo/validate`, { code });
  return response.data;
};

export const getAllPromos = async (): Promise<PromoCode[]> => {
  const response = await axios.get(`${API_URL}/promo`);
  return response.data;
};

