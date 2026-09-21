'use server'

import { redirect } from 'next/navigation'
import { checkPassword, createSession, destroySession } from '@/lib/session'

export type LoginState = { error?: string }

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!process.env.ADMIN_PASSWORD) {
    return { error: 'ADMIN_PASSWORD is not set in .env.local' }
  }
  if (!checkPassword(String(formData.get('password') ?? ''))) {
    return { error: 'Wrong password' }
  }
  await createSession()
  redirect('/admin')
}

export async function logout() {
  await destroySession()
  redirect('/login')
}
