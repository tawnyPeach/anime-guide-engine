'use client';

import { useEffect, useRef } from 'react';

/**
 * Giscus Comments Component
 *
 * HOW TO SET UP GISCUS:
 * 1. Create a public GitHub repository (or use your existing one)
 * 2. Enable Discussions in the repository settings (Settings > General > Features > Discussions)
 * 3. Install the Giscus GitHub App: https://github.com/apps/giscus
 * 4. Go to https://giscus.app and fill in your repository details
 * 5. Copy the repo, repo-id, category, and category-id values
 * 6. Replace the placeholder values below with your actual values
 *
 * Configuration:
 * - repo: "your-username/your-repo-name"
 * - repoId: Get from giscus.app after entering your repo
 * - category: Usually "General" or create a "Comments" category
 * - categoryId: Get from giscus.app after selecting category
 */

interface CommentsProps {
  repo?: string;
  repoId?: string;
  category?: string;
  categoryId?: string;
  mapping?: string;
}

export default function Comments({
  repo = 'your-username/your-repo',
  repoId = 'PLACEHOLDER_REPO_ID',
  category = 'General',
  categoryId = 'PLACEHOLDER_CATEGORY_ID',
  mapping = 'pathname',
}: CommentsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Don't render if placeholders are still in use
    if (repoId === 'PLACEHOLDER_REPO_ID') return;

    const container = ref.current;
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', repo);
    script.setAttribute('data-repo-id', repoId);
    script.setAttribute('data-category', category);
    script.setAttribute('data-category-id', categoryId);
    script.setAttribute('data-mapping', mapping);
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', 'dark_dimmed');
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-loading', 'lazy');
    script.crossOrigin = 'anonymous';
    script.async = true;

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [repo, repoId, category, categoryId, mapping]);

  // Show placeholder message if not configured
  if (repoId === 'PLACEHOLDER_REPO_ID') {
    return (
      <section className="mt-12 border-t border-anime-border pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Comments</h2>
        <div className="bg-anime-card border border-anime-border rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm">
            Comments powered by Giscus will appear here once configured.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Set up at giscus.app with your GitHub repository.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12 border-t border-anime-border pt-8">
      <h2 className="text-xl font-bold text-white mb-4">Comments</h2>
      <div ref={ref} />
    </section>
  );
}
