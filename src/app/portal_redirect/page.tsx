"use server"

import { auth, clerkClient } from "@clerk/nextjs/server";

export default async function PortalRedirectPage() {
  const { userId } = await auth();
  const client = await clerkClient();

  const role = (await client.users.getUser(userId!)).publicMetadata.role;

  if (role == "investor") {
    return (
      <meta httpEquiv="refresh" content="0; URL='/investor-portal'" />
    );
  } else if (role == "business") {
    return (
      <meta httpEquiv="refresh" content="0; URL='/business-portal'" />
    )
  }
}
