import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/landing");
  }

  return <AppShell />;
}
