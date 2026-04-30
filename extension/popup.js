var dateDisplay = document.getElementById('dateDisplay');
var today = new Date();
dateDisplay.textContent = today.toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric'
});

var startRunBtn = document.getElementById('startRunBtn');

function refreshPopup() {
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, function(response) {
    if (!response) return;
    var state = response.state;
    var todayDate = new Date().toLocaleDateString();

    if (state.startedDate === todayDate) {
      startRunBtn.textContent = 'You have already played today';
      startRunBtn.style.backgroundColor = '#333';
      startRunBtn.style.color = '#666';
      startRunBtn.style.cursor = 'not-allowed';
      startRunBtn.disabled = true;
      return;
    }

    if (state.running) {
      startRunBtn.textContent = 'Run In Progress...';
      startRunBtn.style.backgroundColor = '#333';
      startRunBtn.style.color = '#aaaaaa';
      startRunBtn.disabled = true;
    }
  });
}

refreshPopup();

startRunBtn.addEventListener('click', function() {
  chrome.runtime.sendMessage({ type: 'START_RUN' }, function(response) {
    if (response && response.success) {
      startRunBtn.textContent = 'Run In Progress...';
      startRunBtn.style.backgroundColor = '#333';
      startRunBtn.style.color = '#aaaaaa';
      startRunBtn.disabled = true;
    }
  });
});