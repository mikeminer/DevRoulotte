import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Cancellazioni e rimborsi | DevRoulotte",
};

export default function RefundsPage() {
  return (
    <LegalPage
      title="Cancellazioni e rimborsi"
      updatedAt="27 giugno 2026"
      intro="Il piano Premium usa PayPal Subscriptions. Questa pagina spiega il comportamento previsto dell'MVP."
      sections={[
        {
          title: "Abbonamento Premium",
          body: [
            "Il piano Premium non prevede prova gratuita.",
            "PayPal gestisce l'abbonamento a 3,99 EUR al mese e rinnova automaticamente fino a cancellazione.",
          ],
        },
        {
          title: "Cancellazione",
          body: [
            "Puoi cancellare Premium dal profilo DevRoulotte o dal tuo account PayPal.",
            "La cancellazione aggiorna lo stato subscription in Supabase tramite API e webhook PayPal.",
          ],
        },
        {
          title: "Rimborsi",
          body: [
            "L'MVP non gestisce rimborsi automatici. Eventuali rimborsi vanno gestiti manualmente dal dashboard PayPal secondo le regole applicabili.",
            "Prima del lancio commerciale devi inserire contatti reali, tempi di risposta e condizioni di rimborso definitive.",
          ],
        },
      ]}
    />
  );
}
