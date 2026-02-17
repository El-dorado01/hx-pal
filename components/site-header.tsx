'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function SiteHeader() {
  const pathname = usePathname();
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

        {/* <div className='ml-auto flex items-center gap-2'>
          <Button
            variant='ghost'
            asChild
            size='sm'
            className='hidden sm:flex'
          >
            <a
              href='https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard'
              rel='noopener noreferrer'
              target='_blank'
              className='dark:text-foreground text-[10px] uppercase font-bold tracking-widest'
            >
              GitHub
            </a>
          </Button>
        </div> */}
      </div>
    </header>
  );
}
