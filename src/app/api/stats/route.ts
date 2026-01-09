import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

// Cache stats for 5 minutes
let cachedStats: { scans: number; vulnerabilities: number } | null = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    const now = Date.now();

    // Return cached stats if valid
    if (cachedStats && now - cacheTime < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        stats: cachedStats,
      });
    }

    // Fetch fresh stats
    const [scans, vulnerabilities] = await Promise.all([
      db.getTotalScansCount(),
      db.getTotalVulnerabilitiesCount(),
    ]);

    cachedStats = { scans, vulnerabilities };
    cacheTime = now;

    return NextResponse.json({
      success: true,
      stats: cachedStats,
    });
  } catch (error) {
    console.error('Stats API error:', error);

    // Return fallback stats on error
    return NextResponse.json({
      success: true,
      stats: { scans: 1000, vulnerabilities: 5000 },
    });
  }
}
