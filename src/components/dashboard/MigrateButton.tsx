import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { products } from '@/data/products';
import { Database } from 'lucide-react';
import { useDashboardToast } from '@/store/dashboardToast';

export default function MigrateButton() {
  const [loading, setLoading] = useState(false);
  const addToast = useDashboardToast(s => s.addToast);

  const handleMigrate = async () => {
    setLoading(true);
    addToast({ title: 'Migration Started', message: 'Started database migration...', type: 'info' });

    try {
      // 1. Seed Products
      for (const product of products) {
        // Need to hash the ID to UUID or we can just skip hashing if Supabase handles it, 
        // wait, we found earlier it rejects "invalid input syntax for type uuid".
        // Let's use a very basic hash or just generate UUIDs on the fly and don't care about duplicates for this one-time seed,
        // Wait, if we use crypto.randomUUID() it makes new ones, but we need deterministic IDs if possible.
        // Actually, we can just use the provided standard UUIDs for them if we map them.
        
        // A simple string to UUID mapping for our 13 products to ensure they are deterministic:
        const idMap: Record<string, string> = {
          'ts-new-1': '11111111-1111-4111-8111-111111111111',
          'ts-new-2': '22222222-2222-4222-8222-222222222222',
          'ts-new-3': '33333333-3333-4333-8333-333333333333',
          'ts-new-4': '44444444-4444-4444-8444-444444444444',
          'ts-new-5': '55555555-5555-4555-8555-555555555555',
          'sh-new-1': '66666666-6666-4666-8666-666666666666',
          'sh-new-2': '77777777-7777-4777-8777-777777777777',
          'hd-new-1': '88888888-8888-4888-8888-888888888888',
          'hd-new-2': '99999999-9999-4999-8999-999999999999',
          'hd-new-3': 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          'hd-new-4': 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
          'hd-new-5': 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
          'hd-new-6': 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        };

        const dbProduct = {
          id: idMap[product.id] || crypto.randomUUID(),
          name: product.name,
          slug: product.id,
          description: `${product.slogan}. ${product.description}`,
          price: product.price,
          compare_price: null,
          stock_quantity: product.sizeStock?.reduce((sum, s) => sum + s.stock, 0) || 0,
          category: product.category,
          tags: [product.badge, ...(product.features || [])].filter(Boolean),
          colors: product.colors || [],
          images: (product.images || []).map((url, i) => ({
            url,
            alt: product.name,
            isPrimary: i === 0
          })),
          sizes: product.sizes,
          is_published: product.status === 'active',
        };

        await supabase.from('products').upsert(dbProduct, { onConflict: 'id' });
      }

      // 2. Seed Site Sections
      const sections = [
        {
          id: 'ff47bcbf-ff15-4848-88ce-3f712115a32c',
          section_key: 'hero',
          title: 'SLUG\'S ERA',
          subtitle: 'MOVEMENT. NOT MERCH — NEW SEASON',
          cta_text: 'SHOP NOW',
          cta_link: '#products',
          meta: { 
            active: true,
            images: [
              '/images/Female_model_vinyl.webp',
              '/images/turtlemodelimage.webp',
              '/images/slow_down_model.webp',
              '/images/seedhe%20pahad%20se%20model.webp'
            ]
          }
        },
        {
          id: 'e6a8e63a-7a54-4a47-a8a2-2d854e4c92e1',
          section_key: 'sale_banner',
          title: 'SEASON END SALE - GET 20% OFF ON ALL ORDERS',
          cta_link: '/collections',
          meta: { active: true, bgColor: '#C0132A', textColor: '#FFFFFF' }
        },
        {
          id: 'b8b9e63a-7a54-4a47-a8a2-2d854e4c92e2',
          section_key: 'products',
          title: 'The Essential Five',
          subtitle: 'T-Shirt Collection',
          cta_text: 'View All',
          cta_link: '/collections',
          meta: { active: true }
        }
      ];

      for (const section of sections) {
        await supabase.from('site_sections').upsert(section, { onConflict: 'id' });
      }

      addToast({ title: 'Migration Complete', message: 'Migration completed successfully!', type: 'success' });
      // Reload page to fetch new data
      setTimeout(() => window.location.reload(), 1500);
      
    } catch (err: any) {
      console.error(err);
      addToast({ title: 'Migration Failed', message: `Migration failed: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleMigrate}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 bg-[#C0132A]/10 text-[#C0132A] hover:bg-[#C0132A]/20 border border-[#C0132A]/30 rounded-md text-xs font-medium transition-colors"
    >
      <Database size={14} className={loading ? "animate-pulse" : ""} />
      {loading ? 'Migrating...' : 'Seed Database'}
    </button>
  );
}
