import React from 'react';

const MatchCard = ({ match }) => {
  const { teams, fixture, league } = match;
  const date = new Date(fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="match">
      <h2>{teams.home.name} vs {teams.away.name}</h2>
      <p><strong>League:</strong> {league.name}</p>
      <p><strong>Time:</strong> {date}</p>
      <p className="match-details">
        <strong>Venue:</strong> {fixture.venue.name} — {fixture.venue.city}
      </p>
    </div>
  );
};

export default MatchCard;
