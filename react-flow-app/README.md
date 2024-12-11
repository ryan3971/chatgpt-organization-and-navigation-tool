## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)

## Overview
This application provides a visual interface for exploring and managing ChatGPT conversation spaces. It renders conversation flows as interactive node graphs, where each node represents a conversation state and edges represent the relationships between different conversation branches.

## Key Features
- Interactive node-based visualization of conversation flows
- Custom node and edge components with contextual information
- Side panel for managing conversation workspaces
- Auto-layout capabilities using ELK algorithm
- Context menus for node interactions
- Toast notifications for user feedback
- Responsive design with Bootstrap integration
- Real-time synchronization with Chrome storage

## Project Structure
react-flow-app/  
├── src/  
│ ├── components/  
│ │ ├── FlowDiagram/ # Main flow visualization components  
│ │ │ ├── nodes/ # Custom node components  
│ │ │ ├── edges/ # Custom edge componentsv
│ │ │ └── context_menu/ # Context menu components  
│ │ ├── NodeSpacePanel/ # Workspace management panel  
│ │ └── toast/ # Toast notification system  
│ ├── hooks/ # Custom React hooks  
│ ├── util/ # Utility functions  
│ └── assets/ # Static assets  
├── public/ # Public assets  
└── config files # Configuration files

## Key Components
- **FlowDiagram**: Core visualization component using React Flow
- **CustomNode**: Enhanced node component with message display
- **CustomEdge**: Custom edge component with interactive features
- **NodeContextMenu**: Context menu for node operations
- **SidePanel**: Workspace management interface
- **MessageTable**: Message display and interaction component

## Architecture
The application follows a component-based architecture with clear separation of concerns:

- **Core Components**: Handle visualization and user interaction
- **State Management**: Uses React hooks and Chrome storage
- **Layout Engine**: ELK algorithm for automated graph layout
- **Event System**: Custom event handling for user interactions
- **Storage Layer**: Chrome storage integration for persistence

## Technologies Used
- **React** (v18.3.1)
- **React Flow** (@xyflow/react v12.0.2)
- **ELK.js** (v0.9.3) for graph layout
- **Bootstrap** (v5.3.3)
- **Tailwind CSS** (v3.4.8)
- **Vite** (v5.3.4)
- **Chrome Extension APIs**


## Usage
The application integrates with Chrome as an extension, providing a visual interface for ChatGPT conversations. Users can:
- View conversation trees
- Navigate between different conversation spaces
- Interact with nodes to view message content
- Manage workspaces through the side panel
- Auto-arrange layouts for better visualization

For development, use the provided npm scripts:
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
