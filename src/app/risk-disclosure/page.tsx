import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/LegalDocumentPage";

export const metadata: Metadata = {
  title: "Risk Disclosure | CyberCharge",
  description: "CyberCharge Risk Disclosure for infrastructure allocations and digital asset payments.",
};

const sections = [
  {
    title: "No Guaranteed Return",
    body: [
      "CyberCharge does not guarantee returns, fixed yield, profit, appreciation, repayment, or any specific reward amount.",
      "Any examples, estimates, deployment figures, or activity metrics should be treated as illustrative unless separately verified in formal platform records.",
    ],
  },
  {
    title: "Digital Asset Risk",
    body: [
      "Digital assets may be volatile, transactions may be irreversible, wallet software may fail, and users may lose funds if they select the wrong network, token, or recipient.",
      "Network fees, chain congestion, contract behavior, and wallet provider issues may affect transaction execution and confirmation.",
    ],
  },
  {
    title: "Infrastructure Risk",
    body: [
      "EV charging infrastructure may be affected by site acquisition, permitting, construction delays, equipment availability, maintenance, utilization, electricity pricing, and local market demand.",
      "Planned deployment activity may differ from actual deployment activity.",
    ],
  },
  {
    title: "Operational Risk",
    body: [
      "CyberCharge currently includes manual operational steps for rewards and withdrawals. Administrative review, record reconciliation, and treasury operations may introduce delays or errors.",
      "Platform services may be interrupted by hosting, database, wallet, RPC, or third-party infrastructure issues.",
    ],
  },
  {
    title: "Liquidity Risk",
    body: [
      "Infrastructure allocation records may not be transferable, redeemable, or liquid. Users should not assume they can sell, exit, or convert an allocation on demand.",
      "Withdrawal availability depends on approved reward balances and manual review, not on the allocation amount itself.",
    ],
  },
  {
    title: "Regulatory Risk",
    body: [
      "Digital assets, infrastructure participation models, rewards, and cross-border payments may be subject to changing laws and regulatory interpretations.",
      "Users are responsible for understanding restrictions that may apply in their jurisdiction before participating.",
    ],
  },
  {
    title: "Reward Distribution Risk",
    body: [
      "Rewards are based on admin-confirmed records and may depend on infrastructure activity, utilization, operational review, and treasury processes.",
      "Approved rewards may become eligible for withdrawal review, but reward records should not be interpreted as guaranteed income or fixed return.",
    ],
  },
];

export default function RiskDisclosurePage() {
  return (
    <LegalDocumentPage
      description="Key risks associated with CyberCharge infrastructure allocation participation, blockchain payments, rewards, and withdrawals."
      sections={sections}
      title="CyberCharge Risk Disclosure"
    />
  );
}
