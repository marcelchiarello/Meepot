"use client";

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For mock data
import { toast } from 'sonner';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Task, TaskCategory, TaskStatus } from '@/types/task';
import { UserPlus, CheckCircle, Zap } from 'lucide-react'; // Icons

interface EventTaskListParticipantViewProps {
  eventId: string;
  currentParticipantId: string; // e.g., "participant-user-123" or "Alice"
  initialTasks?: Task[];
}

// Mock initial data - adapted from TaskCreator
const generateMockTasks = (eventId: string): Task[] => [
  {
    id: uuidv4(), eventId, title: 'Decorate Main Hall', category: TaskCategory.SUPPLIES, status: TaskStatus.TODO,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), createdAt: new Date(), updatedAt: new Date(),
    assignedTo: ['Organizer Team'], volunteerSlots: 5, volunteers: ['Bob', 'Charlie'], estimatedCost: 150,
    description: "Set up banners, balloons, and table centerpieces in the main hall before the event starts."
  },
  {
    id: uuidv4(), eventId, title: 'Welcome Guests at Entrance', category: TaskCategory.LOGISTICS, status: TaskStatus.IN_PROGRESS,
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), createdAt: new Date(), updatedAt: new Date(),
    assignedTo: ['Anna'], volunteerSlots: 2, volunteers: ['participant-user-123'], // currentParticipant is a volunteer
    description: "Greet guests, check tickets (if any), and guide them to the cloakroom or main area."
  },
  {
    id: uuidv4(), eventId, title: 'Manage Refreshment Stand', category: TaskCategory.FOOD, status: TaskStatus.TODO,
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), createdAt: new Date(), updatedAt: new Date(),
    assignedTo: ['Caterer Co.'], volunteerSlots: 3, volunteers: [], estimatedCost: 300,
    description: "Ensure refreshments are stocked and the area is clean during the event."
  },
  {
    id: uuidv4(), eventId, title: 'Post-Event Cleanup Crew', category: TaskCategory.LOGISTICS, status: TaskStatus.TODO,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), createdAt: new Date(), updatedAt: new Date(),
    assignedTo: [], volunteerSlots: 10, volunteers: ['David', 'Eve'],
    description: "Help with clearing tables, disposing of trash, and packing up event materials after the event concludes."
  },
   {
    id: uuidv4(), eventId, title: 'Photography for First Hour', category: TaskCategory.ACTIVITIES, status: TaskStatus.DONE,
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), createdAt: new Date(), updatedAt: new Date(),
    assignedTo: ['participant-user-123'], // currentParticipant is assigned
    description: "Capture photos of guests arriving and the initial setup."
  },
];

export function EventTaskListParticipantView({ eventId, currentParticipantId, initialTasks }: EventTaskListParticipantViewProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || generateMockTasks(eventId));

  const handleVolunteer = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          // Ensure not already a volunteer or assigned
          const isAlreadyInvolved = task.volunteers?.includes(currentParticipantId) || task.assignedTo?.includes(currentParticipantId);
          if (!isAlreadyInvolved && (task.volunteers?.length || 0) < (task.volunteerSlots || 0) ) {
            console.log(`Participant ${currentParticipantId} volunteered for task ${taskId}`);
            toast.success(`You have volunteered for "${task.title}"!`);
            return { ...task, volunteers: [...(task.volunteers || []), currentParticipantId] };
          } else if (isAlreadyInvolved) {
            toast.info(`You are already involved in "${task.title}".`);
          } else {
            toast.warning(`Sorry, no more volunteer slots available for "${task.title}".`);
          }
        }
        return task;
      })
    );
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus.IN_PROGRESS | TaskStatus.DONE) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          // Check if current participant is assigned or a volunteer
          const canUpdate = task.assignedTo?.includes(currentParticipantId) || task.volunteers?.includes(currentParticipantId);
          if (canUpdate) {
            console.log(`Participant ${currentParticipantId} marked task ${taskId} as ${newStatus}`);
            toast.success(`Task "${task.title}" marked as ${newStatus.replace('_', ' ')}.`);
            return { ...task, status: newStatus, updatedAt: new Date() };
          } else {
            toast.error("You are not authorized to update this task's status.");
          }
        }
        return task;
      })
    );
  };
  
  const getStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE: return "success";
      case TaskStatus.IN_PROGRESS: return "default";
      case TaskStatus.TODO: return "outline";
      case TaskStatus.CANCELLED: return "destructive";
      case TaskStatus.BLOCKED: return "warning";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle>Tasks for Event: {eventId}</CardTitle>
        <CardDescription>View tasks you can volunteer for or update if you are assigned/volunteering.</CardDescription>
      </CardHeader>

      {tasks.length === 0 && (
        <p className="text-muted-foreground text-center">No tasks available for this event yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => {
          const slotsOpen = (task.volunteerSlots || 0) - (task.volunteers?.length || 0);
          const isAssigned = task.assignedTo?.includes(currentParticipantId);
          const isVolunteer = task.volunteers?.includes(currentParticipantId);
          const canVolunteer = !isAssigned && !isVolunteer && slotsOpen > 0 && task.status !== TaskStatus.DONE && task.status !== TaskStatus.CANCELLED;
          const canUpdateStatus = (isAssigned || isVolunteer) && task.status !== TaskStatus.DONE && task.status !== TaskStatus.CANCELLED;

          return (
            <Card key={task.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <Badge variant={getStatusBadgeVariant(task.status)} className="w-fit">{task.status.replace('_',' ').toUpperCase()}</Badge>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                <Separator />
                <div>
                  <p className="text-xs font-semibold">Category: <span className="font-normal">{task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span></p>
                  {task.dueDate && <p className="text-xs font-semibold">Due: <span className="font-normal">{format(new Date(task.dueDate), 'PPp')}</span></p>}
                  {task.assignedTo && task.assignedTo.length > 0 && (
                    <p className="text-xs font-semibold">Assigned to: <span className="font-normal">{task.assignedTo.join(', ')}</span></p>
                  )}
                  {task.estimatedCost != null && (
                    <p className="text-xs font-semibold">Est. Cost: <span className="font-normal">${task.estimatedCost}</span></p>
                  )}
                </div>
                
                {task.volunteerSlots != null && task.volunteerSlots > 0 && (
                  <div>
                    <p className="text-sm font-semibold">Volunteers:</p>
                    {task.volunteers && task.volunteers.length > 0 ? (
                      <ul className="list-disc list-inside text-xs">
                        {task.volunteers.map(v => <li key={v}>{v === currentParticipantId ? `${v} (You)` : v}</li>)}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">No volunteers yet.</p>
                    )}
                    {slotsOpen > 0 && <p className="text-xs text-green-600 dark:text-green-400 font-medium">{slotsOpen} slot(s) open!</p>}
                    {slotsOpen <= 0 && task.volunteers?.length === task.volunteerSlots && <p className="text-xs text-muted-foreground">All volunteer slots filled.</p>}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                {canVolunteer && (
                  <Button size="sm" onClick={() => handleVolunteer(task.id)}>
                    <UserPlus className="mr-2 h-4 w-4" /> Volunteer
                  </Button>
                )}
                {isVolunteer && !isAssigned && task.status !== TaskStatus.DONE && (
                    <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">You volunteered!</Badge>
                )}

                {canUpdateStatus && (
                  <div className="flex gap-2">
                    {task.status !== TaskStatus.IN_PROGRESS && task.status !== TaskStatus.DONE && (
                       <Button variant="outline" size="sm" onClick={() => handleUpdateTaskStatus(task.id, TaskStatus.IN_PROGRESS)}>
                         <Zap className="mr-2 h-4 w-4" /> Mark In Progress
                       </Button>
                    )}
                    {task.status !== TaskStatus.DONE && (
                      <Button variant="outline" size="sm" onClick={() => handleUpdateTaskStatus(task.id, TaskStatus.DONE)}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Mark as Done
                      </Button>
                    )}
                  </div>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
