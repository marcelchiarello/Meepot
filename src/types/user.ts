// Defines the structure for a user profile.

export interface UserProfile {
  userId: string; 
  displayName: string;
  bio?: string;
  avatarUrl?: string; // URL to user's avatar image
  interests?: string[];
  
  // Simplified representation of past events
  pastEventsAttended?: Array<{ 
    eventId: string; 
    eventTitle: string; 
    date: Date; 
  }>;
  
  // List of user IDs who are friends with this user
  friendIds?: string[]; 
  
  // Could also include:
  // location?: string;
  // socialLinks?: Record<string, string>; // e.g., { twitter: 'url', linkedin: 'url' }
  // joinedDate: Date;
}

// Example mock user data (can be moved to a dedicated mock file later)
export const mockUserProfiles: Record<string, UserProfile> = {
  "user-alice-123": {
    userId: "user-alice-123",
    displayName: "Alice Wonderland",
    bio: "Curiouser and curiouser! Event enthusiast and tea party expert.",
    avatarUrl: "/avatars/alice.png", // Placeholder path
    interests: ["Tea Parties", "Rabbit Holes", "Logic Puzzles", "Gardening"],
    pastEventsAttended: [
      { eventId: "event-mad-tea-party", eventTitle: "Mad Hatter's Tea Party", date: new Date(2023, 3, 10) },
      { eventId: "event-croquet-game", eventTitle: "Queen's Croquet Game", date: new Date(2023, 5, 22) },
    ],
    friendIds: ["user-bob-456", "user-charlie-789"],
  },
  "user-bob-456": {
    userId: "user-bob-456",
    displayName: "Bob The Builder",
    bio: "Can we fix it? Yes, we can! Loves construction-themed events and workshops.",
    avatarUrl: "/avatars/bob.png", // Placeholder path
    interests: ["Construction", "DIY Projects", "Workshops", "Team Building"],
    pastEventsAttended: [
      { eventId: "event-buildcon-2023", eventTitle: "BuildCon 2023", date: new Date(2023, 8, 15) },
      { eventId: "event-diy-workshop", eventTitle: "DIY Home Repair Workshop", date: new Date(2023, 10, 5) },
    ],
    friendIds: ["user-alice-123"],
  },
  "user-charlie-789": {
    userId: "user-charlie-789",
    displayName: "Charlie Brown",
    bio: "Good grief! Enjoys quiet gatherings and kite flying competitions (if they go well).",
    avatarUrl: "/avatars/charlie.png", // Placeholder path
    interests: ["Kite Flying", "Baseball", "Philosophy", "Dog Shows"],
    pastEventsAttended: [
      { eventId: "event-kite-festival", eventTitle: "Annual Kite Festival", date: new Date(2023, 6, 19) },
    ],
    friendIds: ["user-alice-123"],
  },
  "user-diana-000": { // A user who attended an event with Alice
    userId: "user-diana-000",
    displayName: "Diana Prince",
    bio: "Advocate for peace and justice. Enjoys cultural festivals and historical talks.",
    avatarUrl: "/avatars/diana.png",
    interests: ["History", "Mythology", "Diplomacy", "Art"],
    pastEventsAttended: [
      { eventId: "event-croquet-game", eventTitle: "Queen's Croquet Game", date: new Date(2023, 5, 22) }, // Same event as Alice
      { eventId: "event-ancient-history-con", eventTitle: "Ancient History Convention", date: new Date(2023, 9, 1) },
    ],
    friendIds: [],
  },
   "user-edward-111": { // Another user who attended an event with Alice
    userId: "user-edward-111",
    displayName: "Edward Scissorhands",
    bio: "Creative soul with a knack for topiary and ice sculpting.",
    avatarUrl: "/avatars/edward.png", // Placeholder
    interests: ["Sculpting", "Gardening", "Art", "Quiet Contemplation"],
    pastEventsAttended: [
      { eventId: "event-croquet-game", eventTitle: "Queen's Croquet Game", date: new Date(2023, 5, 22) }, // Same event as Alice
    ],
    friendIds: [],
  }
};
