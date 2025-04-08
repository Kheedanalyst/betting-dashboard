import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const API_KEY = process.env.REACT_APP_API_KEY;
const SPORTS = [
  'soccer_epl',
  'soccer_spain_la_liga',
  'soccer_germany_bundesliga',
  'soccer_italy_serie_a',
  'soccer_france_ligue_one'
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
  const [startDate, setStartDate] = useState(new Date()); // Start date for filter
  const [endDate, setEndDate] = useState(new Date()); // End date for filter

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

  // Calculate stake based on balance and stake percentage
  useEffect(() => {
    const calculatedStake = (balance * stakePercentage) / 100;
    setStakeAmount(calculatedStake.toFixed(2)); // Round to 2 decimal places
  }, [balance, stakePercentage]);

  // Filter bets based on the selected date range
  const filterByDateRange = (bets) => {
    return bets.filter((bet) => {
      const matchDate = new Date(bet.commence_time * 1000); // Convert to milliseconds
      return matchDate >= startDate && matchDate <= endDate;
    });
  };

  // Sort bets based on time or odds
  const sortBets = () => {
    let sortedBets = [...bets];

    if (sortBy === 'time') {
      sortedBets.sort((a, b) => a.commence_time - b.commence_time); // Sort by time ascending
    } else if (sortBy === 'odds') {
      sortedBets.sort((a, b) => a.odds - b.odds); // Sort by odds ascending
    }

    return filterByDateRange(sortedBets);
  };

  useEffect(() => {
    fetchAllOdds();
  }, []);

  return (
    <div className="App" style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>🧠 Smart Odds Betting Dashboard</h1>
      <button onClick={fetchAllOdds} disabled={loading}>
        {loading ? 'Refreshing...' : 'Refresh Matches'}
      </button>

      <div style={{ marginTop: '1rem' }}>
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
            style={{ marginLeft: '1rem' }}
          />
        </label>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h3>🔄 Sort Matches By:</h3>
        <button onClick={() => setSortBy('time')}>Time</button>
        <button onClick={() => setSortBy('odds')}>Odds</button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>📅 Filter Matches by Date Range:</h3>
        <div>
          <label>Start Date: </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="MMMM d, yyyy"
            selectsStart
            startDate={startDate}
            endDate={endDate}
            inline
          />
        </div>

        <div>
          <label>End Date: </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="MMMM d, yyyy"
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            inline
          />
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        {sortBets().length > 0 ? (
          sortBets().map((bet, idx) => (
            <div key={idx} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
              <h2>{bet.matchup}</h2>
              <p><strong>League:</strong> {bet.league}</p>
              <p><strong>Team:</strong> {bet.team}</p>
              <p><strong>Odds:</strong> {bet.odds}</p>
              <p><strong>Bookmaker:</strong> {bet.bookmaker}</p>
              <p><strong>Kickoff:</strong> {new Date(bet.commence_time * 1000).toLocaleString()}</p>
              <p><strong>Suggested Stake:</strong> ₦{stakeAmount}</p>
            </div>
          ))
        ) : (
          <p>No matches found in the selected date range.</p>
        )}
      </div>
    </div>
  );
}

export default App;
