"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { CreateUserForm } from '../CreateUserForm';

export const metadata = { title: 'Create User' };

export default function CreateUserPage() {
  const handleUserCreated = () => {
    if (typeof window !== 'undefined') {
      window.location.assign('/users');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="container mx-auto">
        <CardHeader>
          <CardTitle>Create User</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateUserForm onUserCreated={handleUserCreated} />
        </CardContent>
      </Card>
    </div>
  );
}