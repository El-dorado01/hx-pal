'use client';

import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

import { LayoutDashboard, ShieldEllipsis } from 'lucide-react';
import { NavMain } from './nav-main';
import { LayoutDashboardIcon } from './animate-ui/icons/layout-dashboard';
import { Plus } from './animate-ui/icons/plus';
import { ClipboardCheck } from './animate-ui/icons/clipboard-check';
import { Settings } from './animate-ui/icons/settings';
import { LogOut } from './animate-ui/icons/log-out';
import Link from 'next/link';
import Image from 'next/image';
import { NavLogout } from './nav-logout';
import { AnimateIcon } from './animate-ui/icons/icon';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboardIcon,
    },
    {
      title: 'Create Session',
      url: '/dashboard/session/new',
      icon: Plus,
    },
    {
      title: 'My Sessions',
      url: '#',
      icon: ClipboardCheck,
    },
    {
      title: 'Settings',
      url: '/dashboard/settings',
      icon: Settings,
    },
  ],
  navLogout: [
    {
      title: 'Logout',
      url: '#',
      icon: LogOut,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <Sidebar
      collapsible='offcanvas'
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <AnimateIcon
              animateOnView
              loop={true}
              loopDelay={5000}
            >
              <Link
                href='/dashboard'
                onClick={() => isMobile && setOpenMobile(false)}
                className='data-[slot=sidebar-menu-button]:p-1.5! flex items-center justify-center md:justify-start pt-6 md:pt-0 gap-2'
              >
                <div className='relative size-8 overflow-hidden flex items-center justify-center'>
                  <Image
                    src='/logo.png'
                    alt='Hx Pal Logo'
                    fill
                    className='object-contain'
                  />
                </div>

                <span className='text-xl font-bold tracking-tight'>Hx Pal</span>
              </Link>
            </AnimateIcon>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavLogout items={data.navLogout} />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
    </Sidebar>
  );
}
