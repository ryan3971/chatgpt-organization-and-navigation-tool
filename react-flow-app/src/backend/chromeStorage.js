// src/chromeStorage.js

// This file contains functions to interact with the Chrome storage API. It is used to save and retrieve the flow data and additional properties of nodes and edges.

// This function is used to retrieve data from the Chrome storage. It takes a key as an argument and returns a promise. The promise resolves with the data if successful, or rejects with an error message if there is an error.
export const getFromStorage = (key) => {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ action: "getFromStorage", key }, (response) => {
			if (response) {
				resolve(response.data);
			} else {
				reject("Error retrieving data");
			}
		});
	});
};

// This function is used to save data to the Chrome storage. It takes a key and a value as arguments and returns a promise. The promise resolves if successful, or rejects with an error message if there is an error.
export const setToStorage = (key, value) => {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ action: "setToStorage", key, value }, (response) => {
			if (response && response.success) {
				resolve();
			} else {
				reject("Error saving data");
			}
		});
	});
};

// This function is used to save the flow data to the Chrome storage. It takes nodes, edges, and properties as arguments and returns a promise. The promise resolves if successful, or rejects with an error message if there is an error.
export const saveFlowData = (nodes, edges, properties) => {
	const data = { nodes, edges, properties };
	return setToStorage("flowData", data);
};

// This function is used to retrieve the flow data from the Chrome storage. It returns a promise that resolves with the flow data if successful, or rejects with an error message if there is an error.
export const loadFlowData = () => {
	return getFromStorage("flowData");
};

// This function is used to save additional properties of a node to the Chrome storage. It takes a nodeId and additional properties as arguments and returns a promise. The promise resolves if successful, or rejects with an error message if there is an error.
export const getAdditionalNodeProperties = (nodeId) => {
	return new Promise((resolve, reject) => {
		getFromStorage("flowData")
			.then((data) => {
				if (data && data.properties && data.properties.nodes && data.properties.nodes[nodeId]) {
					resolve(data.properties.nodes[nodeId].additional || {});
				} else {
					reject("No additional properties found for node");
				}
			})
			.catch(reject);
	});
};

// This function is used to save additional properties of an edge to the Chrome storage. It takes an edgeId and additional properties as arguments and returns a promise. The promise resolves if successful, or rejects with an error message if there is an error.
export const updateNodeProperties = (nodeId, newProperties) => {
	return getFromStorage("flowData").then((data) => {
		if (!data.properties.nodes[nodeId]) {
			data.properties.nodes[nodeId] = { additional: {} };
		}
		data.properties.nodes[nodeId].additional = {
			...data.properties.nodes[nodeId].additional,
			...newProperties,
		};
		return setToStorage("flowData", data);
	});
};

// This function is used to save additional properties of an edge to the Chrome storage. It takes an edgeId and additional properties as arguments and returns a promise. The promise resolves if successful, or rejects with an error message if there is an error.
export const updateEdgeProperties = (edgeId, newProperties) => {
	return getFromStorage("flowData").then((data) => {
		if (!data.properties.edges[edgeId]) {
			data.properties.edges[edgeId] = { additional: {} };
		}
		data.properties.edges[edgeId].additional = {
			...data.properties.edges[edgeId].additional,
			...newProperties,
		};
		return setToStorage("flowData", data);
	});
};
