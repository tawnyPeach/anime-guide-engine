import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "AniYume privacy policy. Learn how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-6">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: July 26, 2026</p>

      <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
          <p>AniYume operates as an informational anime guide website. We do not require user registration. When you visit our site, we may automatically collect:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages visited and time spent on each page</li>
            <li>Referring website addresses</li>
            <li>IP address (anonymized)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Information</h2>
          <p>We use collected information to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Improve our website content and user experience</li>
            <li>Analyze site traffic and usage patterns</li>
            <li>Serve relevant advertisements through third-party ad networks</li>
            <li>Ensure the security and proper functioning of our site</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. Cookies and Advertising</h2>
          <p>AniYume uses cookies and similar tracking technologies. Third-party advertisers, including Google AdSense, may use cookies to serve ads based on your prior visits to our website or other websites.</p>
          <p className="mt-2">Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the internet. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Third-Party Services</h2>
          <p>We use the following third-party services that may collect information:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Google Analytics</strong> — for site traffic analysis</li>
            <li><strong>Google AdSense</strong> — for displaying advertisements</li>
          </ul>
          <p className="mt-2">Each of these services has its own privacy policy. We encourage you to review them.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Affiliate Links</h2>
          <p>AniYume contains affiliate links to third-party services including Amazon, Crunchyroll, and other streaming platforms. When you click these links and make a purchase, we may earn a small commission at no extra cost to you. Affiliate links do not affect the content or recommendations on our site.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Data Retention</h2>
          <p>We do not collect personally identifiable information. Analytics data is retained according to the policies of the third-party services we use (typically 14-26 months for Google Analytics).</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">7. Children&apos;s Privacy</h2>
          <p>AniYume is not directed at children under 13. We do not knowingly collect information from children under 13 years of age.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">8. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. Changes will be posted on this page with an updated &quot;Last updated&quot; date.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">9. Contact</h2>
          <p>If you have questions about this privacy policy, you can reach us at: <a href="mailto:contact@aniyume.net" className="text-primary hover:underline">contact@aniyume.net</a></p>
        </section>
      </div>
    </div>
  );
}
