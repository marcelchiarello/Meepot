import { LocationData } from "@/components/features/events/MapboxLocationPicker"; // Import the specific type

export type Location = LocationData; // Use the more detailed type from Mapbox picker

export enum EventType {
  CONFERENCE = "conference",
  WORKSHOP = "workshop",
  MEETUP = "meetup",
  WEBINAR = "webinar",
  PARTY = "party",
  OTHER = "other",
}

export enum EventCategory {
  TECH = "technology",
  BUSINESS = "business",
  ART = "art",
  MUSIC = "music",
  SPORTS = "sports",
  FOOD = "food",
  LIFESTYLE = "lifestyle",
  CHARITY = "charity",
  OTHER = "other",
}

export enum EventStatus {
  PLANNED = "planned",
  CONFIRMED = "confirmed",
  CANCELED = "canceled",
  COMPLETED = "completed",
  POSTPONED = "postponed",
}

export enum EventVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
  UNLISTED = "unlisted", // Or "link_only"
}

export interface Participant {
  userId: string; // Assuming users have IDs
  status: "attending" | "maybe" | "not_attending" | "pending_approval";
  registeredAt: Date;
}

export interface Invitation {
  id: string;
  eventId: string;
  email: string; // For personal email invitations, or identifier for other types
  type: InvitationType;
  status: InvitationStatus;
  token: string; // Unique token for this specific invitation, used in links
  expiresAt?: Date;
  maxAcceptedUsers?: number; // For group/hierarchical links
  acceptedCount: number;
  requiresApproval: boolean; // Inherited from event or specific to invitation type
  emailVerified?: boolean; // Added for email verification status, defaults to false
  history?: Array<{ action: string; timestamp: Date; actorId?: string }>; // For tracking invitation lifecycle
  
  // Hierarchical fields
  parentId?: string | null; 
  canInviteOthers?: boolean; 
  maxSubInvites?: number | null;
  subInvitesCount?: number;
  customMessage?: string; // For personalized messages

  createdAt: Date;
  updatedAt: Date;
}

export enum InvitationType {
  PERSONAL = 'personal',
  GROUP = 'group', // Generic group link
  PUBLIC = 'public', // Anyone can use, potentially with limits
  PRIVATE_LINK = 'private_link', // A specific link for a known group/purpose but not tied to one email
  HIERARCHICAL = 'hierarchical', // For multi-level/viral invitations
}

export enum InvitationStatus {
  PENDING = 'pending', // Draft, not yet sent
  SENT = 'sent', // Email dispatched
  DELIVERED = 'delivered', // Email confirmed delivered (if tracking)
  OPENED = 'opened', // Email opened (if tracking)
  ACCEPTED = 'accepted', // User RSVP'd Yes
  DECLINED = 'declined', // User RSVP'd No
  WAITLISTED = 'waitlisted', // User wants to attend but event is full
  ERROR = 'error', // Problem sending/delivering
}


export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string; // User ID of assignee
  dueDate?: Date;
  completed: boolean;
}

export interface CostItem {
  id: string;
  name: string;
  amount: number;
  currency: string; // e.g., "USD", "EUR"
  paid: boolean;
}

export interface Event {
  id: string; // Unique identifier (e.g., UUID)
  title: string;
  description: string;
  date: Date; // Start date and time of the event
  endDate?: Date; // Optional end date and time
  location: Location; // Updated to use LocationData
  organizer: string; // User ID of the organizer
  type: EventType;
  category: EventCategory;
  status: EventStatus;
  visibility: EventVisibility;
  maxGuests?: number; // Optional maximum number of guests
  currentGuestCount?: number; // Calculated based on accepted RSVPs
  allowWaitlist?: boolean; // Defaults to true
  requiresApproval: boolean; // True if participants need approval to join
  costs?: CostItem[]; // Optional list of event costs
  tasks?: Task[]; // Optional list of tasks for organizing the event
  participants?: Participant[];
  invitations?: Invitation[];
  tags?: string[]; // Optional tags for discoverability
  bannerImage?: string; // URL to a banner image (for existing events)
  bannerImageFile?: File | null; // For new image uploads
  recurrenceRule?: RecurrenceRule | null; // Optional recurrence rule
  createdAt: Date;
  updatedAt: Date;
}

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type DayOfWeek = 'SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // e.g., repeats every 1 week, or every 2 months
  daysOfWeek?: DayOfWeek[]; // Optional, for weekly/monthly
  dayOfMonth?: number; // Optional, for monthly (e.g., the 15th)
  // monthOfYear?: number; // Optional, for yearly (e.g., 1 for January) - Can be complex, consider simplifying or deferring
  endDate?: string | null; // ISO string for date (optional, date when recurrence stops)
  count?: number | null; // Optional, number of occurrences
}
