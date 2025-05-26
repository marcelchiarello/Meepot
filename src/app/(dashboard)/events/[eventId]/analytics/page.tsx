"use client";

import React from 'react';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, BarChart3, PieChart, Smile, ListChecks, Map } from 'lucide-react';

export default function EventAnalyticsPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  if (!eventId) {
    return <div className="container mx-auto p-4">Loading event analytics...</div>;
  }

  const handleExportData = () => {
    console.log(`Placeholder: Exporting analytics data for event ID: ${eventId}`);
    // In a real app, this would trigger a data export process.
    // toast.info("Export Data (Coming Soon)"); // If using sonner for toasts
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Event Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Insights for Event ID: <span className="font-semibold text-foreground">{eventId}</span>
          </p>
        </div>
        <Button variant="outline" onClick={handleExportData} className="mt-4 sm:mt-0">
          <Download className="mr-2 h-4 w-4" />
          Export Data (Coming Soon)
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Attendance Patterns Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Attendance Patterns</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Chart showing RSVP vs. Actual Attendance, Attendance over time (if recurring).
            </p>
            {/* Placeholder for a simple chart or image */}
            <div className="mt-4 h-40 bg-muted rounded-md flex items-center justify-center">
              <p className="text-xs text-muted-foreground">[Chart Placeholder]</p>
            </div>
          </CardContent>
        </Card>

        {/* Cost Analysis Trends Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Cost Analysis</CardTitle>
            <PieChart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Chart showing Estimated vs. Actual Costs by Category.
            </p>
            <div className="mt-4 h-40 bg-muted rounded-md flex items-center justify-center">
              <p className="text-xs text-muted-foreground">[Chart Placeholder]</p>
            </div>
          </CardContent>
        </Card>

        {/* Guest Satisfaction Metrics Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Guest Satisfaction (Coming Soon)</CardTitle>
            <Smile className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Area for displaying guest feedback scores or sentiment analysis.
            </p>
             <div className="mt-4 h-40 bg-muted rounded-md flex items-center justify-center">
              <p className="text-xs text-muted-foreground">[Data Coming Soon]</p>
            </div>
          </CardContent>
        </Card>

        {/* Task Completion Analytics Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Task Completion</CardTitle>
            <ListChecks className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Chart showing Task Completion Rate, Tasks by Status.
            </p>
            <div className="mt-4 h-40 bg-muted rounded-md flex items-center justify-center">
              <p className="text-xs text-muted-foreground">[Chart Placeholder]</p>
            </div>
          </CardContent>
        </Card>

        {/* Popular Time Slots Heatmap Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Engagement Heatmap (Coming Soon)</CardTitle>
            <Map className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Heatmap for popular times based on guest interaction or RSVP times.
            </p>
            <div className="mt-4 h-40 bg-muted rounded-md flex items-center justify-center">
              <p className="text-xs text-muted-foreground">[Heatmap Visual Coming Soon]</p>
            </div>
          </CardContent>
        </Card>

        {/* Dietary Preference Insights Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Dietary Preferences</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" /> {/* Using Users icon as placeholder */}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Summary of collected dietary restrictions (e.g., Vegetarian: X, Gluten-Free: Y).
            </p>
            <div className="mt-4 h-40 bg-muted rounded-md flex items-center justify-center p-4">
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                    <li>Vegetarian: 15</li>
                    <li>Gluten-Free: 8</li>
                    <li>Nut Allergy: 3</li>
                    <li>Vegan: 5</li>
                </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
