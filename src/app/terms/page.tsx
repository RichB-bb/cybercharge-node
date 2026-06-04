import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/LegalDocumentPage";

export const metadata: Metadata = {
  title: "Terms of Service | CyberCharge",
  description: "CyberCharge Terms of Service for infrastructure allocation participation.",
};

const sections = [
  {
    title: "Platform Description",
    body: [
      "CyberCharge provides a Web3-enabled front-end experience for participating in shared EV charging infrastructure allocation units.",
      "The platform is designed to help users view allocation records, payment history, admin-confirmed rewards, and manually reviewed withdrawal requests.",
    ],
  },
  {
    title: "Allocation Participation",
    body: [
      "An infrastructure allocation is a digital platform record associated with participation in CyberCharge's shared EV charging infrastructure program.",
      "Allocation participation does not represent ownership of a specific physical charging station, equity security, debt instrument, or guaranteed claim unless separately documented in a formal agreement.",
    ],
  },
  {
    title: "Wallet Responsibility",
    body: [
      "Users are responsible for the wallet address they connect, the network they select, the token they send, and the security of their private keys or seed phrases.",
      "CyberCharge cannot reverse blockchain transactions, recover assets sent from an incorrect wallet, or restore access to a compromised wallet.",
    ],
  },
  {
    title: "No Guaranteed Returns",
    body: [
      "CyberCharge does not guarantee returns, fixed yield, profit, appreciation, or any specific reward amount.",
      "Any reward records shown in the platform are based on admin-confirmed records and may depend on deployment activity, infrastructure utilization, operational conditions, and other risks.",
    ],
  },
  {
    title: "Reward Distribution Policy",
    body: [
      "Rewards may be recorded by platform administrators after reviewing operational activity and applicable platform records.",
      "Pending rewards are not withdrawable. Approved rewards may become eligible for manual withdrawal review. Paid rewards are treated as completed records.",
    ],
  },
  {
    title: "Withdrawal Policy",
    body: [
      "Withdrawal requests are reviewed manually. Processing times may vary based on network conditions, operational review, treasury availability, compliance review, and administrative workload.",
      "A withdrawal is not complete until the platform records it as paid and, where applicable, provides a payout transaction hash.",
    ],
  },
  {
    title: "Risk Acknowledgement",
    body: [
      "By using CyberCharge, users acknowledge that infrastructure allocation participation, digital asset payments, blockchain transactions, and manually reviewed rewards involve risk.",
      "Users should not participate with funds they cannot afford to lose and should review the Risk Disclosure before making a payment.",
    ],
  },
  {
    title: "Limitation of Liability",
    body: [
      "To the maximum extent permitted by applicable law, CyberCharge and its contributors are not liable for indirect, incidental, consequential, or special damages arising from use of the platform.",
      "The platform may be updated, paused, restricted, or discontinued as required for security, operational, legal, or compliance reasons.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDocumentPage
      description="Terms governing use of the CyberCharge platform, infrastructure allocation records, wallet payments, rewards, and withdrawal requests."
      sections={sections}
      title="CyberCharge Terms of Service"
    />
  );
}
