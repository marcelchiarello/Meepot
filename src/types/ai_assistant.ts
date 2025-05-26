// Defines the structure for AI Assistant interactions.

// Assuming EventFormData is defined elsewhere and imported if needed
// For now, let's define a placeholder if it's not globally available for this type definition.
// Ideally, this would be: import { EventFormValues as EventFormData } from '@/components/features/events/EventForm';
export interface PlaceholderEventFormData {
  title?: string;
  description?: string;
  date?: string; // Assuming date is handled as string in form initially
  location?: { // Assuming location is an object with address, lat, lon
    address: string;
    latitude?: number;
    longitude?: number;
  } | string; // Or just a string for simple parsing
  eventType?: string; // e.g., from EventType enum
  maxGuests?: number;
  // Add other relevant fields from your EventFormValues
}


export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system'; // System messages for instructions or context
  content: string;
  timestamp: Date;
  
  // For AI to offer actionable buttons to the user
  suggestions?: Array<{ 
    label: string; 
    actionType: 'navigate_and_prefill' | 'clarify_event_details' | 'other'; // Define action types
    payload?: any; // Could be navigation path, prefill data, or other info
  }>;
  
  // If AI suggests pre-filling the event form directly from a message
  prefillData?: Partial<PlaceholderEventFormData>; 
}
