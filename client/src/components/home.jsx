import React, { useState, useEffect, useRef } from 'react';

const Home = ({ isLogin, userData }) => {
  const [ideaStack, setIdeaStack] = useState([]); // holds up to 2 ideas
  const topNoteRef = useRef(null);
  const bottomNoteRef = useRef(null);

  // Fetch one idea for user
  const fetchTopIdea = async () => {
    if (!userData?.id) return null;
    try {
      const response = await fetch('/api/gettopideaforuser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id }),
      });
      const data = await response.json();
      if (response.ok && data.idea) {
        return {
          id: data.idea.id || 0,
          ideaDescription: data.idea.ideaDescription || data.idea,
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching top idea:', error);
      return null;
    }
  };

  // Initialize stack on login: only fetch one idea initially (per your backend constraint)
  useEffect(() => {
    const init = async () => {
      if (!isLogin) return;
      const first = await fetchTopIdea();
      setIdeaStack(first ? [first] : []);
    };
    init();
  }, [isLogin, userData?.id]);

  // Send vote (used when a note is peeled)
  const handleVote = async (isLike, ideaId) => {
    try {
      const response = await fetch('/api/createvote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          ideaId,
          isLike,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error('Error voting:', data?.message || 'unknown');
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // Helpers for rendering text and auto-resize
  function escapeHtml(s) {
    if (typeof s !== 'string') return '';
    return s.replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  function splitSentences(text) {
    if (!text || typeof text !== 'string') return [];
    const parts = text.split(/\. +/g).map(p => p.trim()).filter(Boolean);
    return parts.map(p => (p.endsWith('.') ? p : p + '.'));
  }

  function renderTextBlocks(rawText, contentEl) {
    if (!rawText) {
      contentEl.innerHTML = '';
      return;
    }
    const sentences = splitSentences(rawText);
    const nodes = sentences.length ? sentences : [rawText];
    contentEl.innerHTML = nodes.map(s => `<div class="line">${escapeHtml(s)}</div>`).join('');
  }

  function fitFontToBox(squareEl, contentEl) {
    if (!squareEl || !contentEl) return;
    let side = squareEl.clientWidth;
    let lo = 4, hi = Math.max(16, side), best = lo;
    function fits(fontPx) {
      contentEl.style.fontSize = fontPx + 'px';
      return contentEl.scrollWidth <= contentEl.clientWidth && contentEl.scrollHeight <= contentEl.clientHeight;
    }
    for (let i = 0; i < 24; i++) {
      const mid = Math.floor((lo + hi) / 2);
      if (fits(mid)) { best = mid; lo = mid + 1; }
      else { hi = mid - 1; }
    }
    contentEl.style.fontSize = best + 'px';
  }

  // Peeling / animation logic: attach to top note whenever ideaStack changes
  useEffect(() => {
    const topNote = topNoteRef.current;
    if (!topNote) return;

    const topContent = topNote.querySelector('.content');

    // update content for the top note
    function updateContent() {
      const topIdea = ideaStack[0];
      if (topIdea) {
        renderTextBlocks(topIdea.ideaDescription, topContent);
        fitFontToBox(topNote, topContent);
      } else {
        topContent.innerHTML = '';
      }
    }

    updateContent();
    const onResize = () => updateContent();
    window.addEventListener('resize', onResize);

    // Dragging logic
    let dragging = false;
    let startX = 0;
    const DRAG_THRESHOLD = 80;

    function startDrag(e) {
      dragging = true;
      topNote.classList.add('dragging');
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      // prevent text selection / passive default
      if (e.cancelable) e.preventDefault();
    }

    function drag(e) {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const dx = x - startX;
      const rotate = Math.min(Math.max(-dx / 3, -30), 30);
      topNote.style.transform = `translateX(${dx}px) rotate(${rotate}deg)`;
    }

    async function endDrag() {
      if (!dragging) return;
      dragging = false;
      topNote.classList.remove('dragging');

      const style = topNote.style.transform || '';
      const dxMatch = style.match(/translateX\(([-\d.]+)px\)/);
      const dx = dxMatch ? parseFloat(dxMatch[1]) : 0;

      const currentTop = ideaStack[0];

      if (Math.abs(dx) > DRAG_THRESHOLD && currentTop) {
        const direction = dx > 0 ? 'right' : 'left';
        // vote: right => like, left => dislike
        await handleVote(direction === 'right', currentTop.id);

        // animate out
        topNote.style.transition = 'transform 0.45s ease, opacity 0.45s ease';
        topNote.style.transform = `translateX(${dx * 2}px) rotate(${dx / 5}deg)`;
        topNote.style.opacity = '0';

        // after animation, shift stack and fetch a new bottom
        setTimeout(async () => {
          // shift: remove first element
          setIdeaStack(prev => {
            const next = prev.slice(1); // bottom moves up if present
            return next;
          });

          // fetch a new idea and append if available
          const newIdea = await fetchTopIdea();
          if (newIdea) {
            setIdeaStack(prev => {
              const next = [...prev]; // prev already had top removed by previous setIdeaStack or will soon
              next.push(newIdea);
              return next;
            });
          }

          // reset topNote visual transform so it is ready for the next top
          topNote.style.transition = 'none';
          topNote.style.transform = 'rotate(0deg)';
          topNote.style.opacity = '1';
        }, 480); // slightly longer than animation to ensure it's finished
      } else {
        // snap back
        topNote.style.transition = 'transform 0.3s ease';
        topNote.style.transform = 'rotate(0deg) translateX(0)';
        setTimeout(() => {
          topNote.style.transition = '';
        }, 350);
      }
    }

    // Attach listeners
    topNote.addEventListener('mousedown', startDrag);
    topNote.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('mousemove', drag);
    window.addEventListener('touchmove', drag, { passive: false });
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);
    window.addEventListener('touchcancel', endDrag);

    // cleanup
    return () => {
      window.removeEventListener('resize', onResize);
      topNote.removeEventListener('mousedown', startDrag);
      topNote.removeEventListener('touchstart', startDrag);
      window.removeEventListener('mousemove', drag);
      window.removeEventListener('touchmove', drag);
      window.removeEventListener('mouseup', endDrag);
      window.removeEventListener('touchend', endDrag);
      window.removeEventListener('touchcancel', endDrag);
    };
  }, [ideaStack, userData?.id]); // re-run when stack changes or user changes

  const topIdea = ideaStack[0] || null;
  const bottomIdea = ideaStack[1] || null;

  return (
    <div className="home-container">
      <style>{`
        .home-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          min-height: 100vh;
          background: url('https://cdn.architextures.org/textures/23/2/oak-veneermdf-none-rz7xim-1200.jpg') no-repeat center center fixed;
          background-size: cover;
          padding-top: 2rem;
        }
        .sticky-container {
          position: relative;
          width: 60vmin;
          height: 60vmin;
          margin-bottom: 2rem;
        }
        .sticky-note {
          position: absolute;
          width: 100%;
          height: 100%;
          padding: 2rem;
          box-sizing: border-box;
          font-weight: 700;
          color: #000;
          background-color: #fdfd96;
          background-image: url('https://unblast.com/wp-content/uploads/2022/01/Paper-Texture-7.jpg');
          background-size: cover;
          background-blend-mode: multiply;
          box-shadow: 8px 8px 20px rgba(0,0,0,0.4);
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          flex-direction: column;
          overflow: hidden;
          line-height: 1.2;
          word-break: break-word;
          cursor: grab;
          transform-origin: top center;
          transition: transform 0.2s ease, opacity 0.2s ease;
          transform: rotate(5deg);
        }
        .sticky-note.dragging {
          cursor: grabbing;
          transition: none;
        }
        .content {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .content .line {
          display: block;
          width: 100%;
          margin: 0.2em 0;
        }
        .card { width: 60vmin; }
      `}</style>

      <div className="sticky-container">
        {/* background when no top idea */}
        {!topIdea && (
          <div className="sticky-note">
            <div className="content">No more ideas available!</div>
          </div>
        )}

        {/* bottom note */}
        {bottomIdea && (
          <div className="sticky-note" ref={bottomNoteRef} style={{ transform: 'rotate(5deg)' }}>
            <div className="content">{bottomIdea.ideaDescription}</div>
          </div>
        )}

        {/* top note (interactive) */}
        {topIdea && (
          <div className="sticky-note" ref={topNoteRef}>
            <div className="content">{topIdea.ideaDescription}</div>
          </div>
        )}
      </div>

      <div className="container mt-3">
        <h1 className="text-center">Welcome to Punchfast</h1>
        {isLogin ? (
          <>
            <div className="alert alert-success text-center mt-4">
              You are signed in {userData?.username}.
            </div>
            {topIdea && (
              <div className="d-flex justify-content-center gap-2 mt-2">
                <button className="btn btn-success" onClick={() => { if (topIdea) handleVote(true, topIdea.id); }}>Like</button>
                <button className="btn btn-danger" onClick={() => { if (topIdea) handleVote(false, topIdea.id); }}>Dislike</button>
              </div>
            )}
          </>
        ) : (
          <div className="alert alert-warning text-center mt-4">You are not signed in.</div>
        )}
      </div>
    </div>
  );
};

export default Home;