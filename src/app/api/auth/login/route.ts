import { NextRequest, NextResponse } from 'next/server'
import { createSessionToken, getSessionCookieName, getSessionCookieOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = await createSessionToken()
  const response = NextResponse.json({ success: true })
  response.cookies.set(getSessionCookieName(), token, getSessionCookieOptions())
  return response
}
