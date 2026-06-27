import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Sicurezza | DevRoulotte",
};

export default function SafetyPage() {
  return (
    <LegalPage
      title="Sicurezza"
      updatedAt="27 giugno 2026"
      intro="DevRoulotte e' progettata per ridurre il rischio, non per eliminarlo. Usa sempre buon senso nelle conversazioni con persone sconosciute."
      sections={[
        {
          title: "Prima del match",
          body: [
            "Concedi webcam e microfono solo se vuoi iniziare. Puoi fermarti in qualunque momento con Stop.",
            "Non condividere documenti, indirizzo, numeri personali, password, codici OTP o dati finanziari.",
          ],
        },
        {
          title: "Durante la chiamata",
          body: [
            "Usa Next per cambiare conversazione e Report per comportamenti vietati.",
            "Non seguire link sospetti e non installare software suggerito da sconosciuti.",
          ],
        },
        {
          title: "Moderazione MVP",
          body: [
            "La moderazione base include report, ban, shadowban e log essenziali. Non registriamo video/audio per revisione.",
            "Per un lancio pubblico servono processi operativi, canali di contatto, revisione legale e procedure di risposta agli abusi.",
          ],
        },
        {
          title: "Emergenze",
          body: [
            "Se ricevi minacce credibili o contenuti illegali, interrompi la chiamata, segnala e contatta le autorita' competenti.",
          ],
        },
      ]}
    />
  );
}
