import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { anonymousUser } from '../utils/anonymousUser';

const Home = ({ isLogin, userData, crits, updateCrits }) => {
    const [topIdea, setTopIdea] = useState(null);
    const topNoteRef = useRef(null);
    const bottomNoteRef = useRef(null);

  // Fetch the top idea (works for both logged in and anonymous users)
  useEffect(() => {
    fetchTopIdea();
  }, [isLogin]);

  const fetchTopIdea = async () => {
    try {
        if (isLogin && userData?.id) {
          // Fetch for logged-in user
          const response = await fetch('/api/gettopideaforuser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userData.id }),
          });

          const data = await response.json();

          if (response.ok && data.idea) {
            setTopIdea({
              id: data.idea.id || 0,
              ideaDescription: data.idea.ideaDescription || data.idea,
            });
          } else {
            console.error('Error fetching top idea:', data.message || 'No idea returned');
            setTopIdea(null);
          }
        } else {
          // Fetch for anonymous user - get idea with highest crits that they haven't voted on
          const response = await fetch('/api/gettopideaforanonymous', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ votedIdeaIds: anonymousUser.getVotes().map(v => v.ideaId) }),
          });

          const data = await response.json();

          if (response.ok && data.idea) {
            setTopIdea({
              id: data.idea.id || 0,
              ideaDescription: data.idea.ideaDescription || data.idea,
            });
          } else {
            console.error('Error fetching top idea:', data.message || 'No idea returned');
            setTopIdea(null);
          }
        }
    } catch (error) {
        console.error('Error fetching top idea:', error);
        setTopIdea(null);
    }
  };


  const handleVote = async (isLike) => {
        try {
          if (isLogin && userData?.id) {
            // Logged in user voting
            const response = await fetch('/api/createvote', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: userData.id,
                ideaId: topIdea.id,
                isLike: isLike,
              }),
            });

            const data = await response.json();

            if (response.ok) {
              // Update crits if user gained one
              if (data.userGainedCrit) {
                console.log(`You gained a crit! Total: ${data.userCrits}`);
                updateCrits(data.userCrits);
              }

              // Fetch the next idea
              fetchTopIdea();
            } else {
              console.error('Error voting:', data.message || 'No vote');
            }
          } else {
            // Anonymous user voting
            anonymousUser.addVote(topIdea.id, isLike);

            // 10% chance to gain a crit
            if (Math.random() < 0.10) {
              const newCrits = crits + 1;
              updateCrits(newCrits);
              console.log(`You gained a crit! Total: ${newCrits}`);
            }

            // Fetch the next idea
            fetchTopIdea();
          }
    } catch (error) {
        console.error('Error voting:', error);
    }
    };

  // Initialize peeling sticky note behavior
  useEffect(() => {
    const topNote = topNoteRef.current;
    if (!topNote) return;
    const topContent = topNote.querySelector('.content');

    // Auto-resize text
    function escapeHtml(s) {
      if (typeof s !== 'string') {
        console.warn('escapeHtml called with non-string:', s);
        return '';
      }
      return s.replace(/[&<>"']/g, c => ({
        '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'": '&#39;'
      })[c]);
    }

    function splitSentences(text) {
      if(!text) return [];
      const parts = text.split(/\. +/g).map(p=>p.trim()).filter(Boolean);
      return parts.map(p => (p.endsWith('.') ? p : p+'.'));
    }

    function renderTextBlocks(rawText, contentEl){
      
      const sentences = splitSentences(rawText);
      const nodes = sentences.length ? sentences : [rawText];
      contentEl.innerHTML = nodes.map(s => `<div class="line">${escapeHtml(s)}</div>`).join('');
    }

    function fitFontToBox(squareEl, contentEl) {
      let side = squareEl.clientWidth;
      let lo = 4, hi = side, best = lo;
      function fits(fontPx){
        contentEl.style.fontSize = fontPx + 'px';
        return contentEl.scrollWidth <= contentEl.clientWidth &&
               contentEl.scrollHeight <= contentEl.clientHeight;
      }
      for (let i=0; i<24; i++){
        const mid = Math.floor((lo + hi)/2);
        if(fits(mid)) { best = mid; lo = mid + 1; }
        else { hi = mid - 1; }
      }
      contentEl.style.fontSize = best + 'px';
    }

    function updateContent() {
      if(topIdea) {
        topContent.dataset.rawText = topIdea.ideaDescription;
        renderTextBlocks(topIdea.ideaDescription, topContent);
        fitFontToBox(topNote, topContent);
      }
    }

    updateContent();
    window.addEventListener('resize', updateContent);

    // Dragging logic
    let dragging = false;
    let startX = 0;
    const DRAG_THRESHOLD = 80;

    function startDrag(e){
      dragging = true;
      topNote.classList.add('dragging');
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      e.preventDefault();
    }

    function drag(e){
      if(!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const dx = x - startX;
      const rotate = Math.min(Math.max(-dx / 3, -30), 30);
      topNote.style.transform = `translateX(${dx}px) rotate(${rotate}deg)`;
    }

    function endDrag(){
      if(!dragging) return;
      dragging = false;
      topNote.classList.remove('dragging');

      const style = topNote.style.transform;
      const dxMatch = style.match(/translateX\(([-\d.]+)px\)/);
      const dx = dxMatch ? parseFloat(dxMatch[1]) : 0;

      if(Math.abs(dx) > DRAG_THRESHOLD){
        const direction = dx > 0 ? 'right' : 'left';
        if(direction == "left") {
          handleVote(false);
        } else {
          handleVote(true);
        }
        console.log(`Sticky note peeled ${direction}`);
        setTimeout(() => {
          console.log('Direction reset');        
        }, 1000);

        topNote.style.transition = 'transform 1s ease, opacity 0.3s ease';
        topNote.style.transform = `translateX(${dx*2}px) rotate(${dx/5}deg)`;
        topNote.style.opacity = '0';

        setTimeout(() => {
          topNote.style.transition = 'none';
          topNote.style.transform = 'translateX(0) rotate(0)';
          topNote.style.opacity = '1';
        }, 400);
      } else {
        topNote.style.transition = 'transform 0.3s ease';
        topNote.style.transform = 'rotate(0) translateX(0)';
        setTimeout(()=> {
          topNote.style.transition = ''

        }, 350);
      }
    }

    topNote.addEventListener('mousedown', startDrag);
    topNote.addEventListener('touchstart', startDrag, {passive:false});
    window.addEventListener('mousemove', drag);
    window.addEventListener('touchmove', drag, {passive:false});
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);
    window.addEventListener('touchcancel', endDrag);

    return () => {
      window.removeEventListener('resize', updateContent);
    };
  }, [topIdea]);

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

        .card {
          width: 60vmin;
        }
       `}</style>

      <div className="sticky-container">
        <div className="sticky-note" ref={bottomNoteRef}>
          <div className="content">This is the bottom sticky note revealed after peeling.</div>
        </div>
        {topIdea && (
          <div className="sticky-note" ref={topNoteRef}>
            <div className="content">{topIdea.ideaDescription}</div>
          </div>
        )}
      </div>

      <div className="container mt-5">
            <h1 className="text-center">Welcome to Punchfast</h1>
            {isLogin ? (
                <div>
                    <div className="alert alert-success text-center mt-4">
                        You are signed in {userData?.username }.
                    </div>
                    {topIdea && (
                        <div className="card mt-4">
                            <div className="card-body">
                                <h5 className="card-title">Top Idea</h5>
                                <p className="card-text">{topIdea.ideaDescription}</p>
                                <div className="d-flex justify-content-center gap-2">
                                    <button 
                                        className="btn btn-success"
                                        onClick={() => handleVote(true)}
                                    >
                                        Like
                                    </button>
                                    <button 
                                        className="btn btn-danger"
                                        onClick={() => handleVote(false)}
                                    >
                                        Dislike
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="alert alert-warning text-center mt-4">
                    You are not signed in.
                </div>
            )}
      </div>
    </div>
  );
};

export default Home;