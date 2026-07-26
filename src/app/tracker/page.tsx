import { Metadata } from 'next';
import TrackerClient from './TrackerClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Watch Tracker | AniYume',
  description: 'Track your anime watching progress, rate shows, and manage your watchlist.',
  alternates: { canonical: '/tracker' },
  openGraph: {
    title: 'My Watch Tracker | AniYume',
    description: 'Track your anime watching progress, rate shows, and manage your watchlist.',
    images: [{ url: '/api/og?title=Watch+Tracker&subtitle=Track+Your+Anime' }],
  },
};

export default function TrackerPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-6 py-8 pt-20">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">My Watch Tracker</h1>
        <p className="text-muted-foreground">Track your anime journey — progress, ratings, and notes all in one place.</p>
      </div>
      <TrackerClient />
    </div>
  );
}
