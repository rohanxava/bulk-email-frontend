import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/services/api';

export const useUser = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch((err) => {
        console.error('Error fetching user:', err);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
};
