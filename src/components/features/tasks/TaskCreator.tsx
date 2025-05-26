"use client";

import React, { useState, useEffect } from 'react'; // Added useEffect
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { format } from 'date-fns'; 

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Edit3, PlusCircle } from 'lucide-react';

import { Task, TaskCategory, TaskStatus, TaskFormData } from '@/types/task';

interface TaskCreatorProps {
  eventId: string;
  initialTasks?: Task[];
}

const taskFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(100, { message: "Title too long."}),
  description: z.string().max(500, { message: "Description too long." }).optional(),
  category: z.nativeEnum(TaskCategory, { required_error: "Category is required." }),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  assignedTo: z.array(z.string().min(1, "Assignee name cannot be empty.")).optional(), 
  volunteerSlots: z.coerce.number().positive("Must be a positive number.").optional().nullable(),
  estimatedCost: z.coerce.number().positive("Must be positive.").optional().nullable(),
  actualCost: z.coerce.number().positive("Must be positive.").optional().nullable(),
  paidBy: z.string().min(2, "Paid by name too short.").max(100, "Paid by name too long.").optional().nullable(),
  dueDate: z.string().optional().nullable()
    .refine(val => !val || !isNaN(Date.parse(val)), { message: "Invalid date format." })
    .refine(val => !val || new Date(val) >= new Date(new Date().setHours(0,0,0,0)), { message: "Due date must be today or in the future." }),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const generateMockTasks = (eventId: string): Task[] => [
  {
    id: uuidv4(), eventId, title: 'Book Venue', category: TaskCategory.LOGISTICS, status: TaskStatus.DONE,
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), createdAt: new Date(), updatedAt: new Date(),
    estimatedCost: 500, actualCost: 450, paidBy: 'user-org-1', assignedTo: ['user-org-1']
  },
  {
    id: uuidv4(), eventId, title: 'Order Catering', category: TaskCategory.FOOD, status: TaskStatus.IN_PROGRESS,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), createdAt: new Date(), updatedAt: new Date(),
    estimatedCost: 1200, assignedTo: ['user-planner-2']
  },
];

export function TaskCreator({ eventId, initialTasks }: TaskCreatorProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || generateMockTasks(eventId));
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '', description: '', category: undefined, status: TaskStatus.TODO, assignedTo: [],
      volunteerSlots: undefined, estimatedCost: undefined, actualCost: undefined, paidBy: '', dueDate: '',
    },
  });
  
  const { fields: assignedToFields, append: appendAssignee, remove: removeAssignee } = useFieldArray({
    control: form.control,
    name: "assignedTo",
  });

  useEffect(() => {
    if (editingTask) {
      form.reset({
        title: editingTask.title,
        description: editingTask.description || '',
        category: editingTask.category,
        status: editingTask.status,
        assignedTo: editingTask.assignedTo || [],
        volunteerSlots: editingTask.volunteerSlots || undefined,
        estimatedCost: editingTask.estimatedCost || undefined,
        actualCost: editingTask.actualCost || undefined,
        paidBy: editingTask.paidBy || '',
        dueDate: editingTask.dueDate ? format(new Date(editingTask.dueDate), "yyyy-MM-dd") : '',
      });
    } else {
      form.reset({ 
        title: '', description: '', category: undefined, status: TaskStatus.TODO, assignedTo: [],
        volunteerSlots: undefined, estimatedCost: undefined, actualCost: undefined, paidBy: '', dueDate: '',
      });
    }
  }, [editingTask, form]);

  const handleTaskSubmit = (data: TaskFormValues) => {
    setIsSubmittingTask(true);
    const taskData = { ...data, dueDate: data.dueDate ? new Date(data.dueDate) : null };

    if (editingTask) {
        const updatedTask: Task = { ...editingTask, ...taskData, updatedAt: new Date() };
        setTasks(prevTasks => prevTasks.map(t => t.id === editingTask.id ? updatedTask : t));
        toast.success(`Task "${updatedTask.title}" updated.`);
        toast.info(`🎉 Real-time: User 'Organizer' updated task: "${updatedTask.title}" to ${updatedTask.status.replace('_',' ')}.`); // Real-time sim
        console.log("Updated Task:", updatedTask);
        setEditingTask(null); 
    } else {
        const newTask: Task = {
            id: uuidv4(), eventId, ...taskData, volunteers: [], 
            createdAt: new Date(), updatedAt: new Date(),
        };
        setTasks(prevTasks => [newTask, ...prevTasks]);
        toast.success(`Task "${newTask.title}" added.`);
        toast.info(`🎉 Real-time: User 'Organizer' added new task: "${newTask.title}".`); // Real-time sim
        console.log("New Task:", newTask);
    }
    
    form.reset(); 
    setIsSubmittingTask(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    toast.info(`Editing task: "${task.title}".`);
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    toast.error(`Task "${taskToDelete?.title || 'Unknown'}" deleted.`);
    toast.info(`🎉 Real-time: User 'Organizer' deleted task: "${taskToDelete?.title || 'Unknown'}".`); // Real-time sim
    console.log("Deleted Task ID:", taskId);
    if (editingTask && editingTask.id === taskId) {
        setEditingTask(null); 
        form.reset();
    }
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
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{editingTask ? "Edit Task" : "Create New Task"}</CardTitle>
          <CardDescription>
            {editingTask ? `Update details for "${editingTask.title}"` : `Add a new task for event ID: ${eventId}`}
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleTaskSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Arrange catering" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                        <SelectContent>{Object.values(TaskCategory).map(cat => (<SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>))}</SelectContent>
                      </Select><FormMessage />
                    </FormItem>
                )}/>
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="More details about the task..." {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={TaskStatus.TODO}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>{Object.values(TaskStatus).map(stat => (<SelectItem key={stat} value={stat}>{stat.replace('_',' ').charAt(0).toUpperCase() + stat.replace('_',' ').slice(1)}</SelectItem>))}</SelectContent>
                      </Select><FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="dueDate" render={({ field }) => (
                    <FormItem><FormLabel>Due Date (Optional)</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="volunteerSlots" render={({ field }) => (
                    <FormItem><FormLabel>Volunteer Slots (Optional)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || null)} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <FormField control={form.control} name="estimatedCost" render={({ field }) => (
                    <FormItem><FormLabel>Est. Cost (Optional)</FormLabel><FormControl><Input type="number" placeholder="e.g., 150" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || null)} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="actualCost" render={({ field }) => (
                    <FormItem><FormLabel>Actual Cost (Optional)</FormLabel><FormControl><Input type="number" placeholder="e.g., 145.50" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || null)}/></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="paidBy" render={({ field }) => (
                    <FormItem><FormLabel>Paid By (Optional)</FormLabel><FormControl><Input placeholder="Name or ID" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>
                <div>
                    <FormLabel>Assigned To (Optional)</FormLabel>
                    {assignedToFields.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-2 mt-1">
                            <FormField control={form.control} name={`assignedTo.${index}`} render={({ field }) => (
                                  <FormItem className="flex-grow"><FormControl><Input placeholder="Assignee name or email" {...field} /></FormControl><FormMessage/></FormItem>
                            )}/>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeAssignee(index)}><Trash2 className="h-4 w-4"/></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendAssignee("")}><PlusCircle className="mr-2 h-4 w-4"/> Add Assignee</Button>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              {editingTask && (<Button type="button" variant="outline" onClick={() => { setEditingTask(null); form.reset(); }}>Cancel Edit</Button>)}
              <Button type="submit" disabled={isSubmittingTask}>{isSubmittingTask ? (editingTask ? 'Updating...' : 'Adding...') : (editingTask ? 'Update Task' : 'Add Task')}</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <Card>
        <CardHeader><CardTitle>Current Tasks</CardTitle><CardDescription>List of tasks for this event.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
                <TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Category</TableHead>
                <TableHead>Due</TableHead><TableHead>Assigned</TableHead><TableHead>Volunteers (Slots)</TableHead>
                <TableHead>Est. Cost</TableHead><TableHead>Actual Cost (Paid By)</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {tasks.length === 0 && (<TableRow><TableCell colSpan={9} className="text-center">No tasks created yet.</TableCell></TableRow>)}
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{task.title}</TableCell>
                  <TableCell><Badge variant={getStatusBadgeVariant(task.status) as any}>{task.status.replace('_',' ').toUpperCase()}</Badge></TableCell>
                  <TableCell>{task.category.charAt(0).toUpperCase() + task.category.slice(1)}</TableCell>
                  <TableCell>{task.dueDate ? format(new Date(task.dueDate), 'PP') : 'N/A'}</TableCell>
                  <TableCell className="truncate max-w-[150px]">{task.assignedTo?.join(', ') || 'Unassigned'}</TableCell>
                  <TableCell>{task.volunteers?.length || 0} / {task.volunteerSlots ?? 'N/A'}</TableCell>
                  <TableCell>{task.estimatedCost != null ? `$${task.estimatedCost}`: 'N/A'}</TableCell>
                  <TableCell>
                    {task.actualCost != null ? `$${task.actualCost}`: 'N/A'}
                    {task.paidBy && <span className="text-xs block text-muted-foreground">by {task.paidBy}</span>}
                  </TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditTask(task)}><Edit3 className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
