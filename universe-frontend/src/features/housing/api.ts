import axios from 'axios';
import { HousingListing } from './types';


export async function fetchHousingListings(params: Record<string, string | number>) {
    const res =  axios.get('/api/housing/', { params });
    return (await res).data;
  }
  

export const fetchHousingById = async (id: number): Promise<HousingListing> => {
  const res = await axios.get(`/api/housing/${id}/`);
  return res.data;
};

export const createHousingListing = async (data: FormData): Promise<HousingListing> => {
    const res = await axios.post('/api/housing/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  };
  
  export const updateHousingListing = async (id: number, data: FormData): Promise<HousingListing> => {
    const res = await axios.patch(`/api/housing/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  };

  export const deleteHousingImage = async (imageId: number) => {
    await axios.delete(`/api/housing-images/${imageId}/`);
  };
  