import { APP_REVISION } from '$app/env/private';

export function GET() {
  return Response.json({ revision: APP_REVISION }, { headers: { 'Cache-Control': 'no-store' } });
}
