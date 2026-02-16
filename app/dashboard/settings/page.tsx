'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/SessionContext';
import { useTheme } from 'next-themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  User,
  Settings2,
  Monitor,
  Shield,
  CreditCard,
  Save,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  deleteAccountAction,
  updateProfileAction,
  updatePasswordAction,
} from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const {
    user,
    mode,
    setMode,
    theme: currentTheme,
    setTheme,
    refreshUser,
  } = useSession();
  const [mounted, setMounted] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Loading states
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [isModeUpdating, setIsModeUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  // Avoid hydration mismatch for theme selection
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSaveProfile = async () => {
    if (!name) return toast.error('Name is required');
    setIsProfileSaving(true);
    const res = await updateProfileAction({ name });
    if (res.success) {
      await refreshUser();
      toast.success('Profile updated successfully');
    } else {
      toast.error(res.error || 'Failed to update profile');
    }
    setIsProfileSaving(false);
  };

  const handleChangePassword = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      return toast.error('Please fill all password fields');
    }
    if (newPass !== confirmPass) {
      return toast.error('Passwords do not match');
    }
    if (newPass.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setIsPasswordSaving(true);
    const res = await updatePasswordAction({ currentPass, newPass });
    if (res.success) {
      toast.success('Password updated successfully');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      toast.error(res.error || 'Failed to update password');
    }
    setIsPasswordSaving(false);
  };

  const handleModeChange = async (newMode: 'HINT' | 'ASSISTED' | 'ASK') => {
    setIsModeUpdating(true);
    await setMode(newMode);
    toast.success(
      `Mode switched to ${newMode === 'ASK' ? 'Ask Every Time' : newMode.toLowerCase()}`,
    );
    setIsModeUpdating(false);
  };

  return (
    <div className='p-6 max-w-4xl mx-auto space-y-8'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
        <p className='text-muted-foreground'>
          Manage your account settings and application preferences.
        </p>
      </div>

      <Tabs
        defaultValue='profile'
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-5 h-auto p-1 bg-muted/50 rounded-none mb-8'>
          <TabsTrigger
            value='profile'
            className='py-3 rounded-none'
          >
            <User className='w-4 h-4 mr-2' />
            <span className='hidden md:inline'>Profile</span>
          </TabsTrigger>
          <TabsTrigger
            value='session'
            className='py-3 rounded-none'
          >
            <Settings2 className='w-4 h-4 mr-2' />
            <span className='hidden md:inline'>Session</span>
          </TabsTrigger>
          <TabsTrigger
            value='appearance'
            className='py-3 rounded-none'
          >
            <Monitor className='w-4 h-4 mr-2' />
            <span className='hidden md:inline'>Appearance</span>
          </TabsTrigger>
          <TabsTrigger
            value='account'
            className='py-3 rounded-none'
          >
            <Shield className='w-4 h-4 mr-2' />
            <span className='hidden md:inline'>Account</span>
          </TabsTrigger>
          <TabsTrigger
            value='billing'
            className='py-3 rounded-none'
          >
            <CreditCard className='w-4 h-4 mr-2' />
            <span className='hidden md:inline'>Billing</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent
          value='profile'
          className='space-y-6 animate-in fade-in-50'
        >
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold'>Profile Settings</h2>
            <p className='text-sm text-muted-foreground'>
              Update your personal information.
            </p>
          </div>
          <Separator />
          <div className='grid gap-4 mt-4'>
            <div className='grid gap-1.5'>
              <Label htmlFor='name'>Full Name</Label>
              <Input
                id='name'
                placeholder='Your name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='rounded-none max-w-md'
              />
            </div>
            <div className='grid gap-1.5'>
              <Label htmlFor='email'>Email Address</Label>
              <Input
                id='email'
                type='email'
                placeholder='email@example.com'
                defaultValue={user?.email || ''}
                className='rounded-none max-w-md'
                disabled
              />
              <p className='text-xs text-muted-foreground italic'>
                Email change is disabled for security reasons.
              </p>
            </div>
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={isProfileSaving}
            className='rounded-none bg-primary text-primary-foreground'
          >
            {isProfileSaving ? (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            ) : (
              <Save className='w-4 h-4 mr-2' />
            )}
            Save Profile
          </Button>
        </TabsContent>

        {/* Session Configuration */}
        <TabsContent
          value='session'
          className='space-y-6 animate-in fade-in-50'
        >
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold'>Session Configuration</h2>
            <p className='text-sm text-muted-foreground'>
              Customize how HX Pal assists you during clinical sessions.
            </p>
          </div>
          <Separator />
          <div className='space-y-4 mt-4'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-sm text-muted-foreground italic'>
                Choose your default assistance level for new clinical sessions.
              </p>
              {isModeUpdating && (
                <span className='flex items-center text-xs text-primary font-medium animate-pulse'>
                  <Loader2 className='w-3 h-3 mr-1 animate-spin' />
                  Saving...
                </span>
              )}
            </div>

            <RadioGroup
              value={mode}
              onValueChange={(val) => handleModeChange(val as any)}
              disabled={isModeUpdating}
              className='grid gap-4'
            >
              <div
                className={`flex items-start justify-between p-4 border rounded-none transition-colors ${mode === 'ASK' ? 'bg-primary/5 border-primary/40' : 'bg-muted/5 border-border'}`}
              >
                <div className='flex items-start gap-3'>
                  <RadioGroupItem
                    value='ASK'
                    id='mode-ask'
                    className='mt-1'
                  />
                  <div className='grid gap-1'>
                    <Label
                      htmlFor='mode-ask'
                      className='text-base font-bold cursor-pointer'
                    >
                      Ask Every Time
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Select your preferred mode at the start of each individual
                      session.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`flex items-start justify-between p-4 border rounded-none transition-colors ${mode === 'HINT' ? 'bg-primary/5 border-primary/40' : 'bg-muted/5 border-border'}`}
              >
                <div className='flex items-start gap-3'>
                  <RadioGroupItem
                    value='HINT'
                    id='mode-hint'
                    className='mt-1'
                  />
                  <div className='grid gap-1'>
                    <Label
                      htmlFor='mode-hint'
                      className='text-base font-bold cursor-pointer'
                    >
                      Hint Mode
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Subtle clinical hints and next best questions while you
                      maintain full control.
                    </p>
                  </div>
                </div>
              </div>

              <div className='flex items-start justify-between p-4 border rounded-none bg-muted/10 border-border opacity-60 grayscale-[0.5]'>
                <div className='flex items-start gap-3'>
                  <RadioGroupItem
                    value='ASSISTED'
                    id='mode-assisted'
                    className='mt-1'
                    disabled
                  />
                  <div className='grid gap-1'>
                    <div className='flex items-center gap-2'>
                      <Label
                        htmlFor='mode-assisted'
                        className='text-base font-bold opacity-70'
                      >
                        Assisted Mode
                      </Label>
                      <span className='text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 font-bold uppercase tracking-tighter border border-primary/20'>
                        Coming Soon
                      </span>
                    </div>
                    <p className='text-sm text-muted-foreground opacity-70'>
                      A fully guided clinical clerkship process with direct
                      prompts and structured assistance.
                    </p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent
          value='appearance'
          className='space-y-6 animate-in fade-in-50'
        >
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold'>Appearance</h2>
            <p className='text-sm text-muted-foreground'>
              Customize the look and feel of the application.
            </p>
          </div>
          <Separator />
          <div className='grid gap-4 mt-4 max-w-md'>
            <div className='grid gap-1.5'>
              <Label htmlFor='theme'>Theme Preference</Label>
              {mounted && (
                <RadioGroup
                  value={currentTheme}
                  onValueChange={setTheme}
                  className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-2'
                >
                  <div className='flex items-center space-x-2 border p-3 bg-muted/20'>
                    <RadioGroupItem
                      value='light'
                      id='theme-light'
                    />
                    <Label
                      htmlFor='theme-light'
                      className='cursor-pointer whitespace-nowrap'
                    >
                      Light Mode
                    </Label>
                  </div>
                  <div className='flex items-center space-x-2 border p-3 bg-muted/20'>
                    <RadioGroupItem
                      value='dark'
                      id='theme-dark'
                    />
                    <Label
                      htmlFor='theme-dark'
                      className='cursor-pointer whitespace-nowrap'
                    >
                      Dark Mode
                    </Label>
                  </div>
                  <div className='flex items-center space-x-2 border p-3 bg-muted/20'>
                    <RadioGroupItem
                      value='system'
                      id='theme-system'
                    />
                    <Label
                      htmlFor='theme-system'
                      className='cursor-pointer whitespace-nowrap'
                    >
                      System Default
                    </Label>
                  </div>
                </RadioGroup>
              )}
            </div>
            <p className='text-xs text-muted-foreground italic'>
              Theme changes take effect instantly across the entire application.
            </p>
          </div>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent
          value='account'
          className='space-y-6 animate-in fade-in-50'
        >
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold'>Account Security</h2>
            <p className='text-sm text-muted-foreground'>
              Manage your password and security settings.
            </p>
          </div>
          <Separator />
          <div className='grid gap-4 mt-4 max-w-md'>
            <div className='grid gap-1.5'>
              <Label htmlFor='current-pass'>Current Password</Label>
              <div className='relative'>
                <Input
                  id='current-pass'
                  type={showCurrentPass ? 'text' : 'password'}
                  placeholder='••••••••'
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className='rounded-none'
                />
                <button
                  type='button'
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className='grid gap-1.5'>
              <Label htmlFor='new-pass'>New Password</Label>
              <div className='relative'>
                <Input
                  id='new-pass'
                  type={showNewPass ? 'text' : 'password'}
                  placeholder='••••••••'
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className='rounded-none'
                />
                <button
                  type='button'
                  onClick={() => setShowNewPass(!showNewPass)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className='grid gap-1.5'>
              <Label htmlFor='confirm-pass'>Confirm New Password</Label>
              <div className='relative'>
                <Input
                  id='confirm-pass'
                  type={showConfirmPass ? 'text' : 'password'}
                  placeholder='••••••••'
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className='rounded-none'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={isPasswordSaving}
            className='rounded-none bg-primary text-primary-foreground'
          >
            {isPasswordSaving && (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            )}
            Change Password
          </Button>

          <div className='pt-12'>
            <div className='p-6 border border-destructive/30 bg-destructive/5 space-y-4'>
              <div className='flex items-center space-x-2 text-destructive'>
                <AlertTriangle size={20} />
                <h3 className='font-bold uppercase tracking-wider'>
                  Danger Zone
                </h3>
              </div>
              <p className='text-sm text-muted-foreground'>
                Permanently delete your account and all associated data. This
                action is irreversible.
              </p>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant='destructive'
                    className='rounded-none'
                  >
                    <Trash2 className='w-4 h-4 mr-2' />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        setIsDeleting(true);
                        const res = await deleteAccountAction();
                        if (res.success) {
                          toast.success('Account deleted successfuly');
                          router.push('/login');
                        } else {
                          toast.error(res.error || 'Failed to delete account');
                        }
                        setIsDeleting(false);
                      }}
                      className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent
          value='billing'
          className='space-y-6 animate-in fade-in-50'
        >
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold'>Billing & Subscription</h2>
            <p className='text-sm text-muted-foreground'>
              Manage your subscription and payment methods.
            </p>
          </div>
          <Separator />
          <div className='mt-4'>
            <Alert
              variant='default'
              className='rounded-none bg-primary/5 border-primary/20'
            >
              <AlertCircle className='h-4 w-4 text-primary' />
              <AlertTitle className='text-primary font-bold'>
                Coming Soon
              </AlertTitle>
              <AlertDescription className='text-muted-foreground'>
                Subscription plans and payment management are currently under
                development. Stay tuned for our pro features!
              </AlertDescription>
            </Alert>
          </div>

          <div className='p-4 border border-dashed rounded-none border-muted-foreground/30 opacity-50 flex items-center justify-center py-12'>
            <p className='text-muted-foreground font-medium italic'>
              No active subscription
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
