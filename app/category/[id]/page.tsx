import { supabase } from '@/lib/supabase';
import { ClientCategoryPage } from './_client_page';

export async function generateStaticParams() {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id');

    if (error) {
      console.error('Error fetching categories for static params:', error);
      return [];
    }

    return categories?.map((category) => ({
      id: category.id,
    })) || [];
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

interface CategoryPageProps {
  params: {
    id: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return <ClientCategoryPage categoryId={params.id} />;
}