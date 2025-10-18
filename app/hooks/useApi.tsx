import { AxiosRequestConfig, AxiosResponseHeaders } from 'axios';
import axios from 'axios';
import * as React from 'react';

export function useApi() {
  const [error, setError] = React.useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const request = async <T = any>(config: AxiosRequestConfig): Promise<{ data: T; status: number; statusText?: string; headers: AxiosResponseHeaders | any }> => {
    try {
      const res = await axios(config);
      return res;
    } catch (err: unknown) {
      let message = 'Request failed';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message ?? err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      throw err;
    }
  };

  return { request, error, setError };
}

export default useApi;