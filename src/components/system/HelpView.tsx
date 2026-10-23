import {
  HelpCircle,
  BookOpen,
  Car,
  Music,
  Compass,
  ShieldCheck,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export const HelpView = () => {
  const faqSections = [
    {
      title: 'Carpool Operations & Dispatch',
      icon: Car,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
      items: [
        {
          q: 'How are passenger fares calculated?',
          a: 'Fares are determined by intercity corridor distance, toll waypoints, and driver cost-sharing rules in Indian Rupees (₹).'
        },
        {
          q: 'What is the maximum baggage limit per seat?',
          a: 'Drivers specify luggage capacity (Medium or Large bag) during route publication.'
        }
      ]
    },
    {
      title: 'Concerts & Stadium Events',
      icon: Music,
      color: 'text-purple-600',
      bg: 'bg-purple-50 border-purple-100',
      items: [
        {
          q: 'How does carpool pairing connect to concert tours?',
          a: 'Each uploaded concert automatically aggregates available carpool rides traveling to the host stadium on event day.'
        },
        {
          q: 'Can venue capacities be updated mid-tour?',
          a: 'Yes, ticketing tiers and seating inventory can be edited in real-time from the Concert Details modal.'
        }
      ]
    },
    {
      title: 'Trip Itineraries & Companions',
      icon: Compass,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
      items: [
        {
          q: 'How do travelers join an itinerary?',
          a: 'Travelers browse published trip plans, review waypoints, and reserve their travel companion spot.'
        }
      ]
    },
    {
      title: 'Driver KYC & Compliance Audit',
      icon: ShieldCheck,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50 border-cyan-100',
      items: [
        {
          q: 'What documents are required for driver verification?',
          a: 'Government National ID, valid commercial/personal Driving License, and Vehicle Registration Certificate.'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Screen Title & Subtitle */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
          Knowledge Base & Support
        </h1>
        <p className="text-[13px] font-normal text-slate-500 mt-0.5 max-w-2xl">
          Operational runbooks, intercity compliance guidelines, and system support contacts
        </p>
      </div>

      {/* Help Banner */}
      <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-r from-indigo-50/50 via-white to-sky-50/40 p-6 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Orbita Global Knowledge Base</h2>
            <p className="text-xs text-slate-500">Platform documentation, operational guidelines & admin workflows</p>
          </div>
        </div>
      </div>

      {/* FAQ Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faqSections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div key={idx} className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${section.bg} ${section.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-semibold text-slate-800">{section.title}</h3>
              </div>

              <div className="space-y-3">
                {section.items.map((item, i) => (
                  <div key={i} className="text-xs">
                    <div className="font-semibold text-slate-800 mb-0.5">{item.q}</div>
                    <div className="text-slate-500 leading-relaxed text-[11px]">{item.a}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Support Contact Footer */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-800">Need Immediate Operations Assistance?</div>
            <div className="text-[11px] text-slate-400">Our enterprise mobility dispatcher desk is available 24/7.</div>
          </div>
        </div>

        <a
          href="mailto:support@orbita.global"
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-medium text-white shadow-xs transition-colors"
        >
          <span>Email Operations Desk</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};
