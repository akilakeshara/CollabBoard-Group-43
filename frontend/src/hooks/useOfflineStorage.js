import { useState, useEffect } from 'react';
import localforage from 'localforage';

export const useOfflineStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const item = await localforage.getItem(key);
        if (item) setStoredValue(item);
      } catch (error) {
        console.error('Error reading from localforage', error);
      }
    };
    loadFromStorage();
  }, [key]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setValue = async (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await localforage.setItem(key, valueToStore);
    } catch (error) {
      console.error('Error saving to localforage', error);
    }
  };

  return [storedValue, setValue, isOnline];
};
