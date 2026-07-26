import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "AniYume terms of service. Read our terms and conditions for using this website.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-6">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: July 26, 2026</p>

      <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
          <p>By accessing and using AniYume (aniyume.net), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our website.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
          <p>AniYume is an informational anime guide website that provides filler lists, watch orders, episode guides, and related anime content. All information is provided for educational and entertainment purposes.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. Intellectual Property</h2>
          <p>All original content on AniYume, including text, graphics, logos, and website design, is owned by AniYume and protected by copyright laws. Anime titles, images, and related content are the property of their respective owners. We do not claim ownership of any anime content featured on this site.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. User-Generated Content</h2>
          <p>When you submit reviews or other content to AniYume, you grant us a non-exclusive, royalty-free license to display, modify, and distribute your content on our website. You retain ownership of your original content.</p>
          <p className="mt-2">You agree not to submit content that is:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Spam, promotional material, or unsolicited advertising</li>
            <li>Offensive, hateful, or harassing toward others</li>
            <li>Infringing on the intellectual property rights of others</li>
            <li>Containing malware or malicious code</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Disclaimer of Warranties</h2>
          <p>AniYume is provided &quot;as is&quot; without warranties of any kind. We do not guarantee the accuracy, completeness, or reliability of any information on our site. Anime availability, episode counts, and streaming links may change without notice.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Limitation of Liability</h2>
          <p>AniYume shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website. We are not responsible for the content or practices of third-party websites linked from our site.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">7. Affiliate Disclosure</h2>
          <p>AniYume participates in affiliate marketing programs. We may earn commissions from purchases made through affiliate links on our site. This does not influence our content, reviews, or recommendations.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">8. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the site after changes constitutes acceptance of the new terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">9. Contact</h2>
          <p>For questions about these terms, contact us at: <a href="mailto:contact@aniyume.net" className="text-primary hover:underline">contact@aniyume.net</a></p>
        </section>
      </div>
    </div>
  );
}
