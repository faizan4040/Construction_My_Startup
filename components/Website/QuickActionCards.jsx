import Link from "next/link";
import { ArrowUpRight, FileUp, MessageCircle, PhoneCall, Sparkles } from "lucide-react";

const WHATSAPP =
  "https://wa.me/918955549556?text=Hi%2C%20I%20would%20like%20to%20book%20%2F%20get%20a%20quote.";
const CALL = "tel:+918955549556";

const CARDS = [
  {
    key: "whatsapp",
    title: "Book via WhatsApp",
    sub: "Chat with our team",
    icon: MessageCircle,
    href: WHATSAPP,
    external: true,
    chip: "bg-emerald-400/15 text-emerald-300",
  },
  {
    key: "call",
    title: "Book via Call",
    sub: "Talk to our experts",
    icon: PhoneCall,
    href: CALL,
    chip: "bg-sky-400/15 text-sky-300",
  },
  {
    key: "upload",
    title: "Upload your material list",
    sub: "Get best prices & quick quotes",
    icon: FileUp,
    href: "/upload-material-list",
    primary: true,
  },
  {
    key: "ai",
    title: "Redesign your home with AI",
    sub: "Upload a photo of your room, see a new interior design, and send it to us as an enquiry.",
    icon: Sparkles,
    soon: true,
    chip: "bg-violet-400/15 text-violet-300",
  },
];

function CardBody({ card }) {
  const Icon = card.icon;
  const dark = !card.primary;
  return (
    <>
      <div className="flex items-start justify-between">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            card.primary ? "bg-black text-amber-400" : card.chip
          }`}
        >
          <Icon size={24} />
        </span>
        {card.soon && (
          <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-black">Coming soon</span>
        )}
      </div>

      <div>
        <h3 className={`text-xl font-bold leading-snug ${dark ? "text-white" : "text-black"}`}>{card.title}</h3>
        <p className={`mt-2 text-sm leading-relaxed ${dark ? "text-zinc-400" : "text-black/70"}`}>{card.sub}</p>
      </div>

      {!card.soon && (
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-45 ${
            card.primary ? "bg-black text-amber-400" : "bg-white/10 text-white"
          }`}
        >
          <ArrowUpRight size={20} />
        </span>
      )}
    </>
  );
}

export default function QuickActionCards() {
  return (
    <section className="bg-black px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-8 text-2xl font-bold text-white md:text-3xl">Book in a minute, or send us your list</h2>

        {/* one single line: 4 cards on desktop, swipeable row on phones */}
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] md:gap-4 md:overflow-visible [&::-webkit-scrollbar]:hidden">
          {CARDS.map((card) => {
            const base =
              "group relative flex min-h-90 w-[62%] shrink-0 snap-start flex-col justify-between gap-8 rounded-3xl p-6 sm:w-[40%] md:min-h-105 md:w-auto md:flex-1";

            if (card.soon) {
              return (
                <div
                  key={card.key}
                  aria-disabled="true"
                  className={`${base} cursor-not-allowed border border-dashed border-violet-300/40 bg-zinc-900/60`}
                >
                  <CardBody card={card} />
                </div>
              );
            }

            const cls = `${base} transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-amber-400 ${
              card.primary ? "bg-amber-400" : "border border-white/10 bg-zinc-900"
            }`;

            return card.external ? (
              <a key={card.key} href={card.href} target="_blank" rel="noopener noreferrer" className={cls}>
                <CardBody card={card} />
              </a>
            ) : card.href.startsWith("tel:") ? (
              <a key={card.key} href={card.href} className={cls}>
                <CardBody card={card} />
              </a>
            ) : (
              <Link key={card.key} href={card.href} className={cls}>
                <CardBody card={card} />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}