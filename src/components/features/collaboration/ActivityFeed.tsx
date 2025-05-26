"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActivityLog, ActivityTargetType, ActivityActions } from '@/types/activity'; // Using existing types

interface ActivityFeedProps {
  eventId: string;
  initialActivities?: ActivityLog[];
}

const mockUsers = ["Alice", "Bob", "Charlie", "David", "Eve", "You"];
const mockActions = Object.values(ActivityActions);
const mockTargetTypes: ActivityTargetType[] = ['event', 'task', 'expense', 'invitation', 'rsvp'];
const mockTaskTitles = ["Book Venue", "Order Catering", "Send Reminders", "Setup Decorations", "Coordinate Volunteers"];
const mockExpenseDescriptions = ["Team Dinner", "Venue Deposit", "Marketing Materials", "Snacks & Drinks"];

const generateMockActivity = (eventId: string): ActivityLog => {
  const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
  const action = mockActions[Math.floor(Math.random() * mockActions.length)];
  const targetType = mockTargetTypes[Math.floor(Math.random() * mockTargetTypes.length)];
  let details = `User ${user} performed action ${action}.`;
  let targetId = `${targetType}-${uuidv4().substring(0,3)}`;

  switch (action) {
    case ActivityActions.TASK_UPDATED:
      const taskTitle = mockTaskTitles[Math.floor(Math.random() * mockTaskTitles.length)];
      const newStatus = ["TODO", "IN_PROGRESS", "DONE"][Math.floor(Math.random() * 3)];
      details = `${user} updated task "${taskTitle}" to ${newStatus}.`;
      targetId = taskTitle.toLowerCase().replace(/\s+/g, '-');
      break;
    case ActivityActions.EXPENSE_CREATED:
      const expenseDesc = mockExpenseDescriptions[Math.floor(Math.random() * mockExpenseDescriptions.length)];
      details = `${user} added expense "${expenseDesc}" for $${(Math.random() * 100 + 20).toFixed(2)}.`;
      targetId = expenseDesc.toLowerCase().replace(/\s+/g, '-');
      break;
    case ActivityActions.RSVP_SUBMITTED:
      details = `${user} RSVP'd for the event.`;
      targetId = `rsvp-${uuidv4().substring(0,3)}`;
      break;
    case ActivityActions.COMMENT_ADDED:
        details = `${user} added a comment: "Looks great!"`;
        targetId = `comment-${uuidv4().substring(0,3)}`;
        break;
  }

  return {
    id: uuidv4(),
    eventId,
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24)), // Within last 24 hours
    userId: user,
    action,
    details,
    targetType,
    targetId,
  };
};

const generateInitialMockActivities = (eventId: string, count: number): ActivityLog[] => {
    return Array.from({ length: count }, () => generateMockActivity(eventId))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};


export function ActivityFeed({ eventId, initialActivities }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLog[]>(() => initialActivities || generateInitialMockActivities(eventId, 5));
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterTargetType, setFilterTargetType] = useState<string>('');

  // Simulate new activities appearing
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance to add a new activity
        const newActivity = generateMockActivity(eventId);
        setActivities(prev => [newActivity, ...prev].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()));
        toast.info(`🎉 New Activity: ${newActivity.details || newActivity.action}`, { duration: 5000 });
      }
    }, 7000); // Add activity every 7 seconds
    return () => clearInterval(interval);
  }, [eventId]);

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const actionMatch = filterAction ? activity.action === filterAction : true;
      const targetTypeMatch = filterTargetType ? activity.targetType === filterTargetType : true;
      return actionMatch && targetTypeMatch;
    });
  }, [activities, filterAction, filterTargetType]);
  
  const uniqueActions = useMemo(() => [...new Set(activities.map(a => a.action))].sort(), [activities]);
  const uniqueTargetTypes = useMemo(() => [...new Set(activities.map(a => a.targetType).filter(Boolean) as string[])].sort(), [activities]);


  const simulateNewActivity = () => {
    const newActivity = generateMockActivity(eventId);
    setActivities(prev => [newActivity, ...prev].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()));
    toast.success(`Manually simulated: ${newActivity.details || newActivity.action}`);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Activity Feed</CardTitle>
                <CardDescription>Recent activities for event: {eventId}</CardDescription>
            </div>
            <Button onClick={simulateNewActivity} size="sm" variant="outline">Simulate New</Button>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by action..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Actions</SelectItem>
              {uniqueActions.map(action => <SelectItem key={action} value={action}>{action.replace(/_/g, ' ').toUpperCase()}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterTargetType} onValueChange={setFilterTargetType}>
            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by target type..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Target Types</SelectItem>
               {uniqueTargetTypes.map(type => <SelectItem key={type} value={type}>{type.toUpperCase()}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-[calc(100%-0px)] pr-4"> {/* Adjust height as needed */}
          {filteredActivities.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No activities match your filters.</p>
          ) : (
            <ul className="space-y-4">
              {filteredActivities.map((activity) => (
                <li key={activity.id} className="flex items-start space-x-3 pb-2 border-b border-border/50 last:border-b-0">
                  {/* Icon placeholder or user avatar could go here */}
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                    {activity.userId.substring(0,1)}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.userId}</span>{' '}
                      {activity.action.replace(/_/g, ' ')}
                      {activity.targetType && (
                        <>
                          {' on '}
                          <Badge variant="secondary" className="text-xs">{activity.targetType.toUpperCase()}</Badge>
                          {activity.targetId && <span className="text-muted-foreground text-xs ml-1">(ID: {activity.targetId.substring(0,8)})</span>}
                        </>
                      )}
                    </p>
                    {activity.details && <p className="text-xs text-muted-foreground mt-0.5">{activity.details}</p>}
                    <p className="text-xs text-muted-foreground/80 mt-1" title={format(activity.timestamp, 'PPpp')}>
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
