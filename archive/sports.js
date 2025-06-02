const allSports = ['MLB', 'NBA', 'NFL'];
let activeSports = JSON.parse(localStorage.getItem('activeSports')) || ['MLB'];
let activeSport = localStorage.getItem('activeSport') || 'MLB';

function saveToStorage() {
  localStorage.setItem('activeSports', JSON.stringify(activeSports));
  localStorage.setItem('activeSport', activeSport);
}



const sportData = {
  MLB: [
    { home: 'Yankees', away: 'Red Sox', time: '7:05 PM ET', location: 'Yankee Stadium' },
    { home: 'Dodgers', away: 'Giants', time: '9:10 PM ET', location: 'Dodger Stadium' },
  ],
  NBA: [
    { home: 'Warriors', away: 'Lakers', time: '8:00 PM ET', location: 'Chase Center' },
    { home: 'Heat', away: 'Celtics', time: '7:30 PM ET', location: 'Kaseya Center' },
  ],
  NFL: [
    { home: 'Eagles', away: 'Cowboys', time: '4:25 PM ET', location: 'Lincoln Financial Field' },
    { home: 'Bears', away: 'Packers', time: '1:00 PM ET', location: 'Soldier Field' },
  ]
};

function renderTabs() {
  const tabsContainer = document.getElementById('sports-tabs');
  tabsContainer.innerHTML = '';

  activeSports.forEach(sport => {
    const tabWrapper = document.createElement('div');
    tabWrapper.className = 'relative flex items-center';

    const tab = document.createElement('button');
    tab.textContent = sport;
    tab.className = `px-4 py-2 rounded-t font-semibold border-b-2 transition ${
      sport === activeSport
        ? 'bg-white text-blue-600 border-blue-600'
        : 'bg-gray-200 text-gray-600 border-transparent hover:bg-gray-300'
    }`;
    tab.addEventListener('click', () => {
      activeSport = sport;
      saveToStorage();
      renderTabs();
      renderGames();
    });

    tabWrapper.appendChild(tab);

    if (sport !== 'MLB') {
      const removeBtn = document.createElement('button');
      removeBtn.setAttribute('title', 'Remove sport');

      removeBtn.innerHTML = '&times;';
      removeBtn.className = 'absolute -right-2 -top-2 text-sm bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeSportTab(sport);
      });
      tabWrapper.appendChild(removeBtn);
    }

    tabsContainer.appendChild(tabWrapper);
  });
}

function removeSportTab(sport) {
  const index = activeSports.indexOf(sport);
  if (index > -1) {
    activeSports.splice(index, 1);

    if (activeSports.length === 0) {
    activeSports = ['MLB'];
    activeSport = 'MLB';
    }

    saveToStorage();
    renderTabs();
    renderGames();
  }
}



function renderGames() {
  const container = document.getElementById('content');
  container.innerHTML = '';

  const header = document.createElement('h2');
  header.textContent = `${activeSport} Games`;
  header.className = 'text-xl font-bold mb-2';
  container.appendChild(header);

  const games = sportData[activeSport] || [];
  games.forEach(game => {
    const div = document.createElement('div');
    div.className = 'bg-white p-4 rounded shadow mb-2';
    div.textContent = `${game.away} @ ${game.home} — ${game.time} (${game.location})`;
    container.appendChild(div);
  });
}

function openSportModal() {
    const modal = document.getElementById('sport-modal');
    const options = document.getElementById('sport-options');
    options.innerHTML = '';

    // Add close "X" button with FontAwesome icon if not already present
    let closeBtn = modal.querySelector('.modal-close-x');
    if (!closeBtn) {
        closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close-x absolute top-2 right-2 text-2xl font-bold text-black-500 hover:text-gray-800';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.addEventListener('click', closeSportModal);
        modal.appendChild(closeBtn);
    }

    const available = allSports.filter(s => !activeSports.includes(s));

    available.forEach(sport => {
        const btn = document.createElement('button');
        btn.textContent = sport;
        btn.className = 'w-full bg-blue-100 text-blue-700 hover:bg-blue-200 py-2 rounded text-center';

        btn.addEventListener('click', () => {
            activeSports.push(sport);
            activeSport = sport;
            saveToStorage(); // ✅ Add this
            closeSportModal();
            renderTabs();
            renderGames();
        });
            options.appendChild(btn);
        });

    // Add ESC key listener
    function escListener(e) {
        if (e.key === 'Escape') {
            closeSportModal();
        }
    }
    document.addEventListener('keydown', escListener);

    // Store escListener so it can be removed later
    modal._escListener = escListener;

    modal.classList.remove('hidden');
}

function closeSportModal() {
    const modal = document.getElementById('sport-modal');
    modal.classList.add('hidden');
    // Remove ESC key listener if present
    if (modal._escListener) {
        document.removeEventListener('keydown', modal._escListener);
        delete modal._escListener;
    }
    // Remove the close "X" button if present
    const closeBtn = modal.querySelector('.modal-close-x');
    if (closeBtn) {
        closeBtn.remove();
    }
}




document.getElementById('add-sport-btn').addEventListener('click', openSportModal);
document.getElementById('close-modal').addEventListener('click', closeSportModal);

renderTabs();
renderGames();
