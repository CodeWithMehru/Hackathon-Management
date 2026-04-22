import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = ["/", "/login", "/idea-generator", "/api/generate-idea"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname.toLowerCase();

  // Block vulnerability scanner probes
  if (
    pathname.includes(".env") ||
    pathname.includes(".git") ||
    pathname.includes(".php") ||
    pathname.includes("phpinfo") ||
    pathname.includes("wp-admin") ||
    pathname.includes("wp-login") ||
    pathname.includes("config.json") ||
    pathname.includes("config.yml") ||
    pathname.includes("server-status") ||
    pathname.includes("status") ||
    pathname.includes("nginx_status") ||
    pathname.includes("metrics")
  ) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const cookie of cookiesToSet) {
            response.cookies.set(cookie);
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public");

  if (!isPublic && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: "/:path*",
};

