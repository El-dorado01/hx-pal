'use client';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AnimateIcon } from './animate-ui/icons/icon';

export function NavLogout({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: any;
  }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logoutAction();

        // Clear clinical session data from localStorage
        const keys = [
          'hx-pal-biodata',
          'hx-pal-complaints',
          'hx-pal-hpc',
          'hx-pal-pmh',
          'hx-pal-dh',
          'hx-pal-fh',
          'hx-pal-sh',
          'hx-pal-ros',
          'hx-pal-stage',
        ];
        keys.forEach((key) => window.localStorage.removeItem(key));

        toast.success('Logged out successfully');
        router.push('/login');
        router.refresh();
      } catch (error) {
        toast.error('Logout failed');
      }
    });
  };

  return (
    <SidebarGroup className='mt-5'>
      <SidebarGroupContent className='flex flex-col gap-2'>
        <SidebarMenu className='mt-5'>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <AnimateIcon
                animateOnHover
                loop={true}
                loopDelay={3000}
              >
                <SidebarMenuButton
                  variant={'destructive'}
                  tooltip={item.title}
                  size={'lg'}
                  onClick={handleLogout}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className='size-5 animate-spin' />
                  ) : (
                    item.icon && (
                      <item.icon
                        animation='default-loop'
                        className='size-5'
                      />
                    )
                  )}
                  <span className='text-base'>{item.title}</span>
                </SidebarMenuButton>
              </AnimateIcon>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
