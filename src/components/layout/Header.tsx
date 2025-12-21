'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/products': 'Product Catalog',
  '/simulator': 'Claim Simulator',
};

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/products/') && pathname.includes('/versions')) {
    return 'Version History';
  }
  if (pathname.startsWith('/products/') && pathname !== '/products') {
    return 'Product Configuration';
  }
  return pageTitles[pathname] || 'Dashboard';
}

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Environment: Demo
        </span>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
          D
        </div>
      </div>
    </header>
  );
}
