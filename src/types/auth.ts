export type UserRole = "student" | "marker";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  created_at: string;
}
