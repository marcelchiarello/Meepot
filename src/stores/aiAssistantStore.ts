import {create} from 'zustand';
import { PlaceholderEventFormData } from '@/types/ai_assistant'; // Using the placeholder for now

interface AIAssistantState {
  prefillData: Partial<PlaceholderEventFormData> | null;
  currentEventDraft: Partial<PlaceholderEventFormData> | null; // For AI to be aware of active form data
  setPrefillData: (data: Partial<PlaceholderEventFormData> | null) => void;
  clearPrefillData: () => void;
  setCurrentEventDraft: (draft: Partial<PlaceholderEventFormData> | null) => void;
}

export const useAIAssistantStore = create<AIAssistantState>((set) => ({
  prefillData: null,
  currentEventDraft: null,
  setPrefillData: (data) => set({ prefillData: data }),
  clearPrefillData: () => set({ prefillData: null }),
  setCurrentEventDraft: (draft) => set({ currentEventDraft: draft }),
}));
