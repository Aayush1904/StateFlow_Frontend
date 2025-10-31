import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Up to 3 projects",
        "5 team members",
        "Basic integrations",
        "Community support",
        "1GB storage",
      ],
      limitations: [
        "Limited collaboration (up to 5 concurrent editors)",
        "Basic version history only",
        "No offline editing",
        "No advanced search",
        "No bulk export",
        "No SSO/Authentication enhancements",
      ],
      cta: "Current Plan",
      popular: false,
    },
    {
      name: "Pro",
      price: "₹499",
      period: "per month",
      description: "For growing teams",
      features: [
        "Unlimited projects",
        "25 team members",
        "Advanced integrations",
        "Priority support",
        "50GB storage",
        "Advanced analytics",
        "Custom branding",
      ],
      limitations: [
        "Collaboration limited to 10+ concurrent editors",
        "Standard version history",
        "No offline editing",
        "Limited AI usage quota",
        "No SSO/SAML",
        "No advanced audit logging",
      ],
      cta: "Upgrade to Pro",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "per month",
      description: "For large organizations",
      features: [
        "Unlimited everything",
        "Unlimited team members",
        "All integrations",
        "24/7 dedicated support",
        "Unlimited storage",
        "Advanced security",
        "Custom integrations",
        "SLA guarantee",
      ],
      limitations: [
        "Some platform limitations may apply",
        "Contact sales for detailed capabilities",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="w-full h-auto py-2 px-4 sm:px-6 lg:px-0">
      <main>
        <div className="w-full max-w-5xl mx-auto py-4 sm:py-6 lg:py-8">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-10 lg:mb-12 px-2">
            <h2 className="text-2xl sm:text-3xl lg:text-[28px] leading-tight font-semibold mb-3 sm:mb-4">
              Choose the right plan for you
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
              Select a plan that fits your team's needs. You can always upgrade
              or downgrade later.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative transition-all duration-200 ${plan.popular
                  ? "border-primary shadow-lg md:scale-105 border-2"
                  : "border-border"
                  }`}
              >
                {plan.popular && (
                  <Badge
                    className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1"
                    variant="default"
                  >
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-4 sm:pb-6 pt-6 sm:pt-8 px-4 sm:px-6">
                  <CardTitle className="text-xl sm:text-2xl mb-2 font-semibold">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mb-4 sm:mb-6 min-h-[40px] flex items-center justify-center">
                    {plan.description}
                  </CardDescription>
                  <div className="flex items-baseline justify-center gap-1 sm:gap-1.5">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                      {plan.price}
                    </span>
                    {plan.price !== "Custom" && (
                      <span className="text-sm sm:text-base text-muted-foreground">
                        /{plan.period}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="space-y-4 sm:space-y-5">
                    {/* Features */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold mb-3 text-foreground">
                        Included Features
                      </h4>
                      <ul className="space-y-3 sm:space-y-4">
                        {plan.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2.5 sm:gap-3"
                          >
                            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 shrink-0" />
                            <span className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Limitations */}
                    <div>
                      <Separator className="my-4" />
                      <h4 className="text-xs sm:text-sm font-semibold mb-3 text-foreground">
                        Limitations
                      </h4>
                      <ul className="space-y-2.5 sm:space-y-3">
                        {plan.limitations.map((limitation, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2.5 sm:gap-3"
                          >
                            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/60 mt-0.5 shrink-0" />
                            <span className="text-xs sm:text-sm text-muted-foreground/80 leading-relaxed">
                              {limitation}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-4 sm:px-6">
                  <Button
                    className="w-full h-10 sm:h-11 text-sm sm:text-base"
                    variant={plan.popular ? "default" : "outline"}
                    disabled={plan.name === "Free"}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Platform Limitations Section */}
          <div className="mt-10 sm:mt-16 lg:mt-20 pt-8 sm:pt-12 border-t">
            <div className="bg-muted/30 rounded-lg p-6 sm:p-8 mb-8 sm:mb-12">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6 text-center">
                Platform Limitations & Roadmap
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 sm:mb-8 max-w-3xl mx-auto">
                We're transparent about current platform limitations. Many of these
                are being actively worked on. Contact us to learn more about our
                roadmap.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm sm:text-base mb-2">
                    Collaboration System
                  </h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground/60">•</span>
                      <span>
                        Last-write-wins conflict resolution (CRDTs coming soon)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground/60">•</span>
                      <span>
                        May struggle with 10+ concurrent editors
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground/60">•</span>
                      <span>Full HTML content broadcasting</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm sm:text-base mb-2">
                    Editor Features
                  </h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground/60">•</span>
                      <span>No offline editing support yet</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground/60">•</span>
                      <span>Limited version history features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground/60">•</span>
                      <span>Performance may degrade with very large documents</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm sm:text-base mb-2">
                    AI Features
                  </h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground/60">•</span>
                      <span>Experimental AI autocomplete</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground/60">•</span>
                      <span>No usage tracking or quotas yet</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm sm:text-base mb-2">
                    Mobile & Accessibility
                  </h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground/60">•</span>
                      <span>Editor not fully optimized for mobile</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground/60">•</span>
                      <span>Limited accessibility features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground/60">•</span>
                      <span>English-only UI (i18n coming soon)</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 sm:mt-8 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  See our full limitations documentation for complete details and
                  roadmap.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-6 sm:mt-8 pt-8 sm:pt-12 border-t">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-6 sm:mb-8 text-center px-2">
              Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 px-2">
              <div className="space-y-2 sm:space-y-3">
                <h4 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">
                  Can I change plans anytime?
                </h4>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Yes, you can upgrade or downgrade your plan at any time.
                  Changes will be reflected in your next billing cycle.
                </p>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h4 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">
                  What payment methods do you accept?
                </h4>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  We accept all major credit cards and process payments securely
                  through our payment partners.
                </p>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h4 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">
                  Is there a free trial?
                </h4>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Yes! All paid plans come with a 14-day free trial. No credit
                  card required.
                </p>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h4 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">
                  Need custom pricing?
                </h4>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  For enterprise needs, contact our sales team to discuss custom
                  solutions tailored to your organization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;

