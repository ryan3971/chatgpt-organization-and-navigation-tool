## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [Technologies Used](#technologies-used)
- [Installation](#installation)

## Overview
ChatGPT Navigator is a Chrome extension that adds powerful conversation management features to ChatGPT. It allows users to organize chats into spaces, create branching conversations from existing points, and easily navigate between related discussions.

## Key Features
- **Conversation Spaces**: Organize related chats into logical groupings
- **Branching Conversations**: Create new conversation branches from any point in an existing chat
- **Parent-Child Relationships**: Establish hierarchical relationships between related conversations
- **Easy Navigation**: Quickly move between related chats and specific messages
- **Title Management**: Automatically track and update chat titles
- **Context Menu Integration**: Quick access to key features via right-click menu
- **Real-time Updates**: Synchronizes changes across tabs and windows
- **Persistent Storage**: Maintains conversation organization across sessions

## Architecture
The extension follows a modular architecture with clear separation of concerns:

- **Background Script**: Manages state, handles cross-tab communication, and coordinates storage operations
- **Content Script**: Interfaces with the ChatGPT webpage DOM and handles UI interactions
- **React Frontend**: Provides an intuitive interface for viewing and managing conversation spaces
- **Chrome Storage**: Persists conversation data and relationships
- **Message Passing**: Enables communication between components via Chrome messaging API

## Project Structure

chrome-extension/
├── background.js # Main background script
├── background_helpers/ # Helper functions for background operations
├── Constants/ # Shared constants and configuration
├── content.js # Content script for ChatGPT page integration
├── services/ # Shared services (storage, etc.)
├── manifest.json # Extension configuration
└── index.html # React application entry point


## Key Components

### Background Script (background.js)
- Manages extension state
- Handles context menu operations
- Coordinates storage operations
- Manages cross-tab communication

### Content Script (content.js)
- Integrates with ChatGPT webpage
- Handles DOM mutations and updates
- Manages text selection and branching
- Synchronizes with background state

### Storage Service (chromeStorageService.js)
- Provides interface to Chrome storage
- Handles data persistence
- Manages storage operations

### Constants (constants.js)
- Defines shared configuration
- Maintains message types
- Stores DOM selectors

## Technologies Used
- **Chrome Extensions API**
  - Storage API
  - Messaging API
  - Context Menus API
  - Tabs API
- **JavaScript (ES6+)**
- **React** (for GUI interface)
- **DOM Mutation Observer API**
- **Chrome Storage Sync**