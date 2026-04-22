/**
 * Booking Status Flow Constants
 * 
 * Canonical flow:
 * pending_payment → pending_assignment → confirmed → in_progress → completed
 *                                                                → cancelled (from any state)
 */

export type BookingStatus = 
  | "pending_payment" 
  | "pending" 
  | "pending_assignment" 
  | "confirmed" 
  | "assigned" 
  | "in_progress" 
  | "completed" 
  | "cancelled";

/**
 * Defines which status transitions are allowed
 * Key: current status
 * Value: array of valid next statuses
 */
export const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending_payment: ["pending_assignment", "cancelled"],
  pending: ["pending_assignment", "cancelled"], // Legacy status
  pending_assignment: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled"],
  assigned: ["in_progress", "cancelled"], // Legacy status
  in_progress: ["completed", "cancelled"],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
};

/**
 * Status labels for display
 */
export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending_payment: "Pending Payment",
  pending: "Pending",
  pending_assignment: "Awaiting Assignment",
  confirmed: "Confirmed",
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

/**
 * Status colors for UI
 */
export const STATUS_COLORS: Record<BookingStatus, string> = {
  pending_payment: "bg-amber-500/20 text-amber-700 border-amber-500/30",
  pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  pending_assignment: "bg-indigo-500/20 text-indigo-700 border-indigo-500/30",
  confirmed: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  assigned: "bg-purple-500/20 text-purple-700 border-purple-500/30",
  in_progress: "bg-orange-500/20 text-orange-700 border-orange-500/30",
  completed: "bg-green-500/20 text-green-700 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-700 border-red-500/30",
};

/**
 * Check if a status transition is allowed
 */
export const isTransitionAllowed = (
  currentStatus: BookingStatus, 
  newStatus: BookingStatus
): boolean => {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  return allowed?.includes(newStatus) ?? false;
};

/**
 * Get the next recommended status based on current status
 */
export const getNextStatus = (currentStatus: BookingStatus): BookingStatus | null => {
  const transitions = ALLOWED_TRANSITIONS[currentStatus];
  // Return the first non-cancelled transition
  return transitions?.find(s => s !== "cancelled") || null;
};

/**
 * Authority mapping - who can set each status
 */
export const STATUS_AUTHORITY: Record<BookingStatus, "system" | "admin" | "driver"> = {
  pending_payment: "system",
  pending: "system",
  pending_assignment: "system", // Set after payment
  confirmed: "admin", // Admin confirms after assigning driver/vehicle
  assigned: "admin",
  in_progress: "driver", // Driver starts the trip
  completed: "driver", // Driver completes the trip
  cancelled: "admin", // Admin or system can cancel
};
