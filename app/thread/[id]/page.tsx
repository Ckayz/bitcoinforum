import { supabase } from '@/lib/supabase';
import { ClientThreadPage } from './_client_page';

export async function generateStaticParams() {
  try {
    const { data: threads, error } = await supabase
      .from('threads')
      .select('id');

    if (error) {
      console.error('Error fetching threads for static params:', error);
      return [];
    }

    return threads?.map((thread) => ({
      id: thread.id,
    })) || [];
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

interface ThreadPageProps {
  params: {
    id: string;
  };
}

export default function ThreadPage({ params }: ThreadPageProps) {
  return <ClientThreadPage threadId={params.id} />;
}