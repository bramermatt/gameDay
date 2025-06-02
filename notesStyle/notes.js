const container = document.getElementById('games');
const gameDetails = document.getElementById('game-details');
const calendar = document.getElementById('calendar');

// Filters
const leagueFilter = document.getElementById('league');
const teamFilter = document.getElementById('team');

// Load games for a given date
function loadGames(dateStr, league, team) {
  container.innerHTML = '<p class="text-center text-gray-400">Loading...</p>';

  const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${dateStr}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const games = data.dates?.[0]?.games || [];
      const filteredGames = games.filter(game => {
        return (league === 'MLB' || game.teams.away.team.name.includes(league) || game.teams.home.team.name.includes(league)) && 
               (team === '' || game.teams.away.team.name.includes(team) || game.teams.home.team.name.includes(team));
      });

      if (filteredGames.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No games scheduled.</p>';
        return;
      }

      container.innerHTML = '';
      filteredGames.forEach(game => {
        const card = createGameCard(game);
        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Error loading games:', err);
      container.innerHTML = '<p class="text-center text-red-500">Failed to load games.</p>';
    });
}

// Create game card element
function createGameCard(game) {
  const { gameDate, status, teams, venue } = game;
  const away = teams.away.team.name;
  const home = teams.home.team.name;
  const awayScore = teams.away.score ?? '-';
  const homeScore = teams.home.score ?? '-';
  const state = status.detailedState;
  const time = new Date(gameDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  const location = venue.name;

  const card = document.createElement('div');
  card.className = 'bg-white p-4 rounded shadow cursor-pointer';
  card.innerHTML = `
    <div class="text-lg font-semibold mb-1">${away} @ ${home}</div>
    <div class="text-sm text-gray-700 mb-1">Time: ${time}</div>
    <div class="text-sm text-gray-700 mb-1">Location: ${location}</div>
    <div class="text-sm text-gray-600">Status: ${state}</div>
    <div class="mt-2 font-bold text-blue-600">Score: ${awayScore} – ${homeScore}</div>
  `;
  
  // Event listener to show full game details when clicked
  card.addEventListener('click', () => showGameDetails(game));

  return card;
}

// Show full game details in the right pane
function showGameDetails(game) {
  const { gameDate, status, teams, venue, broadcasts } = game;
  const away = teams.away.team.name;
  const home = teams.home.team.name;
  const awayScore = teams.away.score ?? '-';
  const homeScore = teams.home.score ?? '-';
  const state = status.detailedState;
  const time = new Date(gameDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  const location = venue.name;
  const broadcast = broadcasts?.find(b => b.type === 'TV')?.name || 'Not Available';

  gameDetails.innerHTML = `
    <h3 class="text-xl font-bold mb-2">${away} vs ${home}</h3>
    <div class="text-sm text-gray-700">Date: ${new Date(gameDate).toLocaleDateString()}</div>
    <div class="text-sm text-gray-700">Time: ${time}</div>
    <div class="text-sm text-gray-700">Location: ${location}</div>
    <div class="text-sm text-gray-600">Status: ${state}</div>
    <div class="mt-2 font-bold text-blue-600">Score: ${awayScore} – ${homeScore}</div>
    <div class="mt-2 text-xs text-blue-500">Broadcast: ${broadcast}</div>
  `;
}

// Calendar Logic (you can integrate a real calendar here)
function loadCalendar() {
  const today = new Date();
  calendar.innerHTML = `<div class="font-semibold text-xl text-center">${today.toLocaleDateString()}</div>`;
}

// Event listeners for filters
leagueFilter.addEventListener('change', () => loadGames(dateInput.value, leagueFilter.value, teamFilter.value));
teamFilter.addEventListener('change', () => loadGames(dateInput.value, leagueFilter.value, teamFilter.value));

// Initial load
loadGames(new Date().toISOString().split('T')[0], leagueFilter.value, teamFilter.value);
loadCalendar();
