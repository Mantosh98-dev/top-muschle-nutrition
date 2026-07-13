import { supabaseClient } from './supabase-client.js';

// Helper to check configuration
function checkConfig() {
  if (!supabaseClient) {
    throw new Error('Supabase client is not initialized. Please verify credentials in js/config.js.');
  }
}

/* --- Settings Database Actions --- */
export async function fetchSettings() {
  checkConfig();
  const { data, error } = await supabaseClient
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 means row not found
    throw error;
  }
  return data;
}

export async function updateSettings(settingsData) {
  checkConfig();

  // Clean up settingsData to ensure we don't send undefined fields
  const cleanData = {};
  for (const key in settingsData) {
    if (settingsData[key] !== undefined) {
      cleanData[key] = settingsData[key];
    }
  }

  // Fetch the current columns of settings table dynamically by querying row 1
  let existingRow = null;
  try {
    const { data } = await supabaseClient
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();
    existingRow = data;
  } catch (e) {
    console.warn("Failed to fetch current settings schema:", e);
  }

  // Filter payload keys to only include columns that actually exist in the table
  if (existingRow) {
    for (const key in cleanData) {
      if (!(key in existingRow)) {
        console.warn(`Column "${key}" does not exist in settings table, filtering out of payload.`);
        delete cleanData[key];
      }
    }
  }

  // Attempt to update the existing row with ID 1
  const { data, error } = await supabaseClient
    .from('settings')
    .update(cleanData)
    .eq('id', 1)
    .select()
    .single();

  if (error) {
    console.error("Supabase update error:", error);
    // If it's a PGRST116 (No rows found) or similar, fallback to upsert
    if (error.code === 'PGRST116' || error.message.includes('0 rows') || error.code === 'PGRST110') {
      const { data: upsertData, error: upsertError } = await supabaseClient
        .from('settings')
        .upsert({ id: 1, ...cleanData })
        .select()
        .single();
      if (upsertError) {
        console.error("Supabase upsert fallback error:", upsertError);
        throw upsertError;
      }
      return upsertData;
    }
    throw error;
  }
  return data;
}

export async function fetchCategories() {
  checkConfig();
  const { data, error } = await supabaseClient
    .from('categories')
    .select('*');

  if (error) throw error;

  // Custom sort order based on category names (case-insensitive)
  const customOrder = [
    'protein',
    'whey protein',
    'mass gainer',
    'gainer',
    'creatine',
    'pre workout',
    'amino acid supplements',
    'glucose',
    'health and wellness',
    'vitamins',
    'accessories'
  ];

  return data.sort((a, b) => {
    const nameA = (a.name || '').toLowerCase().trim();
    const nameB = (b.name || '').toLowerCase().trim();
    
    const indexA = customOrder.indexOf(nameA);
    const indexB = customOrder.indexOf(nameB);
    
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    
    return nameA.localeCompare(nameB);
  });
}

export async function saveCategory(categoryData) {
  checkConfig();
  const slug = categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const payload = { ...categoryData, slug };

  const { data, error } = await supabaseClient
    .from('categories')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  checkConfig();
  const { error } = await supabaseClient
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/* --- Products Database Actions --- */
export async function fetchProducts(filters = {}) {
  checkConfig();
  let query = supabaseClient
    .from('products')
    .select(`
      *,
      categories (id, name),
      product_images (id, image_url, sort_order),
      reviews (rating, approved)
    `);

  if (filters.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }
  
  if (filters.category_id) {
    query = query.eq('category_id', filters.category_id);
  }

  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  // Sort featured products first, then new arrivals
  query = query.order('featured', { ascending: false })
               .order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  // Process data to sort images by sort_order
  return data.map(product => {
    if (product.product_images) {
      product.product_images.sort((a, b) => a.sort_order - b.sort_order);
    }
    return product;
  });
}

export async function fetchProductBySlug(slug) {
  checkConfig();
  const { data, error } = await supabaseClient
    .from('products')
    .select(`
      *,
      categories (id, name),
      product_images (id, image_url, sort_order),
      reviews (rating, approved)
    `)
    .eq('slug', slug)
    .single();

  if (error) throw error;

  if (data && data.product_images) {
    data.product_images.sort((a, b) => a.sort_order - b.sort_order);
  }
  return data;
}

export async function fetchProductById(id) {
  checkConfig();
  const { data, error } = await supabaseClient
    .from('products')
    .select(`
      *,
      product_images (id, image_url, sort_order),
      reviews (rating, approved)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  
  if (data && data.product_images) {
    data.product_images.sort((a, b) => a.sort_order - b.sort_order);
  }
  return data;
}

export async function saveProduct(productData, imageUrls = []) {
  checkConfig();
  const slug = productData.slug || productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const productPayload = { ...productData, slug };

  // 1. Insert or update the product record
  const { data: product, error: productError } = await supabaseClient
    .from('products')
    .upsert(productPayload)
    .select()
    .single();

  if (productError) throw productError;

  // 2. Sync product images
  // Delete existing images
  const { error: deleteError } = await supabaseClient
    .from('product_images')
    .delete()
    .eq('product_id', product.id);

  if (deleteError) throw deleteError;

  // Insert new image records
  if (imageUrls.length > 0) {
    const imagePayloads = imageUrls.slice(0, 10).map((url, index) => ({
      product_id: product.id,
      image_url: url,
      sort_order: index
    }));

    const { error: insertError } = await supabaseClient
      .from('product_images')
      .insert(imagePayloads);

    if (insertError) throw insertError;
  }

  return product;
}

export async function deleteProduct(id) {
  checkConfig();
  const { error } = await supabaseClient
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/* --- Authentication Codes Database Actions --- */
export async function fetchAuthCodes() {
  checkConfig();
  const { data, error } = await supabaseClient
    .from('authentication_codes')
    .select(`
      *,
      products (id, title)
    `);

  if (error) throw error;
  return data;
}

export async function fetchAuthCodeById(id) {
  checkConfig();
  const { data, error } = await supabaseClient
    .from('authentication_codes')
    .select(`
      *,
      products (id, title)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function saveAuthCode(codeData) {
  checkConfig();
  const { data, error } = await supabaseClient
    .from('authentication_codes')
    .upsert(codeData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAuthCode(id) {
  checkConfig();
  const { error } = await supabaseClient
    .from('authentication_codes')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// Secure Product Code Verification (runs the PostgreSQL verify_product_code RPC)
export async function verifyProductCode(code) {
  checkConfig();
  // Call the verify_product_code stored procedure (RPC) in Supabase
  const { data, error } = await supabaseClient.rpc('verify_product_code', {
    input_code: code.trim().toUpperCase()
  });

  if (error) throw error;
  
  if (data && data.length > 0) {
    return data[0]; // Returns { verified: true, product_name, product_image, manufacturing_date, expiry_date, status }
  }
  
  return { verified: false };
}

/* --- Supabase Storage Image Upload --- */
export async function uploadImage(file, bucketName = 'product-images') {
  checkConfig();
  
  // Sanitise file name
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Upload file to bucket
  const { data, error } = await supabaseClient.storage
    .from(bucketName)
    .upload(filePath, file);

  if (error) throw error;

  // Retrieve public URL
  const { data: publicUrlData } = supabaseClient.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/* --- Reviews Database Actions --- */
export async function fetchReviews(productId) {
  checkConfig();
  const { data, error } = await supabaseClient
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('approved', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchApprovedReviews() {
  checkConfig();
  const { data, error } = await supabaseClient
    .from('reviews')
    .select(`
      *,
      products (id, title)
    `)
    .eq('approved', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function saveReview(reviewData) {
  checkConfig();
  const { data, error } = await supabaseClient
    .from('reviews')
    .upsert(reviewData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchAllReviewsAdmin() {
  checkConfig();
  const { data, error } = await supabaseClient
    .from('reviews')
    .select(`
      *,
      products (id, title)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function deleteReview(id) {
  checkConfig();
  const { error } = await supabaseClient
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function updateReviewApproval(id, approved) {
  checkConfig();
  const { data, error } = await supabaseClient
    .from('reviews')
    .update({ approved })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

