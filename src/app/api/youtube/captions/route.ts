import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get('videoId');
  
  if (!videoId) {
    return NextResponse.json({ error: 'Video ID required' }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ 
      captions: null, 
      error: 'YouTube API key not configured' 
    });
  }

  try {
    // Fetch video details and check for captions
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`
    );
    
    const videoData = await videoResponse.json();

    if (!videoData.items || videoData.items.length === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Try to get captions using YouTube's caption API
    // Note: This requires the caption API to be enabled
    const captionsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&part=snippet&key=${apiKey}`
    );

    // If captions exist, we'd need to download them
    // For now, return a placeholder if no captions
    const captionsData = await captionsResponse.json();
    
    if (captionsData.items && captionsData.items.length > 0) {
      // Caption exists - in production, you'd download it here
      return NextResponse.json({ 
        captions: "Captions available for this video. (API implementation needed)",
        videoTitle: videoData.items[0].snippet.title
      });
    }

    return NextResponse.json({ 
      captions: null,
      message: 'No captions available for this video'
    });

  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json({ error: 'Failed to fetch captions' }, { status: 500 });
  }
}