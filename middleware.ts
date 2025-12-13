import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;

    // If not logged in → redirect to login
    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/room/:path*", "/twocard/:path*", "/blackjack/:path*", "/dashboard/:path*"], // protected routes
};
