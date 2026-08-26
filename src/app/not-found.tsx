import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <Link href="/dashboard" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
        Return to the dashboard
      </Link>
    </main>
  );
}
