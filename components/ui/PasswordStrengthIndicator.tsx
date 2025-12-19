"use client";

interface PasswordRequirementsProps {
  password: string;
}

export default function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const hasMinLength = password.length >= 6;

  const requirements = [
    { label: "At least ONE UPPERCASE", met: hasUppercase },
    { label: "At least ONE Symbol", met: hasSymbol },
    { label: "At least ONE Number", met: hasNumber },
    { label: "Minimum 6 Characters", met: hasMinLength },
  ];

  return (
   <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
      {requirements.map((req) => (
        <div key={req.label} className="flex items-center space-x-2">
          <span
            className={`w-4 h-4 rounded-full border-1 flex items-center justify-center
              ${req.met ? "border-green-600" : "border-gray-400"}`}
          >
            <span
              className={`w-2 h-2 rounded-full 
                ${req.met ? "bg-green-600" : "bg-transparent"}`}
            />
          </span>
          <span
            className={`text-xs text-[#5C5B59]`}
          >
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
}
