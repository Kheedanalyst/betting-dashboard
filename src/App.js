import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles.css'; // Import styles

const API_KEY = process.env.REACT_APP_API_KEY;
const SPORTS = [
  { key: 'soccer_epl', name: 'English Premier League' },
  { key: 'soccer_spain_la_liga', name: 'La Liga' },
  { key: 'soccer_germany_bundesliga', name: 'Bundesliga' },
  { key: 'soccer_italy_serie_a', name: 'Serie A' },
  { key: 'soccer_netherlands_eredivisie', name: 'Eredivisie' },
  { key: 'soccer_portugal_primeira_liga', name: 'Primeira Liga' },
  { key: 'soccer_france_ligue_one', name: 'Ligue 1' }
];
const REGIONS = 'uk';
const MARKETS = 'h2h';
const ODDS_RANGE = [1.3, 1.6];
const initialBalance = 1000; // Starting balance (₦1,000)

function App() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(initialBalance); // User's current balance
  const [stakePercentage, setStakePercentage] = useState(5); // Bet percentage
  const [stakeAmount, setStakeAmount] = useState(0);
  const [sortBy, setSortBy] = useState('time'); // Default sorting by time
  const [darkMode, setDarkMode] = useState(false); // Dark mode state
  const [selectedLeague, setSelectedLeague] = useState(''); // Selected league for filtering

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

      for (const sport of SPORTS) {
        const data = await fetchOddsForSport(sport.key);

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
                    league: sport.name, // Use the human-readable league name
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

  // Calculate stake based on balance and stake percentage
  useEffect(() => {
    const calculatedStake = (balance * stakePercentage) / 100;
    setStakeAmount(calculatedStake.toFixed(2)); // Round to 2 decimal places
  }, [balance, stakePercentage]);

  // Sort bets based on time, odds, or bookmaker
  const sortBets = () => {
    let sortedBets = [...bets];

    if (sortBy === 'time') {
      sortedBets.sort((a, b) => a.commence_time - b.commence_time); // Sort by time ascending
    } else if (sortBy === 'odds') {
      sortedBets.sort((a, b) => a.odds - b.odds); // Sort by odds ascending
    } else if (sortBy === 'bookmaker') {
      sortedBets.sort((a, b) => a.bookmaker.localeCompare(b.bookmaker)); // Sort by bookmaker name
    }

    // Filter by selected league (if any)
    if (selectedLeague) {
      sortedBets = sortedBets.filter(bet => bet.league === selectedLeague);
    }

    return sortedBets;
  };

  useEffect(() => {
    fetchAllOdds();
  }, []);

  return (
    <div className={`App ${darkMode ? 'dark' : ''}`}>
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
        <h3>🔄 Sort Matches By:</h3>
        <button onClick={() => setSortBy('time')}>Time</button>
        <button onClick={() => setSortBy('odds')}>Odds</button>
        <button onClick={() => setSortBy('bookmaker')}>Bookmaker</button>
      </div>

      <div>
        <h3>🏆 Filter Matches By League:</h3>
        <select onChange={(e) => setSelectedLeague(e.target.value)} value={selectedLeague}>
          <option value="">All Leagues</option>
          {SPORTS.map(sport => (
            <option key={sport.key} value={sport.name}>{sport.name}</option>
          ))}
        </select>
      </div>

      <div>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </div>

      <div>
        {sortBets().length > 0 ? (
          sortBets().map((bet, idx) => (
            <div key={idx} className="match">
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
