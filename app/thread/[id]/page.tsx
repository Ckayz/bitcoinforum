import { ClientThreadPage } from './_client_page';

interface ThreadPageProps {
  params: {
    id: string;
  };
}

export default function ThreadPage({ params }: ThreadPageProps) {
  return <ClientThreadPage threadId={params.id} />;
}
