chrome.webNavigation.onHistoryStateUpdated.addListener(details => {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { msg: 'HISTORY_CHANGED' });
	});
})