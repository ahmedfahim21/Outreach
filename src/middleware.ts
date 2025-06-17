import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/protected') || pathname.startsWith('/paywall')) {
    const paymentHeader = request.cookies.get("payment-session");
    if (!paymentHeader) {
      return NextResponse.rewrite(new URL("/paywall", request.url));
    }
  }
  
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/protected/:path*", "/dashboard/:path*"],
};