"use client"; // Required for using client-side hooks like useState and form handlers

import { EventForm, EventFormValues } from "@/components/features/events/EventForm";
import React from "react";

export default function CreateEventPage() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleCreateEvent = async (data: EventFormValues) => {
    setIsLoading(true);
    console.log("Event Creation Data from page:", data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    // In a real app, you would send this data to your backend API
    // e.g., await fetch('/api/events', { method: 'POST', body: JSON.stringify(data) });
    setIsLoading(false);
    alert("Event creation submitted! Check the console for data. (No actual DB interaction yet)");
    // Potentially redirect or clear form here
  };

  return (
    <div className="container mx-auto py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Create New Event</h1>
        <p className="text-muted-foreground">
          Fill out the details below to schedule your new event.
        </p>
      </header>
      
      <section className="max-w-2xl">
        <EventForm onSubmit={handleCreateEvent} isLoading={isLoading} />
      </section>
    </div>
  );
}
