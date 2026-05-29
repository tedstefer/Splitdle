function formatTime(ms) {
  var minutes = Math.floor(ms / 60000);
  var seconds = Math.floor((ms % 60000) / 1000);
  var millis = ms % 1000;
  return (String(minutes).padStart(2, '0') + ':' +
          String(seconds).padStart(2, '0') + '.' +
          String(millis).padStart(3, '0'));
}

function buildHUD() {
  if (document.getElementById('splitdle-hud')) return;

  var d = new Date();
  var dateStr = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  var hud = document.createElement('div');
  hud.id = 'splitdle-hud';
  hud.style.cssText = 'position:fixed;bottom:16px;right:16px;width:220px;background:rgba(15,15,15,0.95);border:1px solid #e94560;border-radius:12px;padding:14px;z-index:999999;font-family:Arial,sans-serif;color:#fff;box-shadow:0 4px 20px rgba(0,0,0,0.5);';

  var logo = document.createElement('div');
  logo.style.cssText = 'color:#e94560;font-size:16px;font-weight:bold;text-align:center;letter-spacing:2px;margin-bottom:4px;padding-bottom:8px;border-bottom:1px solid #333;position:relative;';
  logo.textContent = 'Splitdle';

  var closeX = document.createElement('span');
  closeX.textContent = '✕';
  closeX.style.cssText = 'position:absolute;top:0;right:0;cursor:pointer;color:#aaaaaa;font-size:12px;line-height:1;';
  closeX.addEventListener('click', function() {
    chrome.runtime.sendMessage({ type: 'GET_STATE' }, function(response) {
      if (!response || !response.state) return;
      var state = response.state;
      if (state.running) {
        document.getElementById('splitdle-confirm').style.display = 'block';
        document.getElementById('splitdle-stop-btn').style.display = 'none';
      } else {
        var hudEl = document.getElementById('splitdle-hud');
        if (hudEl) hudEl.remove();
      }
    });
  });
  logo.appendChild(closeX);

  var date = document.createElement('div');
  date.style.cssText = 'text-align:center;font-size:10px;color:#aaaaaa;margin-bottom:8px;';
  date.textContent = dateStr;

  var timer = document.createElement('div');
  timer.id = 'splitdle-timer';
  timer.style.cssText = 'font-size:28px;font-weight:bold;color:#e94560;text-align:center;letter-spacing:1px;margin-bottom:6px;';
  timer.textContent = '00:00.000';

  var gameLabel = document.createElement('div');
  gameLabel.id = 'splitdle-game';
  gameLabel.style.cssText = 'font-size:11px;color:#aaaaaa;text-align:center;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #333;';
  gameLabel.textContent = 'Loading...';

  var splits = document.createElement('div');
  splits.style.cssText = 'font-size:11px;margin-bottom:12px;';

  var stopBtn = document.createElement('button');
  stopBtn.id = 'splitdle-stop-btn';
  stopBtn.style.cssText = 'width:100%;padding:8px;background:#333;color:#aaaaaa;border:none;border-radius:8px;font-size:12px;cursor:pointer;margin-bottom:8px;';
  stopBtn.textContent = 'Stop Run';

  var confirm = document.createElement('div');
  confirm.id = 'splitdle-confirm';
  confirm.style.cssText = 'display:none;margin-top:10px;background:#1a1a2e;border-radius:8px;padding:12px;text-align:center;border:1px solid #e94560;';

  var confirmText = document.createElement('p');
  confirmText.style.cssText = 'font-size:12px;color:#fff;margin-bottom:4px;';
  confirmText.textContent = 'Are you sure you want to stop?';

  var confirmWarning = document.createElement('p');
  confirmWarning.style.cssText = 'font-size:10px;color:#e94560;margin-bottom:10px;';
  confirmWarning.textContent = 'Your run will be counted as a DNF.';

  var confirmYes = document.createElement('button');
  confirmYes.style.cssText = 'width:100%;padding:7px;background:#e94560;color:#fff;border:none;border-radius:6px;font-size:11px;cursor:pointer;margin-bottom:6px;';
  confirmYes.textContent = 'Yes, Stop Run';

  var confirmNo = document.createElement('button');
  confirmNo.style.cssText = 'width:100%;padding:7px;background:#333;color:#aaaaaa;border:none;border-radius:6px;font-size:11px;cursor:pointer;';
  confirmNo.textContent = 'Continue Running';

  confirm.appendChild(confirmText);
  confirm.appendChild(confirmWarning);
  confirm.appendChild(confirmYes);
  confirm.appendChild(confirmNo);

  hud.appendChild(logo);
  hud.appendChild(date);
  hud.appendChild(timer);
  hud.appendChild(gameLabel);
  hud.appendChild(splits);
  hud.appendChild(stopBtn);
  hud.appendChild(confirm);

  document.body.appendChild(hud);

  chrome.runtime.sendMessage({ type: 'GET_STATE' }, function(response) {
    var games = ['Game 1', 'Game 2', 'Game 3'];
    if (response && response.seed) {
      games = response.seed.map(function(g) { return g.name; });
    }
    games.forEach(function(name, i) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;padding:4px 0;color:#aaaaaa;border-bottom:1px solid #1a1a2e;';
      var label = document.createElement('span');
      label.textContent = name;
      var split = document.createElement('span');
      split.id = 'splitdle-s' + (i + 1);
      split.textContent = '--:--.---';
      row.appendChild(label);
      row.appendChild(split);
      splits.appendChild(row);
    });
  });

  stopBtn.addEventListener('click', function() {
    confirm.style.display = 'block';
    stopBtn.style.display = 'none';
  });

  confirmYes.addEventListener('click', function() {
    chrome.runtime.sendMessage({ type: 'GET_STATE' }, function(stateResponse) {
      if (!stateResponse) return;
      var seed = stateResponse.seed;
      var state = stateResponse.state;
      var currentGame = seed[state.currentGameIndex] ? seed[state.currentGameIndex].name : 'Unknown';
      var date = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      var params = 'dnf=true&game=' + encodeURIComponent(currentGame) + '&date=' + encodeURIComponent(date);

      chrome.runtime.sendMessage({ type: 'STOP_RUN' }, function() {
        var hudEl = document.getElementById('splitdle-hud');
        if (hudEl) hudEl.remove();
        window.location.href = 'https://splitdle.com/results.html?' + params;
      });
    });
  });

  confirmNo.addEventListener('click', function() {
    confirm.style.display = 'none';
    stopBtn.style.display = 'block';
  });

  setInterval(function() {
    chrome.runtime.sendMessage({ type: 'GET_STATE' }, function(response) {
      if (!response || !response.state) return;
      var state = response.state;
      var elapsed = response.elapsed;
      var seed = response.seed;

      var timerEl = document.getElementById('splitdle-timer');
      if (timerEl) timerEl.textContent = formatTime(elapsed);

      var gameEl = document.getElementById('splitdle-game');
      if (gameEl) {
        if (state.running && seed && seed[state.currentGameIndex]) {
          gameEl.textContent = 'Game ' + (state.currentGameIndex + 1) + ' of 3 - ' + seed[state.currentGameIndex].name;
        } else if (!state.running) {
          gameEl.textContent = 'Run Complete!';
        }
      }

      if (state.splits && Array.isArray(state.splits)) {
        state.splits.forEach(function(split, index) {
          var el = document.getElementById('splitdle-s' + (index + 1));
          if (el && split !== null) {
            el.textContent = formatTime(split);
            el.style.color = '#e94560';
          }
        });
      }
    });
  }, 50);
}

var winHandled = false;
var pageReadyForDetection = false;

function detectWinState() {
  var alerts = document.querySelectorAll('[role="alert"]');
  for (var i = 0; i < alerts.length; i++) {
    if (alerts[i].textContent.indexOf('You won!') !== -1) return true;
  }

  var paragraphs = document.querySelectorAll('p.font-semibold');
  for (var j = 0; j < paragraphs.length; j++) {
    if (paragraphs[j].textContent.indexOf('You got it!') !== -1) return true;
  }

  var centerTags = document.querySelectorAll('center');
  for (var k = 0; k < centerTags.length; k++) {
    if (centerTags[k].textContent.indexOf('You win! Congratulations!') !== -1) return true;
  }

  return false;
}

function detectFailState() {
  var alerts = document.querySelectorAll('[role="alert"]');
  for (var i = 0; i < alerts.length; i++) {
    if (alerts[i].textContent.indexOf('You lost!') !== -1) return true;
  }
  return false;
}

function showPrePlayedDNF() {
  var gameEl = document.getElementById('splitdle-game');
  if (gameEl) {
    gameEl.textContent = 'Already played today - DNF';
    gameEl.style.color = '#e94560';
  }

  var stopBtn = document.getElementById('splitdle-stop-btn');
  if (stopBtn) stopBtn.style.display = 'none';

  var dnfMsg = document.createElement('div');
  dnfMsg.style.cssText = 'font-size:11px;color:#e94560;text-align:center;margin-bottom:8px;line-height:1.6;padding:8px;background:#1a1a2e;border-radius:8px;';
  dnfMsg.textContent = 'You have already played this game today, resulting in a DNF.';

  var hud = document.getElementById('splitdle-hud');
  if (hud && stopBtn) hud.insertBefore(dnfMsg, stopBtn);

  chrome.runtime.sendMessage({ type: 'DNF_RUN' }, function() {
    chrome.runtime.sendMessage({ type: 'GET_STATE' }, function(finalState) {
      var seed = finalState ? finalState.seed : [];
      var currentIndex = finalState ? finalState.state.currentGameIndex : 0;
      var gameName = seed[currentIndex] ? seed[currentIndex].name : 'Unknown';
      var date = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      var params = 'dnf=true&game=' + encodeURIComponent(gameName) + '&date=' + encodeURIComponent(date);

      var countdown = 5;
      var countEl = document.createElement('p');
      countEl.style.cssText = 'font-size:11px;color:#aaaaaa;text-align:center;margin-top:8px;';
      countEl.textContent = 'Closing in ' + countdown + '...';
      var hudEl = document.getElementById('splitdle-hud');
      if (hudEl) hudEl.appendChild(countEl);

      var interval = setInterval(function() {
        countdown--;
        if (countdown > 0) {
          countEl.textContent = 'Closing in ' + countdown + '...';
        } else {
          clearInterval(interval);
          var hudEl2 = document.getElementById('splitdle-hud');
          if (hudEl2) hudEl2.remove();
          window.location.href = 'https://splitdle.com/results.html?' + params;
        }
      }, 1000);
    });
  });
}

function startWinDetection() {
  var prePlayedCheckDone = false;

  setTimeout(function() {
    if (!prePlayedCheckDone) {
      prePlayedCheckDone = true;
      if (detectWinState()) {
        showPrePlayedDNF();
        return;
      }
    }
    pageReadyForDetection = true;
  }, 2000);

var observer = new MutationObserver(function() {
    if (!pageReadyForDetection) return;
    if (detectWinState()) {
      handleWin();
      return;
    }
    if (detectFailState()) {
      handleFail();
      return;
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

function handleWin() {
  if (winHandled) return;
  winHandled = true;

  chrome.runtime.sendMessage({ type: 'GAME_WON' }, function(response) {
    if (!response) return;

    var gameEl = document.getElementById('splitdle-game');

    chrome.runtime.sendMessage({ type: 'GET_STATE' }, function(stateResponse) {
      if (!stateResponse) return;
      var state = stateResponse.state;

      if (!state.running) {
        if (gameEl) {
          gameEl.textContent = 'Run Complete!';
          gameEl.style.color = '#e94560';
        }

        var stopBtn = document.getElementById('splitdle-stop-btn');
        if (stopBtn) {
          var countdown = 3;
          stopBtn.style.background = '#1a1a2e';
          stopBtn.style.color = '#ffffff';
          stopBtn.textContent = 'Bringing you to leaderboard in: ' + countdown;

          var countInterval = setInterval(function() {
            countdown--;
            if (countdown > 0) {
              stopBtn.textContent = 'Bringing you to leaderboard in: ' + countdown;
            } else {
              clearInterval(countInterval);
              var hudEl = document.getElementById('splitdle-hud');
              if (hudEl) hudEl.remove();

              chrome.runtime.sendMessage({ type: 'GET_STATE' }, function(finalState) {
                if (!finalState) return;
                var finalStateData = finalState.state;
                var seed = finalState.seed;

                var date = new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                var params = 'date=' + encodeURIComponent(date);

                finalStateData.splits.forEach(function(split, index) {
                  if (split !== null && seed[index]) {
                    params += '&g' + (index + 1) + 'name=' + encodeURIComponent(seed[index].name);
                    params += '&g' + (index + 1) + 'time=' + encodeURIComponent(split);
                  }
                });

                var totalMs = finalStateData.splits.reduce(function(acc, split) {
                  return acc + (split || 0);
                }, 0);

                params += '&total=' + encodeURIComponent(totalMs);
                window.location.href = 'https://splitdle.com/results.html?' + params;
              });
            }
          }, 1000);
        }
      } else {
        if (gameEl) {
          gameEl.textContent = 'Game complete!';
          gameEl.style.color = '#e94560';
        }
      }
    });
  });
}

function handleFail() {
  if (winHandled) return;
  winHandled = true;

  var gameEl = document.getElementById('splitdle-game');
  if (gameEl) {
    gameEl.textContent = 'Failed - DNF';
    gameEl.style.color = '#e94560';
  }

  var stopBtn = document.getElementById('splitdle-stop-btn');
  if (stopBtn) stopBtn.style.display = 'none';

  var dnfMsg = document.createElement('div');
  dnfMsg.style.cssText = 'font-size:11px;color:#e94560;text-align:center;margin-bottom:8px;line-height:1.6;padding:8px;background:#1a1a2e;border-radius:8px;';
  dnfMsg.textContent = 'You failed this game. Your run is a DNF.';

  var hud = document.getElementById('splitdle-hud');
  var btn = document.getElementById('splitdle-stop-btn');
  if (hud && btn) hud.insertBefore(dnfMsg, btn);

  chrome.runtime.sendMessage({ type: 'DNF_RUN' }, function() {
    chrome.runtime.sendMessage({ type: 'GET_STATE' }, function(finalState) {
      var seed = finalState ? finalState.seed : [];
      var currentIndex = finalState ? finalState.state.currentGameIndex : 0;
      var gameName = seed[currentIndex] ? seed[currentIndex].name : 'Unknown';
      var date = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      var params = 'dnf=true&game=' + encodeURIComponent(gameName) + '&date=' + encodeURIComponent(date);

      var countdown = 5;
      var countEl = document.createElement('p');
      countEl.style.cssText = 'font-size:11px;color:#aaaaaa;text-align:center;margin-top:8px;';
      countEl.textContent = 'Closing in ' + countdown + '...';
      var hudEl = document.getElementById('splitdle-hud');
      if (hudEl) hudEl.appendChild(countEl);

      var interval = setInterval(function() {
        countdown--;
        if (countdown > 0) {
          countEl.textContent = 'Closing in ' + countdown + '...';
        } else {
          clearInterval(interval);
          var hudEl2 = document.getElementById('splitdle-hud');
          if (hudEl2) hudEl2.remove();
          window.location.href = 'https://splitdle.com/results.html?' + params;
        }
      }, 1000);
    });
  });
}

function showAlreadyPlayed() {
  var msg = document.createElement('div');
  msg.style.cssText = 'position:fixed;bottom:16px;right:16px;width:220px;background:rgba(15,15,15,0.95);border:1px solid #e94560;border-radius:12px;padding:16px;z-index:999999;font-family:Arial,sans-serif;color:#fff;box-shadow:0 4px 20px rgba(0,0,0,0.5);text-align:center;';

  var logo = document.createElement('div');
  logo.style.cssText = 'color:#e94560;font-size:16px;font-weight:bold;letter-spacing:2px;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #333;';
  logo.textContent = 'Splitdle';

  var text = document.createElement('p');
  text.style.cssText = 'font-size:12px;color:#ffffff;margin-bottom:8px;line-height:1.6;';
  text.textContent = 'You have already played Splitdle today.';

  var countdown = document.createElement('p');
  countdown.style.cssText = 'font-size:11px;color:#aaaaaa;';
  countdown.textContent = 'Closing in 3...';

  msg.appendChild(logo);
  msg.appendChild(text);
  msg.appendChild(countdown);
  document.body.appendChild(msg);

  var count = 3;
  var interval = setInterval(function() {
    count--;
    if (count > 0) {
      countdown.textContent = 'Closing in ' + count + '...';
    } else {
      clearInterval(interval);
      if (msg) msg.remove();
    }
  }, 1000);
}

function showAlreadyPlayedDNF(gameName) {
  var hud = document.getElementById('splitdle-hud');

  var msg = document.createElement('div');
  msg.style.cssText = 'position:fixed;bottom:16px;right:16px;width:220px;background:rgba(15,15,15,0.95);border:1px solid #e94560;border-radius:12px;padding:16px;z-index:999999;font-family:Arial,sans-serif;color:#fff;box-shadow:0 4px 20px rgba(0,0,0,0.5);text-align:center;';

  var logo = document.createElement('div');
  logo.style.cssText = 'color:#e94560;font-size:16px;font-weight:bold;letter-spacing:2px;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #333;';
  logo.textContent = 'Splitdle';

  var text = document.createElement('p');
  text.style.cssText = 'font-size:12px;color:#ffffff;margin-bottom:8px;line-height:1.6;';
  text.textContent = 'You have already played ' + gameName + ' today. Please return to Splitdle to continue.';

  var countdown = document.createElement('p');
  countdown.style.cssText = 'font-size:11px;color:#aaaaaa;';
  countdown.textContent = 'Returning home in 5...';

  msg.appendChild(logo);
  msg.appendChild(text);
  msg.appendChild(countdown);
  document.body.appendChild(msg);

  if (hud) hud.remove();

  chrome.runtime.sendMessage({ type: 'STOP_RUN' });

  var count = 5;
  var interval = setInterval(function() {
    count--;
    if (count > 0) {
      countdown.textContent = 'Returning home in ' + count + '...';
    } else {
      clearInterval(interval);
      window.location.href = 'https://splitdle.com';
    }
  }, 1000);
}

chrome.runtime.sendMessage({ type: 'GET_STATE' }, function(response) {
  if (!response || !response.state) return;
  var state = response.state;
  var seed = response.seed;

  var todayDate = new Date().toLocaleDateString();
  if (state.completedDate === todayDate) {
    showAlreadyPlayed();
    return;
  }

  if (!state.running) return;

  var currentGame = seed[state.currentGameIndex];
  var currentHostname = window.location.hostname;
  var expectedHostname = new URL(currentGame.url).hostname;

  if (currentHostname !== expectedHostname) return;

  var isCorrectGame = false;
  for (var i = 0; i <= state.currentGameIndex; i++) {
    if (new URL(seed[i].url).hostname === currentHostname) {
      isCorrectGame = true;
      break;
    }
  }
  if (!isCorrectGame) return;

  if (currentHostname === 'hellowordl.net') {
    chrome.runtime.sendMessage({ type: 'CHECK_GAME_PLAYED', gameName: 'Hello Wordl' }, function(response) {
      if (response && response.played) {
        buildHUD();
        showAlreadyPlayedDNF('Hello Wordl');
      } else {
        buildHUD();
        startWinDetection();
      }
    });
  } else {
    buildHUD();
    startWinDetection();
  }
});