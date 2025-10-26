import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Ideas = ({ isLogin, userData, crits, updateCrits }) => {
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [newIdea, setNewIdea] = useState('');
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiSummary, setAiSummary] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        const fetchIdeas = async () => {
            if (!isLogin || !userData?.id) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/getIdeasWithVotesFromUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userData.id }),
            });
                if (!res.ok) throw new Error('Failed to fetch ideas')
                    else{
                const data = await res.json();
                console.log(data)
                setIdeas(data.ideas || []);
                    }
            } catch (err) {
                console.error(err);
                setError('Could not load ideas');
            } finally {
                setLoading(false);
            }
        };

        fetchIdeas();
    }, [isLogin, userData]);

    const handleCreateIdea = async (e) => {
        e.preventDefault();
        if (!newIdea.trim()) return;
        setError(null);
        setLoading(true);
        try {
            const res = await fetch('/api/createidea', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({  newIdeaDesc: newIdea, userId: userData.id }),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || 'Failed to create idea');
            }
            setNewIdea('');
            // Refetch ideas to get updated list with vote counts
            const fetchRes = await fetch('/api/getIdeasWithVotesFromUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userData.id }),
            });
            if (fetchRes.ok) {
                const data = await fetchRes.json();
                setIdeas(data.ideas || []);
            }
        } catch (err) {
            console.error(err);
            setError('Could not create idea');
        } finally {
            setLoading(false);
        }
    };

    const handleBoostIdea = async (ideaId) => {
        if (crits < 1) {
            alert('You need at least 1 crit to boost an idea');
            return;
        }

        try {
            const res = await fetch('/api/userboostscrit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userData.id, ideaId: ideaId, critAmount: 1 }),
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.message || 'Failed to boost idea');
                return;
            }

            const data = await res.json();
            updateCrits(data.userCritAmount);

            // Refetch ideas to show updated crit counts
            const fetchRes = await fetch('/api/getIdeasWithVotesFromUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userData.id }),
            });
            if (fetchRes.ok) {
                const ideasData = await fetchRes.json();
                setIdeas(ideasData.ideas || []);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to boost idea');
        }
    };

    const handleAIHelp = async () => {
        if (!aiSummary.trim()) {
            alert('Please enter a summary');
            return;
        }

        setAiLoading(true);
        try {
            const res = await fetch('/api/simplifyidea', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary: aiSummary }),
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.message || 'Failed to generate elevator pitch');
                return;
            }

            const data = await res.json();
            setNewIdea(data.elevator_pitch);
            setShowAIModal(false);
            setAiSummary('');
        } catch (err) {
            console.error(err);
            alert('Failed to generate elevator pitch. Please try again.');
        } finally {
            setAiLoading(false);
        }
    };

    if (!isLogin) {
        return (
            <div className="container stores-container">
                <div className="alert alert-warning text-center mt-5">
                    Please sign in to view your ideas.
                </div>
            </div>
        );
    }

    return (
            <div className="container stores-container">
                <div className="page-header">
                    <h1 className="h3">Your Ideas</h1>
                </div>

                <form onSubmit={handleCreateIdea} style={{ marginBottom: 16 }}>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Share a new idea..."
                            value={newIdea}
                            onChange={(e) => setNewIdea(e.target.value.slice(0, 70))}
                            aria-label="New idea"
                            maxLength={70}
                        />
                        <span className="input-group-btn">
                            <button
                                className="btn btn-info"
                                type="button"
                                onClick={() => setShowAIModal(true)}
                                style={{ marginRight: '5px' }}
                            >
                                AI Help
                            </button>
                            <button className="btn btn-primary" type="submit" disabled={loading}>
                                Add Idea
                            </button>
                        </span>
                    </div>
                    <small className="text-muted">{newIdea.length}/70 characters</small>
                </form>

                {/* AI Help Modal */}
                {showAIModal && (
                    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowAIModal(false)}>
                        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">AI Idea Simplifier</h5>
                                    <button type="button" className="close" onClick={() => setShowAIModal(false)}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <p>Enter a detailed summary of your idea, and AI will create a concise elevator pitch:</p>
                                    <textarea
                                        className="form-control"
                                        rows="5"
                                        placeholder="Describe your idea in detail..."
                                        value={aiSummary}
                                        onChange={(e) => setAiSummary(e.target.value)}
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAIModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="button" className="btn btn-primary" onClick={handleAIHelp} disabled={aiLoading}>
                                        {aiLoading ? 'Generating...' : 'Generate Pitch'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {loading && <p>Loading ideas...</p>}
                {error && <p className="text-danger">{error}</p>}
                {!loading && ideas.length === 0 && <p>No ideas found.</p>}

                {ideas.map((idea) => (
                    <div key={idea.id} className="panel panel-default" style={{ marginBottom: '15px' }}>
                        <div className="panel-body">
                            <p style={{ fontSize: '16px', marginBottom: '10px' }}>{idea.ideaDescription}</p>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', fontSize: '14px', color: '#666' }}>
                                <span>
                                    <i className="fas fa-thumbs-up" style={{ marginRight: '5px', color: '#28a745' }}></i>
                                    {idea.likeCount || 0} likes
                                </span>
                                <span>
                                    <i className="fas fa-thumbs-down" style={{ marginRight: '5px', color: '#dc3545' }}></i>
                                    {idea.dislikeCount || 0} dislikes
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <i className="fas fa-bolt" style={{ marginRight: '5px', color: '#ffc107' }}></i>
                                    {Math.round(idea.ideaCrits * 10) / 10} crits
                                    <button
                                        onClick={() => handleBoostIdea(idea.id)}
                                        className="btn btn-sm btn-warning"
                                        style={{ marginLeft: '5px', padding: '2px 8px', fontSize: '12px' }}
                                        title="Boost this idea with crits"
                                    >
                                        +
                                    </button>
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
    );
};

export default Ideas;