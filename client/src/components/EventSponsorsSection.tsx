import { trpc } from "@/lib/trpc";
import { Award, ExternalLink } from "lucide-react";

const tierLabels: Record<string, string> = {
  diamond: "Diamante",
  gold: "Ouro",
  silver: "Prata",
  bronze: "Bronze",
};

const tierColors: Record<string, string> = {
  diamond: "from-cyan-400 to-blue-500",
  gold: "from-yellow-400 to-yellow-600",
  silver: "from-gray-300 to-gray-500",
  bronze: "from-orange-600 to-orange-800",
};

interface EventSponsorsSectionProps {
  eventSlug: string;
}

export default function EventSponsorsSection({ eventSlug }: EventSponsorsSectionProps) {
  const { data: eventSponsors, isLoading } = trpc.eventSponsors.listByEventSlug.useQuery({ eventSlug });

  if (isLoading || !eventSponsors || eventSponsors.length === 0) {
    return null;
  }

  // Group sponsors by tier
  const sponsorsByTier = {
    diamond: eventSponsors.filter(es => es.tier === "diamond"),
    gold: eventSponsors.filter(es => es.tier === "gold"),
    silver: eventSponsors.filter(es => es.tier === "silver"),
    bronze: eventSponsors.filter(es => es.tier === "bronze"),
  };

  const tiers = ["diamond", "gold", "silver", "bronze"] as const;

  return (
    <section className="py-16 bg-gradient-to-br from-[#0f1f3a] to-[#0a1628] border-t border-gray-800">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-10 w-1 bg-gradient-to-b from-[#f59e0b] to-[#fb923c] rounded"></div>
            <h3 className="text-3xl font-bold text-white">Patrocinadores do Evento</h3>
            <div className="h-10 w-1 bg-gradient-to-b from-[#f59e0b] to-[#fb923c] rounded"></div>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Agradecemos o apoio dos nossos patrocinadores que tornam este evento possível
          </p>
        </div>

        {/* Sponsors by Tier */}
        <div className="space-y-12">
          {tiers.map(tier => {
            const tierSponsors = sponsorsByTier[tier];
            if (tierSponsors.length === 0) return null;

            // Define grid columns based on tier
            const gridCols = tier === "diamond" 
              ? "grid-cols-1 md:grid-cols-2" 
              : tier === "gold"
              ? "grid-cols-2 md:grid-cols-3"
              : "grid-cols-2 md:grid-cols-4";

            return (
              <div key={tier} className="space-y-6">
                {/* Tier Badge */}
                <div className="flex items-center justify-center">
                  <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${tierColors[tier]} text-white font-bold text-lg shadow-lg`}>
                    <Award className="h-5 w-5" />
                    {tierLabels[tier]}
                  </div>
                </div>

                {/* Sponsors Grid */}
                <div className={`grid ${gridCols} gap-6`}>
                  {tierSponsors.map(es => {
                    const sponsor = es.sponsor;
                    if (!sponsor) return null;

                    return (
                      <a
                        key={es.id}
                        href={sponsor.website || undefined}
                        target={sponsor.website ? "_blank" : undefined}
                        rel={sponsor.website ? "noopener noreferrer" : undefined}
                        className={`group relative bg-white rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                          sponsor.website ? "cursor-pointer" : "cursor-default"
                        }`}
                      >
                        {/* Logo Container */}
                        <div className="flex items-center justify-center h-32">
                          {sponsor.logoUrl ? (
                            <img
                              src={sponsor.logoUrl}
                              alt={sponsor.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <div className="text-center">
                              <p className="text-2xl font-bold text-gray-800">{sponsor.name}</p>
                            </div>
                          )}
                        </div>

                        {/* Hover Overlay */}
                        {sponsor.website && (
                          <div className="absolute inset-0 bg-black/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="text-center text-white p-4">
                              <ExternalLink className="h-8 w-8 mx-auto mb-2" />
                              <p className="font-semibold">{sponsor.name}</p>
                              <p className="text-sm text-gray-300 mt-1">Visitar website</p>
                            </div>
                          </div>
                        )}

                        {/* Tier Badge on Card */}
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold bg-gradient-to-r ${tierColors[tier]} text-white`}>
                          {tierLabels[tier]}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
