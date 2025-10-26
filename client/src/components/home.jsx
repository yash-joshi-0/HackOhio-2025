import React, { useState, useEffect, useRef } from 'react';
import { anonymousUser } from '../utils/anonymousUser';

const Home = ({ isLogin, userData, crits, updateCrits }) => {
  const [ideaStack, setIdeaStack] = useState([]);
  const topNoteRef = useRef(null);
  const bottomNoteRef = useRef(null);

  // Fetch top idea for logged-in or anonymous user
  const fetchTopIdea = async () => {
    try {
      let response;
      if (isLogin && userData?.id) {
        response = await fetch('/api/gettopideaforuser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userData.id }),
        });
      } else {
        response = await fetch('/api/gettopideaforanonymous', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ votedIdeaIds: anonymousUser.getVotes().map(v => v.ideaId) }),
        });
      }

      const data = await response.json();
      if (response.ok && data.idea) {
        return {
          id: data.idea.id || 0,
          ideaDescription: data.idea.ideaDescription || data.idea,
        };
      }
    } catch (err) {
      console.error('Error fetching top idea:', err);
    }
    return null;
  };

  // Initialize stack
  useEffect(() => {
    const initIdeas = async () => {
      const first = await fetchTopIdea();
      const second = await fetchTopIdea();
      const stack = [first, second].filter(Boolean);
      setIdeaStack(stack);
    };
    initIdeas();
  }, [isLogin, userData?.id]);

  // Handle voting logic
  const handleVote = async (isLike) => {
    const topIdea = ideaStack[0];
    if (!topIdea) return;

    try {
      if (isLogin && userData?.id) {
        const response = await fetch('/api/createvote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userData.id,
            ideaId: topIdea.id,
            isLike,
          }),
        });
        const data = await response.json();

        if (response.ok && data.userGainedCrit) {
          updateCrits(data.userCrits);
        }
      } else {
        // Anonymous logic
        anonymousUser.addVote(topIdea.id, isLike);
        if (Math.random() < 0.1) updateCrits(crits + 1);
      }

      // Fetch next idea
      const newIdea = await fetchTopIdea();
      setIdeaStack(prev => {
        const [, ...rest] = prev;
        return [...rest, newIdea].filter(Boolean);
      });

    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  // Drag/peel animation
  useEffect(() => {
    const topNote = topNoteRef.current;
    if (!topNote) return;

    let dragging = false;
    let startX = 0;
    const DRAG_THRESHOLD = 80;

    function startDrag(e) {
      dragging = true;
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      topNote.style.transition = 'none';
      topNote.style.cursor = 'grabbing';
    }

    function drag(e) {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const dx = x - startX;
      const rotate = Math.min(Math.max(dx / 10, -25), 25);
      topNote.style.transform = `translateX(${dx}px) rotate(${rotate}deg)`;
    }

    async function endDrag() {
      if (!dragging) return;
      dragging = false;
      topNote.style.cursor = 'grab';

      const dx = parseFloat(topNote.style.transform.match(/translateX\(([-\d.]+)px\)/)?.[1]) || 0;
      if (Math.abs(dx) > DRAG_THRESHOLD) {
        const isLike = dx > 0;
        topNote.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        topNote.style.transform = `translateX(${dx * 2}px) rotate(${dx / 4}deg)`;
        topNote.style.opacity = '0';

        setTimeout(async () => {
          await handleVote(isLike);
          topNote.style.transition = 'none';
          topNote.style.transform = 'rotate(0deg)';
          topNote.style.opacity = '1';
        }, 420);
      } else {
        topNote.style.transition = 'transform 0.3s ease';
        topNote.style.transform = 'translateX(0px) rotate(0deg)';
      }
    }

    topNote.addEventListener('mousedown', startDrag);
    topNote.addEventListener('touchstart', startDrag);
    window.addEventListener('mousemove', drag);
    window.addEventListener('touchmove', drag);
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);

    return () => {
      topNote.removeEventListener('mousedown', startDrag);
      topNote.removeEventListener('touchstart', startDrag);
      window.removeEventListener('mousemove', drag);
      window.removeEventListener('touchmove', drag);
      window.removeEventListener('mouseup', endDrag);
      window.removeEventListener('touchend', endDrag);
    };
  }, [ideaStack]);

  const topIdea = ideaStack[0];
  const bottomIdea = ideaStack[1];

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
          font-family: 'Margarine', cursive;
        }
        .sticky-container {
          position: relative;
          width: clamp(300px, 45vmin, 600px);
          height: clamp(300px, 45vmin, 600px);
        }
        .sticky-note {
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: #fff89a;
          background-image: url('https://unblast.com/wp-content/uploads/2022/01/Paper-Texture-7.jpg');
          background-size: cover;
          background-blend-mode: multiply;
          box-shadow: 10px 10px 25px rgba(0,0,0,0.35);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          box-sizing: border-box;
          color: #000;
          font-weight: bold;
          font-size: clamp(16px, 2vw, 26px);
          transform: rotate(4deg);
          cursor: grab;
          user-select: none;
        }
        .sticky-note:nth-child(2) {
          transform: rotate(2deg);
          opacity: 0.8;
        }
        .sticky-note.dragging {
          cursor: grabbing;
        }
      `}</style>

      <div className="sticky-container">
        {bottomIdea && (
          <div className="sticky-note" ref={bottomNoteRef}>
            {bottomIdea.ideaDescription}
          </div>
        )}

        {topIdea ? (
          <div className="sticky-note" ref={topNoteRef}>
            {topIdea.ideaDescription}
          </div>
        ) : (
          <div className="sticky-note">
            No more ideas available!
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
