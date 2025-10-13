'use client';

import { EchoAccount } from '@/components/echo-account-next';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { FC } from 'react';

interface HeaderProps {
  title?: string;
  className?: string;
}

const Header: FC<HeaderProps> = ({ title = 'Aphorize', className = '' }) => {
  const pathname = usePathname();

  const navItems = [
    { href: '/find', label: 'Find Quote', icon: MessageSquare },
    { href: '/generate', label: 'Generate Quote', icon: MessageSquare },
    { href: '/poster', label: 'Poster Builder', icon: ImageIcon },
  ];

  return (
    <header className={`border-border border-b bg-background ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/aphorize-favicon.png"
              alt="aphorize logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <Link href="/">
              <h1 className="font-semibold text-foreground text-xl hover:text-primary transition-colors">
                {title}
              </h1>
            </Link>
          </div>

          <nav className="flex items-center gap-4">
            <EchoAccount />

            {/* Hamburger menu - shown on all screen sizes */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:w-80">
                <SheetHeader className="space-y-3 pb-6">
                  <SheetTitle className="text-2xl">{title}</SheetTitle>
                  <p className="text-muted-foreground text-sm">
                    Create and share memorable quotes
                  </p>
                </SheetHeader>
                <nav className="flex flex-col gap-3 mt-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={isActive ? 'default' : 'ghost'}
                          className="w-full justify-start gap-3 h-12 text-base"
                          size="lg"
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
