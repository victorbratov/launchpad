import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isInvestorRoute = createRouteMatcher("/investor/(.*)");
const isBusinessOwnerRoute = createRouteMatcher("/business-owner/(.*)");
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
  "/pitches(.*)",
  "/api/cron(.*)"
]);
const isOnbordingRoute = createRouteMatcher("/onboarding(.*)");

export default clerkMiddleware(async (auth, req) => {
  const { isAuthenticated, sessionClaims, redirectToSignIn } = await auth()

  if (isAuthenticated && isOnbordingRoute(req)) {
    return NextResponse.next();
  }

  if (!isAuthenticated && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  if (isAuthenticated && !sessionClaims?.metadata?.onboardingComplete) {
    console.log('Redirecting to onboarding');
    const url = new URL('/onboarding', req.url);
    return NextResponse.redirect(url);
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
  if (isBusinessOwnerRoute(req)) {
    await auth.protect((has) => {
      return has({ permission: 'org:business_owner:general' });
    })
  }
  if (isInvestorRoute(req)) {
    await auth.protect((has) => {
      return has({ permission: 'org:investor:general' });
    })
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
