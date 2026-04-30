var todaysSeed = [
  { name: 'Hello Wordl', url: 'https://hellowordl.net/', category: 'word' },
  { name: 'Costcodle', url: 'https://costcodle.com/', category: 'trivia' },
  { name: 'Framed', url: 'https://framed.wtf/', category: 'film' },
  { name: 'Flagle', url: 'https://www.flagle.io/', category: 'geography' },
];

var runState = {
  running: false,
  startTime: null,
  currentGameIndex: 0,
  splits: [null, null, null, null],
  completedDate: null,
  startedDate: null
};

function validateRunState() {
  var todayDate = new Date().toLocaleDateString();

  if (runState.running && runState.startTime) {
    var elapsed = Date.now() - runState.startTime;
    if (elapsed > 7200000) {
      runState.running = false;
      runState.startTime = null;
      runState.currentGameIndex = 0;
      runState.splits = [null, null, null, null];
    }
  }

  if (runState.completedDate && runState.completedDate !== todayDate) {
    runState.completedDate = null;
  }

  if (runState.startedDate && runState.startedDate !== todayDate) {
    runState.startedDate = null;
  }
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  validateRunState();

  if (message.type === 'START_RUN') {
    runState.running = true;
    runState.startTime = Date.now();
    runState.currentGameIndex = 0;
    runState.splits = [null, null, null, null];
    runState.startedDate = new Date().toLocaleDateString();
    chrome.tabs.create({ url: todaysSeed[0].url });
    sendResponse({ success: true });
  }

  if (message.type === 'GET_STATE') {
    var elapsed = runState.running
      ? Date.now() - runState.startTime
      : 0;
    sendResponse({
      state: runState,
      elapsed: elapsed,
      seed: todaysSeed
    });
  }

  if (message.type === 'GAME_WON') {
    var elapsed = Date.now() - runState.startTime;
    runState.splits[runState.currentGameIndex] = elapsed;

    if (runState.currentGameIndex < 3) {
      runState.currentGameIndex++;
      chrome.tabs.create({ url: todaysSeed[runState.currentGameIndex].url });
    } else {
      runState.running = false;
      runState.completedDate = new Date().toLocaleDateString();
    }

    sendResponse({ success: true });
  }

  if (message.type === 'STOP_RUN') {
    runState.running = false;
    runState.startTime = null;
    runState.splits = [null, null, null, null];
    runState.currentGameIndex = 0;
    sendResponse({ success: true });
  }

  if (message.type === 'DNF_RUN') {
    runState.running = false;
    runState.startTime = null;
    runState.splits = [null, null, null, null];
    runState.currentGameIndex = 0;
    runState.startedDate = new Date().toLocaleDateString();
    sendResponse({ success: true });
  }

  return true;
});