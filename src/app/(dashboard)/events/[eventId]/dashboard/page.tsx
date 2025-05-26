"use client";

import React from 'react';
import { useParams } from 'next/navigation';

import { ActivityFeed } from '@/components/features/collaboration/ActivityFeed';
import { LivePresence } from '@/components/features/collaboration/LivePresence';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EventDashboardPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  if (!eventId) {
    return <div className="container mx-auto p-4">Loading event details...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Event Dashboard</h1>
        <p className="text-muted-foreground">
          Overview and real-time activity for Event ID: <span className="font-semibold text-foreground">{eventId}</span>
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Event Details & Stats (Placeholder)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed event information, RSVP summaries, and management tools would go here.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold">Total RSVPs</h4>
                    <p className="text-2xl">125</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold">Tasks Pending</h4>
                    <p className="text-2xl">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <ActivityFeed eventId={eventId} />
        </div>

        <div className="lg:col-span-1 space-y-8">
          <LivePresence eventId={eventId} />
           <Card>
            <CardHeader>
              <CardTitle>Quick Actions (Placeholder)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">Send Reminder to All</Button>
              <Button variant="outline" className="w-full">Export Guest List</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
