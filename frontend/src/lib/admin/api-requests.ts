import { API_ROUTER_URL } from '../api';
import type { LottieFile } from './types';

const getHeaders = () => {
  return {
    Authorization: `Bearer ${localStorage.getItem('access-token')}`,
  };
};

const BASE_URL = `${API_ROUTER_URL}/admin/lottie`;

export const getLottieFiles = async (): Promise<LottieFile[]> => {
  const response = await fetch(`${BASE_URL}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch lottie files');
  }

  return await response.json();
};
