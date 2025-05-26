"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; 
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarPlus } from 'lucide-react'; // Icons for calendar buttons
import { Invitation, InvitationType, InvitationStatus as MockInvitationStatus } from '@/types/event'; 
import { RSVP, RSVPStatus } from '@/types/rsvp';

// Mock invitation data
const mockInvitations: Invitation[] = [
  {
    id: 'inv-123-personal', eventId: 'event-abc-1', email: 'invited.guest@example.com',
    type: InvitationType.PERSONAL, status: MockInvitationStatus.SENT, token: 'personal-token-123',
    acceptedCount: 0, requiresApproval: false, createdAt: new Date(), updatedAt: new Date(),
    customMessage: "We'd love to see you there!",
  },
  {
    id: 'inv-456-approval', eventId: 'event-xyz-2', email: 'vip.guest@example.com',
    type: InvitationType.PERSONAL, status: MockInvitationStatus.SENT, token: 'approval-token-456',
    acceptedCount: 0, requiresApproval: true, createdAt: new Date(), updatedAt: new Date(),
    customMessage: "Your presence is requested, approval needed.",
  },
  {
    id: 'inv-789-link', eventId: 'event-def-3', email: 'Link User', 
    type: InvitationType.PRIVATE_LINK, status: MockInvitationStatus.PENDING, token: 'link-token-789',
    acceptedCount: 0, requiresApproval: false, maxAcceptedUsers: 50, createdAt: new Date(), updatedAt: new Date(),
  }
];

// Mock event details
const mockEventDetails: Record<string, { title: string; date: Date; endDate?: Date; location?: string; description?: string; requiresApproval?: boolean }> = {
  'event-abc-1': { 
    title: 'Grand Gala Dinner', 
    date: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), 
    endDate: new Date(new Date().getTime() + (30 * 24 * 60 * 60 * 1000) + (2 * 60 * 60 * 1000)), 
    location: 'The Grand Ballroom, 123 Main St, Anytown',
    description: 'Join us for an evening of elegance and celebration.'
  },
  'event-xyz-2': { 
    title: 'Exclusive VIP Meetup', 
    date: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000), 
    requiresApproval: true,
    location: 'The Penthouse Suite, Luxe Hotel',
    description: 'An exclusive gathering for our VIP members.'
  },
  'event-def-3': { 
    title: 'Community Workshop', 
    date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000) + (3 * 60 * 60 * 1000)), 
    location: 'Community Center, Room A',
    description: 'Learn new skills and connect with your neighbors.'
  },
};

const rsvpFormSchema = z.object({
  guestName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  status: z.nativeEnum(RSVPStatus, { required_error: "Please select your RSVP status." }),
  plusOne: z.boolean().default(false),
  plusOneName: z.string().optional(),
  dietaryRestrictions: z.string().max(500, "Too long!").optional(),
  otherPreferences: z.string().max(500, "Too long!").optional(),
}).refine(data => !data.plusOne || (data.plusOne && data.plusOneName && data.plusOneName.length >= 2), {
  message: "Plus one's name must be at least 2 characters if bringing a guest.",
  path: ["plusOneName"],
});

type RsvpFormValues = z.infer<typeof rsvpFormSchema>;

export default function RsvpPage() {
  const params = useParams();
  const router = useRouter();
  const invitationToken = params.invitationToken as string;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [eventDetail, setEventDetail] = useState<{ title: string; date: Date; endDate?: Date; location?: string; description?: string; requiresApproval?: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRsvpStatus, setSubmittedRsvpStatus] = useState<RSVPStatus | null>(null);

  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: {
      guestName: '',
      status: undefined, 
      plusOne: false,
      plusOneName: '',
      dietaryRestrictions: '',
      otherPreferences: '',
    },
  });

  const rsvpStatus = form.watch("status");
  const bringingPlusOne = form.watch("plusOne");

  useEffect(() => {
    setIsLoading(true);
    const foundInvitation = mockInvitations.find(inv => inv.token === invitationToken);
    if (foundInvitation) {
      setInvitation(foundInvitation);
      const event = mockEventDetails[foundInvitation.eventId];
      setEventDetail(event || null);
      form.reset({ 
        guestName: foundInvitation.type === InvitationType.PERSONAL ? (foundInvitation.email.includes('@') ? foundInvitation.email.split('@')[0] : foundInvitation.email) : '', 
        status: undefined,
        plusOne: false,
        plusOneName: '',
        dietaryRestrictions: '',
        otherPreferences: '',
      });
    } else {
      toast.error("Invitation not found or invalid.");
    }
    setIsLoading(false);
  }, [invitationToken, form, router]);

  const onSubmitRsvp = (data: RsvpFormValues) => {
    if (!invitation || !eventDetail) return;
    setIsSubmitting(true);

    let finalStatus = data.status;
    const needsApproval = invitation.requiresApproval || eventDetail.requiresApproval;
    if (data.status === RSVPStatus.ACCEPTED && needsApproval) {
      finalStatus = RSVPStatus.PENDING_APPROVAL;
    }

    const rsvpData: RSVP = {
      id: uuidv4(),
      invitationId: invitation.id,
      eventId: invitation.eventId,
      guestName: data.guestName,
      status: finalStatus,
      plusOne: data.plusOne,
      plusOneName: data.plusOne ? data.plusOneName : undefined,
      dietaryRestrictions: data.dietaryRestrictions,
      otherPreferences: data.otherPreferences,
      respondedAt: new Date(),
      needsApproval: needsApproval && data.status === RSVPStatus.ACCEPTED,
    };

    console.log("RSVP Submitted:", rsvpData);
    setTimeout(() => {
      setIsSubmitting(false);
      if (finalStatus === RSVPStatus.PENDING_APPROVAL) {
        toast.success("Thank you for your RSVP! Your response is pending approval.");
      } else if (finalStatus === RSVPStatus.ACCEPTED) {
        toast.success("Thank you for your RSVP! We look forward to seeing you.");
        setSubmittedRsvpStatus(RSVPStatus.ACCEPTED); 
      } else {
        toast.info("Thank you for your response.");
        setSubmittedRsvpStatus(finalStatus); 
      }
    }, 1000);
  };

  const handleAddToCalendar = (calendarType: 'google' | 'apple' | 'outlook') => {
    if (!eventDetail || !invitation) return;
    const title = encodeURIComponent(eventDetail.title);
    // Ensure dates are in UTC for .ics or Google links, then format as YYYYMMDDTHHMMSSZ
    // For simplicity, using local time here. Proper .ics generation is more complex.
    const startTime = eventDetail.date.toISOString().replace(/-|:|\.\d{3}/g, "");
    const endTime = eventDetail.endDate ? eventDetail.endDate.toISOString().replace(/-|:|\.\d{3}/g, "") : startTime;
    const description = encodeURIComponent(eventDetail.description || invitation.customMessage || '');
    const location = encodeURIComponent(eventDetail.location || '');

    console.log(`Attempting to generate ${calendarType} calendar event for event "${eventDetail.title}" / invitation token "${invitation.token}"`);
    toast.info(`Placeholder: Add to ${calendarType} Calendar functionality. Event: ${title}, Start: ${startTime}, End: ${endTime}, Location: ${location}, Desc: ${description}`);
  };

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading invitation...</div>;
  }

  if (!invitation || !eventDetail) {
    return <div className="container mx-auto p-4 text-center text-destructive">This invitation link is invalid or has expired.</div>;
  }

  const isRsvpSubmittedAndAccepted = submittedRsvpStatus === RSVPStatus.ACCEPTED;

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">You're Invited!</CardTitle>
          <CardDescription>to</CardDescription>
          <h1 className="text-4xl font-bold text-primary">{eventDetail.title}</h1>
          <p className="text-muted-foreground mt-2">
            {new Date(eventDetail.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' at '}
            {new Date(eventDetail.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
          {invitation.customMessage && (
            <p className="mt-4 text-lg italic text-foreground/80">"{invitation.customMessage}"</p>
          )}
        </CardHeader>
        <CardContent>
          {!isRsvpSubmittedAndAccepted ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitRsvp)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="guestName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl><Input placeholder="Please enter your full name" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Will you attend?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                          disabled={isSubmitting}
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value={RSVPStatus.ACCEPTED} /></FormControl>
                            <FormLabel className="font-normal">Yes, I'll be there!</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value={RSVPStatus.DECLINED} /></FormControl>
                            <FormLabel className="font-normal">No, I can't make it</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {rsvpStatus === RSVPStatus.ACCEPTED && (
                  <>
                    <FormField
                      control={form.control}
                      name="plusOne"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Are you bringing a Plus One?</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    {bringingPlusOne && (
                      <FormField
                        control={form.control}
                        name="plusOneName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plus One's Name</FormLabel>
                            <FormControl><Input placeholder="Name of your guest" {...field} disabled={isSubmitting} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="dietaryRestrictions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dietary Restrictions (Optional)</FormLabel>
                          <FormControl><Textarea placeholder="Any allergies or dietary needs?" {...field} disabled={isSubmitting} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="otherPreferences"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Other Preferences or Notes (Optional)</FormLabel>
                          <FormControl><Textarea placeholder="Anything else we should know?" {...field} disabled={isSubmitting} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                <Button type="submit" className="w-full" disabled={isSubmitting || !rsvpStatus}>
                  {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="text-center space-y-6 py-8">
              <h2 className="text-2xl font-semibold">Thank you for RSVPing!</h2>
              {submittedRsvpStatus === RSVPStatus.ACCEPTED && <p className="text-muted-foreground">Your spot is confirmed for {eventDetail.title}.</p> }
              
              {submittedRsvpStatus === RSVPStatus.ACCEPTED && (
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-xl font-medium">Add to Calendar</h3>
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <Button variant="outline" onClick={() => handleAddToCalendar('google')}>
                            <CalendarPlus className="mr-2 h-4 w-4" /> Google Calendar
                        </Button>
                        <Button variant="outline" onClick={() => handleAddToCalendar('apple')}>
                            <CalendarPlus className="mr-2 h-4 w-4" /> Apple Calendar
                        </Button>
                        <Button variant="outline" onClick={() => handleAddToCalendar('outlook')}>
                            <CalendarPlus className="mr-2 h-4 w-4" /> Outlook Calendar
                        </Button>
                    </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
