"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Using Avatar

interface LivePresenceProps {
  eventId: string;
}

export function LivePresence({ eventId }: LivePresenceProps) {
  // Mock data for users currently viewing/editing
  // In a real app, this would come from a real-time service (e.g., WebSockets, Supabase Realtime, Firebase Realtime DB)
  const mockPresence = [
    { id: 'user1', name: 'Alice Wonderland', status: 'Editing', avatarFallback: 'AW', avatarUrl: '/avatars/alice.png' }, // Assuming you have placeholder avatar images
    { id: 'user2', name: 'Bob The Builder', status: 'Viewing', avatarFallback: 'BB', avatarUrl: '/avatars/bob.png' },
    { id: 'user-you', name: 'You', status: 'Viewing', avatarFallback: 'U', avatarUrl: '/avatars/you.png'  },
    { id: 'user4', name: 'Charlie Brown', status: 'Viewing', avatarFallback: 'CB', avatarUrl: '/avatars/charlie.png'  },
    { id: 'user5', name: 'Diana Prince', status: 'Idle', avatarFallback: 'DP', avatarUrl: '/avatars/diana.png'  },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Presence</CardTitle>
        <CardDescription>Users currently active on this event ({eventId}).</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        {mockPresence.map(user => (
          <div 
            key={user.id} 
            className="flex flex-col items-center space-y-1 p-2 rounded-md hover:bg-accent/20 transition-colors" 
            title={`${user.name} - ${user.status}`}
          >
            <Avatar className="h-12 w-12 border-2 border-muted-foreground/50">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.avatarFallback}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{user.name.split(' ')[0]}</span> {/* Display first name */}
            <Badge 
              variant={
                user.status === 'Editing' ? 'destructive' : 
                user.status === 'Viewing' ? 'secondary' : 
                'outline'
              } 
              className="text-[10px] px-1.5 py-0.5"
            >
              {user.status}
            </Badge>
          </div>
        ))}
         {mockPresence.length === 0 && <p className="text-sm text-muted-foreground">No other users currently active.</p>}
      </CardContent>
    </Card>
  );
}
