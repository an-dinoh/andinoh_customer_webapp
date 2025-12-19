import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left side - Blue container with big flowers (fixed, no scroll) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F75BD] relative items-center justify-center overflow-hidden">
        {/* Large flower flowing from top-left */}
        <div className="absolute -top-[250px] -left-[150px] transform rotate-[15deg]">
          <div className="relative w-[1000px] h-[1000px] opacity-18">
            <Image
              src="/leaf.png"
              alt="Decorative Flower"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Smaller flower flowing from bottom-right in opposite direction */}
        <div className="absolute -bottom-[150px] -right-[100px] transform rotate-[160deg] scale-x-[-1]">
          <div className="relative w-[650px] h-[650px] opacity-20">
            <Image
              src="/leaf.png"
              alt="Decorative Flower"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Hotel branding text */}
        <div className="relative z-10 text-white text-center px-12">
          <h1 className="text-5xl font-bold mb-4">Welcome to Andinoh</h1>
          <p className="text-xl opacity-90">Manage your hotel with ease</p>
        </div>
      </div>

      {/* Right side - Form (scrollable) */}
      <div className="w-full lg:w-1/2 bg-white overflow-y-auto">
        <div className="min-h-full flex items-center justify-center px-4 sm:px-6 md:px-8 py-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
