import Image from "next/image";

const institutions = [
  {
    name: "Stanford",
    logo: "/logos/stanford.png",
    darkLogo: "/logos/stanford-dark.png",
  },
  { name: "MIT", logo: "/logos/mit.png", darkLogo: "/logos/mit-dark.png" },
  {
    name: "Harvard",
    logo: "/logos/harvard.png",
    darkLogo: "/logos/harvard-dark.png",
  },
  {
    name: "Google",
    logo: "/logos/google.png",
    darkLogo: "/logos/google-dark.png",
  },
  {
    name: "Microsoft",
    logo: "/logos/microsoft.png",
    darkLogo: "/logos/microsoft-dark.png",
  },
];

export default function InstitutionBadge() {
  return (
    <div className="py-12">
      <div className="container px-4 md:px-6">
        <p className="text-center text-sm text-muted-foreground mb-8">
          Trusted by educators at
        </p>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {institutions.map((institution, index) => (
            <div
              key={index}
              className="relative w-28 h-14 md:w-32 md:h-16 bg-background rounded-lg shadow-sm border flex items-center justify-center transition-all duration-300 hover:shadow-md hover:border-primary"
            >
              <Image
                src={institution.logo}
                alt={institution.name}
                width={120}
                height={40}
                className="object-contain dark:hidden"
              />
              <Image
                src={institution.darkLogo || institution.logo}
                alt={institution.name}
                width={120}
                height={40}
                className="object-contain hidden dark:block"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
