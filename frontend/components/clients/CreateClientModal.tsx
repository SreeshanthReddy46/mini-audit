'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<any>;
}

export function CreateClientModal({ isOpen, onClose, onCreate }: CreateClientModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Client company name is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onCreate(name.trim());
      setName('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Audit Client">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-500">
          Enter the legal business entity name. This client will be isolated strictly to your firm.
        </p>

        <Input
          label="Client Business Name"
          placeholder="e.g. Tata Steel Audits / Acme Corp"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error || undefined}
          autoFocus
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={loading} disabled={!name.trim()}>
            Create Client
          </Button>
        </div>
      </form>
    </Modal>
  );
}
