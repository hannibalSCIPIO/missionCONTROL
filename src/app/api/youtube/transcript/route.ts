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
    
    // Use 'py' on Windows (Python launcher), otherwise python3
    const pythonCmd = process.platform === 'win32' ? 'py' : 'python3';
    
    const proc = spawn(pythonCmd, [scriptPath, videoUrl], {
      cwd: process.cwd(),
      shell: true
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        resolve(NextResponse.json({ 
          error: 'Failed to fetch transcript', 
          details: stderr || 'Run: pip install yt-dlp'
        }, { status: 500 }));
      } else {
        resolve(NextResponse.json({ transcript: stdout }));
      }
    });
    
    proc.on('error', (err) => {
      resolve(NextResponse.json({ 
        error: 'Python not found', 
        details: err.message + '. Install Python from python.org'
      }, { status: 500 }));
    });
  });
}
