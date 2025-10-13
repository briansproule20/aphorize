import { EchoAccount } from '@/components/echo-account-next';
import Image from 'next/image';
import type { FC } from 'react';

interface HeaderProps {
  title?: string;
  className?: string;
}

const Header: FC<HeaderProps> = async ({
  title = 'My App',
  className = '',
}) => {
  return (
    <header
      className={`border-border border-b bg-background ${className}`}
    >
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
            <h1 className="font-semibold text-foreground text-xl">{title}</h1>
          </div>

          <nav className="flex items-center space-x-4">
            <EchoAccount />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
