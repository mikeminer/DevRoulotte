import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Regole community | DevRoulotte",
};

export default function CommunityRulesPage() {
  return (
    <LegalPage
      title="Regole community"
      updatedAt="27 giugno 2026"
      intro="Regole semplici e severe per mantenere DevRoulotte un superconnector 1:1 usabile, 18+ e professionale."
      sections={[
        {
          title: "18+ obbligatorio",
          body: [
            "Usa DevRoulotte solo se hai almeno 18 anni. Se sospetti la presenza di un minorenne, interrompi e segnala.",
          ],
        },
        {
          title: "Contenuti vietati",
          body: [
            "Sono vietati nudita', contenuti sessuali espliciti, minacce, odio, molestie, autolesionismo, spam, truffe, malware e contenuti illegali.",
            "E' vietato chiedere dati sensibili, registrare o ridistribuire la chiamata senza consenso e usare bot o automazioni invasive.",
          ],
        },
        {
          title: "Comportamento",
          body: [
            "Rispetta il tempo delle altre persone. Usa Next o Stop se la conversazione non e' adatta.",
            "Non impersonare altre persone, non promuovere attivita' illegali e non usare DevRoulotte per sorveglianza o raccolta dati.",
          ],
        },
        {
          title: "Segnalazioni",
          body: [
            "Il pulsante Report invia una segnalazione con motivo, dettagli opzionali e identificativi tecnici del match.",
            "Troppi report possono attivare uno shadowban temporaneo in attesa di revisione.",
          ],
        },
      ]}
    />
  );
}
