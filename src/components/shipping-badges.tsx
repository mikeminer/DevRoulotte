import Image from "next/image";

type ShippingBadgesProps = {
  className?: string;
  surface: "landing_footer" | "chat_footer";
};

const shippingBadges = [
  {
    href: "https://shipordie.club/ship/devroulotte",
    ariaLabel: "DevRoulotte su Ship or Die",
    analyticsId: "ship_or_die_badge",
    destination: "ship_or_die",
    src: "/badges/shipordie-logo.webp",
    alt: "Ship or Die",
    width: 400,
    height: 225,
    className: "h-7 w-auto object-contain",
    linkClassName: "px-2",
  },
  {
    href: "https://www.producthunt.com/products/devroulotte-chat?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-devroulotte-chat",
    ariaLabel: "DevRoulotte.chat su Product Hunt",
    analyticsId: "product_hunt_badge",
    destination: "product_hunt",
    src: "/badges/producthunt-featured.svg",
    alt: "DevRoulotte.chat - networking | Product Hunt",
    width: 250,
    height: 54,
    className: "h-7 w-auto object-contain",
  },
  {
    href: "https://peerpush.com/p/devroulottechat",
    ariaLabel: "DevRoulotte.chat su PeerPush",
    analyticsId: "peerpush_badge",
    destination: "peerpush",
    src: "/badges/peerpush-badge.png",
    alt: "DevRoulotte.chat on PeerPush",
    width: 230,
    height: 54,
    className: "h-7 w-auto object-contain",
  },
  {
    href: "https://www.uneed.best/tool/devroulotte",
    ariaLabel: "DevRoulotte.chat launching soon on Uneed",
    analyticsId: "uneed_badge",
    destination: "uneed",
    src: "/badges/uneed-launching-soon.png",
    alt: "Launching Soon on Uneed",
    width: 250,
    height: 54,
    className: "h-7 w-auto object-contain",
  },
  {
    href: "https://www.nxgntools.com/tools/devroulottechat?utm_source=devroulottechat",
    ariaLabel: "DevRoulotte.chat launching soon on NextGen Tools",
    analyticsId: "nextgen_tools_badge",
    destination: "nextgen_tools",
    src: "/badges/nextgen-tools-launching-soon.svg",
    alt: "Launching Soon on NextGen Tools",
    width: 250,
    height: 48,
    className: "h-7 w-auto object-contain",
  },
  {
    href: "https://devglobe.app/projects/devroulotte?utm_source=badge&utm_medium=embed",
    ariaLabel: "DevRoulotte launched on DevGlobe",
    analyticsId: "devglobe_badge",
    destination: "devglobe",
    src: "/badges/devglobe-launched.svg",
    alt: "Launched on DevGlobe",
    width: 250,
    height: 54,
    className: "h-7 w-auto object-contain",
  },
];

export function ShippingBadges({ className = "", surface }: ShippingBadgesProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {shippingBadges.map((badge) => (
        <a
          key={badge.analyticsId}
          href={badge.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={badge.ariaLabel}
          data-analytics-event="outbound_badge_clicked"
          data-analytics-surface={surface}
          data-analytics-cta-id={badge.analyticsId}
          data-analytics-destination={badge.destination}
          className={`inline-flex h-9 items-center rounded-md border border-white/10 bg-white py-1 transition hover:bg-slate-100 ${
            badge.linkClassName ?? "px-1.5"
          }`}
        >
          <Image
            src={badge.src}
            alt={badge.alt}
            width={badge.width}
            height={badge.height}
            unoptimized
            className={badge.className}
          />
        </a>
      ))}
    </div>
  );
}
