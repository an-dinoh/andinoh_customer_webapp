import { CheckCircle, CloseCircle } from "@/components/icons";
import { PASSWORD_RULES } from "@/utils/stay";

/** Every rule at once, ticked as they're met (guide 3.1); the server still has the final word. */
export default function PasswordRules({ password }: { password: string }) {
  if (!password) return null;
  return (
    <ul className="grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2" aria-label="Password requirements">
      {PASSWORD_RULES.map(r => {
        const ok = r.test(password);
        return (
          <li key={r.label} className={`flex items-center gap-1.5 ${ok ? "text-success" : "text-muted"}`}>
            {ok ? <CheckCircle className="h-3.5 w-3.5 shrink-0" /> : <CloseCircle className="h-3.5 w-3.5 shrink-0" />}
            {r.label}
          </li>
        );
      })}
    </ul>
  );
}
