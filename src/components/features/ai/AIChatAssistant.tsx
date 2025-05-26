"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Send, Bot, User, Sparkles } from 'lucide-react'; 

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatMessage, PlaceholderEventFormData } from '@/types/ai_assistant';
import { useAIAssistantStore } from '@/stores/aiAssistantStore'; 
import { useRouter } from 'next/navigation'; 

interface AIChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

// Simple keyword-based parser (can be expanded)
const parseEventDetailsFromMessage = (message: string): Partial<PlaceholderEventFormData> => {
  const prefillData: Partial<PlaceholderEventFormData> = {};
  const lowerMessage = message.toLowerCase();

  const titleMatch = lowerMessage.match(/(plan|create|organize|schedule) (a|an|my|the) ([\w\s]+?) for|party for|meeting about ([\w\s]+)/);
  if (titleMatch) {
    prefillData.title = titleMatch[3] || titleMatch[4] || "New Event";
    if (lowerMessage.includes("birthday party for")) {
        const nameMatch = lowerMessage.match(/birthday party for ([\w\s]+?)(next|on|at|$)/);
        prefillData.title = nameMatch ? `${nameMatch[1].trim()}'s Birthday Party` : "Birthday Party";
    } else if (lowerMessage.includes("meetup about")) {
         const topicMatch = lowerMessage.match(/meetup about ([\w\s]+?)(next|on|at|$)/);
         prefillData.title = topicMatch ? `Meetup: ${topicMatch[1].trim()}` : "Meetup";
    }
  } else if (!prefillData.title) { // Only set default if no other title logic matched
    prefillData.title = "My New Event"; 
  }

  if (lowerMessage.includes("next friday")) {
    const today = new Date();
    const nextFriday = new Date(today.setDate(today.getDate() + (5 + 7 - today.getDay()) % 7));
    nextFriday.setHours(19,0,0,0); 
    prefillData.date = nextFriday.toISOString().slice(0, 16); 
  } else if (lowerMessage.includes("tomorrow")) {
     const tomorrow = new Date();
     tomorrow.setDate(tomorrow.getDate() + 1);
     tomorrow.setHours(18,0,0,0); 
     prefillData.date = tomorrow.toISOString().slice(0, 16);
  }
  
  const guestMatch = lowerMessage.match(/(\d+)\s*(people|guests|friends)/);
  if (guestMatch) {
    prefillData.maxGuests = parseInt(guestMatch[1], 10);
  }

  const locationMatch = lowerMessage.match(/at ([\w\s\d,'-]+?)(next|on|for|$)/);
  if (locationMatch && !locationMatch[1].trim().match(/^(next|on|for|evening|morning)$/)) { 
    prefillData.location = locationMatch[1].trim();
  }

  if (lowerMessage.includes("party")) prefillData.eventType = "party";
  else if (lowerMessage.includes("meetup")) prefillData.eventType = "meetup";
  else if (lowerMessage.includes("dinner")) prefillData.eventType = "other"; 
  else if (lowerMessage.includes("conference")) prefillData.eventType = "conference";
  
  if (!prefillData.description && (prefillData.title !== "My New Event" || Object.keys(prefillData).length > 1)) {
    prefillData.description = `AI Draft: ${message}`;
  }

  return prefillData;
};


export function AIChatAssistant({ isOpen, onClose }: AIChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { setPrefillData, currentEventDraft, setCurrentEventDraft } = useAIAssistantStore(state => ({
    setPrefillData: state.setPrefillData,
    currentEventDraft: state.currentEventDraft,
    setCurrentEventDraft: state.setCurrentEventDraft,
  }));
  const router = useRouter();

  const getCurrentDraftSummary = useCallback(() => {
    if (!currentEventDraft || Object.keys(currentEventDraft).length === 0) return "nothing specific yet";
    let summary = [];
    if (currentEventDraft.title && currentEventDraft.title !== "My New Event") summary.push(`event titled "${currentEventDraft.title}"`);
    if (currentEventDraft.eventType) summary.push(`a ${currentEventDraft.eventType}`);
    if (currentEventDraft.date) summary.push(`on ${new Date(currentEventDraft.date).toLocaleDateString()}`);
    if (currentEventDraft.location) {
        const loc = typeof currentEventDraft.location === 'string' ? currentEventDraft.location : currentEventDraft.location.address;
        if(loc) summary.push(`at ${loc}`);
    }
    if (currentEventDraft.maxGuests) summary.push(`for ${currentEventDraft.maxGuests} guests`);
    return summary.length > 0 ? summary.join(", ") : "an event";
  }, [currentEventDraft]);

  useEffect(() => { 
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    const userMessage: ChatMessage = { id: uuidv4(), role: 'user', content: inputValue, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const lowerUserMessage = userMessage.content.toLowerCase();
      let aiResponseContent = "I'm sorry, I'm not sure how I can help with that. Could you try rephrasing, or ask about planning an event?";
      let suggestions: ChatMessage['suggestions'] = [];
      let prefillPayload: Partial<PlaceholderEventFormData> | undefined = undefined;
      
      const draftSummary = getCurrentDraftSummary();
      const eventTypeForMenu = currentEventDraft?.eventType || (parseEventDetailsFromMessage(userMessage.content).eventType);

      if (lowerUserMessage.includes("food") || lowerUserMessage.includes("menu ideas")) {
        if (eventTypeForMenu === 'party' || eventTypeForMenu === 'birthday party') aiResponseContent = `For your ${eventTypeForMenu || 'party'} (${draftSummary}), finger foods like mini quiches, sliders, and a dessert table often work well! Don't forget drinks. We should consider dietary needs.`;
        else if (eventTypeForMenu === 'meetup' || eventTypeForMenu === 'conference') aiResponseContent = `For your ${eventTypeForMenu || 'professional event'} (${draftSummary}), coffee, tea, water, and perhaps light snacks like pastries or fruit platters are common.`;
        else if (eventTypeForMenu === 'dinner') aiResponseContent = `For a dinner party (${draftSummary}), how about a three-course meal? Perhaps Italian?`;
        else aiResponseContent = "Thinking about food... What kind of event are we planning? Knowing the type helps me suggest a menu!";
        suggestions.push({ label: "Add 'Collect Dietary Info' Task", actionType: 'other', payload: { taskTitle: "Collect Dietary Info" } });
      } else if (lowerUserMessage.includes("save money") || lowerUserMessage.includes("budget")) {
        aiResponseContent = `To save money on your ${draftSummary}, consider hosting on a weekday, looking for bundle deals, or making it a potluck if appropriate. Would you like to create a task to track the budget?`;
        suggestions.push({ label: "Add 'Track Budget' Task", actionType: 'other', payload: { taskTitle: "Track Event Budget" } });
      } else if (lowerUserMessage.match(/find a (caterer|dj|photographer|venue)/)) {
        const vendorType = lowerUserMessage.match(/find a (caterer|dj|photographer|venue)/)?.[1];
        aiResponseContent = `I can help look for a ${vendorType}. What's your approximate budget and preferred style for the ${vendorType}? We're planning for ${draftSummary}.`;
        if (userMessage.content.split(" ").length > 3) { 
             aiResponseContent = `Okay, for your ${draftSummary}, I found these mock ${vendorType}s: 'Awesome ${vendorType} Co.' (4.5 stars) and 'Pro ${vendorType} Services' (4 stars).`;
             suggestions.push({ label: `Add "Contact Awesome ${vendorType} Co." to Notes`, actionType: 'other', payload: { note: `Contact Awesome ${vendorType} Co.` } });
        }
      } else {
        const parsedDetails = parseEventDetailsFromMessage(userMessage.content);
        if (Object.keys(parsedDetails).length > (parsedDetails.title === "My New Event" ? 1: 0) || (parsedDetails.title && parsedDetails.title !== "My New Event") ) {
            prefillPayload = { ...(currentEventDraft || {}), ...parsedDetails }; // Merge with current draft
            aiResponseContent = `Okay, I've updated the draft based on your message: "${prefillPayload.title || 'New Event'}". Would you like to open the event form with these details?`;
            suggestions.push({ label: "Open Event Form with Updated Draft", actionType: 'navigate_and_prefill', payload: { path: '/events/create', prefillData: prefillPayload }});
        } else if (lowerUserMessage.includes("hello") || lowerUserMessage.includes("hi")) {
          aiResponseContent = `Hello! How can I help you plan your ${draftSummary} today? You can ask for menu ideas, budget tips, or help finding vendors.`;
        } else if (lowerUserMessage.includes("help")) {
           aiResponseContent = "Sure, I can help you plan events. Try telling me something like: 'Plan a birthday party for John next Friday for 20 people at the park.' Or ask about food, budget, or vendors for the event you're currently drafting.";
        }
      }

      const aiMessage: ChatMessage = {
        id: uuidv4(), role: 'assistant', content: aiResponseContent,
        timestamp: new Date(), suggestions: suggestions.length > 0 ? suggestions : undefined,
        prefillData, // This field might be redundant if action payload contains the prefill data
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: NonNullable<ChatMessage['suggestions']>[0]) => {
    if (suggestion.actionType === 'navigate_and_prefill' && suggestion.payload?.path) {
      if (suggestion.payload.prefillData) {
        setPrefillData(suggestion.payload.prefillData);
        setCurrentEventDraft(suggestion.payload.prefillData); // Also update current draft
      }
      toast.info("Opening event form...", { description: suggestion.payload.prefillData ? "Drafting details..." : "" });
      router.push(suggestion.payload.path);
      onClose(); 
    } else if (suggestion.actionType === 'other' && suggestion.payload?.taskTitle) {
      toast.success(`Task "${suggestion.payload.taskTitle}" added (simulated).`);
      console.log("AI Suggestion Action (Task):", suggestion.payload.taskTitle);
    } else if (suggestion.actionType === 'other' && suggestion.payload?.note) {
      toast.success(`Note "${suggestion.payload.note}" added to event (simulated).`);
      console.log("AI Suggestion Action (Note):", suggestion.payload.note);
    } else {
      toast.info(`Action: ${suggestion.label} (Simulated).`);
      console.log("AI Suggestion Action (Other):", suggestion);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-full max-w-md z-50">
      <Card className="flex flex-col h-[60vh] max-h-[700px] shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle>AI Event Assistant</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <span className="sr-only">Close chat</span>&times;
          </Button>
        </CardHeader>
        <ScrollArea ref={scrollAreaRef} className="flex-grow p-4 space-y-4 bg-muted/30">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex mb-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg shadow-sm ${ msg.role === 'user' ? 'bg-primary text-primary-foreground' : msg.role === 'assistant' ? 'bg-background border' : 'bg-muted text-muted-foreground' }`}>
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">{format(msg.timestamp, 'p')} {msg.role === 'assistant' && <Bot className="inline ml-1 h-3 w-3" />} {msg.role === 'user' && <User className="inline ml-1 h-3 w-3" />}</p>
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.suggestions.map((sugg, index) => ( <Button key={index} variant="outline" size="sm" className="w-full bg-background/80 hover:bg-background text-xs" onClick={() => handleSuggestionClick(sugg)}> {sugg.label} </Button> ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && ( <div className="flex justify-start mb-3"><div className="max-w-[80%] p-3 rounded-lg bg-background border shadow-sm"><p className="text-sm text-muted-foreground italic">Assistant is typing...</p></div></div> )}
        </ScrollArea>
        <CardFooter className="pt-4 border-t">
          <div className="flex w-full items-center space-x-2">
            <Input type="text" placeholder="Ask for event planning help..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} disabled={isTyping} />
            <Button onClick={handleSendMessage} disabled={isTyping || inputValue.trim() === ''}><Send className="h-4 w-4" /><span className="sr-only">Send</span></Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
