import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Anime Guide Engine';
  const subtitle = searchParams.get('subtitle') || '';
  const type = searchParams.get('type') || '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0533 30%, #0d1b3e 60%, #0a0a1a 100%)',
          padding: '60px',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          }}
        />

        {/* Type badge */}
        {type && (
          <div
            style={{
              display: 'flex',
              fontSize: '20px',
              color: '#a78bfa',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              marginBottom: '20px',
              padding: '8px 20px',
              borderRadius: '8px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              background: 'rgba(139, 92, 246, 0.1)',
            }}
          >
            {type}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: title.length > 40 ? '42px' : '56px',
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: '900px',
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              display: 'flex',
              fontSize: '24px',
              color: '#9ca3af',
              marginTop: '20px',
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Branding */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              fontSize: '22px',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Anime Guide Engine
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
