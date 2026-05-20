import express from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { upload, uploadToSupabase } from '../lib/storage';

export const adminRouter = express.Router();

// ==========================================
// FILE UPLOAD
// ==========================================
adminRouter.post('/upload', upload.single('productImage'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    const publicUrl = await uploadToSupabase(req.file);
    res.status(200).json({ success: true, data: { url: publicUrl } });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// PRODUCTS CRUD
// ==========================================

// GET all products with optional filters
adminRouter.get('/products', async (req, res, next) => {
  try {
    const { category, status, search, limit = '50', offset = '0' } = req.query;

    let query = supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, data, total: count });
  } catch (error) {
    next(error);
  }
});

// GET single product
adminRouter.get('/products/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: 'Product not found' });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// CREATE product
adminRouter.post('/products', async (req, res, next) => {
  try {
    const { name, slogan, description, price, original_price, category, status, image, images, colors, sizes, features, tags, meta_title, meta_description, slug } = req.body;

    const sku = `SE-${category?.substring(0, 2).toUpperCase() || 'XX'}-${Date.now().toString(36).toUpperCase()}`;

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name, slogan, description, price, original_price, category,
        status: status || 'draft', image, images: images || [], colors: colors || [],
        sizes: sizes || [], features: features || [], tags: tags || [],
        meta_title, meta_description, slug, sku, in_stock: true,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// UPDATE product
adminRouter.put('/products/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// DELETE product
adminRouter.delete('/products/:id', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// ORDERS
// ==========================================

// GET all orders
adminRouter.get('/orders', async (req, res, next) => {
  try {
    const { status, search, limit = '50', offset = '0' } = req.query;

    let query = supabaseAdmin
      .from('orders')
      .select('*, users(name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status) query = query.eq('status', status);
    if (search) query = query.or(`order_number.ilike.%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, data, total: count });
  } catch (error) {
    next(error);
  }
});

// GET single order
adminRouter.get('/orders/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, users(name, email, phone)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// UPDATE order status (also accepts POST for frontend compatibility)
adminRouter.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    // Update shipping_status in sync with order status
    const shippingMap: Record<string, string> = {
      shipped: 'in_transit', delivered: 'delivered', cancelled: 'failed',
    };

    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (shippingMap[status]) updatePayload.shipping_status = shippingMap[status];

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updatePayload)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Create notification for status changes
    if (['shipped', 'delivered', 'cancelled'].includes(status)) {
      await supabaseAdmin.from('notifications').insert({
        type: status === 'cancelled' ? 'system' : 'new_order',
        title: `Order ${data.order_number || data.id} — ${status}`,
        message: note || `Status updated to ${status}`,
        metadata: { order_id: data.id, status },
      }).catch(() => {}); // non-critical
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST alias for status update (frontend uses POST)
adminRouter.post('/orders/:id/status', async (req, res, next) => {
  req.method = 'PATCH';
  // Re-use the PATCH handler by forwarding
  const { status, note } = req.body;
  const validStatuses = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }
  try {
    const shippingMap: Record<string, string> = { shipped: 'in_transit', delivered: 'delivered', cancelled: 'failed' };
    const updatePayload: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (shippingMap[status]) updatePayload.shipping_status = shippingMap[status];

    const { data, error } = await supabaseAdmin
      .from('orders').update(updatePayload).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

// SAVE admin note on an order
adminRouter.post('/orders/:id/note', async (req, res, next) => {
  try {
    const { note } = req.body;
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ admin_note: note || '', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// ADD tracking info to an order
adminRouter.post('/orders/:id/tracking', async (req, res, next) => {
  try {
    const { tracking_number, courier } = req.body;
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({
        tracking_number,
        courier,
        shipping_status: 'label_created',
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// NOTIFICATIONS
// ==========================================

adminRouter.get('/notifications', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/notifications/read', async (req, res, next) => {
  try {
    const { ids } = req.body;
    let query = supabaseAdmin.from('notifications').update({ is_read: true });
    if (ids && ids.length > 0) {
      query = query.in('id', ids);
    } else {
      // Mark all as read
      query = query.eq('is_read', false);
    }
    const { error } = await query;
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// RETURNS
// ==========================================

adminRouter.get('/returns', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('returns')
      .select('*, orders(order_number, total), users(name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/returns/:id', async (req, res, next) => {
  try {
    const { status, admin_note, refund_amount } = req.body;
    const { data, error } = await supabaseAdmin
      .from('returns')
      .update({ status, admin_note, refund_amount, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // If approved, update order status to 'returned'
    if (status === 'approved' && data.order_id) {
      await supabaseAdmin.from('orders')
        .update({ status: 'returned', updated_at: new Date().toISOString() })
        .eq('id', data.order_id)
        .catch(() => {});
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// ENHANCED ANALYTICS
// ==========================================

// Revenue time-series (daily/weekly/monthly aggregation)
adminRouter.get('/analytics/revenue', async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const days = Math.min(Number(period), 365);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('total, created_at, status')
      .gte('created_at', since.toISOString())
      .neq('status', 'cancelled')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const byDate: Record<string, { revenue: number; orders: number }> = {};
    (orders || []).forEach(o => {
      const dateKey = new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      if (!byDate[dateKey]) byDate[dateKey] = { revenue: 0, orders: 0 };
      byDate[dateKey].revenue += o.total || 0;
      byDate[dateKey].orders += 1;
    });

    const data = Object.entries(byDate).map(([date, vals]) => ({
      date, revenue: Math.round(vals.revenue), orders: vals.orders,
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// CUSTOMERS
// ==========================================

// GET all customers
adminRouter.get('/customers', async (req, res, next) => {
  try {
    const { search, limit = '50', offset = '0' } = req.query;

    let query = supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, data, total: count });
  } catch (error) {
    next(error);
  }
});

// GET single customer with order history
adminRouter.get('/customers/:id', async (req, res, next) => {
  try {
    const { data: customer, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('user_id', req.params.id)
      .order('created_at', { ascending: false });

    res.json({ success: true, data: { ...customer, orders: orders || [] } });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// ANALYTICS
// ==========================================

adminRouter.get('/analytics/overview', async (req, res, next) => {
  try {
    // Get order stats
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('total, status, created_at');

    if (ordersError) throw ordersError;

    const totalRevenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
    const totalOrders = orders?.length || 0;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const deliveredOrders = orders?.filter(o => o.status === 'delivered').length || 0;

    // Get customer count
    const { count: customerCount } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get product count
    const { count: productCount } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        deliveredOrders,
        customerCount: customerCount || 0,
        productCount: productCount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// DISCOUNTS
// ==========================================

adminRouter.get('/discounts', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/discounts', async (req, res, next) => {
  try {
    const { code, description, type, value, min_order, max_discount, usage_limit, per_user_limit, starts_at, expires_at, applies_to } = req.body;

    const { data, error } = await supabaseAdmin
      .from('discount_codes')
      .insert({
        code: code.toUpperCase(), description, type, value, min_order,
        max_discount, usage_limit, per_user_limit: per_user_limit || 1,
        starts_at, expires_at, applies_to: applies_to || 'all', is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete('/discounts/:id', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('discount_codes')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Discount deleted' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// INVENTORY
// ==========================================

adminRouter.get('/inventory', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id, name, sizes, stock_quantity, sku, status')
      .order('stock_quantity', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/inventory/:id', async (req, res, next) => {
  try {
    const { stock_quantity } = req.body;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({
        stock_quantity,
        in_stock: stock_quantity > 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// SITE SECTIONS (CMS Site Editor)
// ==========================================

// GET all site sections
adminRouter.get('/site-sections', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_sections')
      .select('*')
      .order('section_key');

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
});

// GET single site section by key
adminRouter.get('/site-sections/:key', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_sections')
      .select('*')
      .eq('section_key', req.params.key)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: 'Section not found' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// UPDATE site section by key
adminRouter.put('/site-sections/:key', async (req, res, next) => {
  try {
    const { title, subtitle, body_text, image_url, cta_text, cta_link, meta } = req.body;

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (title !== undefined) updatePayload.title = title;
    if (subtitle !== undefined) updatePayload.subtitle = subtitle;
    if (body_text !== undefined) updatePayload.body_text = body_text;
    if (image_url !== undefined) updatePayload.image_url = image_url;
    if (cta_text !== undefined) updatePayload.cta_text = cta_text;
    if (cta_link !== undefined) updatePayload.cta_link = cta_link;
    if (meta !== undefined) updatePayload.meta = meta;

    const { data, error } = await supabaseAdmin
      .from('site_sections')
      .update(updatePayload)
      .eq('section_key', req.params.key)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// UPSERT site section (create if not exists, update if exists)
adminRouter.post('/site-sections', async (req, res, next) => {
  try {
    const { section_key, title, subtitle, body_text, image_url, cta_text, cta_link, meta } = req.body;

    if (!section_key) {
      return res.status(400).json({ success: false, error: 'section_key is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('site_sections')
      .upsert({
        section_key,
        title,
        subtitle,
        body_text,
        image_url,
        cta_text,
        cta_link,
        meta: meta || {},
      }, { onConflict: 'section_key' })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});
