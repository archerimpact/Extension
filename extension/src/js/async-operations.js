function getDataAsync(getObj, callback) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(getObj, (data) => {
      const err = chrome.runtime.lastError;
      if (err) { return reject(err); }
      return resolve(callback(data));
    });
  });
}

function setDataAsync(key, val) {
  const setObj = {};
  setObj[key] = val;
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(setObj, () => {
      const err = chrome.runtime.lastError;
      if (err) { return reject(err); }
      return resolve(val);
    });
  });
}

function getTabAsync() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
      const err = chrome.runtime.lastError;
      if (err) { return reject(err); }
      if (tabs.length > 0) { return resolve(tabs[0]); }
      return reject('No active tab to retrieve.');
    });
  });
}

function injectResourcesAsync(files) {
  if (files.constructor !== Array || files.length === 0) {
    return Promise.reject('Invalid resources given to inject.');
  }

  return Promise.all(files.map((file) => { executeScriptAsync(file) }));
}


function executeScriptAsync(file) {
  return new Promise((resolve, reject) => {
    chrome.tabs.executeScript(null, {file: file, allFrames: true}, (result) => {
      const err = chrome.runtime.lastError;
      if (err) { return reject(err); }
      return resolve(result);
    });
  });
}

function setHighlightAsync(highlightStatus) {
  if (highlightStatus) {
    $("#highlightStatus").text("Highlighting: ON");
    $("#highlightIcon").css("color", "rgba(255, 255, 255, 1)");
    return injectResourcesAsync(['src/js/async-operations.js']).then(() => {
      return executeScriptAsync('src/js/add-highlight.js');
    }).catch(console.log.bind(console));
  } else {
    $("#highlightStatus").text("Highlighting: OFF");
    $("#highlightIcon").css("color", "rgba(255, 255, 255, .5)");
    return executeScriptAsync('src/js/rm-highlight.js');
  }
}