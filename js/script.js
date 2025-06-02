const container = document.getElementById('games');

// Create compact date picker and arrow buttons
const controls = document.createElement('div');
controls.className = 'mb-2 flex items-center justify-center gap-2 flex-wrap sticky top-14 z-20 bg-white py-1 shadow rounded-lg';

const backBtn = document.createElement('button');
backBtn.innerHTML = '&#8592;'; // Left arrow
backBtn.title = 'Previous Day';
backBtn.className = 'bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600';

const dateInput = document.createElement('input');
dateInput.type = 'date';
dateInput.className = 'border rounded px-2 py-1 text-sm';
const today = new Date();
dateInput.value = today.toISOString().split('T')[0];

const todayBtn = document.createElement('button');
todayBtn.textContent = 'Today';
todayBtn.title = 'Go to Today';
todayBtn.className = 'bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600';

const forwardBtn = document.createElement('button');
forwardBtn.innerHTML = '&#8594;'; // Right arrow
forwardBtn.title = 'Next Day';
forwardBtn.className = 'bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600';

controls.appendChild(backBtn);
controls.appendChild(dateInput);
controls.appendChild(todayBtn);
controls.appendChild(forwardBtn);
container.parentNode.insertBefore(controls, container);

// Arrow button event listeners
backBtn.addEventListener('click', () => {
    const date = new Date(dateInput.value);
    date.setDate(date.getDate() - 1);
    dateInput.value = date.toISOString().split('T')[0];
    loadGames(dateInput.value);
});
forwardBtn.addEventListener('click', () => {
    const date = new Date(dateInput.value);
    date.setDate(date.getDate() + 1);
    dateInput.value = date.toISOString().split('T')[0];
    loadGames(dateInput.value);
});
todayBtn.addEventListener('click', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    dateInput.value = todayStr;
    loadGames(todayStr);
});

function loadGames(dateStr) {
    container.innerHTML = '<p class="text-center text-gray-400 py-4">Loading...</p>';
    const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${dateStr}`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            const games = data.dates?.[0]?.games || [];
            if (games.length === 0) {
                container.innerHTML = '<p class="text-center text-gray-500 py-8">No games were played on this date.</p>';
                return;
            }
            container.innerHTML = '';
            
            // Create a grid layout for maximum content
            const grid = document.createElement('div');
            grid.className = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2';
            
            games.forEach(game => {
                const {
                    gameDate,
                    status,
                    teams,
                    venue
                } = game;

                const away = teams.away.team.name;
                const home = teams.home.team.name;
                const awayScore = teams.away.score ?? '-';
                const homeScore = teams.home.score ?? '-';
                const state = status.detailedState;
                const time = new Date(gameDate).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit'
                });

                const card = document.createElement('div');
                card.className = 'game-card bg-white p-3 rounded-lg shadow-sm border hover:shadow-md cursor-pointer transition-all duration-200';
                card.setAttribute('data-game-id', game.gamePk);
                card.addEventListener('click', () => openGamePage(game));

                // Compact team logos
                const awayLogo = game.teams.away.team.id
                    ? `https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`
                    : '';
                const homeLogo = game.teams.home.team.id
                    ? `https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`
                    : '';

                // Status styling
                let statusColor = 'bg-gray-100 text-gray-600';
                let statusIcon = '';
                if (state === 'Final') {
                    statusColor = 'bg-green-100 text-green-700';
                    statusIcon = '';
                } else if (state === 'In Progress') {
                    statusColor = 'bg-yellow-100 text-yellow-700';
                    statusIcon = '';
                } else if (state === 'Postponed') {
                    statusColor = 'bg-red-100 text-red-700';
                    statusIcon = '';
                } else {
                    statusIcon = '';
                }

                // Score display
                let scoreDisplay = '';
                if ((state === 'Final' || state === 'In Progress') && awayScore !== '-' && homeScore !== '-') {
                    const awayWin = awayScore > homeScore;
                    const homeWin = homeScore > awayScore;
                    scoreDisplay = `
                        <div class="flex justify-between items-center text-lg font-bold">
                            <span class="${awayWin ? 'text-green-600' : homeWin ? 'text-gray-400' : ''}">${awayScore}</span>
                            <span class="text-gray-300 mx-2">-</span>
                            <span class="${homeWin ? 'text-green-600' : awayWin ? 'text-gray-400' : ''}">${homeScore}</span>
                        </div>
                    `;
                } else {
                    scoreDisplay = `<div class="text-center text-sm text-gray-500">${time}</div>`;
                }

                // Ultra-compact card layout
                card.innerHTML = `
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2 flex-1">
                            <img src="${awayLogo}" alt="${away}" class="h-6 w-6 rounded-full" onerror="this.style.display='none'">
                            <span class="text-sm font-medium truncate">${away}</span>
                        </div>
                        <div class="mx-2 text-xs text-gray-400">@</div>
                        <div class="flex items-center gap-2 flex-1 justify-end">
                            <span class="text-sm font-medium truncate">${home}</span>
                            <img src="${homeLogo}" alt="${home}" class="h-6 w-6 rounded-full" onerror="this.style.display='none'">
                        </div>
                    </div>
                    
                    ${scoreDisplay}
                    
                    <div class="flex items-center justify-between mt-2 text-xs">
                        <span class="inline-flex items-center px-2 py-1 rounded-full ${statusColor} font-medium">
                            <span class="mr-1">${statusIcon}</span>
                            ${state}
                        </span>
                        <span class="text-gray-500 truncate ml-2">${venue.name}</span>
                    </div>
                `;

                grid.appendChild(card);
            });
            
            container.appendChild(grid);
        })
        .catch(err => {
            console.error('Error loading games:', err);
            container.innerHTML = '<p class="text-center text-red-500 py-4">Failed to load games.</p>';
        });
}

// Event listeners
dateInput.addEventListener('change', () => loadGames(dateInput.value));
todayBtn.addEventListener('click', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    dateInput.value = todayStr;
    loadGames(todayStr);
});

// Set dateInput to today and load today's games on page load
const todayStr = new Date().toISOString().split('T')[0];
dateInput.value = todayStr;
loadGames(todayStr);

// Remove or comment out this block if you don't have a yesterdayBtn
// yesterdayBtn.addEventListener('click', () => {
//     const yest = new Date();
//     yest.setDate(yest.getDate() - 1);
//     const yestStr = yest.toISOString().split('T')[0];
//     dateInput.value = yestStr;
//     loadGames(yestStr);
// });

// Mobile menu functionality
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Navigation highlighting
const allLinks = document.querySelectorAll('a');
allLinks.forEach(link => {
    link.addEventListener('click', () => {
        allLinks.forEach(l => l.classList.remove('underline', 'font-bold', 'text-white'));
        link.classList.add('underline', 'font-bold', 'text-white');
    });
});

// Initial load
loadGames(dateInput.value);

// Game page functionality
function openGamePage(game) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeGamePage();
    });

    // Create game page content
    const gamePage = document.createElement('div');
    gamePage.className = 'bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto';
    
    const {
        gameDate,
        status,
        teams,
        venue,
        gamePk
    } = game;

    const away = teams.away.team.name;
    const home = teams.home.team.name;
    const awayScore = teams.away.score ?? 0;
    const homeScore = teams.home.score ?? 0;
    const state = status.detailedState;
    const time = new Date(gameDate).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
    });

    const awayLogo = teams.away.team.id
        ? `https://www.mlbstatic.com/team-logos/${teams.away.team.id}.svg`
        : '';
    const homeLogo = teams.home.team.id
        ? `https://www.mlbstatic.com/team-logos/${teams.home.team.id}.svg`
        : '';

    // Status styling
    let statusColor = 'bg-gray-100 text-gray-600';
    if (state === 'Final') statusColor = 'bg-green-100 text-green-700';
    else if (state === 'In Progress') statusColor = 'bg-yellow-100 text-yellow-700';
    else if (state === 'Postponed') statusColor = 'bg-red-100 text-red-700';

    // Fetch extra game details (boxscore, linescore, probable pitchers, etc.)
    // Fullscreen toggle handler
    function toggleFullscreen() {
        gamePage.classList.toggle('fullscreen');
        if (gamePage.classList.contains('fullscreen')) {
            gamePage.style.position = 'fixed';
            gamePage.style.inset = '0';
            gamePage.style.width = '100vw';
            gamePage.style.height = '100vh';
            gamePage.style.maxWidth = '100vw';
            gamePage.style.maxHeight = '100vh';
            gamePage.style.borderRadius = '0';
            gamePage.style.overflowY = 'auto';
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            fullscreenBtn.title = 'Exit Fullscreen';
        } else {
            gamePage.style.position = '';
            gamePage.style.inset = '';
            gamePage.style.width = '';
            gamePage.style.height = '';
            gamePage.style.maxWidth = '48rem';
            gamePage.style.maxHeight = '90vh';
            gamePage.style.borderRadius = '';
            gamePage.style.overflowY = '';
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            fullscreenBtn.title = 'Fullscreen';
        }
    }

    // Create fullscreen button
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    fullscreenBtn.title = 'Fullscreen';
    fullscreenBtn.className = 'text-gray-500 hover:text-gray-700 text-xl font-bold mr-2';
    fullscreenBtn.type = 'button';
    fullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFullscreen();
    });

    Promise.all([
        fetch(`https://statsapi.mlb.com/api/v1/game/${gamePk}/boxscore`).then(r => r.json()).catch(() => null),
        fetch(`https://statsapi.mlb.com/api/v1/game/${gamePk}/linescore`).then(r => r.json()).catch(() => null),
        fetch(`https://statsapi.mlb.com/api/v1/game/${gamePk}/feed/live`).then(r => r.json()).catch(() => null)
    ]).then(([boxscore, linescore, live]) => {
        // Probable pitchers
        let awayPitcher = game.teams.away.probablePitcher || (boxscore && boxscore.teams && boxscore.teams.away && boxscore.teams.away.probablePitcher);
        let homePitcher = game.teams.home.probablePitcher || (boxscore && boxscore.teams && boxscore.teams.home && boxscore.teams.home.probablePitcher);

        // Get pitcher names if available
        function getPitcherName(pitcher) {
            if (!pitcher) return 'TBD';
            if (pitcher.fullName) return pitcher.fullName;
            if (pitcher.firstName && pitcher.lastName) return `${pitcher.firstName} ${pitcher.lastName}`;
            return 'TBD';
        }

        // Linescore table
        let linescoreTable = '';
        if (linescore && linescore.innings && linescore.innings.length) {
            linescoreTable = `
                <div class="overflow-x-auto mb-6">
                    <table class="min-w-full text-xs text-center border border-gray-200 rounded-lg">
                        <thead>
                            <tr>
                                <th class="px-2 py-1 border-b"></th>
                                ${linescore.innings.map((inn, i) => `<th class="px-2 py-1 border-b">${i + 1}</th>`).join('')}
                                <th class="px-2 py-1 border-b">R</th>
                                <th class="px-2 py-1 border-b">H</th>
                                <th class="px-2 py-1 border-b">E</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="font-bold px-2 py-1 border-b">${away}</td>
                                ${linescore.innings.map(inn => `<td class="px-2 py-1 border-b">${inn.away?.runs ?? ''}</td>`).join('')}
                                <td class="px-2 py-1 border-b font-bold">${linescore.teams.away.runs ?? ''}</td>
                                <td class="px-2 py-1 border-b">${linescore.teams.away.hits ?? ''}</td>
                                <td class="px-2 py-1 border-b">${linescore.teams.away.errors ?? ''}</td>
                            </tr>
                            <tr>
                                <td class="font-bold px-2 py-1">${home}</td>
                                ${linescore.innings.map(inn => `<td class="px-2 py-1">${inn.home?.runs ?? ''}</td>`).join('')}
                                <td class="px-2 py-1 font-bold">${linescore.teams.home.runs ?? ''}</td>
                                <td class="px-2 py-1">${linescore.teams.home.hits ?? ''}</td>
                                <td class="px-2 py-1">${linescore.teams.home.errors ?? ''}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        }

        // Player of the Game (if available)
        let playerOfGame = '';
        if (live && live.liveData && live.liveData.decisions && live.liveData.decisions.winner) {
            const winner = live.liveData.decisions.winner;
            playerOfGame = `
                <div class="bg-green-50 p-3 rounded-lg mb-4 flex items-center gap-3">
                    <span class="inline-block bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">Player of the Game</span>
                    <span class="font-medium text-green-900">${winner.fullName}</span>
                    ${winner.primaryPosition ? `<span class="text-xs text-gray-500">(${winner.primaryPosition.abbreviation})</span>` : ''}
                </div>
            `;
        }

        // Highlights (if available)
        let highlights = '';
        if (live && live.liveData && live.liveData.plays && live.liveData.plays.allPlays) {
            const scoringPlays = live.liveData.plays.scoringPlays || [];
            if (scoringPlays.length) {
                highlights = `
                    <div class="bg-yellow-50 p-3 rounded-lg mb-4">
                        <h4 class="font-semibold text-yellow-800 mb-2">Scoring Plays</h4>
                        <ul class="list-disc pl-5 space-y-1 text-sm">
                            ${scoringPlays.map(idx => {
                                const play = live.liveData.plays.allPlays[idx];
                                return `<li>${play.about.halfInning === 'top' ? 'Top' : 'Bottom'} ${play.about.inning}: ${play.result.description}</li>`;
                            }).join('')}
                        </ul>
                    </div>
                `;
            }
        }

        // Umpires
        let umpires = '';
        if (live && live.liveData && live.liveData.boxscore && live.liveData.boxscore.officials && live.liveData.boxscore.officials.length) {
            umpires = `
                <div class="bg-gray-100 p-3 rounded-lg mb-4">
                    <h4 class="font-semibold text-gray-700 mb-2">Umpires</h4>
                    <ul class="flex flex-wrap gap-2 text-xs">
                        ${live.liveData.boxscore.officials.map(u => `<li class="bg-white px-2 py-1 rounded border">${u.official.fullName} (${u.officialType})</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        // Probable pitchers
        let probablePitchers = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="bg-blue-50 p-4 rounded-lg text-center">
                    <h4 class="font-semibold text-blue-700 mb-1">Probable Pitcher (Away)</h4>
                    <p class="text-lg">${getPitcherName(awayPitcher)}</p>
                </div>
                <div class="bg-red-50 p-4 rounded-lg text-center">
                    <h4 class="font-semibold text-red-700 mb-1">Probable Pitcher (Home)</h4>
                    <p class="text-lg">${getPitcherName(homePitcher)}</p>
                </div>
            </div>
        `;

        // Team stats (if available)
        let teamStats = '';
        if (boxscore && boxscore.teams) {
            function statRow(label, awayVal, homeVal) {
                return `
                    <tr>
                        <td class="px-2 py-1 text-right text-gray-700">${awayVal ?? '-'}</td>
                        <td class="px-2 py-1 text-center text-gray-500">${label}</td>
                        <td class="px-2 py-1 text-left text-gray-700">${homeVal ?? '-'}</td>
                    </tr>
                `;
            }
            const awayStats = boxscore.teams.away.teamStats?.batting || {};
            const homeStats = boxscore.teams.home.teamStats?.batting || {};
            teamStats = `
                <div class="overflow-x-auto mb-6">
                    <table class="min-w-full text-xs text-center border border-gray-200 rounded-lg">
                        <thead>
                            <tr>
                                <th class="px-2 py-1 border-b">${away}</th>
                                <th class="px-2 py-1 border-b"></th>
                                <th class="px-2 py-1 border-b">${home}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${statRow('Hits', awayStats.hits, homeStats.hits)}
                            ${statRow('Runs', awayStats.runs, homeStats.runs)}
                            ${statRow('Home Runs', awayStats.homeRuns, homeStats.homeRuns)}
                            ${statRow('Doubles', awayStats.doubles, homeStats.doubles)}
                            ${statRow('Triples', awayStats.triples, homeStats.triples)}
                            ${statRow('Walks', awayStats.baseOnBalls, homeStats.baseOnBalls)}
                            ${statRow('Strikeouts', awayStats.strikeOuts, homeStats.strikeOuts)}
                            ${statRow('Left On Base', awayStats.leftOnBase, homeStats.leftOnBase)}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // Where to Watch (placeholder or real data if available)
        let watchInfo = `
            <div class="bg-indigo-50 p-3 rounded-lg mb-4 text-sm text-center">
                <h4 class="font-semibold text-indigo-800 mb-1">Where to Watch</h4>
                <p>Watch live on <a href="https://www.mlb.com/live-stream-games" target="_blank" class="text-indigo-600 underline">MLB.TV</a>, ESPN, or check your local listings.</p>
            </div>
        `;


        // Build the full HTML
        gamePage.innerHTML = `
            <div class="p-4 relative">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-800">Game Details</h2>
                <div class="flex items-center gap-2">

                    <button onclick="closeGamePage()" class="text-gray-500 hover:text-gray-700 text-2xl font-bold" title="Close">×</button>
                </div>
            </div>
            <div class="flex items-center justify-between mb-4">
                <div class="flex flex-col items-center">
                <img src="${awayLogo}" alt="${away}" class="h-12 w-12 rounded-full border bg-white" onerror="this.style.display='none'">
                <span class="font-medium text-sm mt-1">${away}</span>
                ${(state === 'Final' || state === 'In Progress') ? `<span class="text-lg font-bold">${awayScore}</span>` : ''}
                </div>
                <div class="text-center">
                <span class="inline-block px-2 py-1 rounded ${statusColor} text-xs">${state}</span>
                <div class="text-xs text-gray-500 mt-2">${time}</div>
                </div>
                <div class="flex flex-col items-center">
                <img src="${homeLogo}" alt="${home}" class="h-12 w-12 rounded-full border bg-white" onerror="this.style.display='none'">
                <span class="font-medium text-sm mt-1">${home}</span>
                ${(state === 'Final' || state === 'In Progress') ? `<span class="text-lg font-bold">${homeScore}</span>` : ''}
                </div>
            </div>
            ${probablePitchers}
            ${linescoreTable}
            ${playerOfGame}
            ${highlights}
            ${umpires}
            ${watchInfo}
            ${teamStats}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                <div class="bg-gray-50 p-2 rounded text-center">
                <div class="text-xs text-gray-600">Date</div>
                <div class="text-sm">${new Date(gameDate).toLocaleDateString()}</div>
                </div>
                <div class="bg-gray-50 p-2 rounded text-center">
                <div class="text-xs text-gray-600">Time</div>
                <div class="text-sm">${time}</div>
                </div>
                <div class="bg-gray-50 p-2 rounded text-center">
                <div class="text-xs text-gray-600">Venue</div>
                <div class="text-sm">${venue.name}</div>
                </div>
            </div>
            <div class="bg-blue-50 p-2 rounded text-xs mb-2">
                <span class="font-medium text-gray-600">Game ID:</span>
                <span>${gamePk}</span>
                <span class="ml-4 font-medium text-gray-600">Status:</span>
                <span>${status.abstractGameState}</span>
                ${game.doubleHeader === 'Y' ? '<span class="ml-4 bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">Doubleheader Game</span>' : ''}
            </div>
            <div class="flex gap-2 mt-4">
                <button onclick="window.open('https://www.mlb.com/gameday/${gamePk}', '_blank')" class="flex-1 bg-white border text-blue-700 py-2 px-2 rounded font-bold hover:bg-blue-50 text-sm">
                View on MLB.com
                </button>
                <button onclick="closeGamePage()" class="flex-1 bg-gray-800 text-white py-2 px-2 rounded font-bold hover:bg-gray-700 text-sm">
                Close
                </button>
            </div>
            </div>
        `;

        // Insert fullscreen button into the modal header
        const header = gamePage.querySelector('.flex.justify-between.items-center.mb-4 .flex.items-center.gap-2');
        if (header) {
            header.insertBefore(fullscreenBtn, header.firstChild);
        }

        // Add fullscreen CSS (only modal, not browser fullscreen)
        const styleId = 'game-modal-fullscreen-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .fullscreen {
                    position: fixed !important;
                    inset: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    max-width: 100vw !important;
                    max-height: 100vh !important;
                    border-radius: 0 !important;
                    z-index: 60 !important;
                    overflow-y: auto !important;
                }
            `;
            document.head.appendChild(style);
        }
    });

    overlay.appendChild(gamePage);
    document.body.appendChild(overlay);
}

function closeGamePage() {
    const overlay = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
    if (overlay) {
        overlay.remove();
    }
}