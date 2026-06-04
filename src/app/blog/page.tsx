import { Metadata } from 'next';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Blog - Anime Guides, Tips & News',
  description: 'Read our latest articles about anime filler guides, watch orders, seasonal recommendations, and tips for getting the most out of your anime experience.',
  alternates: { canonical: '/blog' },
};

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
}

function getBlogPosts(): BlogPost[] {
  const blogDir = path.join(process.cwd(), 'src/content/blog');

  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.md'));

  const posts: BlogPost[] = files.map((file) => {
    const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
    const frontmatter = parseFrontmatter(content);

    return {
      slug: file.replace('.md', ''),
      title: frontmatter.title || file.replace('.md', '').replace(/-/g, ' '),
      date: frontmatter.date || '',
      excerpt: frontmatter.excerpt || '',
      author: frontmatter.author || 'AniYume',
    };
  });

  return posts.sort((a, b) => (b.date > a.date ? 1 : -1));
}

function parseFrontmatter(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const parts = content.split('---');
  if (parts.length < 3) return result;

  const frontmatterStr = parts[1].trim();
  const lines = frontmatterStr.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();
    result[key] = value;
  }

  return result;
}

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />

      <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
        Anime Guide Blog
      </h1>
      <p className="text-muted-foreground text-lg mb-8">
        Tips, guides, and news for anime fans
      </p>

      {posts.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/40 hover:glow-card-hover transition-all duration-300"
            >
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-xl font-bold text-foreground mb-2 hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <time dateTime={post.date}>
                    {post.date ? new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                  </time>
                  <span>by {post.author}</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {post.excerpt}
                </p>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
