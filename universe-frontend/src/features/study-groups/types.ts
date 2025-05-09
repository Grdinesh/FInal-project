// src/features/study-groups/types.ts
export interface StudyGroup {
    id: number;
    name: string;
    description: string;
    course: string;
    subject_tags: string[];
    creator: number;
    created_at: string;
  }
  
  export interface GroupMembership {
    id: number;
    group: number;
    user: number;
    is_accepted: boolean;
    requested_at: string;
  }
  
  export interface GroupMessage {
    id: number;
    group: number;
    sender: SenderUser;
    content: string;
    timestamp: string;
  }
  
  export interface SenderUser {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    profile_picture?: string | null;
  }
  