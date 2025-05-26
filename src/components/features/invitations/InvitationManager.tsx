"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';

import QRCode from 'qrcode.react'; // Import QR Code generator
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'; // For QR code modal
import { toast } from 'sonner';
import { Invitation, InvitationStatus, InvitationType, EventVisibility } from '@/types/event';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'; // For actions
import { MoreHorizontal } from 'lucide-react'; // Icon for actions

interface InvitationManagerProps {
  eventId: string;
  eventVisibility: EventVisibility; 
  initialInvitations?: Invitation[]; 
}

const emailSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  customMessage: z.string().max(500, "Custom message too long (max 500 chars).").optional(),
  canInviteOthers: z.boolean().default(false).optional(),
  maxSubInvites: z.coerce.number().positive("Must be positive").optional().nullable(),
}).refine(data => !data.canInviteOthers || (data.canInviteOthers && data.maxSubInvites && data.maxSubInvites > 0), {
    message: "Max sub-invites must be a positive number if 'Can Invite Others' is checked.",
    path: ["maxSubInvites"],
});
type EmailFormValues = z.infer<typeof emailSchema>;

const shareableLinkSchema = z.object({
  linkAlias: z.string().optional(),
  customMessage: z.string().max(500, "Custom message too long (max 500 chars).").optional(), // Added customMessage
  maxAcceptedUsers: z.coerce.number().positive("Must be a positive number.").optional().nullable(),
  expiresAt: z.string().optional().nullable()
    .refine(val => !val || !isNaN(Date.parse(val)), { message: "Invalid date format." })
    .refine(val => !val || new Date(val) > new Date(), { message: "Expiration date must be in the future." }),
  requiresApproval: z.boolean().default(false),
  canInviteOthers: z.boolean().default(false).optional(),
  maxSubInvites: z.coerce.number().positive("Must be positive").optional().nullable(),
}).refine(data => !data.canInviteOthers || (data.canInviteOthers && data.maxSubInvites && data.maxSubInvites > 0), {
    message: "Max sub-invites must be a positive number if 'Can Invite Others' is checked.",
    path: ["maxSubInvites"],
});
type ShareableLinkFormValues = z.infer<typeof shareableLinkSchema>;

const subInvitationSchema = z.object({
  email: z.string().email({ message: "Invalid email address for sub-invite." }),
  customMessage: z.string().max(500, "Custom message too long (max 500 chars).").optional(),
});
type SubInvitationFormValues = z.infer<typeof subInvitationSchema>;


// Mock initial data - replace with API calls later
const generateMockInvitations = (eventId: string): Invitation[] => [
  {
    id: uuidv4(), eventId, email: 'john.doe@example.com', type: InvitationType.PERSONAL,
    status: InvitationStatus.ACCEPTED, token: uuidv4(), acceptedCount: 1, requiresApproval: false, emailVerified: true,
    canInviteOthers: true, maxSubInvites: 5, subInvitesCount: 1, customMessage: "Hey John, hope to see you there!",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 
  },
  { // Sub-invite for John
    id: uuidv4(), eventId, email: 'sub.john@example.com', type: InvitationType.HIERARCHICAL, parentId: invitations.find(inv => inv.email === 'john.doe@example.com')?.id, // This parentId might need to be set dynamically after john.doe is created if not hardcoded
    status: InvitationStatus.SENT, token: uuidv4(), acceptedCount: 0, requiresApproval: false, emailVerified: false, customMessage: "John thought you might like this.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), updatedAt: new Date(),
  },
  {
    id: uuidv4(), eventId, email: 'jane.smith@example.com', type: InvitationType.PERSONAL,
    status: InvitationStatus.SENT, token: uuidv4(), acceptedCount: 0, requiresApproval: false, emailVerified: false,
    canInviteOthers: false, 
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), updatedAt: new Date(),
  },
  { 
    id: 'public-event-link', eventId, email: 'Public Event Link', customMessage: "Join our public event!",
    type: InvitationType.PUBLIC,
    status: InvitationStatus.ACCEPTED, // Represents 'active' or 'available'
    token: `public-${eventId}`, // A predictable token or identifier
    acceptedCount: 0, // Not directly tracked per user here, but globally for event
    requiresApproval: false,
    emailVerified: true, // N/A but true for consistency
    createdAt: new Date(),
    updatedAt: new Date(),
  },
   {
    id: uuidv4(), eventId, email: 'Initial Private Link', type: InvitationType.PRIVATE_LINK,
    status: InvitationStatus.PENDING, token: uuidv4(), maxAcceptedUsers: 10, acceptedCount: 1, requiresApproval: false,
    canInviteOthers: true, maxSubInvites: 3, subInvitesCount: 0, // Hierarchical Data
    createdAt: new Date(), updatedAt: new Date(),
  }
].filter(inv => inv.type !== InvitationType.PUBLIC);


export function InvitationManager({ eventId, initialInvitations, eventVisibility }: InvitationManagerProps) {
  const getInitialInvitations = () => {
    let baseInvitations = initialInvitations || generateMockInvitations(eventId);
     // Simple fix for mock data parentId: find John Doe and assign his ID to sub.john
     const johnDoe = baseInvitations.find(inv => inv.email === 'john.doe@example.com');
     if (johnDoe) {
        const subJohn = baseInvitations.find(inv => inv.email === 'sub.john@example.com');
        if (subJohn) subJohn.parentId = johnDoe.id;
     }

    if (eventVisibility === EventVisibility.PUBLIC && !baseInvitations.find(inv => inv.type === InvitationType.PUBLIC)) {
      return [
        {
          id: `public-event-${eventId}`, eventId, email: 'Public Event Link', type: InvitationType.PUBLIC,
          status: InvitationStatus.ACCEPTED, token: `public-${eventId}`, acceptedCount: 0, 
          requiresApproval: false, emailVerified: true, createdAt: new Date(), updatedAt: new Date(),
        },
        ...baseInvitations
      ];
    }
    return baseInvitations;
  };

  const [invitations, setInvitations] = useState<Invitation[]>(getInitialInvitations());
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkLoading, setIsLinkLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState<string | null>(null); 
  const [selectedInvitations, setSelectedInvitations] = useState<Set<string>>(new Set());
  const [showSubInviteModal, setShowSubInviteModal] = useState<Invitation | null>(null);


  useEffect(() => { 
    setInvitations(getInitialInvitations());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventVisibility, eventId]); 


  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '', customMessage: '', canInviteOthers: false, maxSubInvites: undefined },
  });

  const shareableLinkForm = useForm<ShareableLinkFormValues>({
    resolver: zodResolver(shareableLinkSchema),
    defaultValues: {
      linkAlias: '', customMessage: '', maxAcceptedUsers: undefined, expiresAt: '', requiresApproval: false,
      canInviteOthers: false, maxSubInvites: undefined
    },
  });

  const subInvitationForm = useForm<SubInvitationFormValues>({
    resolver: zodResolver(subInvitationSchema),
    defaultValues: { email: '', customMessage: '' },
  });

  const handleSendPersonalInvitation = (data: EmailFormValues) => {
    setIsLoading(true);
    const newInvitation: Invitation = {
      id: uuidv4(), eventId, email: data.email, type: InvitationType.PERSONAL,
      status: InvitationStatus.SENT, token: uuidv4(), acceptedCount: 0,
      requiresApproval: false, emailVerified: false, 
      canInviteOthers: data.canInviteOthers, 
      maxSubInvites: data.canInviteOthers ? data.maxSubInvites : undefined,
      subInvitesCount: 0, customMessage: data.customMessage,
      createdAt: new Date(), updatedAt: new Date(),
      history: [{ action: 'created_and_sent', timestamp: new Date() }]
    };
    setTimeout(() => {
      setInvitations(prev => [newInvitation, ...prev]);
      console.log('New Personal Invitation:', newInvitation);
      emailForm.reset();
      setIsLoading(false);
      toast.success(`Personal invitation sent to ${data.email} (simulated). Message: "${data.customMessage || 'No custom message'}"`);
    }, 500);
  };

  const handleCreateShareableLink = (data: ShareableLinkFormValues) => {
    setIsLinkLoading(true);
    const token = uuidv4();
    const newLinkInvitation: Invitation = {
      id: uuidv4(), eventId, email: data.linkAlias || `link-${token.substring(0, 8)}`, 
      type: InvitationType.PRIVATE_LINK, status: InvitationStatus.PENDING, 
      token, acceptedCount: 0, requiresApproval: data.requiresApproval,
      maxAcceptedUsers: data.maxAcceptedUsers || undefined,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      canInviteOthers: data.canInviteOthers,
      maxSubInvites: data.canInviteOthers ? data.maxSubInvites : undefined,
      subInvitesCount: 0, customMessage: data.customMessage,
      createdAt: new Date(), updatedAt: new Date(),
      history: [{ action: 'shareable_link_created', timestamp: new Date() }]
    };
    setTimeout(() => {
      setInvitations(prev => [newLinkInvitation, ...prev]);
      console.log('New Shareable Link Invitation:', newLinkInvitation);
      shareableLinkForm.reset();
      setIsLinkLoading(false);
      toast.success(`Shareable link "${newLinkInvitation.email}" created (simulated). Message: "${data.customMessage || 'No custom message'}"`);
    }, 500);
  };
  
  const handleCreateSubInvitation = (parentInvite: Invitation, subInviteData: SubInvitationFormValues) => {
    if (!parentInvite.canInviteOthers || (parentInvite.maxSubInvites != null && (parentInvite.subInvitesCount || 0) >= parentInvite.maxSubInvites)) {
        toast.error("Cannot create sub-invitation: Limit reached or not allowed.");
        return;
    }
    const newSubInvitation: Invitation = {
        id: uuidv4(), eventId, email: subInviteData.email, type: InvitationType.HIERARCHICAL,
        parentId: parentInvite.id, status: InvitationStatus.SENT, token: uuidv4(), acceptedCount: 0,
        requiresApproval: parentInvite.requiresApproval, 
        emailVerified: false, canInviteOthers: false, 
        customMessage: subInviteData.customMessage,
        createdAt: new Date(), updatedAt: new Date(),
        history: [{ action: 'sub_invitation_created', timestamp: new Date(), actorId: parentInvite.id }]
    };
    setInvitations(prev => {
        const parentIndex = prev.findIndex(inv => inv.id === parentInvite.id);
        if (parentIndex === -1) return prev;
        const updatedParent = { ...prev[parentIndex], subInvitesCount: (prev[parentIndex].subInvitesCount || 0) + 1 };
        const newInvites = [...prev];
        newInvites[parentIndex] = updatedParent;
        return [newSubInvitation, ...newInvites];
    });
    console.log('New Sub-Invitation:', newSubInvitation);
    subInvitationForm.reset();
    setShowSubInviteModal(null);
    toast.success(`Sub-invitation sent for ${subInviteData.email} (simulated).`);
  };


  const generateShareableUrl = (token: string) => `${window.location.origin}/events/${eventId}/invite/${token}`;

  const getStatusBadgeVariant = (status: InvitationStatus) => {
    switch (status) {
      case InvitationStatus.ACCEPTED: return "success";
      case InvitationStatus.DECLINED: return "destructive";
      case InvitationStatus.SENT: return "default";
      case InvitationStatus.PENDING: return "outline";
      case InvitationStatus.ERROR: return "destructive";
      default: return "secondary";
    }
  };

  const handleResendEmail = (invite: Invitation) => {
    console.log(`Resending email to ${invite.email} for event ${eventId}. Custom message: "${invite.customMessage || 'N/A'}"`);
    toast.info(`Resend email action triggered for ${invite.email}.`);
  };

  const handleSendSmsReminder = (invite: Invitation) => {
    console.log(`Sending SMS reminder for invitation token ${invite.token} (email: ${invite.email}) for event ${eventId}.`);
    toast.info(`Send SMS reminder action triggered for ${invite.email}.`);
  };

  const handleBulkResendEmails = () => {
    const selectedPersonalInvites = invitations.filter(inv => selectedInvitations.has(inv.id) && inv.type === InvitationType.PERSONAL);
    if (selectedPersonalInvites.length === 0) {
        toast.warning("No personal invitations selected to resend emails.");
        return;
    }
    console.log(`Attempting to resend emails for ${selectedPersonalInvites.length} selected invitations.`);
    selectedPersonalInvites.forEach(invite => {
        console.log(`  - Resending to: ${invite.email}, Custom Message: "${invite.customMessage || 'N/A'}"`);
    });
    toast.info(`Bulk resend email action triggered for ${selectedPersonalInvites.length} invitations.`);
    setSelectedInvitations(new Set()); // Clear selection
  };

  const handleBulkSendSmsReminders = () => {
     const selectedInvitesForSms = invitations.filter(inv => selectedInvitations.has(inv.id));
     if (selectedInvitesForSms.length === 0) {
        toast.warning("No invitations selected for SMS reminders.");
        return;
    }
    console.log(`Attempting to send SMS reminders for ${selectedInvitesForSms.length} selected invitations.`);
     selectedInvitesForSms.forEach(invite => {
        console.log(`  - SMS to: ${invite.email} (Token: ${invite.token})`);
    });
    toast.info(`Bulk SMS reminder action triggered for ${selectedInvitesForSms.length} invitations.`);
    setSelectedInvitations(new Set()); // Clear selection
  };

  const canBulkResendEmail = invitations.some(inv => selectedInvitations.has(inv.id) && inv.type === InvitationType.PERSONAL);


  return (
    <div className="space-y-8">
      {/* Public Event Link Display (if event is public) */}
      {eventVisibility === EventVisibility.PUBLIC && (
        <Card>
          <CardHeader>
            <CardTitle>Public Event Link</CardTitle>
            <CardDescription>This event is public. Share this link for anyone to join.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-3">
            <QRCode value={generateShareableUrl(`public-${eventId}`)} size={128} level="H" />
            <Input
              readOnly
              type="text"
              value={generateShareableUrl(`public-${eventId}`)}
              className="w-full text-center"
            />
             <Button onClick={() => {
                navigator.clipboard.writeText(generateShareableUrl(`public-${eventId}`));
                toast.success("Public link copied to clipboard!");
            }}>Copy Public Link</Button>
          </CardContent>
        </Card>
      )}

      {/* Personal Invitation Card */}
      <Card>
        <CardHeader>
          <CardTitle>Send Personal Invitation</CardTitle>
          <CardDescription>Enter the email address of the guest to invite personally.</CardDescription>
        </CardHeader>
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(handleSendPersonalInvitation)}>
            <CardContent className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="guest@example.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={emailForm.control}
                name="customMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Hope you can make it!" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={emailForm.control}
                name="canInviteOthers"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} /></FormControl>
                    <FormLabel className="font-normal">Allow this guest to invite others?</FormLabel>
                  </FormItem>
                )}
              />
              {emailForm.watch("canInviteOthers") && (
                <FormField
                  control={emailForm.control}
                  name="maxSubInvites"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Sub-Invites</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 3" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || null)} disabled={isLoading} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Personal Invite'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Shareable Link Invitation Card */}
      <Card>
        <CardHeader>
          <CardTitle>Create Shareable Link</CardTitle>
          <CardDescription>Generate a shareable link for guests to join.</CardDescription>
        </CardHeader>
        <Form {...shareableLinkForm}>
          <form onSubmit={shareableLinkForm.handleSubmit(handleCreateShareableLink)}>
            <CardContent className="space-y-4">
              <FormField
                control={shareableLinkForm.control}
                name="linkAlias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Alias (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., friends-link, company-invite" {...field} disabled={isLinkLoading} />
                    </FormControl>
                    <FormDescription>A friendly name for this link.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={shareableLinkForm.control}
                name="maxAcceptedUsers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Uses (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || null)} disabled={isLinkLoading} />
                    </FormControl>
                    <FormDescription>Maximum number of guests who can use this link.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={shareableLinkForm.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expires At (Optional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} disabled={isLinkLoading} />
                    </FormControl>
                    <FormDescription>When this link should no longer be valid.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={shareableLinkForm.control}
                name="requiresApproval"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                     <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLinkLoading} /></FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Require Approval</FormLabel>
                      <FormDescription>Guests using this link will need organizer approval.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={shareableLinkForm.control}
                name="customMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Join us for this special occasion!" {...field} disabled={isLinkLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={shareableLinkForm.control}
                name="canInviteOthers"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLinkLoading} /></FormControl>
                    <FormLabel className="font-normal">Allow this link to grant further invitations?</FormLabel>
                  </FormItem>
                )}
              />
              {shareableLinkForm.watch("canInviteOthers") && (
                <FormField
                  control={shareableLinkForm.control}
                  name="maxSubInvites"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Sub-Invites (from this link)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 3" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || null)} disabled={isLinkLoading} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLinkLoading}>
                {isLinkLoading ? 'Creating...' : 'Create Shareable Link'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedInvitations.size > 0 && (
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-background border-t shadow-md z-10">
            <div className="container mx-auto flex items-center space-x-4">
                <span className="text-sm font-medium">{selectedInvitations.size} invitation(s) selected</span>
                <Button variant="outline" size="sm" onClick={handleBulkResendEmails} disabled={!canBulkResendEmail}>
                    Resend Selected Emails
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkSendSmsReminders} disabled={selectedInvitations.size === 0}>
                    Send SMS to Selected
                </Button>
                 <Button variant="destructive" size="sm" onClick={() => { console.log("Bulk delete on:", selectedInvitations); setSelectedInvitations(new Set()); toast.error("Bulk delete (simulated).") }} disabled={selectedInvitations.size === 0}>
                    Delete Selected
                </Button>
            </div>
        </div>
      )}

      {/* Current Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Invitations</CardTitle>
          <CardDescription>List of all invitations sent or created for this event.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[24px]">
                  <Checkbox
                    checked={invitations.filter(inv => inv.type !== InvitationType.PUBLIC).length > 0 && selectedInvitations.size === invitations.filter(inv => inv.type !== InvitationType.PUBLIC).length}
                    onCheckedChange={(checked) => {
                      const newSelected = new Set<string>();
                      if (checked) {
                        invitations.filter(inv => inv.type !== InvitationType.PUBLIC).forEach(inv => newSelected.add(inv.id));
                      }
                      setSelectedInvitations(newSelected);
                    }}
                  />
                </TableHead>
                <TableHead>Identifier / Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[250px]">Details & Hierarchy</TableHead> 
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.filter(inv => inv.type !== InvitationType.PUBLIC).length === 0 && eventVisibility !== EventVisibility.PUBLIC && ( 
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No invitations yet.</TableCell></TableRow>
              )}
              {invitations.filter(inv => inv.type !== InvitationType.PUBLIC).map((invite) => { 
                const shareUrl = (invite.type === InvitationType.PRIVATE_LINK || invite.type === InvitationType.PUBLIC) 
                                 ? generateShareableUrl(invite.token) 
                                 : null;
                const canCreateSubInvite = invite.canInviteOthers && 
                                           (invite.maxSubInvites == null || (invite.subInvitesCount || 0) < invite.maxSubInvites);

                return (
                  <TableRow 
                    key={invite.id} 
                    data-state={selectedInvitations.has(invite.id) ? "selected" : ""}
                    className={invite.parentId ? "bg-muted/30 hover:bg-muted/50" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedInvitations.has(invite.id)}
                        onCheckedChange={(checked) => {
                          const newSelected = new Set(selectedInvitations);
                          if (checked) newSelected.add(invite.id);
                          else newSelected.delete(invite.id);
                          setSelectedInvitations(newSelected);
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {invite.parentId && <span className="text-xs text-muted-foreground block">Child of: {invitations.find(p=>p.id === invite.parentId)?.email.substring(0,15) || 'N/A'}...</span>}
                      {invite.email}
                      {invite.type === InvitationType.PERSONAL && (
                        <span title={invite.emailVerified ? "Email Verified" : "Email Not Verified"} className="ml-2">
                          {invite.emailVerified ? '✅' : '⚠️'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{invite.type.charAt(0).toUpperCase() + invite.type.slice(1).toLowerCase().replace(/_/g, " ")}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(invite.status) as any}>
                        {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs ">
                      Token: <span className="truncate block max-w-[100px]">{invite.token}</span>
                      {invite.maxAcceptedUsers != null && `Uses: ${invite.acceptedCount}/${invite.maxAcceptedUsers}`}
                      {invite.expiresAt && `Expires: ${new Date(invite.expiresAt).toLocaleDateString()}`}
                      {invite.canInviteOthers && (
                        <div className="mt-1 text-blue-600 dark:text-blue-400">
                          Can invite: {invite.subInvitesCount || 0} / {invite.maxSubInvites ?? '∞'}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="space-x-1">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {invite.type === InvitationType.PERSONAL && (
                            <DropdownMenuItem onClick={() => handleResendEmail(invite)}>Resend Email</DropdownMenuItem>
                          )}
                           <DropdownMenuItem onClick={() => handleSendSmsReminder(invite)}>Send SMS Reminder</DropdownMenuItem>
                          {(invite.type === InvitationType.PRIVATE_LINK || invite.type === InvitationType.PUBLIC) && shareUrl && (
                             <DropdownMenuItem onClick={() => setShowQrModal(shareUrl)}>Show QR & Link</DropdownMenuItem>
                          )}
                          {canCreateSubInvite && (
                             <DropdownMenuItem onClick={() => setShowSubInviteModal(invite)}>+ Create Sub-Invite</DropdownMenuItem>
                          )}
                           <DropdownMenuItem className="text-destructive" onClick={() => {console.log("Delete invite:", invite.id); toast.error(`Simulated delete for ${invite.email}`);}}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* QR Code Modal - separate from table structure for clarity */}
      {showQrModal && (
        <Dialog open={!!showQrModal} onOpenChange={(isOpen) => !isOpen && setShowQrModal(null)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>Shareable Invitation Link</DialogTitle></DialogHeader>
                <div className="flex flex-col items-center justify-center space-y-4 p-4">
                    <QRCode value={showQrModal} size={256} level="H" />
                    <Input readOnly type="text" value={showQrModal} className="w-full text-center" />
                    <Button onClick={() => { navigator.clipboard.writeText(showQrModal); toast.success("Link copied!"); }}>Copy Link</Button>
                </div>
            </DialogContent>
        </Dialog>
      )}

      {/* Sub-Invitation Modal */}
      {showSubInviteModal && (
        <Dialog open={!!showSubInviteModal} onOpenChange={(isOpen) => !isOpen && setShowSubInviteModal(null)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Sub-Invitation</DialogTitle>
                    <CardDescription>For: {showSubInviteModal.email} (Parent)</CardDescription>
                </DialogHeader>
                <Form {...subInvitationForm}>
                    <form onSubmit={subInvitationForm.handleSubmit(data => handleCreateSubInvitation(showSubInviteModal, data))} className="space-y-4">
                        <FormField
                            control={subInvitationForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Guest Email</FormLabel>
                                    <FormControl><Input type="email" placeholder="subguest@example.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={subInvitationForm.control}
                            name="customMessage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Custom Message (Optional)</FormLabel>
                                    <FormControl><Textarea placeholder="e.g., John thought you'd be interested!" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Send Sub-Invitation</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
