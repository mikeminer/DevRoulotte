import Link from "next/link";
import { ArrowLeft, Linkedin, Mail } from "lucide-react";
import { CookiePreferencesButton } from "@/components/cookie-preferences-button";
import { GdprFooterBadge } from "@/components/gdpr-footer-badge";
import {
  CONTACT_EMAIL,
  CONTACT_MAILTO,
  LINKEDIN_COMPANY_URL,
} from "@/lib/app-config";

type LegalSection = {
  title: string;
  body: string[];
};

export function LegalPage({
  title,
  updatedAt,
  intro,
  sections,
}: {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-screen bg-[#080b10] px-4 py-5 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/chat"
          className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alla chat
        </Link>

        <header className="mt-8 border-b border-white/10 pb-6">
          <p className="text-xs font-semibold uppercase text-teal-200">
            DevRoulotte
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">{intro}</p>
          <p className="mt-4 text-xs text-slate-500">
            Ultimo aggiornamento: {updatedAt}
          </p>
        </header>

        <div className="grid gap-6 py-7">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold text-white">{section.title}</h2>
              <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-300">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="flex flex-wrap items-center gap-3 border-t border-white/10 py-5 text-xs text-slate-400">
          <GdprFooterBadge />
          <a
            href={CONTACT_MAILTO}
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
          >
            <Mail className="h-3.5 w-3.5" />
            Contacts: {CONTACT_EMAIL}
          </a>
          <a
            href={LINKEDIN_COMPANY_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
          >
            <Linkedin className="h-3.5 w-3.5" />
            LinkedIn
          </a>
          <CookiePreferencesButton className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white" />
        </footer>
      </div>
    </main>
  );
}
