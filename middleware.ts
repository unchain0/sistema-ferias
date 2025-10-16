export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/professionals/:path*', '/vacations/:path*'],
};
