// Defines the structure for an RSVP response to an event invitation.

export enum RSVPStatus {
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  WAITLISTED = 'waitlisted', // If event is full and guest wants to be on waitlist
  PENDING_APPROVAL = 'pending_approval', // If RSVP requires organizer approval
}

export interface RSVP {
  id: string; // Unique identifier for the RSVP
  invitationId: string; // Links to the specific Invitation via its token or ID
  eventId: string; // ID of the event this RSVP is for
  
  userId?: string; // Optional: ID of the registered user, if applicable
  guestName: string; // Name of the primary guest responding
  
  status: RSVPStatus; // The RSVP status
  
  plusOne: boolean; // Whether the guest is bringing a +1 (defaults to false)
  plusOneName?: string; // Optional: Name of the +1 guest, if applicable
  
  dietaryRestrictions?: string; // Optional: Any dietary needs or restrictions
  otherPreferences?: string; // Optional: Other preferences or notes for the organizer
  
  respondedAt: Date; // Timestamp of when the RSVP was submitted/updated
  
  // This might be determined by the event settings or invitation type.
  // If true, the RSVP status will be 'pending_approval' until an organizer approves it.
  needsApproval?: boolean; 
}

// It might be useful to also have a type for the RSVP form data
// that can be slightly different from the stored RSVP object (e.g., before ID generation)
export type RSVPFormData = Omit<RSVP, 'id' | 'respondedAt' | 'eventId' | 'invitationId'> & {
  // Specific form fields that might not directly map, if any
};
