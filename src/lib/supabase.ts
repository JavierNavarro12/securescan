import { createClient } from '@supabase/supabase-js';
import type { DbScan, DbPayment } from '@/types';

// Client-side Supabase client (limited permissions)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side Supabase client (full permissions)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Database helper functions
export const db = {
  // Create a new scan
  async createScan(url: string, ipAddress?: string): Promise<DbScan | null> {
    const { data, error } = await supabaseAdmin
      .from('scans')
      .insert({
        url,
        status: 'pending',
        ip_address: ipAddress,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating scan:', error);
      return null;
    }
    return data;
  },

  // Get scan by ID
  async getScan(id: string): Promise<DbScan | null> {
    const { data, error } = await supabaseAdmin
      .from('scans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error getting scan:', error);
      return null;
    }
    return data;
  },

  // Update scan with results
  async updateScan(
    id: string,
    updates: Partial<Omit<DbScan, 'id' | 'created_at'>>
  ): Promise<DbScan | null> {
    const { data, error } = await supabaseAdmin
      .from('scans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating scan:', error);
      return null;
    }
    return data;
  },

  // Check if URL was scanned recently (within 1 hour)
  async getRecentScan(url: string): Promise<DbScan | null> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from('scans')
      .select('*')
      .eq('url', url)
      .eq('status', 'completed')
      .gte('completed_at', oneHourAgo)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return null;
    }
    return data;
  },

  // Count scans from IP in last hour (for rate limiting)
  async countRecentScans(ipAddress: string): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { count, error } = await supabaseAdmin
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ipAddress)
      .gte('created_at', oneHourAgo);

    if (error) {
      console.error('Error counting scans:', error);
      return 0;
    }
    return count || 0;
  },

  // Mark scan as paid
  async markScanAsPaid(scanId: string, stripeSessionId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('scans')
      .update({
        is_paid: true,
        stripe_session_id: stripeSessionId,
      })
      .eq('id', scanId);

    return !error;
  },

  // Create payment record
  async createPayment(
    scanId: string,
    stripePaymentId: string,
    amount: number,
    status: 'pending' | 'completed' | 'failed'
  ): Promise<DbPayment | null> {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert({
        scan_id: scanId,
        stripe_payment_id: stripePaymentId,
        amount,
        status,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating payment:', error);
      return null;
    }
    return data;
  },

  // Get total scans count (for social proof)
  async getTotalScansCount(): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    if (error) {
      return 0;
    }
    return count || 0;
  },

  // Get total vulnerabilities found (for social proof)
  async getTotalVulnerabilitiesCount(): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from('scans')
      .select('results')
      .eq('status', 'completed')
      .not('results', 'is', null);

    if (error || !data) {
      return 0;
    }

    return data.reduce((total, scan) => {
      const results = scan.results as any[];
      return total + (results?.length || 0);
    }, 0);
  },
};
