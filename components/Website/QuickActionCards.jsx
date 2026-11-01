"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  FileUp,
  MessageCircle,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  Zap,
} from "lucide-react";

const WHATSAPP =
  "https://wa.me/918955549556?text=Hi%2C%20I%20would%20like%20to%20book%20%2F%20get%20a%20quote.";
const CALL = "tel:+918955549556";

/**
 * Each card explains: WHAT it is (title), WHEN to use it (bestFor),
 * and WHAT happens on click (cta). No photos needed: every card has its
 * own animated visual built from icons / SVG.
 */
const CARDS = [
  {
    key: "whatsapp",
    tag: "Fastest",
    title: "Book via WhatsApp",
    sub: "Chat with our team",
    bestFor: "Quick questions, photos and instant quotes",
    cta: "Chat now",
    icon: MessageCircle,
    href: WHATSAPP,
    external: true,
  },
  {
    key: "call",
    tag: "Talk live",
    title: "Book via Call",
    sub: "Talk to our experts",
    bestFor: "Detailed discussion and site-specific advice",
    cta: "Call now",
    icon: PhoneCall,
    href: CALL,
  },
  {
    key: "upload",
    tag: "Best prices",
    title: "Upload your material list",
    sub: "Get best prices & quick quotes",
    bestFor: "Already have a list? We price every item",
    cta: "Upload list",
    icon: FileUp,
    href: "/upload-material-list",
    primary: true,
  },
  {
    key: "ai",
    tag: "Coming soon",
    title: "Redesign your home with AI",
    sub: "Upload a photo of your room, see a new interior design, and send it to us as an enquiry.",
    bestFor: "See a new look before you build",
    cta: "Coming soon",
    icon: Sparkles,
    soon: true,
  },
];

/* ---------- AI room: wireframe on the left becomes a designed room ---------- */
function RoomScene({ after }) {
  const line = after ? "none" : "#a1a1aa";
  const dash = after ? undefined : "3 3";
  const f = (color) => (after ? color : "none");

  return (
    <svg
      viewBox="0 0 210 100"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <g stroke={line} strokeWidth="1" strokeDasharray={dash} strokeLinejoin="round">
        {/* wall + floor */}
        <rect x="0" y="0" width="210" height="70" fill={f("#fff7ed")} stroke={after ? "none" : "#71717a"} />
        <rect x="0" y="70" width="210" height="30" fill={f("#fdba74")} stroke={after ? "none" : "#71717a"} />
        {after && <rect x="0" y="70" width="210" height="3" fill="#000" opacity=".12" />}

        {/* window */}
        <rect x="146" y="12" width="46" height="36" rx="2" fill={f("#bae6fd")} stroke={after ? "#000" : "#71717a"} strokeWidth={after ? 2 : 1} />
        <path d="M169 12V48M146 30H192" stroke={after ? "#000" : "#71717a"} strokeWidth={after ? 1.5 : 1} fill="none" />

        {/* picture frame */}
        <rect x="24" y="14" width="34" height="24" rx="2" fill={f("#fff")} stroke={after ? "#000" : "#71717a"} strokeWidth={after ? 2 : 1} />
        {after && <path d="M28 34L38 24L45 31L50 27L55 34Z" fill="#f97316" stroke="none" />}
        {after && <circle cx="49" cy="20" r="2.5" fill="#000" stroke="none" />}

        {/* sofa */}
        <rect x="52" y="38" width="86" height="20" rx="8" fill={f("#ea580c")} />
        <rect x="46" y="48" width="98" height="22" rx="9" fill={f("#f97316")} />
        <rect x="42" y="46" width="14" height="24" rx="6" fill={f("#c2410c")} />
        <rect x="134" y="46" width="14" height="24" rx="6" fill={f("#c2410c")} />
        {after && <path d="M95 52V68" stroke="#7c2d12" strokeWidth="1" opacity=".5" />}
        <path d="M54 70V77M134 70V77" stroke={after ? "#000" : "#71717a"} strokeWidth={after ? 2.5 : 1} fill="none" />

        {/* cushion */}
        {after && <rect x="60" y="44" width="14" height="12" rx="4" fill="#fff" stroke="none" />}

        {/* lamp */}
        <path d="M172 78V58" stroke={after ? "#000" : "#71717a"} strokeWidth={after ? 2 : 1} fill="none" />
        <path d="M164 58L168 44H176L180 58Z" fill={f("#fff")} stroke={after ? "#000" : "#71717a"} strokeWidth={after ? 2 : 1} />

        {/* rug */}
        <ellipse cx="96" cy="87" rx="42" ry="7" fill={f("#000")} opacity={after ? 0.85 : 1} />
        {after && <ellipse cx="96" cy="87" rx="30" ry="4" fill="none" stroke="#f97316" strokeWidth="1.5" />}

        {/* plant */}
        <rect x="8" y="56" width="14" height="14" rx="3" fill={f("#000")} stroke={after ? "none" : "#71717a"} />
        {after ? (
          <>
            <ellipse cx="11" cy="48" rx="4" ry="9" fill="#fb923c" transform="rotate(-20 11 48)" />
            <ellipse cx="19" cy="48" rx="4" ry="9" fill="#f97316" transform="rotate(20 19 48)" />
            <ellipse cx="15" cy="44" rx="3.5" ry="10" fill="#ea580c" />
          </>
        ) : (
          <path d="M15 56V42M15 50L9 44M15 48L21 42" fill="none" />
        )}
      </g>
    </svg>
  );
}

function AIStage() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-zinc-950">
      {/* before: blueprint wireframe */}
      <div className="absolute inset-0 bg-zinc-900">
        <RoomScene after={false} />
      </div>

      {/* after: finished design, revealed by a sweeping AI scan */}
      <div className="qa-reveal absolute inset-0">
        <RoomScene after />
      </div>

      {/* scan line + handle */}
      <div className="qa-scan absolute bottom-0 top-0 z-10 w-0.5 bg-orange-400 shadow-[0_0_14px_3px_rgba(249,115,22,0.9)]">
        <span className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-orange-500 text-white ring-2 ring-white">
          <Sparkles size={14} />
        </span>
      </div>

      {/* twinkling sparkles */}
      <Sparkles size={12} className="qa-twinkle absolute left-[18%] top-[22%] z-10 text-orange-300" />
      <Sparkles size={10} className="qa-twinkle absolute right-[16%] top-[56%] z-10 text-white" style={{ animationDelay: ".7s" }} />
      <Sparkles size={9} className="qa-twinkle absolute left-[48%] top-[12%] z-10 text-orange-200" style={{ animationDelay: "1.3s" }} />

      {/* labels */}
      <span className="absolute bottom-1.5 left-2 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-300">
        Before
      </span>
      <span className="absolute bottom-1.5 right-2 z-10 rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
        AI design
      </span>
    </div>
  );
}

/* ---------- Animated icon stages ---------- */
function Stage({ card }) {
  const Icon = card.icon;

  if (card.key === "ai") return <AIStage />;

  if (card.key === "whatsapp") {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="qa-ring absolute h-16 w-16 rounded-full bg-orange-500/40" />
        <span className="qa-ring absolute h-16 w-16 rounded-full bg-orange-500/30" style={{ animationDelay: "1s" }} />
        <span className="qa-float relative flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-600/40">
          <Icon size={32} />
        </span>

        {/* typing bubbles */}
        <span className="qa-bubble absolute right-[16%] top-[18%] flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-2.5 py-1.5 shadow-md">
          {[0, 1, 2].map((d) => (
            <span key={d} className="qa-dot h-1.5 w-1.5 rounded-full bg-zinc-700" style={{ animationDelay: `${d * 0.18}s` }} />
          ))}
        </span>
        <span
          className="qa-bubble absolute bottom-[16%] left-[15%] rounded-2xl rounded-br-sm bg-zinc-700 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-md"
          style={{ animationDelay: "1.4s" }}
        >
          Hi!
        </span>
      </div>
    );
  }

  if (card.key === "call") {
    const bars = [0.5, 0.9, 0.65, 1, 0.55];
    return (
      <div className="absolute inset-0 flex items-center justify-center gap-5">
        <div className="flex h-10 items-center gap-1">
          {bars.map((h, i) => (
            <span key={i} className="qa-bar w-1 rounded-full bg-orange-400" style={{ height: `${h * 100}%`, animationDelay: `${i * 0.12}s` }} />
          ))}
        </div>

        <div className="relative flex items-center justify-center">
          <span className="qa-ring absolute h-16 w-16 rounded-full bg-orange-500/40" />
          <span className="qa-ring absolute h-16 w-16 rounded-full bg-orange-500/30" style={{ animationDelay: "1s" }} />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-600/40">
            <Icon size={28} className="qa-wig" />
          </span>
        </div>

        <div className="flex h-10 items-center gap-1">
          {[...bars].reverse().map((h, i) => (
            <span key={i} className="qa-bar w-1 rounded-full bg-orange-400" style={{ height: `${h * 100}%`, animationDelay: `${i * 0.12 + 0.3}s` }} />
          ))}
        </div>
      </div>
    );
  }

  // upload
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="absolute inset-3 rounded-xl border-2 border-dashed border-black/30" />

      <span className="qa-sheet absolute left-[22%] bottom-[22%] h-6 w-5 rounded-sm bg-white shadow-md" />
      <span className="qa-sheet absolute right-[22%] bottom-[22%] h-6 w-5 rounded-sm bg-white shadow-md" style={{ animationDelay: "1.1s" }} />

      <span className="qa-lift relative flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-orange-400 shadow-xl shadow-black/30">
        <Icon size={28} />
      </span>

      <span className="absolute bottom-5 h-1.5 w-24 overflow-hidden rounded-full bg-black/20">
        <span className="qa-prog block h-full rounded-full bg-black" />
      </span>
    </div>
  );
}

function CardBody({ card }) {
  const primary = card.primary;

  return (
    <>
      {/* Animated stage */}
      <div
        className={`relative h-32 overflow-hidden rounded-2xl ${
          primary ? "bg-black/10" : card.soon ? "bg-zinc-950" : "bg-black"
        }`}
      >
        {!primary && !card.soon && (
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(249,115,22,0.22),transparent_65%)]" />
        )}
        <Stage card={card} />

        <span
          className={`absolute left-2.5 top-2.5 z-20 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-md ${
            card.soon
              ? "bg-white text-black"
              : primary
              ? "bg-black text-white"
              : "bg-orange-500 text-white"
          }`}
        >
          {!card.soon && <Zap size={11} />}
          {card.tag}
        </span>
      </div>

      {/* Text */}
      <div className="mt-3.5 flex-1">
        <h3 className={`text-base font-extrabold leading-snug ${primary ? "text-black" : "text-white"}`}>
          {card.title}
        </h3>
        <p className={`mt-1 line-clamp-2 text-[13px] leading-snug ${primary ? "text-black/75" : "text-zinc-400"}`}>
          {card.sub}
        </p>

        <p
          className={`mt-2.5 flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold leading-snug ${
            primary ? "bg-black/10 text-black" : "bg-white/5 text-zinc-200"
          }`}
        >
          <CheckCircle2 size={13} className={`mt-px shrink-0 ${primary ? "text-black" : "text-orange-400"}`} />
          <span>
            <span className="opacity-70">Best for: </span>
            {card.bestFor}
          </span>
        </p>
      </div>

      {/* Action */}
      <div
        className={`mt-3.5 flex items-center justify-between rounded-full py-1 pl-4 pr-1 text-sm font-extrabold ${
          card.soon
            ? "border border-dashed border-white/25 text-zinc-400"
            : primary
            ? "bg-black text-white"
            : "bg-orange-500 text-white"
        }`}
      >
        {card.cta}
        {card.soon ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
            <Sparkles size={15} />
          </span>
        ) : (
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-45 ${
              primary ? "bg-orange-500 text-white" : "bg-black text-white"
            }`}
          >
            <ArrowUpRight size={17} />
          </span>
        )}
      </div>
    </>
  );
}

export default function QuickActionCards() {
  return (
    <section className="relative isolate overflow-hidden bg-black px-4 py-16 sm:px-8 lg:py-20">
      <style>{`
        @keyframes qaRise { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:none } }
        @keyframes qaRing { 0% { transform:scale(.8); opacity:.9 } 100% { transform:scale(2.1); opacity:0 } }
        @keyframes qaFloat { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-6px) } }
        @keyframes qaWig { 0%,100% { transform:rotate(0) } 10%,30%,50% { transform:rotate(-14deg) } 20%,40% { transform:rotate(14deg) } 60% { transform:rotate(0) } }
        @keyframes qaBar { 0%,100% { transform:scaleY(.35) } 50% { transform:scaleY(1) } }
        @keyframes qaBubble { 0%,100% { transform:translateY(4px) scale(.92); opacity:.5 } 50% { transform:translateY(-4px) scale(1); opacity:1 } }
        @keyframes qaDot { 0%,100% { opacity:.3; transform:translateY(0) } 50% { opacity:1; transform:translateY(-2px) } }
        @keyframes qaLift { 0%,100% { transform:translateY(5px) } 50% { transform:translateY(-6px) } }
        @keyframes qaSheet { 0% { transform:translateY(10px) rotate(-8deg); opacity:0 } 50% { opacity:1 } 100% { transform:translateY(-34px) rotate(8deg); opacity:0 } }
        @keyframes qaProg { 0% { width:0 } 80%,100% { width:100% } }
        @keyframes qaReveal { 0% { clip-path:inset(0 100% 0 0) } 100% { clip-path:inset(0 0 0 0) } }
        @keyframes qaScan { 0% { left:0 } 100% { left:100% } }
        @keyframes qaTwinkle { 0%,100% { opacity:0; transform:scale(.4) rotate(0) } 50% { opacity:1; transform:scale(1.2) rotate(45deg) } }

        .qa-rise    { animation:qaRise .8s cubic-bezier(.22,1,.36,1) both }
        .qa-ring    { animation:qaRing 2s ease-out infinite }
        .qa-float   { animation:qaFloat 3s ease-in-out infinite }
        .qa-wig     { animation:qaWig 2.6s ease-in-out infinite }
        .qa-bar     { transform-origin:center; animation:qaBar 1s ease-in-out infinite }
        .qa-bubble  { animation:qaBubble 2.8s ease-in-out infinite }
        .qa-dot     { animation:qaDot 1s ease-in-out infinite }
        .qa-lift    { animation:qaLift 2.2s ease-in-out infinite }
        .qa-sheet   { animation:qaSheet 2.2s ease-in infinite }
        .qa-prog    { animation:qaProg 2.2s ease-in-out infinite }
        .qa-reveal  { animation:qaReveal 4.5s ease-in-out infinite alternate }
        .qa-scan    { animation:qaScan 4.5s ease-in-out infinite alternate }
        .qa-twinkle { animation:qaTwinkle 2.4s ease-in-out infinite }

        .qa-grid {
          background-image:
            linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,.05) 1px, transparent 1px);
          background-size:56px 56px;
          mask-image:linear-gradient(to bottom, black 0%, transparent 80%);
          -webkit-mask-image:linear-gradient(to bottom, black 0%, transparent 80%);
        }
        @media (prefers-reduced-motion:reduce){
          .qa-rise,.qa-ring,.qa-float,.qa-wig,.qa-bar,.qa-bubble,.qa-dot,
          .qa-lift,.qa-sheet,.qa-prog,.qa-reveal,.qa-scan,.qa-twinkle { animation:none!important }
          .qa-reveal { clip-path:inset(0 0 0 50%) }
          .qa-scan { left:50% }
        }
      `}</style>

      {/* Background decoration */}
      <div className="qa-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute -left-24 top-0 -z-10 h-80 w-80 rounded-full bg-orange-600/25 blur-[110px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-80 w-80 rounded-full bg-orange-500/15 blur-[110px]" />

      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mb-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/50 bg-orange-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-300">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            Get in touch
          </span>
          <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white md:text-4xl">
            Book in a minute, or{" "}
            <span className="inline-block -skew-x-6 bg-orange-500 px-2.5 text-black">
              <span className="block skew-x-6">send us your list</span>
            </span>
          </h2>
          <p className="mt-4 text-sm text-zinc-400 md:text-base">
            Pick the option that suits you. Chat, call, or upload your material list and get a quote.
          </p>
        </div>

        {/* swipeable row on phones, 4 compact cards on desktop */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
          {CARDS.map((card, i) => {
            const base =
              "qa-rise group relative flex w-[72%] shrink-0 snap-start flex-col rounded-3xl p-3 sm:w-[42%] md:w-auto";
            const style = { animationDelay: `${0.1 + i * 0.1}s` };

            if (card.soon) {
              return (
                <div
                  key={card.key}
                  aria-disabled="true"
                  style={style}
                  className={`${base} cursor-not-allowed border border-dashed border-orange-400/40 bg-zinc-900/60`}
                >
                  <CardBody card={card} />
                </div>
              );
            }

            const cls = `${base} transition-all duration-300 hover:-translate-y-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500 ${
              card.primary
                ? "bg-orange-500 shadow-2xl shadow-orange-600/30"
                : "border border-white/10 bg-zinc-900 hover:border-orange-500/60"
            }`;

            if (card.external) {
              return (
                <a key={card.key} href={card.href} target="_blank" rel="noopener noreferrer" style={style} className={cls}>
                  <CardBody card={card} />
                </a>
              );
            }

            if (card.href.startsWith("tel:")) {
              return (
                <a key={card.key} href={card.href} style={style} className={cls}>
                  <CardBody card={card} />
                </a>
              );
            }

            return (
              <Link key={card.key} href={card.href} style={style} className={cls}>
                <CardBody card={card} />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}