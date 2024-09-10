const sampleData = {
	node_1: {
		title: "Chat Title 1",
		isParent: true,
		messages: [
			["Hello, how are you?", "I'm fine, thank you! How can I help you today?"],
			["What is the weather like today?", "The weather is sunny with a high of 25°C."],
		],
		pinned_messages: [],
		branches: {
			node_2: {
				selectedText: "How are you?",
				selectedTextContainerId: 1,
				isMessageOverwritten: true,
			},
			node_3: {
				selectedText: "Weather today?",
				selectedTextContainerId: 2,
				isMessageOverwritten: false,
			},
		},
	},

	node_2: {
		title: "Chat Title 2",
		isParent: false,
		messages: [["Tell me a joke.", "Why don't skeletons fight each other? They don't have the guts."]],
		branches: {},
		},

	node_3: {
		title: "Chat Title 3",
		isParent: false,
		messages: [["What's the capital of France?", "The capital of France is Paris."]],
		branches: {},
	},
};

export default sampleData;
