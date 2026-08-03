import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { hasValidSession } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await hasValidSession()) redirect("/dashboard");
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[390px] items-center bg-surface px-5 py-10 shadow-2xl">
      <LoginForm />
    </main>
  );
}
