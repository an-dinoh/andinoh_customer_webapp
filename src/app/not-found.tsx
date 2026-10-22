import Button from "@/components/ui/Button";
import { Home } from "@/components/icons";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-center">
      <Logo width={110} height={19} className="mb-10 h-5 w-auto" priority />
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">We can’t find that page</h1>
      <p className="mt-2 max-w-md text-sm text-muted">It may have moved, or the link may be wrong.</p>
      <Button className="mt-8" icon={Home} href="/">Back to home</Button>
    </div>
  );
}
