import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles.css'; // Import styles

const API_KEY = '2cbf429d440bf1a456424cadfa185b51';
const SPORTS = [
  'soccer_epl',
  'soccer_spain_la_liga',
  'soccer_germany_bundesliga',
  'soccer_italy_serie_a',
  'soccer_netherlands_eredivisie',
  'soccer_portugal_primeira_liga',
  'soccer_france_ligue_one'
];
const REGIONS = 'uk';
const MARKETS = 'h2h';
const ODDS_RANGE = [1.3, 1.6];
const initialBalance = 1000; // Starting balance (₦1,000)

function App() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(initialBalance);
  const [stakePercentage, setStakePercentage] = useState(5);
  const [stakeAmount, setStakeAmount] = useState(0);
  const [sortBy, setSortBy] = useState('time');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState('all');

  const fetchOddsForSport = async (sportKey) => {
    const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds`, {
      params: {
        api_key: API_KEY,
        regions: REGIONS,
        markets: MARKETS,
        oddsFormat: 'decimal',
      },
    });
    return response.data;
  };

  const fetchAllOdds = async () => {
    setLoading(true);
    try {
      let allBets = [];

      for (const sportKey of SPORTS) {
        const data = await fetchOddsForSport(sportKey);

        data.forEach((game) => {
          game.bookmakers.forEach((bookmaker) => {
            bookmaker.markets.forEach((market) => {
              market.outcomes.forEach((outcome) => {
                if (outcome.price >= ODDS_RANGE[0] && outcome.price <= ODDS_RANGE[1]) {
                  allBets.push({
                    matchup: `${game.home_team} vs ${game.away_team}`,
                    team: outcome.name,
                    odds: outcome.price,
                    bookmaker: bookmaker.title,
                    league: game.sport_title,
                    commence_time: game.commence_time
                  });
                }
              });
            });
          });
        });
      }

      setBets(allBets);
    } catch (error) {
      console.error('Error fetching odds:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const calculatedStake = (balance * stakePercentage) / 100;
    setStakeAmount(calculatedStake.toFixed(2));
  }, [balance, stakePercentage]);

  const sortBets = () => {
    let sortedBets = [...bets];

    if (sortBy === 'time') {
      sortedBets.sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time));
    } else if (sortBy === 'odds') {
      sortedBets.sort((a, b) => a.odds - b.odds);
    }

    if (selectedLeague !== 'all') {
      sortedBets = sortedBets.filter(bet => bet.league === selectedLeague);
    }

    return sortedBets;
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
    document.body.className = darkMode ? '' : 'dark';
  };

  useEffect(() => {
    fetchAllOdds();
  }, []);

  const uniqueLeagues = [...new Set(bets.map(bet => bet.league))];

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <h1>🧠 Smart Odds Betting Dashboard</h1>
      <button onClick={fetchAllOdds} disabled={loading}>
        {loading ? 'Refreshing...' : 'Refresh Matches'}
      </button>

      <div>
        <h2>💰 Current Balance: ₦{balance}</h2>
        <h3>📊 Stake per Bet: ₦{stakeAmount}</h3>

        <label>
          Set Stake Percentage (%):
          <input
            type="number"
            value={stakePercentage}
            onChange={(e) => setStakePercentage(e.target.value)}
            min="1"
            max="100"
          />
        </label>
      </div>

      <div>
        <h3>🎨 Appearance:</h3>
        <button onClick={toggleDarkMode}>{darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</button>
      </div>

      <div>
        <h3>🔄 Sort Matches By:</h3>
        <button onClick={() => setSortBy('time')}>Time</button>
        <button onClick={() => setSortBy('odds')}>Odds</button>
      </div>

      <div>
        <h3>⚽ Filter by League:</h3>
        <select onChange={(e) => setSelectedLeague(e.target.value)} value={selectedLeague}>
          <option value="all">All Leagues</option>
          {uniqueLeagues.map((league, idx) => (
            <option key={idx} value={league}>{league}</option>
          ))}
        </select>
      </div>

      <div>
        {sortBets().length > 0 ? (
          sortBets().map((bet, idx) => (
            <div key={idx} className="match match-card">
              <h2>{bet.matchup}</h2>
              <p><strong>League:</strong> {bet.league}</p>
              <p><strong>Team:</strong> {bet.team}</p>
              <p><strong>Odds:</strong> {bet.odds}</p>
              <p><strong>Bookmaker:</strong> {bet.bookmaker}</p>
              <p><strong>Kickoff:</strong> {new Date(bet.commence_time).toLocaleString()}</p>
              <p><strong>Suggested Stake:</strong> ₦{stakeAmount}</p>
              <button>Place Bet</button>
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
