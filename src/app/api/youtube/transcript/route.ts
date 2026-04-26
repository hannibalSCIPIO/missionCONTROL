import { NextRequest, NextResponse } from 'next/server';
import { YouTubeTranscript } from 'youtube-transcript';

export async function GET(request: NextRequest) {
  const videoUrl = request.nextUrl.searchParams.get('url');
  
  if (!videoUrl) {
    return NextResponse.json({ error: 'Video URL required' }, { status: 400 });
  }

  // Extract video ID from URL
  const videoIdMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;
  
  if (!videoId) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
  }

  try {
    const transcript = await YouTubeTranscript.fetchTranscript(videoId);
    
    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ 
        error: 'No captions available', 
        details: 'This video does not have subtitles'
      }, { status: 404 });
    }

    // Convert to plain text
    const text = transcript.map(t => t.text).join(' ');
    
    return NextResponse.json({ transcript: text });
  } catch (err: any) {
    return NextResponse.json({ 
      error: 'Failed to fetch transcript', 
      details: err.message || 'Could not get captions for this video'
    }, { status: 500 });
  }
}
