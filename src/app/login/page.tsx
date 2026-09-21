'use client'

import { useActionState } from 'react'
import { login, type LoginState } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {})

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <form action={action} className="w-full max-w-sm space-y-5 rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Admin login</h1>
          <p className="text-sm text-neutral-400">Enter the admin password to continue.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
        </div>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </main>
  )
}
