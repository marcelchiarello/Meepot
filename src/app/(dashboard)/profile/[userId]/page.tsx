"use client";

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserProfile, mockUserProfiles } from '@/types/user'; // Import mock data and type
import { UserPlus, Users, MessageCircle } from 'lucide-react';

// Helper to get mock user data
const getMockUser = (userId: string): UserProfile | undefined => {
  return mockUserProfiles[userId];
};

// Helper to get friends' profiles (mock)
const getMockFriends = (friendIds: string[] | undefined): UserProfile[] => {
  if (!friendIds) return [];
  return friendIds.map(id => mockUserProfiles[id]).filter(Boolean) as UserProfile[];
};

// Helper to get users who attended the same event (mock)
const getMockMutualAttendees = (currentUser: UserProfile, eventId: string): UserProfile[] => {
  if (!currentUser || !eventId) return [];
  return Object.values(mockUserProfiles).filter(
    (profile) =>
      profile.userId !== currentUser.userId && // Not the current user
      !currentUser.friendIds?.includes(profile.userId) && // Not already a friend
      profile.pastEventsAttended?.some((event) => event.eventId === eventId)
  );
};


export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const userProfile = getMockUser(userId);

  if (!userProfile) {
    return <div className="container mx-auto p-4 text-center">User profile not found.</div>;
  }

  const friends = getMockFriends(userProfile.friendIds);
  const firstPastEvent = userProfile.pastEventsAttended?.[0];
  const mutualAttendees = firstPastEvent ? getMockMutualAttendees(userProfile, firstPastEvent.eventId) : [];

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/80 to-secondary/80" /> {/* Profile Banner Placeholder */}
        <CardHeader className="flex flex-col items-center text-center -mt-16 space-y-2">
          <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
            <AvatarImage src={userProfile.avatarUrl || `/avatars/default.png`} alt={userProfile.displayName} />
            <AvatarFallback>{userProfile.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="pt-2">
            <CardTitle className="text-3xl font-bold">{userProfile.displayName}</CardTitle>
            {userProfile.bio && <CardDescription className="mt-1 text-lg text-muted-foreground">{userProfile.bio}</CardDescription>}
          </div>
           <div className="pt-2">
            <Button variant="outline" disabled>
              <UserPlus className="mr-2 h-4 w-4" /> Add Friend (Placeholder)
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 mt-4">
          {userProfile.interests && userProfile.interests.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mb-3 text-primary">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {userProfile.interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="text-sm px-3 py-1">
                    {interest}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          <Separator />

          {userProfile.pastEventsAttended && userProfile.pastEventsAttended.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mb-3 text-primary">Past Events Attended</h3>
              <ul className="space-y-3">
                {userProfile.pastEventsAttended.map((event) => (
                  <li key={event.eventId} className="p-3 bg-muted/50 rounded-md hover:bg-muted/80 transition-colors">
                    <Link href={`/events/${event.eventId}`} className="font-medium text-foreground hover:underline">
                      {event.eventTitle}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.date), 'PPP')}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Separator />
          
          <section>
            <h3 className="text-xl font-semibold mb-3 text-primary">Connections</h3>
            {friends.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {friends.map(friend => (
                  <Link key={friend.userId} href={`/profile/${friend.userId}`}>
                    <Card className="text-center p-3 hover:shadow-lg transition-shadow">
                      <Avatar className="h-16 w-16 mx-auto mb-2">
                        <AvatarImage src={friend.avatarUrl || `/avatars/default.png`} alt={friend.displayName} />
                        <AvatarFallback>{friend.displayName.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium">{friend.displayName}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No connections yet.</p>
            )}
             <Button variant="outline" className="mt-4" disabled>
                <Users className="mr-2 h-4 w-4" /> View All Friends (Placeholder)
            </Button>
          </section>

          {firstPastEvent && mutualAttendees.length > 0 && (
            <>
              <Separator />
              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">
                  People you might know from "{firstPastEvent.eventTitle}"
                </h3>
                <div className="space-y-3">
                  {mutualAttendees.slice(0, 3).map(attendee => ( // Show up to 3 suggestions
                    <Card key={attendee.userId} className="flex items-center justify-between p-3">
                       <Link href={`/profile/${attendee.userId}`} className="flex items-center space-x-3 group">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={attendee.avatarUrl || `/avatars/default.png`} alt={attendee.displayName} />
                          <AvatarFallback>{attendee.displayName.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium group-hover:underline">{attendee.displayName}</p>
                          {attendee.bio && <p className="text-xs text-muted-foreground truncate max-w-xs">{attendee.bio}</p>}
                        </div>
                      </Link>
                      <Button variant="outline" size="sm" disabled>
                        <UserPlus className="mr-1.5 h-3 w-3" /> Connect (Placeholder)
                      </Button>
                    </Card>
                  ))}
                </div>
              </section>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
