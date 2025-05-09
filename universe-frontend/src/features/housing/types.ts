// types.ts
export interface HousingListing {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  is_furnished: boolean;
  has_wifi: boolean;
  amenities: string;
  image?: string;
  latitude?: number;
  longitude?: number;
  posted_by: number;
  posted_date: string;
  seller_username: string;
  is_sold: boolean;
  average_rating: number;
}


export interface HousingMessage {
  id: number;
  item: number;
  sender: number;
  receiver: number;
  content: string;
  timestamp: string;
  sender_username: string;
  receiver_username: string;
}
