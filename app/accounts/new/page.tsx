import { NewAccountForm } from './form';

export const metadata = { title: 'Create Account' };

export default function NewAccountPage() {
  return (
    <div className="w-full max-w-md rounded-lg p-8 shadow-md">
      <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">Create a New Account</h1>
      <NewAccountForm />
    </div>
  );
}
