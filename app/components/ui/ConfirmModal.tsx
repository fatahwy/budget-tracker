import React from 'react';
import { Button } from './button';

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title = 'Confirmation',
  message,
  onCancel,
  onConfirm,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded shadow p-6 w-96">
        <div className="font-semibold text-lg mb-2">{title}</div>
        <div className="text-sm mb-4">{message}</div>
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" className="px-3 py-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" className="px-3 py-1" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;