// Defines the structure for an activity log entry.

export type ActivityTargetType = 'event' | 'task' | 'expense' | 'invitation' | 'rsvp' | 'comment' | 'participant';

export interface ActivityLog {
  id: string; // Unique identifier for the log entry
  eventId: string; // ID of the event this activity pertains to
  timestamp: Date; // When the activity occurred
  userId: string; // User who performed the action (name or ID)
  
  // A more structured action type might be beneficial in a real system
  // e.g., { type: 'CREATE', entity: 'TASK', entityId: 'task-123' }
  // For now, a string is fine for simulation.
  action: string; // e.g., "created_event", "updated_task_status", "added_expense", "guest_rsvp_accepted"
  
  details?: string; // e.g., "Task 'Buy Decorations' marked as DONE", "Expense 'Dinner' for $50 added"
  
  targetType?: ActivityTargetType; // The type of entity that was affected
  targetId?: string; // The ID of the entity that was affected
  
  // Optional: For changes, can store previous value snippet or diff link
  // previousState?: Partial<any>; 
  // currentState?: Partial<any>;
}

// Example action strings (can be expanded)
export const ActivityActions = {
  EVENT_CREATED: "event_created",
  EVENT_UPDATED: "event_updated",
  TASK_CREATED: "task_created",
  TASK_UPDATED: "task_updated", // e.g., status change, assignment
  TASK_DELETED: "task_deleted",
  EXPENSE_CREATED: "expense_created",
  EXPENSE_APPROVED: "expense_approved",
  EXPENSE_REJECTED: "expense_rejected",
  INVITATION_SENT: "invitation_sent",
  INVITATION_LINK_CREATED: "invitation_link_created",
  RSVP_SUBMITTED: "rsvp_submitted", // Guest action
  RSVP_APPROVED: "rsvp_approved", // Organizer action
  COMMENT_ADDED: "comment_added",
  PARTICIPANT_JOINED: "participant_joined",
};
