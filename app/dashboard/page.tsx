import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import ClientDashboard from './ClientDashboard';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const accountId = session?.user?.defaultAccountId;

  return (
    <ClientDashboard
      defaultAccountId={accountId}
    />
  );
}