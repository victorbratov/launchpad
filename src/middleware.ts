import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isInvestorRoute = createRouteMatcher("/investor/(.*)");
const isBusinessOwnerRoute = createRouteMatcher("/business-owner/(.*)");
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/"
]);

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
    if (isBusinessOwnerRoute(req)) {
      await auth.protect((has) => {
        return has ({ permission: 'org:business_owner:general' });
      })
    }
    if (isInvestorRoute(req)) {
      await auth.protect((has) => {
        return has ({ permission: 'org:investor:general' });
      })
    }
})

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

