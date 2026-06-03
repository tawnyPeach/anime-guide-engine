'use client';

import { useState } from 'react';

/**
 * Newsletter Signup Placeholder
 *
 * To connect to a real email service:
 * - Buttondown API: POST https://api.buttondown.email/v1/subscribers with { email }
 * - ConvertKit: POST https://api.convertkit.com/v3/forms/{form_id}/subscribe
 * - Mailchimp: Use their marketing API
 *
 * Add your API key to .env and create an API route at /api/newsletter
 */

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // TODO: Connect to Buttondown API or your preferred email service
      setSubmitted(true);
      setEmail('');
    }
  };

  if (submitted) {
    return (
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/30 rounded-xl p-6 text-center">
        <p className="text-purple-300 font-medium">Thanks! Newsletter integration coming soon.</p>
        <p className="text-gray-400 text-sm mt-1">
          (Newsletter feature is being set up - we&apos;ll notify you when it&apos;s live)
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-anime-border rounded-xl p-6">
      <h3 className="text-white font-semibold mb-1">Get Anime Updates</h3>
      <p className="text-gray-400 text-sm mb-4">
        Weekly filler guides and watch order updates delivered to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 px-4 py-2 rounded-lg bg-anime-card border border-anime-border text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all duration-200"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}
