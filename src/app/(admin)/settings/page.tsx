'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/admin/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  Loader2, 
  Save, 
  Globe, 
  User, 
  Lock, 
  Briefcase,
  ShieldCheck,
  Mail,
  X,
  Link,
  GitBranch
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [savingStatus, setSavingStatus] = useState<string | null>(null)
  const [siteSettings, setSiteSettings] = useState({
    id: '',
    availability_status: true,
    bio: '',
    tagline: '',
    social_github: '',
    social_linkedin: '',
    social_twitter: ''
  })
  const [accountEmail, setAccountEmail] = useState('')
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setAccountEmail(user.email || '')

        const { data: settings, error } = await supabase.from('site_settings').select('*').single()
        if (settings) {
          setSiteSettings({
            id: settings.id || '',
            availability_status: settings.availability_status ?? true,
            bio: settings.bio || '',
            tagline: settings.tagline || '',
            social_github: settings.social_github || '',
            social_linkedin: settings.social_linkedin || '',
            social_twitter: settings.social_twitter || ''
          })
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [supabase])

  const saveSiteSettings = async () => {
    setSavingStatus('site')
    try {
      const { error } = await supabase
        .from('site_settings')
        .update(siteSettings)
        .eq('id', siteSettings.id)

      if (error) throw error
      toast.success('Site settings updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update site settings')
    } finally {
      setSavingStatus(null)
    }
  }

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      toast.error('Passwords do not match')
      return
    }

    setSavingStatus('password')
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      })
      if (error) throw error
      toast.success('Password updated successfully')
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setSavingStatus(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#7C3AED] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <PageHeader title="Platform Settings" />

      <Tabs defaultValue="site" className="space-y-8">
        <TabsList className="bg-[#111111] border border-[#161616] p-1.5 rounded-2xl h-14 w-auto inline-flex shadow-xl">
           <TabsTrigger 
             value="site" 
             className="data-[state=active]:bg-[#161616] data-[state=active]:text-white data-[state=active]:shadow-xl text-[#A1A1AA] hover:text-white transition-all rounded-xl h-full px-8 font-bold uppercase text-[10px] tracking-widest gap-2"
           >
             <Globe className="w-4 h-4" /> Portfolio Identity
           </TabsTrigger>
           <TabsTrigger 
             value="account" 
             className="data-[state=active]:bg-[#161616] data-[state=active]:text-white data-[state=active]:shadow-xl text-[#A1A1AA] hover:text-white transition-all rounded-xl h-full px-8 font-bold uppercase text-[10px] tracking-widest gap-2"
           >
             <ShieldCheck className="w-4 h-4" /> Security Access
           </TabsTrigger>
        </TabsList>

        <TabsContent value="site" className="space-y-10 animate-in fade-in duration-300">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Core Profile */}
              <div className="bg-[#111111] border border-[#161616] p-8 rounded-2xl shadow-2xl space-y-8">
                 <div className="flex items-center gap-3 border-b border-[#262626] pb-4">
                    <User className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-bold font-sans text-white">Public Profile</h3>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-5 bg-[#161616] border border-[#262626] rounded-2xl shadow-inner transition-all hover:border-[#7C3AED]/20">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "p-3 rounded-xl transition-colors",
                            siteSettings.availability_status ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                          )}>
                             <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-white text-xs font-bold uppercase tracking-widest">Accepting New Work</p>
                             <p className="text-[#52525B] text-[10px] uppercase font-bold tracking-widest leading-none mt-1">Updates global availability status</p>
                          </div>
                       </div>
                       <Switch 
                         checked={siteSettings.availability_status}
                         onCheckedChange={(c) => setSiteSettings(prev => ({ ...prev, availability_status: c }))}
                         className="data-[state=checked]:bg-emerald-500"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest block px-1">Catchy Headline / Role Tagline</label>
                       <Input 
                         value={siteSettings.tagline}
                         onChange={(e) => setSiteSettings(prev => ({ ...prev, tagline: e.target.value }))}
                         placeholder="e.g. Building world-class digital experiences..." 
                         className="bg-[#161616] border-none shadow-inner h-12 text-white rounded-xl font-bold"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest block px-1">Professional Bio</label>
                       <Textarea 
                         value={siteSettings.bio}
                         onChange={(e) => setSiteSettings(prev => ({ ...prev, bio: e.target.value }))}
                         placeholder="Brief summary used in about sections..." 
                         className="bg-[#161616] border-none shadow-inner min-h-[140px] text-white rounded-xl italic leading-relaxed"
                       />
                    </div>
                 </div>
              </div>

              {/* Social Integration */}
              <div className="bg-[#111111] border border-[#161616] p-8 rounded-2xl shadow-2xl space-y-8">
                 <div className="flex items-center gap-3 border-b border-[#262626] pb-4">
                    <Globe className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-bold font-sans text-white">Social Ecosystem</h3>
                 </div>

                 <div className="space-y-6">
                    <SocialInput 
                      icon={<GitBranch className="w-4 h-4" />} 
                      label="GitHub Repository Proxy"
                      value={siteSettings.social_github}
                      onChange={(v:any) => setSiteSettings(prev => ({ ...prev, social_github: v }))}
                    />
                    <SocialInput  
                      icon={<Link className="w-4 h-4" />} 
                      label="LinkedIn Network Link"
                      value={siteSettings.social_linkedin}
                      onChange={(v:any) => setSiteSettings(prev => ({ ...prev, social_linkedin: v }))}
                    />
                    <SocialInput 
                      icon={<X className="w-4 h-4" />} 
                      label="X / Twitter Handle"
                      value={siteSettings.social_twitter}
                      onChange={(v:any) => setSiteSettings(prev => ({ ...prev, social_twitter: v }))}
                    />
                    
                    <div className="pt-6 border-t border-[#161616]">
                       <Button 
                         onClick={saveSiteSettings} 
                         disabled={savingStatus === 'site'}
                         className="w-full h-14 bg-white text-black hover:bg-[#A1A1AA] transition-all rounded-xl font-bold uppercase text-xs tracking-widest gap-2 shadow-2xl shadow-white/5 active:scale-95"
                       >
                         {savingStatus === 'site' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                         Save Profile Configuration
                       </Button>
                    </div>
                 </div>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="account" className="space-y-10 animate-in fade-in duration-300">
           <div className="max-w-xl mx-auto space-y-8">
              <div className="bg-[#111111] border border-[#161616] p-10 rounded-3xl shadow-2xl space-y-10">
                 <div className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 bg-[#161616] rounded-2xl border border-[#262626] flex items-center justify-center mb-6 shadow-xl">
                       <Lock className="w-6 h-6 text-[#7C3AED]" />
                    </div>
                    <h3 className="text-2xl font-bold font-sans text-white tracking-tight">Security Credentials</h3>
                    <p className="text-[#A1A1AA] text-sm">Update your administrative access password</p>
                 </div>

                 <div className="flex items-center gap-4 p-5 bg-[#161616] border border-[#262626] rounded-2xl shadow-inner">
                    <div className="p-2.5 bg-[#7C3AED]/10 rounded-xl text-[#7C3AED]">
                       <Mail className="w-4 h-4" />
                    </div>
                    <div>
                       <p className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest">Registered Administrator</p>
                       <p className="text-white text-sm font-bold tracking-tight">{accountEmail}</p>
                    </div>
                 </div>

                 <form onSubmit={updatePassword} className="space-y-6">
                    <div className="space-y-4">
                       <Input 
                         type="password" 
                         placeholder="New Secure Password" 
                         value={passwords.new}
                         onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                         className="bg-[#161616] border-none shadow-inner h-14 rounded-2xl text-white font-mono px-6"
                       />
                       <Input 
                         type="password" 
                         placeholder="Confirm New Password" 
                         value={passwords.confirm}
                         onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                         className="bg-[#161616] border-none shadow-inner h-14 rounded-2xl text-white font-mono px-6"
                       />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={savingStatus === 'password'}
                      className="w-full h-14 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-2xl font-bold uppercase text-xs tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                    >
                      {savingStatus === 'password' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Password Update'}
                    </Button>
                 </form>
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SocialInput({ icon, label, value, onChange }: any) {
  return (
    <div className="space-y-2">
       <label className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest block px-1">{label}</label>
       <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-[#262626] rounded-lg text-[#A1A1AA] group-focus-within:bg-[#7C3AED]/10 group-focus-within:text-[#7C3AED] transition-all">
             {icon}
          </div>
          <Input 
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..." 
            className="bg-[#161616] border-none shadow-inner h-12 text-white rounded-xl pl-14 font-mono text-[10px] placeholder:opacity-30 focus:border-[#7C3AED]/30 transition-all" 
          />
       </div>
    </div>
  )
}
