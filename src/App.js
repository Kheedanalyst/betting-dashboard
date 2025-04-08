import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_KEY = process.env.REACT_APP_API_KEY;
const SPORT = 'soccer_epl';
const REGIONS = 'uk';
const MARKETS = 'h2h';
const ODDS_RANGE = [1.3, 1.6];

function App() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOdds = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${SPORT}/odds`, {
        params: {
          api_key: API_KEY,
          regions: REGIONS,
          markets: MARKETS,
          oddsFormat: 'decimal',
        },
      });
      const data = response.data;
      const filtered = [];

      data.forEach((game) => {
        game.bookmakers.forEach((bookmaker) => {
          bookmaker.markets.forEach((market) => {
            market.outcomes.forEach((outcome) => {
              if (outcome.price >= ODDS_RANGE[0] && outcome.price <= ODDS_RANGE[1]) {
                filtered.push({
                  matchup: `${game.home_team} vs ${game.away_team}`,
                  team: outcome.name,
                  odds: outcome.price,
                  bookmaker: bookmaker.title,
                });
              }
            });
          });
        });
      });

      setBets(filtered);
    } catch (error) {
      console.error('Error fetching odds:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOdds();
  }, []);

  return (
    <div className="App" style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Low-Risk Betting Suggestions</h1>
      <button onClick={fetchOdds} disabled={loading}>
        {loading ? 'Refreshing...' : 'Refresh Matches'}
      </button>
      <div style={{ marginTop: '1rem' }}>
        {bets.length > 0 ? (
          bets.map((bet, idx) => (
            <div key={idx} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
              <h2>{bet.matchup}</h2>
              <p><strong>Team:</strong> {bet.team}</p>
              <p><strong>Odds:</strong> {bet.odds}</p>
              <p><strong>Bookmaker:</strong> {bet.bookmaker}</p>
            </div>
          ))
        ) : (
          <p>No matches found in the safe odds range.</p>
        )}
      </div>
    </div>
  );
}

export default App;
