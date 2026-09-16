import auth from 'next-auth/middleware';

// Next 16 requires the middleware file to statically export the function
// (default or named `middleware`). `export { default } from ...` is not
// detected by the build, so re-export via an explicit default export.
export default auth;

export const config = {
  matcher: ['/dashboard/:path*', '/professionals/:path*', '/vacations/:path*'],
};
