"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Download } from 'lucide-react'; // Added Download icon

import { Event, EventVisibility } from '@/types/event'; 
import { RSVP, RSVPStatus } from '@/types/rsvp';

interface RSVPManagerProps {
  eventId: string;
  initialEventDetails?: Partial<Event>; 
  initialRsvps?: RSVP[];
}

const generateMockEventDetails = (eventId: string): Event => ({
  id: eventId,
  title: 'Summer Tech Conference 2024',
  description: 'A conference about summer tech.',
  date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), 
  location: { address: '123 Tech Lane', latitude: 0, longitude: 0 },
  organizer: 'user-org-1',
  type: 'conference',
  category: 'technology',
  status: 'confirmed',
  visibility: EventVisibility.PRIVATE,
  maxGuests: 5, 
  currentGuestCount: 3, 
  allowWaitlist: true,
  requiresApproval: true, 
  createdAt: new Date(),
  updatedAt: new Date(),
});

const generateMockRsvps = (eventId: string): RSVP[] => [
  { 
    id: uuidv4(), eventId, invitationId: 'inv-aaa', userId: 'user-1', guestName: 'Alice Wonderland', 
    status: RSVPStatus.ACCEPTED, plusOne: true, plusOneName: 'Mad Hatter', respondedAt: new Date(), needsApproval: false 
  },
  { 
    id: uuidv4(), eventId, invitationId: 'inv-bbb', userId: 'user-2', guestName: 'Bob The Builder', 
    status: RSVPStatus.ACCEPTED, plusOne: false, respondedAt: new Date(), needsApproval: false 
  },
  { 
    id: uuidv4(), eventId, invitationId: 'inv-ccc', userId: 'user-3', guestName: 'Charlie Brown', 
    status: RSVPStatus.PENDING_APPROVAL, plusOne: false, respondedAt: new Date(), needsApproval: true 
  },
  { 
    id: uuidv4(), eventId, invitationId: 'inv-ddd', userId: 'user-4', guestName: 'Diana Prince', 
    status: RSVPStatus.PENDING_APPROVAL, plusOne: true, plusOneName: 'Steve Trevor', respondedAt: new Date(), needsApproval: true
  },
  { 
    id: uuidv4(), eventId, invitationId: 'inv-eee', userId: 'user-5', guestName: 'Edward Scissorhands', 
    status: RSVPStatus.DECLINED, plusOne: false, respondedAt: new Date(), needsApproval: false
  },
  { 
    id: uuidv4(), eventId, invitationId: 'inv-fff', userId: 'user-6', guestName: 'Fiona Gallagher', 
    status: RSVPStatus.WAITLISTED, plusOne: false, respondedAt: new Date(), needsApproval: false 
  },
];


export function RSVPManager({ eventId, initialEventDetails, initialRsvps }: RSVPManagerProps) {
  const [eventDetails, setEventDetails] = useState<Event>(() => initialEventDetails ? { ...generateMockEventDetails(eventId), ...initialEventDetails } : generateMockEventDetails(eventId));
  const [rsvps, setRsvps] = useState<RSVP[]>(() => initialRsvps || generateMockRsvps(eventId));

  useEffect(() => {
    const acceptedCount = rsvps.reduce((acc, rsvp) => {
      if (rsvp.status === RSVPStatus.ACCEPTED) {
        return acc + 1 + (rsvp.plusOne ? 1 : 0);
      }
      return acc;
    }, 0);
    setEventDetails(prev => ({ ...prev, currentGuestCount: acceptedCount }));
  }, [rsvps]);

  const rsvpSummary = useMemo(() => {
    const summary = {
      accepted: 0,
      declined: 0,
      pendingApproval: 0,
      waitlisted: 0,
      spotsRemaining: 0,
    };
    rsvps.forEach(rsvp => {
      if (rsvp.status === RSVPStatus.ACCEPTED) summary.accepted += (1 + (rsvp.plusOne ? 1 : 0));
      else if (rsvp.status === RSVPStatus.DECLINED) summary.declined++;
      else if (rsvp.status === RSVPStatus.PENDING_APPROVAL) summary.pendingApproval++;
      else if (rsvp.status === RSVPStatus.WAITLISTED) summary.waitlisted++;
    });
    summary.spotsRemaining = (eventDetails.maxGuests ?? Infinity) - summary.accepted;
    return summary;
  }, [rsvps, eventDetails.maxGuests]);


  const updateRsvpStatus = (rsvpId: string, newStatus: RSVPStatus) => {
    setRsvps(prevRsvps => 
      prevRsvps.map(rsvp => 
        rsvp.id === rsvpId ? { ...rsvp, status: newStatus, respondedAt: new Date() } : rsvp
      )
    );
  };

  const handleApproveRsvp = (rsvp: RSVP) => {
    const currentGuests = eventDetails.currentGuestCount || 0;
    const guestCountForThisRsvp = 1 + (rsvp.plusOne ? 1 : 0);

    if (eventDetails.maxGuests && (currentGuests + guestCountForThisRsvp) > eventDetails.maxGuests) {
      if (eventDetails.allowWaitlist) {
        updateRsvpStatus(rsvp.id, RSVPStatus.WAITLISTED);
        toast.info(`${rsvp.guestName} moved to waitlist as event is at capacity.`);
      } else {
        toast.error("Event at capacity. Cannot approve. Consider enabling waitlist or increasing capacity.");
      }
    } else {
      updateRsvpStatus(rsvp.id, RSVPStatus.ACCEPTED);
      toast.success(`${rsvp.guestName} approved and moved to accepted.`);
    }
  };

  const handleDenyRsvp = (rsvpId: string) => {
    updateRsvpStatus(rsvpId, RSVPStatus.DECLINED);
    toast.info(`RSVP denied.`);
  };

  const handleAcceptFromWaitlist = (rsvp: RSVP) => {
    const currentGuests = eventDetails.currentGuestCount || 0;
    const guestCountForThisRsvp = 1 + (rsvp.plusOne ? 1 : 0);
    
    if (eventDetails.maxGuests && (currentGuests + guestCountForThisRsvp) > eventDetails.maxGuests) {
      toast.error("Event still at capacity. Cannot accept from waitlist yet.");
    } else {
      updateRsvpStatus(rsvp.id, RSVPStatus.ACCEPTED);
      toast.success(`${rsvp.guestName} accepted from waitlist.`);
    }
  };
  
  const handleManualStatusChange = (rsvpId: string, newStatus: RSVPStatus) => {
    const rsvpToUpdate = rsvps.find(r => r.id === rsvpId);
    if (!rsvpToUpdate) return;

    let guestChange = 0;
    const rsvpGuestCount = 1 + (rsvpToUpdate.plusOne ? 1 : 0);

    if (rsvpToUpdate.status === RSVPStatus.ACCEPTED && newStatus !== RSVPStatus.ACCEPTED) {
        guestChange = -rsvpGuestCount;
    } else if (rsvpToUpdate.status !== RSVPStatus.ACCEPTED && newStatus === RSVPStatus.ACCEPTED) {
        if (eventDetails.maxGuests && ((eventDetails.currentGuestCount || 0) + guestChange + rsvpGuestCount) > eventDetails.maxGuests) {
            toast.error("Cannot change to Accepted, event would exceed capacity.");
            return;
        }
        guestChange = rsvpGuestCount;
    }
    
    updateRsvpStatus(rsvpId, newStatus);
    toast.info(`RSVP status for ${rsvpToUpdate.guestName} changed to ${newStatus}.`);
  };

  const getStatusBadgeVariant = (status: RSVPStatus) => {
    switch (status) {
      case RSVPStatus.ACCEPTED: return "success";
      case RSVPStatus.DECLINED: return "destructive";
      case RSVPStatus.PENDING_APPROVAL: return "warning";
      case RSVPStatus.WAITLISTED: return "info"; 
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>RSVP Summary for: {eventDetails.title}</CardTitle>
            <CardDescription>
              Capacity: {eventDetails.maxGuests ?? 'Unlimited'} | 
              Waitlist: {eventDetails.allowWaitlist ? 'Enabled' : 'Disabled'}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            console.log(`Organizer is exporting event ${eventId} ("${eventDetails.title}") to a calendar format.`);
            toast.info("Placeholder: Export event to calendar functionality.");
          }}>
            <Download className="mr-2 h-4 w-4" />
            Export Event
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center pt-4">
          <div><p className="text-2xl font-bold">{rsvpSummary.accepted}</p><p className="text-sm text-muted-foreground">Accepted</p></div>
          <div><p className="text-2xl font-bold">{rsvpSummary.declined}</p><p className="text-sm text-muted-foreground">Declined</p></div>
          <div><p className="text-2xl font-bold">{rsvpSummary.pendingApproval}</p><p className="text-sm text-muted-foreground">Pending Approval</p></div>
          <div><p className="text-2xl font-bold">{rsvpSummary.waitlisted}</p><p className="text-sm text-muted-foreground">Waitlisted</p></div>
          <div><p className="text-2xl font-bold text-primary">{rsvpSummary.spotsRemaining < 0 ? 0 : rsvpSummary.spotsRemaining}</p><p className="text-sm text-muted-foreground">Spots Remaining</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Received RSVPs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>+1</TableHead>
                <TableHead>Dietary</TableHead>
                <TableHead>Responded At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rsvps.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center">No RSVPs received yet.</TableCell></TableRow>
              )}
              {rsvps.map((rsvp) => (
                <TableRow key={rsvp.id}>
                  <TableCell className="font-medium">{rsvp.guestName}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(rsvp.status) as any}>{rsvp.status.replace('_', ' ').toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>{rsvp.plusOne ? (rsvp.plusOneName || 'Yes') : 'No'}</TableCell>
                  <TableCell className="truncate max-w-xs">{rsvp.dietaryRestrictions || 'N/A'}</TableCell>
                  <TableCell>{new Date(rsvp.respondedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    {rsvp.status === RSVPStatus.PENDING_APPROVAL && (
                      <>
                        <Button variant="outline" size="sm" className="mr-2" onClick={() => handleApproveRsvp(rsvp)}>Approve</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDenyRsvp(rsvp.id)}>Deny</Button>
                      </>
                    )}
                    {rsvp.status === RSVPStatus.WAITLISTED && (
                      <Button variant="outline" size="sm" onClick={() => handleAcceptFromWaitlist(rsvp)}>Accept from Waitlist</Button>
                    )}
                    {(rsvp.status === RSVPStatus.ACCEPTED || rsvp.status === RSVPStatus.DECLINED) && (
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           {rsvp.status !== RSVPStatus.ACCEPTED && <DropdownMenuItem onClick={() => handleManualStatusChange(rsvp.id, RSVPStatus.ACCEPTED)}>Mark as Accepted</DropdownMenuItem>}
                           {rsvp.status !== RSVPStatus.DECLINED && <DropdownMenuItem onClick={() => handleManualStatusChange(rsvp.id, RSVPStatus.DECLINED)}>Mark as Declined</DropdownMenuItem>}
                           {rsvp.status !== RSVPStatus.WAITLISTED && eventDetails.allowWaitlist && <DropdownMenuItem onClick={() => handleManualStatusChange(rsvp.id, RSVPStatus.WAITLISTED)}>Move to Waitlist</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
