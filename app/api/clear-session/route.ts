import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { authOptions } from '@/lib/auth-config';

// Redis configuration - you'll need to add this to your environment variables
const REDIS_URL = (process.env.REDIS_URL || 'redis://localhost:6379').replace(/^"|"$/g, '');

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return new NextResponse('Unauthorized: No user session found', { status: 401 });
    }

    const userEmail = session.user.email;
    const emailHash = createHash('sha256').update(userEmail).digest('hex');
    const sessionKey = `agent_session:${emailHash}`;

    // Import Redis dynamically to avoid issues in development
    const { createClient } = await import('redis');

    const client = createClient({
      url: REDIS_URL,
    });

    await client.connect();

    try {
      // Delete the session data from Redis
      const deleted = await client.del(sessionKey);

      if (deleted > 0) {
        console.log(`Session cleared for user: ${userEmail} (hash: ${emailHash})`);
        return NextResponse.json({
          success: true,
          message: 'Session cleared successfully',
        });
      } else {
        console.log(`No session found for user: ${userEmail} (hash: ${emailHash})`);
        return NextResponse.json({
          success: true,
          message: 'No session data found to clear',
        });
      }
    } finally {
      await client.disconnect();
    }
  } catch (error) {
    console.error('Error clearing session:', error);
    return new NextResponse('Internal server error while clearing session', { status: 500 });
  }
}
