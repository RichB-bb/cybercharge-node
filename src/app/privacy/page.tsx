import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/LegalDocumentPage";

export const metadata: Metadata = {
  title: "Privacy Policy | CyberCharge",
  description: "CyberCharge Privacy Policy covering wallet, transaction, dashboard, and local storage data.",
};

const sections = [
  {
    title: "Wallet Address Usage",
    body: [
      "CyberCharge uses connected wallet addresses as the primary user identifier for the front-end MVP experience.",
      "Wallet addresses may be stored to create user records, link allocation records, display dashboard data, and process withdrawal requests.",
    ],
  },
  {
    title: "Transaction Data",
    body: [
      "The platform may store transaction hashes, payment amounts, payment assets, selected networks, payment status, token contract references, and confirmation timestamps.",
      "Blockchain transactions are public and may remain visible through third-party block explorers even if platform records are later updated.",
    ],
  },
  {
    title: "Dashboard Data",
    body: [
      "Dashboard records may include allocations, transaction history, reward records, withdrawal requests, payout transaction hashes, and related status changes.",
      "This information is used to help users review platform activity associated with their connected wallet address.",
    ],
  },
  {
    title: "Cookies & Local Storage",
    body: [
      "CyberCharge may use local storage to remember language preferences and wallet connection state where supported by the user's browser and wallet provider.",
      "Clearing browser storage or using a private browser session may reset preferences and wallet connection state.",
    ],
  },
  {
    title: "Third Party Services",
    body: [
      "The platform may interact with wallet providers, WalletConnect/Reown, blockchain RPC providers, block explorers, Supabase, Cloudflare, and market data services.",
      "These third-party services may process technical information according to their own privacy practices and policies.",
    ],
  },
  {
    title: "Contact",
    body: [
      "Questions about privacy, dashboard records, or data handling can be directed to contact@tslcharge.cc.",
      "Users should never send private keys, seed phrases, or wallet recovery information to CyberCharge or any support contact.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocumentPage
      description="How CyberCharge handles wallet addresses, transaction records, dashboard data, local storage, and third-party service interactions."
      sections={sections}
      title="CyberCharge Privacy Policy"
    />
  );
}
