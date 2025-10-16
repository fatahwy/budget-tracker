"use client";

import React from 'react';
import { CreateUserForm } from '../CreateUserForm';

export default function CreateUserPage() {
  const handleUserCreated = (user: any) => {
    if (typeof window !== 'undefined') {
      window.location.assign('/users');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create User</h1>
      <CreateUserForm onUserCreated={handleUserCreated} />
    </div>
  );
}