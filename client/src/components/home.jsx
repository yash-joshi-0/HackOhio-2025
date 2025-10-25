import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = ({ isLogin, user }) => {
    const [topIdea, setTopIdea] = useState(null);

    useEffect(() => {
        if (isLogin) {
            fetchTopIdea();
        }
    }, [isLogin]);

    const fetchTopIdea = async () => {
        try {
            const response = await axios.get('/api/ideas/gettopideaforuser');
            setTopIdea(response.data);
        } catch (error) {
            console.error('Error fetching top idea:', error);
        }
    };

    const handleVote = async (isLike) => {
        try {
            await axios.post('/api/votes/createvote', {
                userId: user.id,
                ideaId: topIdea.id,
                isLike
            });
            fetchTopIdea(); // Refresh the idea after voting
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center">Welcome to Punchfast</h1>
            {isLogin ? (
                <div>
                    <div className="alert alert-success text-center mt-4">
                        You are signed in as a {user}.
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
    );
};

export default Home;
