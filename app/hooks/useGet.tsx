import { useEffect, useState, useCallback } from 'react';
import { useApi } from './useApi';

export type useGetResult<T> = {
  data: T[];
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export function useGet<T>(endpoint: string): useGetResult<T> {
  const { request } = useApi();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await request<T[]>({ url: endpoint, method: 'GET' });
      const payload = res.data;
      if (Array.isArray(payload)) {
        setData(payload as T[]);
      } else {
        setError('Invalid Response');
      }
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [endpoint, request]);

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, loading, error, reload: fetchData };
}

export default useGet;