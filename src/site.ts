export const EMAIL = 'zarars@gmail.com';
export const NAV = [
  { href: '/services/', label: 'Services' },
  { href: '/about/', label: 'About' },
  { href: '/blog/', label: 'Blog' },
  { href: '/notes/', label: 'Notes' },
  { href: '/contact/', label: 'Contact' },
];
export const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-CA', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
