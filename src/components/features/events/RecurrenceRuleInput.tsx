"use client";

import React, { useEffect } from 'react';
import { useForm, useFormContext, Controller, useWatch } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RecurrenceFrequency, DayOfWeek, RecurrenceRule } from '@/types/event';
import { cn } from '@/lib/utils';

// Define the Zod schema for the recurrence rule input
// This schema is for the sub-form, it will be nested into the main EventForm schema
export const recurrenceRuleSchema = z.object({
  frequency: z.nativeEnum(RecurrenceFrequency),
  interval: z.coerce.number().min(1, "Interval must be at least 1."),
  daysOfWeek: z.array(z.nativeEnum(DayOfWeek)).optional().nullable(),
  // dayOfMonth: z.coerce.number().min(1).max(31).optional().nullable(), // We'll handle this conditionally
  endDate: z.string().optional().nullable()
    .refine(val => !val || !isNaN(Date.parse(val)), { message: "Invalid end date format." }),
  count: z.coerce.number().min(1, "Count must be at least 1.").optional().nullable(),
}).refine(data => {
    if (data.frequency === 'weekly' && (!data.daysOfWeek || data.daysOfWeek.length === 0)) {
        return false; // Days of week are required for weekly frequency
    }
    return true;
}, {
    message: "Please select at least one day for weekly recurrence.",
    path: ["daysOfWeek"],
})
.refine(data => !(data.endDate && data.count), {
    message: "Cannot set both an end date and a number of occurrences.",
    path: ["endDate"], // Or path: ["count"] , or a general path
});

export type RecurrenceRuleFormValues = z.infer<typeof recurrenceRuleSchema>;

interface RecurrenceRuleInputProps {
  parentFieldName: string; // e.g., "recurrenceRule"
  eventStartDate: string | null; // To validate recurrence endDate
  disabled?: boolean;
}

const daysOfWeekOptions: { id: DayOfWeek; label: string }[] = [
  { id: 'SU', label: 'Sun' }, { id: 'MO', label: 'Mon' }, { id: 'TU', label: 'Tue' },
  { id: 'WE', label: 'Wed' }, { id: 'TH', label: 'Thu' }, { id: 'FR', label: 'Fri' },
  { id: 'SA', label: 'Sat' },
];

export function RecurrenceRuleInput({ parentFieldName, eventStartDate, disabled }: RecurrenceRuleInputProps) {
  const { control, watch, setValue, getValues, formState: { errors: parentErrors } } = useFormContext(); // Get context from parent EventForm

  const frequency = useWatch({
    control,
    name: `${parentFieldName}.frequency`,
  });

  // Refine schema based on eventStartDate
  const currentRecurrenceSchema = recurrenceRuleSchema.refine(data => {
    if (data.endDate && eventStartDate && new Date(data.endDate) <= new Date(eventStartDate)) {
        return false;
    }
    return true;
  }, {
      message: "Recurrence end date must be after the event start date.",
      path: ["endDate"],
  });
  
  // This component doesn't have its own <Form> tag or submit, it's part of the parent form

  return (
    <div className="space-y-6 p-4 border rounded-md bg-muted/30">
      <FormField
        control={control}
        name={`${parentFieldName}.frequency`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Frequency</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.values(RecurrenceFrequency).map(f => (
                  <SelectItem key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`${parentFieldName}.interval`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Interval</FormLabel>
            <FormControl>
              <Input type="number" placeholder="e.g., 1 for every, 2 for every other" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || '')} disabled={disabled} />
            </FormControl>
            <FormDescription>
              {`Repeat every ${field.value || '...'} ${frequency ? (frequency + (field.value > 1 ? 's' : '')) : ''}`}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {frequency === 'weekly' && (
        <FormField
          control={control}
          name={`${parentFieldName}.daysOfWeek`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Days of the Week</FormLabel>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                {daysOfWeekOptions.map((day) => (
                  <FormField
                    key={day.id}
                    control={control}
                    name={`${parentFieldName}.daysOfWeek`}
                    render={({ field: dayField }) => {
                      const currentDays = Array.isArray(dayField.value) ? dayField.value : [];
                      return (
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              disabled={disabled}
                              checked={currentDays.includes(day.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? dayField.onChange([...currentDays, day.id])
                                  : dayField.onChange(currentDays.filter((value) => value !== day.id));
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{day.label}</FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`${parentFieldName}.endDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date (Optional)</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field} 
                  value={field.value || ''} 
                  disabled={disabled || !!watch(`${parentFieldName}.count`)} 
                />
              </FormControl>
              <FormDescription>When the recurrence should stop.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`${parentFieldName}.count`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Occurrences (Optional)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="e.g., 10" 
                  {...field} 
                  onChange={e => field.onChange(parseInt(e.target.value,10) || null)} 
                  disabled={disabled || !!watch(`${parentFieldName}.endDate`)}
                />
              </FormControl>
              <FormDescription>After how many times it should stop.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* Display general error for endDate/count mutual exclusivity, if any */}
      {parentErrors?.[parentFieldName]?.root?.message && (
         <p className="text-sm font-medium text-destructive">{parentErrors[parentFieldName].root.message as string}</p>
      )}
    </div>
  );
}
