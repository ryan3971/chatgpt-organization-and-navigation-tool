const sampleData = {
	node_1: {
		title: "Chat Title 1",
		isParent: true,
		messages: [
			"Hello, how are you?",
			"I'm fine, thank you! How can I help you today?",
			"What is the weather like today?",
			"The weather is sunny with a high of 25°C.",
			"What is the weather like today?",
			"The weather is sunny with a high of 25°C.",
			"What is the weather like today?",
			"The weather is sunny with a high of 25°C.",
			"What is the weather like today?",
			"The weather is sunny with a high of 25°C.",
			"What is the weather like today?",
			"The weather is sunny with a high of 25°C.",
		],
		branches: {
			node_2: {
				selectedText: "How are you?",
				selectedTextContainerId: "0",
			},
			node_3: {
				selectedText: "Weather today?",
				selectedTextContainerId: "2",
			},
		},
	},

	node_2: {
		title: "Chat Title 2 4356456 456456 45364356 435564356",
		isParent: false,
		messages: ["Tell me a joke.", "Why don't skeletons fight each other? They don't have the guts."],
		branches: {
			node_4: {
				selectedText: "Tell me a joke",
				selectedTextContainerId: "1",
			},
		},
	},
	node_3: {
		title: "Chat Title 3",
		isParent: false,
		messages: ["What's the capital of France?", "The capital of France is Paris."],
		branches: {},
	},
	node_4: {
		title: "Chat Title 4",
		isParent: false,
		messages: ["Can you help me with my homework?", "Sure! What do you need help with?"],
		branches: {},
	},
};

export default sampleData;
