
import { supabase } from './src/lib/supabaseClient';

async function checkCoupons() {
  try {
    const { data, error } = await supabase.from('coupons').select('*').limit(1);
    if (error) {
      console.error('Error fetching coupons:', error.message);
    } else {
      console.log('Coupons found:', data);
    }
  } catch (err) {
    console.error('Exception checking coupons:', err);
  }
}

checkCoupons();
