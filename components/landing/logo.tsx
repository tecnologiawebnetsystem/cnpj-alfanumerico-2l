import Image from "next/image"

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/images/image.png"
        alt="CNPJ Detector by ACT Digital"
        width={200}
        height={60}
        className="h-auto w-auto max-h-[40px]"
        priority
      />
    </div>
  )
}

export function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/images/image.png"
        alt="ACT Digital - CNPJ Detector"
        width={200}
        height={60}
        className="h-auto w-auto"
        priority
      />
    </div>
  )
}
