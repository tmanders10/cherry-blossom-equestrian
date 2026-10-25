import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

export async function GET(request) {
  // Optional: Verify Vercel Cron Secret to secure the endpoint
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Call the Supabase stored procedure to execute the weekly rollover
    const { data, error } = await supabase.rpc('rollover_active_weeks');

    if (error) {
      console.error('Cron job rollover error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, result: data });
  } catch (err) {
    console.error('Cron job handler failed:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
