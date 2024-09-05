/***** CHATGPT Specific Constants */
/*
 * Values specific to ChatGPT (like html element and attribute names, etc.)
 * Put here in case they change - best not to hard code them in the codebase
*/

/***** General Constants ******/
export const CHATGPT_ORIGIN = "https://chatgpt.com";
export const CHATGPT_HOSTNAME = "chatgpt.com";

/***** Storage Keys *****/
export const NODE_SPACES_KEY = "node_spaces_keys";


/***** Messages ******/

/* General Messages */

export const CONTENT_SCRIPT_CONSTANTS = "content_script_constants";         // Message to send constants the the content script
export const SYNC_WITH_CONTENT_SCRIPT = "sync_with_content_script";         // Message to sync with the content script when a tab is first opened
export const HANDLE_NEW_BRANCH_CREATION = "handle_new_branch_creation";     // Message to handle new branch creation
export const UPDATE_NODE_MESSAGES = "update_node_messages";                 // Message to save/update node messages
export const SCROLL_TO_CHAT_MESSAGE = "scroll_to_chat_message";             // Message to scroll to indicated chat message

export const UPDATE_NODE_TITLE = "update_node_title";                 // Message to handle updating the node title
export const HANDLE_NODE_DELETION = "handle_node_deletion";                 // Message to handle deleting a node

export const IS_NEW_BRANCH = "is_new_branch";                               // Message to check if a node is a new branch

/* Retrieve information from Content script */
export const GET_NODE_TITLE = "get_node_title"; // Message to get the node title from content script
export const GET_NODE_DATA = "get_node_data"; // Message to get the node data from content script
export const GET_SELECTED_TEXT = "get_selected_text"; // Message to get the selected text from content script
export const GET_MESSAGE_TO_PIN = "get_message_to_pin"; // Message to get the node messages from content script
export const CHROME_TOAST = "chrome_toast";                                               // Message to show an alert

/***** Selected Text Flags ******/
export const MAX_TEXT_SELECTION_LENGTH = 100;                               // Maximum length of text that can be selected
export const NO_TEXT_SELECTED = "no_text_selected";                         // No text is selected
export const MAX_TEXT_SELECTION_LENGTH_EXCEEDED = "max_text_selection_length_exceeded"; // Text selected is too long
export const TEXT_SPANS_MULTIPLE_MESSAGES = "text_spans_multiple_messages"; // Text spans multiple ChatGPT messages
export const INVALID_TEXT_SELECTED = "invalid_text_selected";               // Invalid text selected (i.e., text outside of a message)
export const VALID_TEXT_SELECTED = "valid_text_selected";                   // Valid text selected

/***** Pin MEssage Flags ******/
export const UNKNOWN_PIN_MESSAGE_ERROR = "unknown_pin_message_error";                   // Unknown message selected
export const INVALID_PIN_MESSAGE_SELECTION = "invalid_pin_message_selection"; // Invalid text selected (i.e., text outside of a message)
export const VALID_PIN_MESSAGE = "valid_pin_message";                         // Valid text selected

/***** Chrome Context Menu Items ******/
export const CONTEXT_MENU_CREATE_PARENT_NODE = "create_parent_node";        // Create a parent node
export const CONTEXT_MENU_CREATE_BRANCH_NODE = "create_branch_node";        // Create a branch node
export const CONTEXT_MENU_RESET = "reset";                                  // Reset Chrome storage
export const CONTEXT_MENU_OPEN_GUI = "open_gui";                            // Open the ChatGPT GUI
export const CONTEXT_MENU_PIN_MESSAGE = "pin_message";                      // Pin a message


/****** Chat Type ******/
export const NODE_TYPE_NEW = "new_node";                                    // New node
export const NODE_TYPE_NEW_BRANCH = "new_branch_node";                      // New branch node
export const NODE_TYPE_EXISTING = "existing_node";                          // Existing node
export const NODE_TYPE_UNKNOWN = "unknown_node";                            //i.e., it's a node but not stored in the extension

/****** User Notification Types ******/
export const ERROR = "error";                                           // Error notification
export const INFO = "info";                                             // Information notification
export const SUCCESS = "success";                                       // Success notification
export const WARNING = "warning";                                       // Warning notification

/****** React Application Messages ******/
export const REACT_OPEN_CHAT = "open_chat";                             // Open the ChatGPT chat
export const REACT_GET_NODE_SPACE_KEYS = "react_get_node_space_keys";   // Get the node space keys
export const REACT_APP_MOUNTED = "react_app_mounted";                   // React app has mounted
export const GET_NODE_SPACE_DATA = "get_node_space_data";               // Get the node space data
export const HANDLE_OPEN_NODE_CHAT = "handle_open_node_chat";           // Handle opening a node chat
export const REACT_UPDATE_NODE_SPACE_TITLE = "react_update_node_space_title";   // Update the node space title
export const REACT_DELETE_NODE_SPACE = "react_delete_node_space";       // Delete the node space