import type { ReactNode } from "react";
import { Building2, Gift, Mail, MessageSquare, Star } from "lucide-react";

type HelpSection = {
  title: string;
  icon: ReactNode;
  iconClass: string;
  items: Array<{ label: string; text: string }>;
};

const sections: HelpSection[] = [
  {
    title: "Getting Started",
    icon: <Star className="h-5 w-5" />,
    iconClass: "bg-amber-100 text-amber-700",
    items: [
      {
        label: "Create your first reward",
        text: "Navigate to the Rewards tab and click “Create Reward” to set up rewards for your customers.",
      },
      {
        label: "Generate your QR code",
        text: "Go to the QR Code tab to create a unique code that customers can scan to leave feedback and claim rewards.",
      },
    ],
  },
  {
    title: "Managing Rewards",
    icon: <Gift className="h-5 w-5" />,
    iconClass: "bg-blue-100 text-blue-700",
    items: [
      {
        label: "Edit existing rewards",
        text: "Update titles, descriptions, and values to keep promotions current.",
      },
      {
        label: "Track redemptions",
        text: "Click “View Redemptions” to see issued and redeemed codes in one place.",
      },
      {
        label: "One active reward",
        text: "Only one reward can be active at a time—activating one will deactivate the others.",
      },
    ],
  },
  {
    title: "Updating Business Info",
    icon: <Building2 className="h-5 w-5" />,
    iconClass: "bg-violet-100 text-violet-700",
    items: [
      {
        label: "Update details",
        text: "Edit your business name, address, and branding from “Edit Info / Customize”.",
      },
      {
        label: "Customize your customer form",
        text: "Adjust colors and prompts to match your brand and improve response rates.",
      },
      {
        label: "Preview first",
        text: "Use preview mode to double-check the customer experience before publishing changes.",
      },
    ],
  },
  {
    title: "Customer Reviews & Feedback",
    icon: <MessageSquare className="h-5 w-5" />,
    iconClass: "bg-emerald-100 text-emerald-700",
    items: [
      {
        label: "View customer feedback",
        text: "Check the Reviews tab to see what your customers are saying about your business.",
      },
      {
        label: "Respond to reviews",
        text: "Use insights from comments to improve your service and offerings.",
      },
      {
        label: "Track satisfaction",
        text: "Monitor overall rating trends over time to measure progress.",
      },
    ],
  },
];

export default function HelpSupportPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Help &amp; Support</h1>
        <p className="mt-1 text-sm text-gray-600">
          Get started with StarBoard and learn how to make the most of your rewards program.
        </p>
      </header>

      <div className="space-y-5">
        {sections.map((section) => (
          <section key={section.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className={`grid h-12 w-12 place-items-center rounded-2xl ${section.iconClass}`}>
                {section.icon}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                <ul className="mt-3 space-y-2">
                  {section.items.map((item) => (
                    <li key={item.label} className="flex gap-2 text-sm text-gray-700">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
                      <span>
                        <span className="font-semibold text-gray-900">{item.label}:</span> {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-3xl bg-gradient-to-br from-[#F2C125] to-[#FF8C1A] p-8 text-white shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-full border border-white/70">
            <Mail className="h-7 w-7" />
          </div>
          <h3 className="text-2xl font-bold">Need More Help?</h3>
          <p className="mt-2 text-sm text-white/90">
            Our support team is here to help you with any questions or issues.
          </p>
          <a
            href="mailto:support@starboard.com"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-[#D98900] shadow-sm transition hover:bg-white/95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Mail className="h-4 w-4" />
            support@starboard.com
          </a>
        </div>
      </section>
    </div>
  );
}

