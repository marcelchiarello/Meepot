// Defines the structure for a Task related to an event.

export enum TaskCategory {
  FOOD = 'food',
  DRINKS = 'drinks',
  SUPPLIES = 'supplies',
  ACTIVITIES = 'activities',
  LOGISTICS = 'logistics', // e.g., setup, cleanup, transportation
  COMMUNICATION = 'communication', // e.g., sending reminders, social media
  OTHER = 'other',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  CANCELLED = 'cancelled',
  BLOCKED = 'blocked', // If a task is blocked by another
}

export interface Task {
  id: string; // Unique identifier for the task
  eventId: string; // ID of the event this task belongs to
  
  title: string;
  description?: string;
  category: TaskCategory;
  status: TaskStatus;
  
  assignedTo?: string[]; // Array of user IDs or names assigned to the task
  
  volunteerSlots?: number; // Number of volunteers needed/allowed
  volunteers?: string[]; // Array of user IDs or names who volunteered
  
  estimatedCost?: number;
  actualCost?: number;
  paidBy?: string; // User ID or name of the person who paid
  
  dueDate?: Date | null; // Can be null if no specific due date
  
  // For sub-tasks or dependencies, if needed in future
  // parentTaskId?: string; 
  // dependsOnTaskIds?: string[];

  createdAt: Date;
  updatedAt: Date;
}

// For form data, before ID generation and with Date potentially as string
export type TaskFormData = Omit<Task, 'id' | 'eventId' | 'createdAt' | 'updatedAt' | 'volunteers' | 'subInvitesCount'> & {
  dueDate?: string | null; // Date from form input might be string
  // assignedTo could be a string of comma-separated emails/names initially
};
