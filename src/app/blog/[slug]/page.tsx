import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import Breadcrumbs from '@/components/Breadcrumbs';

interface Props {
  params: Promise<{ slug: string }>;
}

function getBlogDir() {
  return path.join(process.cwd(), 'src/content/blog');
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

function getBody(content: string): string {
  const parts = content.split('---');
  if (parts.length < 3) return content;
  return parts.slice(2).join('---').trim();
}

function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary hover:text-primary/80 underline">$1</a>');

  // Tables (simple)
  html = html.replace(/^\|(.+)\|$/gm, (match) => {
    const cells = match.split('|').filter((c) => c.trim());
    if (cells.every((c) => c.trim().match(/^[-:]+$/))) {
      return ''; // Skip separator row
    }
    const row = cells.map((c) => `<td class="px-3 py-2 border border-border">${c.trim()}</td>`).join('');
    return `<tr>${row}</tr>`;
  });

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul class="list-disc pl-4 mb-4 space-y-1">${match}</ul>`);

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$1</li>');

  // Paragraphs (lines that are not already HTML)
  const lines = html.split('\n');
  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      result.push('');
    } else if (trimmed.startsWith('<')) {
      result.push(line);
    } else {
      result.push(`<p class="leading-relaxed mb-4">${trimmed}</p>`);
    }
  }

  return result.join('\n');
}

export async function generateStaticParams() {
  const blogDir = getBlogDir();
  if (!fs.existsSync(blogDir)) return [];

  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.md'));
  return files.map((f) => ({ slug: f.replace('.md', '') }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blogDir = getBlogDir();
  const filePath = path.join(blogDir, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return { title: 'Not Found' };
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const frontmatter = parseFrontmatter(content);

  return {
    title: frontmatter.title || slug.replace(/-/g, ' '),
    description: frontmatter.excerpt || '',
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const blogDir = getBlogDir();
  const filePath = path.join(blogDir, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const frontmatter = parseFrontmatter(content);
  const body = getBody(content);
  const htmlContent = markdownToHtml(body);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: frontmatter.title || slug },
        ]}
      />

      <article>
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            {frontmatter.title || slug.replace(/-/g, ' ')}
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {frontmatter.date && (
              <time dateTime={frontmatter.date}>
                {new Date(frontmatter.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
            )}
            {frontmatter.author && <span>by {frontmatter.author}</span>}
          </div>
        </header>

        <div
          className="prose prose-themed max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>

      <div className="mt-12 pt-8 border-t border-border">
        <Link
          href="/blog"
          className="text-primary hover:text-primary/80 transition-colors"
        >
          ← Back to all posts
        </Link>
      </div>
    </div>
  );
}
