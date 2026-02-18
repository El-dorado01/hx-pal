'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from '@/lib/SessionContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { User, Settings, LogOut } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function SiteHeader() {
  const pathname = usePathname();
  const { user } = useSession();
  const router = useRouter();
  const pathSegments = pathname.split('/').filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSegments.length - 1;
    const label =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

    return {
      href,
      label,
      isLast,
    };
  });

  const handleLogout = async () => {
    await logoutAction();
    router.push('/login');
  };

  const userInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email
      ? user.email.charAt(0).toUpperCase()
      : 'U';

  return (
    <header className='flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
      <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger className='-ml-1' />
        <Separator
          orientation='vertical'
          className='mx-2 data-[orientation=vertical]:h-4'
        />

        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                <BreadcrumbItem
                  className={index > 0 ? 'hidden md:inline-flex' : ''}
                >
                  {crumb.isLast ? (
                    <BreadcrumbPage className='font-bold uppercase tracking-tight text-xs'>
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      asChild
                      className='uppercase tracking-tight text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors'
                    >
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!crumb.isLast && (
                  <BreadcrumbSeparator
                    className={index > 0 ? 'hidden md:inline-flex' : ''}
                  />
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className='ml-auto flex items-center gap-4'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='relative h-8 w-8 rounded-full p-0 transition-transform hover:scale-105 active:scale-95'
              >
                <Avatar className='h-8 w-8 border border-border/50 ring-offset-background transition-colors hover:border-primary/50'>
                  <AvatarImage
                    src=''
                    alt={user?.name || 'User'}
                  />
                  <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs'>
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-56 mt-2 shadow-xl border-border/50 bg-background/95 backdrop-blur-sm'
              align='end'
              forceMount
            >
              <DropdownMenuLabel className='font-normal'>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm font-semibold leading-none text-foreground'>
                    {user?.name || 'User'}
                  </p>
                  <p className='text-xs leading-none text-muted-foreground truncate'>
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className='bg-border/50' />
              <DropdownMenuItem
                onClick={() => router.push('/dashboard/settings')}
                className='cursor-pointer focus:bg-primary/10 focus:text-primary'
              >
                <User className='mr-2 h-4 w-4' />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/dashboard/settings')}
                className='cursor-pointer focus:bg-primary/10 focus:text-primary'
              >
                <Settings className='mr-2 h-4 w-4' />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className='bg-border/50' />
              <DropdownMenuItem
                onClick={handleLogout}
                className='cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive'
              >
                <LogOut className='mr-2 h-4 w-4' />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
