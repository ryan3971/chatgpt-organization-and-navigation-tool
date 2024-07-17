chrome.action.onClicked.addListener(() => {
	console.log("Action button clicked. Opening window.");

	chrome.windows.create({
		url: "index.html",
		type: "popup",
		width: 800,
		height: 600,
		focused: true,
	});
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "getFromStorage") {
		chrome.storage.sync.get(request.key, (result) => {
			console.log("Data retrieved from storage:", result[request.key]);
			sendResponse({ data: result[request.key] });
		});
	} else if (request.action === "setToStorage") {
		let data = {};
		data[request.key] = request.value;
		console.log("Data saved to storage:", data);
		chrome.storage.sync.set(data, () => {
			sendResponse({ success: true });
		});
	}
	return true; // Keeps the message channel open for sendResponse
});