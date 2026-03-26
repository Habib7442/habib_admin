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
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Loader2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean(),
})

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    toast.success('Signed in successfully')
    router.refresh()
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in duration-1000 slide-in-from-bottom-5">
        <div className="flex justify-center mb-10">
          <div className="bg-[#111111] p-4 rounded-3xl border border-[#262626] shadow-2xl shadow-indigo-500/10">
            <ShieldCheck className="w-10 h-10 text-[#7C3AED]" />
          </div>
        </div>
        
        <Card className="bg-[#111111] border-[#262626] shadow-2xl shadow-black/50 overflow-hidden rounded-2xl">
          <CardHeader className="space-y-2 pb-2">
            <CardTitle className="text-2xl font-bold text-white text-center tracking-tight">Welcome Back Admin</CardTitle>
            <CardDescription className="text-[#A1A1AA] text-center">
              Please enter your credentials to access the CMS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white text-xs font-semibold uppercase tracking-wider">Email Address</FormLabel>
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
                      <FormLabel className="text-white text-xs font-semibold uppercase tracking-wider">Password</FormLabel>
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
                
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="rememberMe" 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          className="border-[#262626] data-[state=checked]:bg-[#7C3AED] data-[state=checked]:border-none"
                        />
                        <label
                          htmlFor="rememberMe"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#A1A1AA] cursor-pointer hover:text-white transition-colors"
                        >
                          Remember me
                        </label>
                      </div>
                    )}
                  />
                  <a href="#" className="text-xs text-[#7C3AED] hover:underline">Forgot password?</a>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-md rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    'Authenticate'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="bg-[#161616] border-t border-[#262626] py-6 flex flex-col gap-4">
            <p className="text-xs text-[#A1A1AA] text-center">
                New admin? <Link href="/signup" className="text-[#7C3AED] hover:underline font-bold">Create an Account</Link>
            </p>
            <p className="text-[10px] text-[#52525B] text-center">Secured with Supabase Authentication</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
