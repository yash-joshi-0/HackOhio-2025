import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Ideas = ({ isLogin, userData }) => {
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [newIdea, setNewIdea] = useState('');

    useEffect(() => {
        const fetchIdeas = async () => {
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
    }, []);

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

    return (
            <div className="container stores-container">
                <div className="page-header">
                    <a href="/newroute" className="btn btn-primary pull-right">
                        <span className="glyphicon glyphicon-plus"></span>
                    </a>
                    <h1 className="h3">Ideas</h1>
                </div>

                <form onSubmit={handleCreateIdea} style={{ marginBottom: 16 }}>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Share a new idea..."
                            value={newIdea}
                            onChange={(e) => setNewIdea(e.target.value)}
                            aria-label="New idea"
                        />
                        <span className="input-group-btn">
                            <button className="btn btn-primary" type="submit" disabled={loading}>
                                Add Idea
                            </button>
                        </span>
                    </div>
                </form>

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
                                <span>
                                    <i className="fas fa-bolt" style={{ marginRight: '5px', color: '#ffc107' }}></i>
                                    {idea.ideaCrits} crits
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
    );
};

export default Ideas;