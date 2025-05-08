// src/features/roommate-matching/types.ts
export interface User {
    id: number;
    username: string;
    email: string;
  }
  
  export interface UserProfile {
    id: number;
    user: User;
    first_name: string;
    last_name: string;
    age: number | null;
    gender: string;
    interests: string;
    course_major: string;
    bio: string;
    profile_picture: string | null;
    date_joined: string;
  }
  
  export interface RoommateProfile {
    id: number;
    user_profile: UserProfile;
    SmokingRooms_preference: string;
    drinking_preference: string;
    sleep_habits: string;
    study_habits: string;
    guests_preference: string;
    cleanliness_level: number;
    max_rent_budget: number | null;
    preferred_move_in_date: string | null;
  }
  
  export interface MatchRequest {
    id: number;
    sender: number;
    receiver: number;
    sender_detail: User;
    receiver_detail: User;
    status: 'pending' | 'accepted' | 'rejected';
    message: string;
    created_at: string;
    updated_at: string;
  }
  export type MatchStatus = 'none' | 'pending' | 'accepted' | 'rejected';

  export interface MatchProfile {
    user: User;
    profile: UserProfile;
    roommate_profile: RoommateProfile;
    compatibility_score: number;
    match_status: MatchStatus;
  }
  
  export interface Message {
    id: string;
    content: string;
    sender: number; // User ID
    timestamp: string;
    read?: boolean;
  }
  