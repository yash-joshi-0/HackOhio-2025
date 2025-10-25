import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Ideas = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNearby = async () => {
            try {
                const res = await fetch(`/api/`);
                if (!res.ok) throw new Error('Failed to fetch ideas');
                const data = await res.json();
                setStores(data.stores || []);
            } catch (err) {
                console.error(err);
                setError('Could not load ideas');
            } finally {
                setLoading(false);
            }
        };
    }, [message]);
};

    return (
            <div className="container stores-container">
                <div className="page-header">
                    <a href="/newroute" className="btn btn-primary pull-right">
                        <span className="glyphicon glyphicon-plus"></span>
                    </a>
                    <h1 className="h3">Routes</h1>
                </div>

                <div>
                    {loading && <p>Loading nearby routes...</p>}
                    {error && <p className="text-danger">{error}</p>}
                    {!loading && routes.length === 0 && <p>No stores found nearby.</p>}

                    {routes.map((s) => (
                        <div key={s.id} className="panel panel-default">
                            <div className="panel-body">
                                <h4 className="panel-title">{s.name}</h4>
                                <ul className="list-group" style={{ marginTop: '10px', marginBottom: 0 }}>
                                    {s.stores && s.stores.map(store => (
                                        <li key={store.id} className="list-group-item" style={{ border: 'none', padding: '5px 15px' }}>
                                            {store.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
        </div>
    );
};

export default Ideas;