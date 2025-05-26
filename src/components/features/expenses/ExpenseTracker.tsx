"use client";

import React, { useState, useEffect, useMemo } from 'react'; // Added useEffect
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
import { Separator } from '@/components/ui/separator';
import { Expense, ExpenseFormData, Balance, ParticipantNetBalance } from '@/types/expense';
import { PlusCircle, Trash2, Users } from 'lucide-react';

interface ExpenseTrackerProps {
  eventId: string;
  participants: string[]; 
  initialExpenses?: Expense[];
}

const splitDetailSchema = z.object({
  participantId: z.string().min(1, "Participant is required."),
  amount: z.coerce.number().positive("Amount must be positive.").optional(),
  percentage: z.coerce.number().min(0).max(100, "Percentage must be between 0 and 100.").optional(),
});

const expenseFormSchema = z.object({
  description: z.string().min(3, "Description is too short.").max(200, "Description is too long."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  paidBy: z.string().min(1, "Payer is required."),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format." }),
  category: z.string().optional(),
  receiptImageFile: z.instanceof(File).optional().nullable()
    .refine(file => !file || (file.size <= 5 * 1024 * 1024), `Max file size is 5MB.`)
    .refine(file => !file || ['image/jpeg', 'image/png', 'image/gif'].includes(file.type), 'Only .jpg, .png, .gif formats are supported.'),
  splitMethod: z.enum(['equal', 'percentage', 'itemized', 'exact_amounts']),
  splitDetails: z.array(splitDetailSchema).optional(), 
}).superRefine((data, ctx) => {
  if (data.splitMethod === 'percentage') {
    const totalPercentage = data.splitDetails?.reduce((sum, detail) => sum + (detail.percentage || 0), 0);
    if (totalPercentage !== 100) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Total percentage must be 100%. Current: ${totalPercentage?.toFixed(2) || 0}%`, path: ["splitDetails"] });
    }
  } else if (data.splitMethod === 'itemized' || data.splitMethod === 'exact_amounts') {
    const totalAmount = data.splitDetails?.reduce((sum, detail) => sum + (detail.amount || 0), 0);
    if (totalAmount !== data.amount) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Total of split amounts ($${totalAmount?.toFixed(2) || 0}) must equal the expense amount ($${data.amount.toFixed(2)}).`, path: ["splitDetails"] });
    }
  }
  if ((data.splitMethod === 'percentage' || data.splitMethod === 'itemized' || data.splitMethod === 'exact_amounts') && (!data.splitDetails || data.splitDetails.length === 0)) {
     ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Split details are required for ${data.splitMethod} method.`, path: ["splitDetails"] });
  }
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
const mockParticipants = ['Alice', 'Bob', 'Charlie', 'David'];

const generateMockExpenses = (eventId: string, participants: string[]): Expense[] => [
  {
    id: uuidv4(), eventId, description: 'Dinner at Restaurant', amount: 120, currency: 'USD',
    paidBy: participants[0], date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), category: 'food',
    splitMethod: 'equal', splitDetails: participants.map(p => ({ participantId: p })), 
    approvalStatus: 'approved', createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: uuidv4(), eventId, description: 'Groceries for BBQ', amount: 75, currency: 'USD',
    paidBy: participants[1], date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), category: 'food',
    splitMethod: 'percentage', 
    splitDetails: [ { participantId: participants[0], percentage: 40 }, { participantId: participants[1], percentage: 30 }, { participantId: participants[2], percentage: 30 } ],
    approvalStatus: 'pending', createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: uuidv4(), eventId, description: 'Movie Tickets', amount: 45, currency: 'USD',
    paidBy: participants[2], date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), category: 'entertainment',
    splitMethod: 'equal', splitDetails: participants.slice(0,3).map(p => ({ participantId: p })), 
    approvalStatus: 'rejected', createdAt: new Date(), updatedAt: new Date()
  }
];

export function ExpenseTracker({ eventId, participants = mockParticipants, initialExpenses }: ExpenseTrackerProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses || generateMockExpenses(eventId, participants));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: '', amount: undefined, paidBy: participants[0] || '', date: format(new Date(), 'yyyy-MM-dd'),
      category: '', receiptImageFile: null, splitMethod: 'equal', splitDetails: [],
    },
  });

  const { fields: splitDetailFields, append: appendSplitDetail, remove: removeSplitDetail, replace: replaceSplitDetails } = useFieldArray({
    control: form.control, name: "splitDetails",
  });
  
  const splitMethod = form.watch('splitMethod');

  useEffect(() => {
    if (!participants || participants.length === 0) return;
    let newSplitDetails: Array<{ participantId: string; amount?: number; percentage?: number }> = [];
    if (splitMethod === 'equal') newSplitDetails = participants.map(p => ({ participantId: p }));
    else if (splitMethod === 'percentage') newSplitDetails = participants.map(p => ({ participantId: p, percentage: parseFloat((100 / participants.length).toFixed(2)) }));
    else if (splitMethod === 'itemized' || splitMethod === 'exact_amounts') newSplitDetails = participants.map(p => ({ participantId: p, amount: 0 }));
    replaceSplitDetails(newSplitDetails);
  }, [splitMethod, participants, replaceSplitDetails]);

  const handleExpenseSubmit = (data: ExpenseFormValues) => {
    setIsSubmitting(true);
    let finalSplitDetails = data.splitDetails || [];
    if (data.splitMethod === 'equal') {
      const numParticipantsInSplit = finalSplitDetails.length > 0 ? finalSplitDetails.length : participants.length;
      const amountPerPerson = data.amount / numParticipantsInSplit;
      finalSplitDetails = (finalSplitDetails.length > 0 ? finalSplitDetails : participants.map(p => ({ participantId: p })))
                          .map(detail => ({ ...detail, amount: amountPerPerson }));
    }
    let receiptImageUrl: string | undefined = undefined;
    if (data.receiptImageFile) {
      const file = data.receiptImageFile;
      receiptImageUrl = `/mock-receipts/receipt-${Date.now()}.${file.name.split('.').pop()}`;
      console.log("Simulating receipt upload:", { fileName: file.name, mockUrl: receiptImageUrl });
    }
    const newExpense: Expense = {
      id: uuidv4(), eventId, description: data.description, amount: data.amount, currency: 'USD', 
      paidBy: data.paidBy, date: new Date(data.date), category: data.category || undefined, receiptImageUrl,
      splitMethod: data.splitMethod, splitDetails: finalSplitDetails, approvalStatus: 'pending', 
      createdAt: new Date(), updatedAt: new Date(),
    };
    setExpenses(prev => [newExpense, ...prev]);
    toast.success(`Expense "${newExpense.description}" added for approval.`);
    toast.info(`🎉 Real-time: ${newExpense.paidBy} added expense: "${newExpense.description}" for $${newExpense.amount}.`); // Real-time sim
    console.log("New Expense:", newExpense);
    form.reset();
    replaceSplitDetails(participants.map(p => ({ participantId: p }))); 
    setIsSubmitting(false);
  };

  const handleExpenseApproval = (expenseId: string, newStatus: 'approved' | 'rejected') => {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;
    setExpenses(prev => prev.map(e => e.id === expenseId ? {...e, approvalStatus: newStatus, updatedAt: new Date()} : e));
    if (newStatus === 'approved') {
      toast.success(`Expense "${expense.description}" approved!`);
      toast.info(`🎉 Real-time: Expense "${expense.description}" was approved.`);
    } else {
      toast.error(`Expense "${expense.description}" rejected!`);
      toast.info(`🎉 Real-time: Expense "${expense.description}" was rejected.`);
    }
  };

  const calculatedBalances = useMemo(() => {
    const balances: Record<string, number> = {}; 
    participants.forEach(p => balances[p] = 0);
    expenses.filter(exp => exp.approvalStatus === 'approved').forEach(expense => {
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;
      if (expense.splitMethod === 'equal') {
        const share = expense.amount / expense.splitDetails.length;
        expense.splitDetails.forEach(detail => { balances[detail.participantId] = (balances[detail.participantId] || 0) - share; });
      } else if (expense.splitMethod === 'percentage') {
        expense.splitDetails.forEach(detail => {
          const share = expense.amount * ((detail.percentage || 0) / 100);
          balances[detail.participantId] = (balances[detail.participantId] || 0) - share;
        });
      } else if (expense.splitMethod === 'itemized' || expense.splitMethod === 'exact_amounts') {
        expense.splitDetails.forEach(detail => { balances[detail.participantId] = (balances[detail.participantId] || 0) - (detail.amount || 0); });
      }
    });
    return Object.entries(balances)
      .map(([participantId, netAmount]) => ({ participantId, netAmount, currency: 'USD' }))
      .filter(b => Math.abs(b.netAmount) > 0.005);
  }, [expenses, participants]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>Add New Expense</CardTitle><CardDescription>Track shared costs for event: {eventId}</CardDescription></CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleExpenseSubmit)}>
            <CardContent className="space-y-6">
              <FormField name="description" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="e.g., Team Dinner" {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField name="amount" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Amount (USD)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 100.00" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField name="paidBy" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Paid By</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select who paid" /></SelectTrigger></FormControl> <SelectContent>{participants.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent> </Select><FormMessage /> </FormItem> )}/>
                <FormField name="date" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )}/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="category" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Category (Optional)</FormLabel><FormControl><Input placeholder="e.g., Food, Transport" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField name="splitMethod" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Split Method</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="How to split?" /></SelectTrigger></FormControl> <SelectContent> <SelectItem value="equal">Equally</SelectItem> <SelectItem value="percentage">By Percentage</SelectItem> <SelectItem value="itemized">By Itemized Amounts</SelectItem> <SelectItem value="exact_amounts">By Exact Amounts</SelectItem> </SelectContent> </Select><FormMessage /> </FormItem> )}/>
              </div>
              {(splitMethod === 'percentage' || splitMethod === 'itemized' || splitMethod === 'exact_amounts') && (
                <div className="space-y-3 p-3 border rounded-md">
                  <h4 className="text-sm font-medium">Split Details ({splitMethod.replace('_', ' ')})</h4>
                  {splitDetailFields.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <FormField name={`splitDetails.${index}.participantId`} control={form.control} render={({ field }) => ( <FormItem className="w-full sm:w-1/3"> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select Participant" /></SelectTrigger></FormControl> <SelectContent>{participants.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent> </Select><FormMessage/> </FormItem> )}/>
                      {splitMethod === 'percentage' && <FormField name={`splitDetails.${index}.percentage`} control={form.control} render={({ field }) => ( <FormItem className="w-full sm:w-1/3"><FormControl><Input type="number" placeholder="%" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage/></FormItem> )}/>}
                      {(splitMethod === 'itemized' || splitMethod === 'exact_amounts') && <FormField name={`splitDetails.${index}.amount`} control={form.control} render={({ field }) => ( <FormItem className="w-full sm:w-1/3"><FormControl><Input type="number" placeholder="Amount ($)" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)}/></FormControl><FormMessage/></FormItem> )}/>}
                    </div>
                  ))}
                </div>
              )}
              <FormField control={form.control} name="receiptImageFile" render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem><FormLabel>Upload Receipt (Optional)</FormLabel><FormControl><Input type="file" accept="image/jpeg, image/png, image/gif" onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)} className="pt-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" {...rest} /></FormControl><FormDescription>Max 5MB (JPEG, PNG, GIF).</FormDescription><FormMessage /></FormItem>
              )}/>
            </CardContent>
            <CardFooter><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Expense for Approval'}</Button></CardFooter>
          </form>
        </Form>
      </Card>
      <Card>
        <CardHeader><CardTitle>Expenses Log</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow> <TableHead>Description</TableHead> <TableHead>Amount</TableHead> <TableHead>Paid By</TableHead> <TableHead>Date</TableHead> <TableHead>Status</TableHead> <TableHead>Receipt</TableHead> <TableHead className="text-right">Actions</TableHead> </TableRow></TableHeader>
            <TableBody>
              {expenses.length === 0 && <TableRow><TableCell colSpan={7} className="text-center">No expenses logged yet.</TableCell></TableRow>}
              {expenses.map(exp => (
                <TableRow key={exp.id} className={exp.approvalStatus === 'rejected' ? 'bg-red-50/50 dark:bg-red-900/10 line-through' : exp.approvalStatus === 'pending' ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}>
                  <TableCell>{exp.description}</TableCell>
                  <TableCell>${exp.amount.toFixed(2)}</TableCell>
                  <TableCell>{exp.paidBy}</TableCell>
                  <TableCell>{format(new Date(exp.date), 'PP')}</TableCell>
                  <TableCell><Badge variant={ exp.approvalStatus === 'approved' ? 'success' : exp.approvalStatus === 'rejected' ? 'destructive' : 'outline' }>{exp.approvalStatus.toUpperCase()}</Badge></TableCell>
                  <TableCell>{exp.receiptImageUrl ? ( <a href={exp.receiptImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">View</a> ) : <span className="text-xs text-muted-foreground">N/A</span>}</TableCell>
                  <TableCell className="text-right">
                    {exp.approvalStatus === 'pending' && (
                      <> <Button variant="outline" size="xs" className="mr-1" onClick={() => handleExpenseApproval(exp.id, 'approved')}> Approve </Button> <Button variant="destructive" size="xs" onClick={() => handleExpenseApproval(exp.id, 'rejected')}> Reject </Button> </>
                    )}
                    {exp.approvalStatus === 'approved' && <span className="text-xs text-green-600">Approved</span>}
                    {exp.approvalStatus === 'rejected' && <span className="text-xs text-red-600">Rejected</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Current Balances</CardTitle><CardDescription>Who owes whom (simplified net balances).</CardDescription></CardHeader>
        <CardContent>
           {calculatedBalances.length === 0 && <p className="text-muted-foreground">No balances to show yet or everyone is settled.</p>}
          <ul className="space-y-1">
            {calculatedBalances.map(bal => ( <li key={bal.participantId} className={`text-sm p-2 rounded-md ${bal.netAmount < 0 ? 'bg-red-50 dark:bg-red-900/30' : 'bg-green-50 dark:bg-green-900/30'}`}> {bal.participantId}: <span className="font-medium">{bal.netAmount < 0 ? `Owes $${(-bal.netAmount).toFixed(2)}` : `Is Owed $${bal.netAmount.toFixed(2)}`}</span> </li> ))}
          </ul>
          {calculatedBalances.length > 0 && (
            <div className="mt-6 space-y-3">
              <Separator />
              <h4 className="text-md font-semibold">Settlement Actions</h4>
              <Button variant="outline" disabled onClick={() => toast.info("Smart settlement suggestions coming soon!")}> Suggest Optimized Settlements (Coming Soon) </Button>
              <div className="flex space-x-2 pt-2">
                 <Button size="sm" variant="secondary" onClick={() => toast.info("Placeholder: Settle via Venmo action.")}>Settle via Venmo</Button>
                 <Button size="sm" variant="secondary" onClick={() => toast.info("Placeholder: Settle via PayPal action.")}>Settle via PayPal</Button>
              </div>
              <p className="text-xs text-muted-foreground">Note: These are placeholders for payment integration.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
