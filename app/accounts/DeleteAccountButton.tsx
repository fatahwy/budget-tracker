'use client';

import { useState } from 'react';

export function DeleteAccountButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/accounts', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.reload();
      } else {
        alert(data.message ?? 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleDelete} disabled={loading} className="text-red-600 hover:underline">
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
}