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
                const res = await fetch('/api/idea');
                if (!res.ok) throw new Error('Failed to fetch ideas');
                const data = await res.json();
                setIdeas(data.ideas || []);
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
            const res = await fetch('/idea/createidea', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({  newIdeaDesc: newIdea, userId: userData.id }),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || 'Failed to create idea');
            }
            const created = await res.json();
            setIdeas(prev => [created, ...prev]);
            setNewIdea('');
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
                    <div key={idea.id || idea._id} className="panel panel-default">
                        <div className="panel-body">
                            <h4 className="panel-title">{idea.title || idea.text || 'Untitled'}</h4>
                            <ul className="list-group" style={{ marginTop: '10px', marginBottom: 0 }}>
                                {idea.stores && idea.stores.map(store => (
                                    <li key={store.id} className="list-group-item" style={{ border: 'none', padding: '5px 15px' }}>
                                        {store.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
    );
};

export default Ideas;