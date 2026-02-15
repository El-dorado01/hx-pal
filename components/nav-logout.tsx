'use client';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
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
                  asChild
                >
                  <Link href={item.url}>
                    {item.icon && (
                      <item.icon
                        animation='default-loop'
                        className='size-5'
                      />
                    )}
                    <span className='text-base'>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </AnimateIcon>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
