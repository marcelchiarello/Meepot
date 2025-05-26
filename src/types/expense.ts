// Defines structures for expense tracking and settlement.

// Represents a single expense item.
export interface Expense {
  id: string;
  eventId: string;
  description: string;
  amount: number;
  currency: string; // e.g., 'USD', 'EUR'
  paidBy: string; // participantId or name of the person who paid
  date: Date;
  category?: string; // e.g., 'food', 'transport', 'decorations'
  receiptImageUrl?: string; // URL or path to an uploaded receipt image
  
  splitMethod: 'equal' | 'percentage' | 'itemized' | 'exact_amounts';
  
  // Details of how the expense is split among participants.
  // The structure of each item in this array depends on `splitMethod`.
  splitDetails: Array<{ 
    participantId: string; // ID of the participant involved in the split
    amount?: number;        // Used for 'itemized' or 'exact_amounts'
    percentage?: number;    // Used for 'percentage' (e.g., 0.5 for 50%)
  }>;
  
  // isApproved: boolean; // Replaced by approvalStatus
  approvalStatus: 'pending' | 'approved' | 'rejected'; // New field for approval workflow
  receiptImageFile?: File | null; // For handling file upload in form state

  createdAt: Date;
  updatedAt: Date;
}

// Represents a debt or credit relationship between two participants.
export interface Balance {
  fromParticipantId: string;
  toParticipantId: string;
  amount: number;
  currency: string; // Ensure currency consistency
}

// Represents a participant's net balance for the event.
// Positive means they are owed money, negative means they owe money.
export interface ParticipantNetBalance {
    participantId: string;
    netAmount: number; // Positive if owed, negative if owes
    currency: string;
}


// Placeholder for a single transaction in a settlement.
// This would typically involve a payment from one participant to another.
export interface Transaction {
  id: string;
  fromParticipantId: string;
  toParticipantId: string;
  amount: number;
  currency: string;
  date: Date;
  method?: string; // e.g., 'Cash', 'Bank Transfer', 'Venmo'
  status: 'pending' | 'completed' | 'failed';
}

// Placeholder for an optimized transfer instruction.
// This is derived from the balances to minimize the number of payments.
export interface Transfer {
  fromParticipantId: string;
  toParticipantId: string;
  amount: number;
  currency: string;
}

// Represents the overall settlement status and details for an event.
export interface Settlement {
  eventId: string;
  transactions: Transaction[]; // Record of actual payments made
  // Balances could be a list of Balance objects or a map as initially thought.
  // A list of Balance objects might be easier for direct display of who owes whom.
  finalBalances: Balance[]; 
  participantNetBalances: ParticipantNetBalance[]; // Net amount each participant owes or is owed
  optimizedTransfers: Transfer[]; // Suggested transfers to settle debts
  status: 'pending' | 'partial' | 'settled'; // Overall settlement status
  createdAt: Date;
  updatedAt: Date;
}

// For form data, before ID generation and with Date potentially as string
export type ExpenseFormData = Omit<Expense, 'id' | 'eventId' | 'createdAt' | 'updatedAt' | 'approvalStatus' | 'currency' | 'receiptImageUrl'> & {
  date: string; // Date from form input will be string
  receiptImageFile?: File | null; 
  // `splitDetails` will also be built up by the form
};
