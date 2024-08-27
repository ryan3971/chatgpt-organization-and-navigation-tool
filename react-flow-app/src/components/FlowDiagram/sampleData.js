const sampleData = {
	node_1: {
		title: "Chat Title 1",
		isParent: true,
		messages: [
			["Hello, how are you?", "I'm fine, thank you! How can I help you today?"],
			["What is the weather like today?", "The weather is sunny with a high of 25°C."],
		],
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
			node_5: {
				selectedText: "favorite color",
				selectedTextContainerId: 1,
				isMessageOverwritten: true,
			},
			node_8: {
				selectedText: "quantum mechanics",
				selectedTextContainerId: 1,
				isMessageOverwritten: false,
			},
			node_12: {
				selectedText: "meaning of life",
				selectedTextContainerId: 1,
				isMessageOverwritten: false,
			},
		},
	},

	node_2: {
		title: "Chat Title 2",
		isParent: false,
		messages: [["Tell me a joke.", "Why don't skeletons fight each other? They don't have the guts."]],
		branches: {
			node_4: {
				selectedText: "Tell me a joke",
				selectedTextContainerId: 1,
				isMessageOverwritten: false,
			},
		},
	},

	node_3: {
		title: "Chat Title 3",
		isParent: false,
		messages: [["What's the capital of France?", "The capital of France is Paris."]],
		branches: {},
	},

	node_4: {
		title: "Chat Title 4",
		isParent: false,
		messages: [["Can you help me with my homework?", "Sure! What do you need help with?"]],
		branches: {},
	},

	node_5: {
		title: "Chat Title 5",
		isParent: false,
		messages: [
			["What's your favorite color?", "I like blue, how about you?"],
			["Can you recommend a good book?", "I recommend '1984' by George Orwell."],
		],
		branches: {
			node_6: {
				selectedText: "favorite color",
				selectedTextContainerId: 1,
				isMessageOverwritten: true,
			},
			node_7: {
				selectedText: "good book",
				selectedTextContainerId: 2,
				isMessageOverwritten: false,
			},
		},
	},

	node_6: {
		title: "Chat Title 6",
		isParent: false,
		messages: [["Do you like cats?", "Yes, I find them quite adorable."]],
		branches: {},
	},

	node_7: {
		title: "Chat Title 7",
		isParent: false,
		messages: [["What's the best movie you've seen recently?", "I really enjoyed 'Inception.'"]],
		branches: {},
	},

	node_8: {
		title: "Chat Title 8",
		isParent: false,
		messages: [
			["Can you explain quantum mechanics?", "Quantum mechanics is a branch of physics dealing with subatomic particles."],
			["Can you explain relativity?", "Relativity is a theory by Einstein explaining how space and time are linked."],
			["What's a black hole?", "A black hole is a region in space where gravity is so strong that even light can't escape."],
		],
		branches: {
			node_9: {
				selectedText: "quantum mechanics",
				selectedTextContainerId: 1,
				isMessageOverwritten: false,
			},
			node_10: {
				selectedText: "relativity",
				selectedTextContainerId: 2,
				isMessageOverwritten: true,
			},
			node_11: {
				selectedText: "black hole",
				selectedTextContainerId: 3,
				isMessageOverwritten: false,
			},
		},
	},

	node_9: {
		title: "Chat Title 9",
		isParent: false,
		messages: [["Can you simplify quantum mechanics?", "At its core, quantum mechanics describes how particles behave at a microscopic scale."]],
		branches: {},
	},

	node_10: {
		title: "Chat Title 10",
		isParent: false,
		messages: [
			[
				"What's the theory of special relativity?",
				"It's the theory that describes how time and space are related for objects moving at a constant speed.",
			],
		],
		branches: {},
	},

	node_11: {
		title: "Chat Title 11",
		isParent: false,
		messages: [
			[
				"Can you explain more about black holes?",
				"They are formed when a star collapses under its own gravity, creating a point with infinite density.",
			],
		],
		branches: {},
	},

	node_12: {
		title: "Chat Title 12",
		isParent: false,
		messages: [
			["What's the meaning of life?", "Some say it's 42, others have different interpretations."],
			["What's the purpose of existence?", "That’s a philosophical question with many answers, depending on who you ask."],
		],
		branches: {
			node_13: {
				selectedText: "meaning of life",
				selectedTextContainerId: 1,
				isMessageOverwritten: false,
			},
			node_14: {
				selectedText: "purpose of existence",
				selectedTextContainerId: 2,
				isMessageOverwritten: false,
			},
		},
	},

	node_13: {
		title: "Chat Title 13",
		isParent: false,
		messages: [
			["What's 42?", "It's a reference to 'The Hitchhiker's Guide to the Galaxy,' where 42 is the answer to the ultimate question of life."],
		],
		branches: {},
	},

	node_14: {
		title: "Chat Title 14",
		isParent: false,
		messages: [["What are different interpretations of existence?", "Some believe it’s religious, others say it’s about personal fulfillment."]],
		branches: {},
	},

	node_15: {
		title: "Chat Title 15",
		isParent: false,
		messages: [["Can you recommend a TV show?", "I recommend 'Breaking Bad.'"]],
		branches: {},
	},
};

export default sampleData;
