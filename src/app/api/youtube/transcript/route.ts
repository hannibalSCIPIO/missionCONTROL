import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function GET(request: NextRequest) {
  const videoUrl = request.nextUrl.searchParams.get('url');
  
  if (!videoUrl) {
    return NextResponse.json({ error: 'Video URL required' }, { status: 400 });
  }

  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'get_transcript.py');
    
    const proc = spawn('python3', [scriptPath, videoUrl], {
      cwd: process.cwd()
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        resolve(NextResponse.json({ 
          error: 'Failed to fetch transcript', 
          details: stderr || 'No subtitles available for this video'
        }, { status: 500 }));
      } else {
        resolve(NextResponse.json({ transcript: stdout }));
      }
    });
  });
}
