import { Factory } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Factory className="size-6" aria-hidden />
          </span>
          <div>
            <p className="text-lg font-semibold leading-tight">Matesther</p>
            <p className="text-sm text-muted-foreground">Uniform manufacturing ERP</p>
          </div>
        </div>

        {children}
      </div>
    </main>
  );
}
