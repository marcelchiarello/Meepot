"use client";

import React, { useEffect, useCallback } from 'react'; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner"; 
import useLocalStorage from "@/hooks/useLocalStorage"; 
import { useAIAssistantStore } from '@/stores/aiAssistantStore'; // Import AI store
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MapboxLocationPicker, { LocationData } from "./MapboxLocationPicker";
import ImageUpload from "./ImageUpload";
import { Checkbox } from "@/components/ui/checkbox"; 
import { RecurrenceRuleInput, recurrenceRuleSchema as recurrenceSubSchema } from "./RecurrenceRuleInput"; 
import { EventType, Location, RecurrenceRule } from "@/types/event"; 
import { PlaceholderEventFormData } from '@/types/ai_assistant';


// Define the Zod schema for the form
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];

const locationSchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters long."),
  latitude: z.number(),
  longitude: z.number(),
}).refine(data => !!data.address && typeof data.latitude === 'number' && typeof data.longitude === 'number', {
  message: "Location is required and must include address, latitude, and longitude.",
  path: [], 
});

const eventFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  description: z.string().min(15, { message: "Description must be at least 15 characters long (after stripping HTML)." })
    .refine(value => {
      const stripped = value.replace(/<[^>]+>/g, "");
      return stripped.length >= 10;
    }, "Description content is too short.")
    .refine(value => {
      const stripped = value.replace(/<[^>]+>/g, "");
      return stripped.length <= 1000;
    }, "Description content is too long (max 1000 characters after stripping HTML)."),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format." })
    ,
  location: locationSchema, 
  eventType: z.nativeEnum(EventType, { required_error: "Event type is required." }),
  bannerImageFile: z
    .instanceof(File, { message: "Invalid image file." })
    .optional()
    .nullable()
    .refine(file => !file || file.size <= MAX_FILE_SIZE, `Max image size is ${MAX_FILE_SIZE / (1024*1024)}MB.`)
    .refine(
      file => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .gif formats are supported."
    ),
  enableRecurrence: z.boolean().optional(),
  recurrenceRule: recurrenceSubSchema.optional().nullable(),
  maxGuests: z.coerce.number().positive().optional().nullable(), // Added maxGuests to form schema
})
.superRefine((data, ctx) => {
  if (data.enableRecurrence && !data.recurrenceRule) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Recurrence details are required when recurrence is enabled.", path: ["recurrenceRule"] });
  }
  if (data.date && new Date(data.date) <= new Date() && !data.enableRecurrence) {
     ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Event date must be in the future for non-recurring events.", path: ["date"] });
  }
  if (data.enableRecurrence && data.recurrenceRule?.endDate && data.date && new Date(data.recurrenceRule.endDate) <= new Date(data.date)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Recurrence end date must be after the event start date.", path: ["recurrenceRule", "endDate"] });
  }
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  onSubmit: (data: EventFormValues) => void;
  defaultValues?: Partial<EventFormValues>;
  isLoading?: boolean;
}

const LOCAL_STORAGE_DRAFT_KEY = "meepot-event-draft";
type StorableEventFormValues = Omit<EventFormValues, 'bannerImageFile'>;

export function EventForm({ onSubmit, defaultValues: externalDefaultValues, isLoading }: EventFormProps) {
  const [draft, setDraft, removeDraft] = useLocalStorage<StorableEventFormValues>(LOCAL_STORAGE_DRAFT_KEY);
  const { prefillData, clearPrefillData, setCurrentEventDraft } = useAIAssistantStore();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: externalDefaultValues || prefillData || draft || { 
      title: "", description: "<p></p>", date: "", location: undefined, eventType: undefined,
      bannerImageFile: null, enableRecurrence: false, recurrenceRule: null, maxGuests: undefined,
    },
  });
  
  const watchedValues = form.watch();

  useEffect(() => {
    if (prefillData && !externalDefaultValues) { 
      const mappedPrefillData: Partial<EventFormValues> = { ...prefillData };
      if (typeof prefillData.location === 'string' && prefillData.location) {
          console.warn("AI provided location as a string. Manual selection might be needed for map.", prefillData.location);
          delete mappedPrefillData.location; 
      } else if (typeof prefillData.location === 'object' && prefillData.location) {
          mappedPrefillData.location = prefillData.location as LocationData; 
      }
      if (prefillData.maxGuests) mappedPrefillData.maxGuests = Number(prefillData.maxGuests);


      form.reset(mappedPrefillData as Partial<EventFormValues>); 
      toast.success("AI Assistant has drafted event details for you!", { description: "Review and complete the form.", duration: 5000 });
      clearPrefillData(); 
    }
  }, [prefillData, form.reset, clearPrefillData, externalDefaultValues]);

  useEffect(() => {
    if (externalDefaultValues) { // If editing, publish to AI store once
        const { bannerImageFile, ...storableValues } = externalDefaultValues;
        const { recurrenceRule, ...aiDraft } = storableValues; 
         if (aiDraft.location && typeof aiDraft.location === 'object') {
           aiDraft.location = aiDraft.location.address; 
         }
        setCurrentEventDraft(aiDraft as Partial<PlaceholderEventFormData>);
        return; // And don't set up auto-save or load from local storage
    }

    const subscription = form.watch((value, { name, type }) => {
      if (type === 'change') { // Only update on actual field changes
        const { bannerImageFile, ...storableValues } = value;
        setDraft(storableValues as StorableEventFormValues); // Update local storage draft
        
        // Update AI store draft
        const { recurrenceRule, ...aiDraft } = storableValues;
        if (aiDraft.location && typeof aiDraft.location === 'object') {
          aiDraft.location = aiDraft.location.address; 
        }
        setCurrentEventDraft(aiDraft as Partial<PlaceholderEventFormData>);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, externalDefaultValues, setDraft, setCurrentEventDraft]);
  
   useEffect(() => {
    if (draft && !externalDefaultValues && !prefillData) { 
      const { bannerImageFile, ...storableDraft } = draft; 
      form.reset(storableDraft as EventFormValues); 
      toast.info("Draft loaded from previous session.", { description: "Continue editing or clear the form.", duration: 5000 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, form.reset, externalDefaultValues, prefillData]); 

  const enableRecurrence = form.watch("enableRecurrence");
  const eventStartDate = form.watch("date");

  useEffect(() => {
    if (!enableRecurrence) {
      form.setValue("recurrenceRule", null);
      const recurrenceFields: (keyof RecurrenceRule)[] = ['frequency', 'interval', 'daysOfWeek', 'endDate', 'count'];
      recurrenceFields.forEach(field => form.clearErrors(`recurrenceRule.${field}` as any));
      form.clearErrors("recurrenceRule");
    } else if (enableRecurrence && !form.getValues("recurrenceRule")) {
      form.setValue("recurrenceRule", {
        frequency: EventType.WORKSHOP === form.getValues("eventType") ? 'weekly' : 'daily',
        interval: 1, daysOfWeek: [], endDate: null, count: null,
      }, { shouldValidate: true });
    }
  }, [enableRecurrence, form]);

  const handleFormSubmit = (data: EventFormValues) => {
    console.log("Event Form Data:", data);
    onSubmit(data);
    removeDraft(); 
    setCurrentEventDraft(null); // Clear AI store draft
    toast.success("Event submitted (simulated) and draft cleared!");
    form.reset(externalDefaultValues || { 
        title: "", description: "<p></p>", date: "", location: undefined, 
        eventType: undefined, bannerImageFile: null, enableRecurrence: false, recurrenceRule: null, maxGuests: undefined
    }); 
  };

  const handleClearDraft = () => {
    removeDraft();
    setCurrentEventDraft(null); // Clear AI store draft
    form.reset(externalDefaultValues || { 
        title: "", description: "<p></p>", date: "", location: undefined, 
        eventType: undefined, bannerImageFile: null, enableRecurrence: false, recurrenceRule: null, maxGuests: undefined
    });
    toast.info("Draft cleared and form reset.");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={handleClearDraft} disabled={isLoading}> Clear Draft & Reset Form </Button>
        </div>
        <div className="space-y-4 p-4 border rounded-md">
          <h3 className="text-lg font-medium text-primary">Basic Information</h3>
          <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="My Awesome Event" {...field} /></FormControl><FormDescription>The main title of your event.</FormDescription><FormMessage /></FormItem> )}/>
          <FormField control={form.control} name="eventType" render={({ field }) => ( <FormItem><FormLabel>Event Type</FormLabel><Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select an event type" /></SelectTrigger></FormControl> <SelectContent>{Object.values(EventType).map((type) => ( <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1).toLowerCase().replace(/_/g, " ")}</SelectItem> ))}</SelectContent> </Select><FormDescription>What kind of event is it?</FormDescription><FormMessage /></FormItem> )}/>
          <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><RichTextEditor value={field.value} onChange={field.onChange} onBlur={field.onBlur} placeholder="Tell us more about your event..." disabled={isLoading} /></FormControl><FormDescription>A detailed description of what the event is about. Use the tools above for formatting.</FormDescription><FormMessage /></FormItem> )}/>
           <FormField control={form.control} name="maxGuests" render={({ field }) => ( <FormItem><FormLabel>Max Guests (Optional)</FormLabel><FormControl><Input type="number" placeholder="e.g., 50" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || null)} /></FormControl><FormDescription>Maximum number of guests allowed.</FormDescription><FormMessage /></FormItem> )}/>
        </div>
        <div className="space-y-4 p-4 border rounded-md">
          <h3 className="text-lg font-medium text-primary">Event Banner</h3>
          <FormField control={form.control} name="bannerImageFile" render={({ field }) => ( <FormItem><FormLabel>Banner Image</FormLabel><FormControl><ImageUpload value={field.value} onChange={field.onChange} disabled={isLoading} /></FormControl><FormDescription>Upload a banner image for your event (max 5MB, JPEG/PNG/GIF).</FormDescription><FormMessage /></FormItem> )}/>
        </div>
        <div className="space-y-4 p-4 border rounded-md">
          <h3 className="text-lg font-medium text-primary">Date & Time</h3>
          <FormField control={form.control} name="date" render={({ field }) => ( <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormDescription>The date and time when the event starts.</FormDescription><FormMessage /></FormItem> )}/>
        </div>
        <div className="space-y-4 p-4 border rounded-md">
          <h3 className="text-lg font-medium text-primary">Location</h3>
          <FormField control={form.control} name="location" render={({ field }) => ( <FormItem><FormLabel>Location</FormLabel><FormControl><MapboxLocationPicker value={field.value as LocationData | undefined} onChange={field.onChange} disabled={isLoading} /></FormControl><FormDescription>Type to search for an address, or click on the map.</FormDescription><FormMessage /></FormItem> )}/>
        </div>
        <div className="space-y-4 p-4 border rounded-md">
          <h3 className="text-lg font-medium text-primary">Event Recurrence</h3>
          <FormField control={form.control} name="enableRecurrence" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} /></FormControl><FormLabel className="font-normal">This is a recurring event</FormLabel></FormItem> )}/>
          {enableRecurrence && ( <RecurrenceRuleInput parentFieldName="recurrenceRule" eventStartDate={eventStartDate} disabled={isLoading} /> )}
        </div>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">{isLoading ? "Submitting..." : "Create Event"}</Button>
      </form>
    </Form>
  );
}
