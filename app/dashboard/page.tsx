import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import ClientDashboard from './ClientDashboard';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const clientId = session?.user?.clientId;
  const accountId = session?.user?.defaultAccountId;

  if (!clientId) {
    return <div>Error: Not logged in</div>;
  }

  return (
    <ClientDashboard
      defaultAccountId={accountId}
    />
  );
}