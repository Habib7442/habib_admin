'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2, UserPlus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      if (error) throw error

      if (data?.user?.identities?.length === 0) {
        toast.error('This email is already registered')
        return
      }

      toast.success('Account created! Please check your email for the confirmation link.')
      router.push('/login')
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in duration-1000 slide-in-from-bottom-5">
        <div className="flex justify-center mb-10">
          <div className="bg-[#111111] p-4 rounded-3xl border border-[#262626] shadow-2xl shadow-indigo-500/10">
            <UserPlus className="w-10 h-10 text-[#7C3AED]" />
          </div>
        </div>
        
        <Card className="bg-[#111111] border-[#262626] shadow-2xl shadow-black/50 overflow-hidden rounded-2xl">
          <CardHeader className="space-y-2 pb-2">
            <div className="flex items-center justify-between">
                <Link href="/login" className="text-[#52525B] hover:text-white transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-widest">
                    <ArrowLeft className="w-3 h-3" /> Back
                </Link>
                <div className="px-3 py-1 rounded-full bg-[#161616] border border-[#262626] text-[10px] font-bold text-[#7C3AED] uppercase tracking-widest">
                    Registration
                </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white text-center tracking-tight mt-4">Create Admin Account</CardTitle>
            <CardDescription className="text-[#A1A1AA] text-center">
              Register your credentials to manage your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                          Email Address
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="admin@example.com" 
                          {...field} 
                          className="bg-[#161616] border-[#262626] text-white focus:border-[#7C3AED] h-12 rounded-xl transition-all"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white text-[10px] font-bold uppercase tracking-widest">Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          className="bg-[#161616] border-[#262626] text-white focus:border-[#7C3AED] h-12 rounded-xl transition-all"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white text-[10px] font-bold uppercase tracking-widest">Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          className="bg-[#161616] border-[#262626] text-white focus:border-[#7C3AED] h-12 rounded-xl transition-all"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 bg-white hover:bg-white/90 text-black font-bold text-sm rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 mt-6"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    'Create My Account'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="bg-[#161616] border-t border-[#262626] py-6 flex flex-col gap-4">
            <p className="text-xs text-[#52525B] text-center">
                Already have an account? <Link href="/login" className="text-[#7C3AED] hover:underline font-bold">Sign In</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
