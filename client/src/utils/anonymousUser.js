// Utility to manage anonymous user data in localStorage

const ANONYMOUS_VOTES_KEY = 'anonymous_votes';
const ANONYMOUS_CRITS_KEY = 'anonymous_crits';

export const anonymousUser = {
  // Get all anonymous votes
  getVotes: () => {
    const votes = localStorage.getItem(ANONYMOUS_VOTES_KEY);
    return votes ? JSON.parse(votes) : [];
  },

  // Add a vote (ideaId, isLike)
  addVote: (ideaId, isLike) => {
    const votes = anonymousUser.getVotes();
    // Check if already voted on this idea
    const existingVoteIndex = votes.findIndex(v => v.ideaId === ideaId);
    if (existingVoteIndex !== -1) {
      // Update existing vote
      votes[existingVoteIndex].isLike = isLike;
    } else {
      // Add new vote
      votes.push({ ideaId, isLike });
    }
    localStorage.setItem(ANONYMOUS_VOTES_KEY, JSON.stringify(votes));
  },

  // Check if user has voted on an idea
  hasVoted: (ideaId) => {
    const votes = anonymousUser.getVotes();
    return votes.some(v => v.ideaId === ideaId);
  },

  // Get anonymous crits count
  getCrits: () => {
    const crits = localStorage.getItem(ANONYMOUS_CRITS_KEY);
    return crits ? parseInt(crits, 10) : 5; // Start with 5 crits
  },

  // Set anonymous crits
  setCrits: (amount) => {
    localStorage.setItem(ANONYMOUS_CRITS_KEY, amount.toString());
  },

  // Add crits
  addCrits: (amount) => {
    const current = anonymousUser.getCrits();
    anonymousUser.setCrits(current + amount);
  },

  // Clear all anonymous data (called after merging with account)
  clear: () => {
    localStorage.removeItem(ANONYMOUS_VOTES_KEY);
    localStorage.removeItem(ANONYMOUS_CRITS_KEY);
  },

  // Get all data for merging
  getAllData: () => {
    return {
      votes: anonymousUser.getVotes(),
      crits: anonymousUser.getCrits()
    };
  }
};
