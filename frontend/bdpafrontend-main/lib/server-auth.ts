// Server-side auth helper for API routes
// Reads user session from cookies

import { cookies } from 'next/headers';
import { serverStorage } from './server-storage';

export async function getServerUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('skillgap_session');
    
    if (!sessionCookie) {
      return null;
    }

    const sessionData = JSON.parse(sessionCookie.value);
    const user = await serverStorage.getUserById(sessionData.id);
    
    return user ? { id: user.id, email: user.email } : null;
  } catch (error) {
    return null;
  }
}

