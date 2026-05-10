import { supabase } from "@/integrations/ibb/client";

const GUEST_USER_KEY = "ibb_guest_user_id";
const GUEST_SESSION_KEY = "ibb_guest_session_token";

export interface GuestUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  session_token: string | null;
}

/**
 * Get or create a guest user for the current session
 * Persists guest_user_id in localStorage to reuse across page refreshes
 */
export const getOrCreateGuestUser = async (
  guestInfo: { name: string; email: string; phone: string }
): Promise<GuestUser> => {
  // Check if we have an existing guest_user_id in localStorage
  const existingGuestId = localStorage.getItem(GUEST_USER_KEY);
  
  if (existingGuestId) {
    // Verify the guest user still exists and update their info
    const { data: existingGuest, error } = await supabase
      .from("guest_users")
      .select("*")
      .eq("id", existingGuestId)
      .maybeSingle();
    
    if (!error && existingGuest) {
      // Update guest info if changed
      const { data: updatedGuest, error: updateError } = await supabase
        .from("guest_users")
        .update({
          name: guestInfo.name,
          email: guestInfo.email,
          phone: guestInfo.phone,
          last_seen_at: new Date().toISOString(),
        })
        .eq("id", existingGuestId)
        .select()
        .single();
      
      if (!updateError && updatedGuest) {
        return updatedGuest as GuestUser;
      }
    }
    // If guest not found, clear localStorage and create new
    localStorage.removeItem(GUEST_USER_KEY);
    localStorage.removeItem(GUEST_SESSION_KEY);
  }
  
  // Create a new guest user
  const sessionToken = crypto.randomUUID();
  
  const { data: newGuest, error } = await supabase
    .from("guest_users")
    .insert({
      name: guestInfo.name,
      email: guestInfo.email,
      phone: guestInfo.phone,
      session_token: sessionToken,
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create guest user: ${error.message}`);
  }
  
  // Persist to localStorage
  localStorage.setItem(GUEST_USER_KEY, newGuest.id);
  localStorage.setItem(GUEST_SESSION_KEY, sessionToken);
  
  return newGuest as GuestUser;
};

/**
 * Get the current guest user ID from localStorage
 */
export const getCurrentGuestUserId = (): string | null => {
  return localStorage.getItem(GUEST_USER_KEY);
};

/**
 * Get the current guest session token from localStorage
 */
export const getCurrentGuestSessionToken = (): string | null => {
  return localStorage.getItem(GUEST_SESSION_KEY);
};

/**
 * Clear guest user data from localStorage
 */
export const clearGuestUser = (): void => {
  localStorage.removeItem(GUEST_USER_KEY);
  localStorage.removeItem(GUEST_SESSION_KEY);
};

/**
 * Check if user is currently a guest
 */
export const isGuestUser = (): boolean => {
  return !!localStorage.getItem(GUEST_USER_KEY);
};
