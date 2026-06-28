import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { CONTACT_EMAIL } from "@/lib/app-config";

export const metadata: Metadata = {
  title: "Cancellazioni e rimborsi | DevRoulotte",
};

export default function RefundsPage() {
  return (
    <LegalPage
      title="Cancellazioni e rimborsi"
      updatedAt="28 giugno 2026"
      intro={`Il piano Premium usa PayPal Subscriptions. Per richieste su pagamenti, cancellazioni o rimborsi scrivi a ${CONTACT_EMAIL}.`}
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
            `Per chiedere verifica o rimborso scrivi a ${CONTACT_EMAIL} indicando email account, ID transazione PayPal se disponibile, data del pagamento e motivo della richiesta.`,
            "Rispondiamo di norma entro 14 giorni. Se servono verifiche PayPal o controlli anti-frode, comunichiamo l'eventuale estensione dei tempi.",
          ],
        },
      ]}
    />
  );
}
