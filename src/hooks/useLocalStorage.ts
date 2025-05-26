import { useState, useEffect } from 'react';

// Type for the value that can be stored
type StoredValue<T> = T | null;

// Hook
function useLocalStorage<T>(key: string, initialValue?: T): [StoredValue<T>, (value: T | null) => void, () => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<StoredValue<T>>(() => {
    if (typeof window === 'undefined') {
      return initialValue !== undefined ? initialValue : null;
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? (JSON.parse(item) as T) : (initialValue !== undefined ? initialValue : null);
    } catch (error) {
      // If error also return initialValue
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue !== undefined ? initialValue : null;
    }
  });

  // useEffect to update local storage when the state changes
  // This effect should ideally run only when the key or storedValue changes.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      if (storedValue === null || storedValue === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, storedValue]);

  const setValue = (value: T | null) => {
    setStoredValue(value);
  };

  const removeValue = () => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
      setStoredValue(null); // Also update state to reflect removal
    } catch (error) {
      console.error(`Error removing localStorage key “${key}”:`, error);
    }
  };
  
  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
