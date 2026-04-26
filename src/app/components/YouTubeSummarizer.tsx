'use client';

import { useState } from 'react';

interface Summary {
  id: string;
  videoUrl: string;
  videoTitle: string;
  captions: string;
  summary: string;
  keyTakeaways: string[];
  mainConcepts: { title: string; content: string }[];
  actionItems: string[];
  studyNotes: string;
  createdAt: string;
}

export default function YouTubeSummarizer() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captions, setCaptions] = useState('');
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [showSummary, setShowSummary] = useState<Summary | null>(null);

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const fetchCaptions = async () => {
    if (!youtubeUrl) {
      setError('Please enter a YouTube URL');
      return;
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      setError('Invalid YouTube URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call the transcript API that uses yt-dlp
      const response = await fetch(`/api/youtube/transcript?url=${encodeURIComponent(youtubeUrl)}`);
      const data = await response.json();
      
      if (response.ok && data.transcript) {
        setCaptions(data.transcript);
      } else {
        setError(data.details || data.error || 'No captions available for this video');
        setCaptions('');
      }
    } catch (err) {
      setError('Failed to fetch transcript. Make sure yt-dlp is installed: pip install yt-dlp');
    }

    setLoading(false);
  };

  const generateSummary = async () => {
    if (!captions) {
      setError('Please fetch captions first');
      return;
    }

    setLoading(true);

    // Simulate AI summarization
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newSummary: Summary = {
      id: Date.now().toString(),
      videoUrl: youtubeUrl,
      videoTitle: `Video: ${extractVideoId(youtubeUrl) || 'Unknown'}`,
      captions: captions,
      summary: 'This video covers key concepts that can be transformed into actionable learning material. The content provides foundational knowledge that can be applied to practical scenarios.',
      keyTakeaways: [
        'Understanding the core principles is essential for application',
        'Practical examples help reinforce learning',
        'Consistent practice leads to mastery',
        'Real-world applications demonstrate value'
      ],
      mainConcepts: [
        { title: 'Concept 1', content: 'The fundamental principle that underlies everything else. Important to understand before moving forward.' },
        { title: 'Concept 2', content: 'Building on the first concept, this adds depth and complexity to the learning.' },
        { title: 'Concept 3', content: 'Practical application of the previous concepts in real-world scenarios.' }
      ],
      actionItems: [
        'Review the key concepts covered in the video',
        'Practice applying the concepts in a real scenario',
        'Share learnings with someone else to reinforce understanding',
        'Create a plan to implement these ideas within 7 days'
      ],
      studyNotes: `# Study Notes\n\n## Summary\n${captions.substring(0, 500)}...\n\n## Key Learning Points\n1. Start with fundamentals\n2. Build progressively\n3. Apply practically\n\n## Action Items\n- Complete initial review\n- Practice exercises\n- Schedule follow-up`,
      createdAt: new Date().toISOString()
    };

    setSummaries([newSummary, ...summaries]);
    setShowSummary(newSummary);
    setCaptions('');
    setYoutubeUrl('');
    setLoading(false);
  };

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">YouTube Summarizer</h1>
      </header>
      <div className="page-content">
        {/* Input Section */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Extract Captions</div>
              <div className="card-subtitle">Enter a YouTube URL to extract closed captions</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <input 
              className="input" 
              style={{ flex: 1 }}
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && fetchCaptions()}
            />
            <button 
              className="btn btn-primary" 
              onClick={fetchCaptions}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : 'Get Captions'}
            </button>
          </div>
          {error && <div style={{ color: 'var(--error)', marginTop: 8, fontSize: 13 }}>{error}</div>}
        </div>

        {/* Captions Display */}
        {captions && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div>
                <div className="card-title">Captions</div>
                <div className="card-subtitle">Raw caption text from video</div>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={generateSummary}
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : 'Generate Summary'}
              </button>
            </div>
            <div style={{ 
              maxHeight: 300, 
              overflow: 'auto', 
              background: 'var(--bg-primary)', 
              padding: 16, 
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'monospace',
              fontSize: 13,
              whiteSpace: 'pre-wrap'
            }}>
              {captions}
            </div>
          </div>
        )}

        {/* Summary Output */}
        {showSummary && (
          <div className="card" style={{ marginBottom: 24, borderLeft: '3px solid var(--accent)' }}>
            <div className="card-header">
              <div>
                <div className="card-title">📚 Teaching Material Generated</div>
                <div className="card-subtitle">{showSummary.videoTitle}</div>
              </div>
            </div>

            {/* Key Takeaways */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>Key Takeaways</h3>
              <ul style={{ paddingLeft: 20 }}>
                {showSummary.keyTakeaways.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: 4, color: 'var(--text-primary)' }}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Main Concepts */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>Main Concepts</h3>
              {showSummary.mainConcepts.map((concept, idx) => (
                <div key={idx} style={{ 
                  marginBottom: 12, 
                  padding: 12, 
                  background: 'var(--bg-primary)', 
                  borderRadius: 'var(--radius-sm)' 
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{concept.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{concept.content}</div>
                </div>
              ))}
            </div>

            {/* Action Items */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>Action Items</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {showSummary.actionItems.map((item, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8,
                    padding: '8px 12px',
                    background: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13
                  }}>
                    <div style={{ 
                      width: 16, 
                      height: 16, 
                      border: '1px solid var(--border)', 
                      borderRadius: 4 
                    }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Study Notes */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>Study Notes</h3>
              <pre style={{ 
                background: 'var(--bg-primary)', 
                padding: 16, 
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                fontFamily: 'monospace',
                overflow: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {showSummary.studyNotes}
              </pre>
            </div>
          </div>
        )}

        {/* Previous Summaries */}
        {summaries.length > 0 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Previous Summaries</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {summaries.map(summary => (
                <div 
                  key={summary.id} 
                  className="card" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowSummary(summary)}
                >
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{summary.videoTitle}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {new Date(summary.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                    {summary.keyTakeaways.length} key takeaways
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
