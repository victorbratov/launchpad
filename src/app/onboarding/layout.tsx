import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

/**
 * This is the root layout for the onboarding section of the app.
 * It checks if the user has completed onboarding.
 * */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  if ((await auth()).sessionClaims?.metadata?.onboardingComplete === true) {
    redirect('/')
  }

  return <>{children}</>
}
