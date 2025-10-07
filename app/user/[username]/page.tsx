import { Suspense } from 'react';
import { UserProfileClient } from './_client_page';

interface UserProfilePageProps {
  params: {
    username: string;
  };
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    }>
      <UserProfileClient username={decodeURIComponent(params.username)} />
    </Suspense>
  );
}
