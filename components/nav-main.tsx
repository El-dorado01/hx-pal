'use client';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { AnimateIcon } from './animate-ui/icons/icon';
import { usePathname } from 'next/navigation';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: any;
  }[];
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className='flex flex-col gap-2'>
        <SidebarMenu className='mt-5'>
          {items.map((item) => {
            // Determine active state
            // Exact match for root dashboard or strict sub-path match
            const isActive =
              item.url === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.url);

            return (
              <SidebarMenuItem key={item.title}>
                <AnimateIcon
                  animateOnHover
                  loop={true}
                  loopDelay={3000}
                >
                  <SidebarMenuButton
                    tooltip={item.title}
                    size={'lg'}
                    variant={'default'}
                    isActive={isActive}
                    asChild
                  >
                    <Link
                      href={item.url}
                      onClick={handleLinkClick}
                    >
                      {item.icon && <item.icon className='size-5' />}
                      <span className='text-base'>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </AnimateIcon>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
