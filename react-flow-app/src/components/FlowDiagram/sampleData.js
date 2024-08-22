const sampleData = {
	node_1: {
		title: "Chat Title 1",
		isParent: true,
		messages: [
			{
				userMessage: "Hello, how are you?",
				gptMessage: "I'm fine, thank you! How can I help you today?",
			},
			{
				userMessage: "What is the weather like today?",
				gptMessage: "The weather is sunny with a high of 25°C.",
			},
			{
				userMessage: "What is the weather like today?",
				gptMessage: "The weather is sunny with a high of 25°C.",
			},
			{
				userMessage: "What is the weather like today?",
				gptMessage: "The weather is sunny with a high of 25°C.",
			},
			{
				userMessage: "What is the weather like today?",
				gptMessage: "The weather is sunny with a high of 25°C.",
			},
			{
				userMessage: "What is the weather like today?",
				gptMessage: "The weather is sunny with a high of 25°C.",
			},
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
		title: "Chat Title 2",
		isParent: false,
		messages: [
			{
				userMessage: "Tell me a joke.",
				gptMessage: "Why don't skeletons fight each other? They don't have the guts.",
			},
		],
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
		messages: [
			{
				userMessage: "What's the capital of France?",
				gptMessage: "The capital of France is Paris.",
			},
		],
		branches: {},
	},
	node_4: {
		title: "Chat Title 4",
		isParent: false,
		messages: [
			{
				userMessage: "Can you help me with my homework?",
				gptMessage: "Sure! What do you need help with?",
			},
		],
		branches: {},
	},
};

export default sampleData;
