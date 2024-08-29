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
export const NODES_KEY = "nodes";
export const NODES_PROPERTIES_KEY = "nodes_properties";
export const NODES_MESSAGES_KEY = "nodes_messages";
export const NODES_MESSAGES_USER_MESSAGE_KEY = "userMessage";
export const NODES_MESSAGES_GPT_MESSAGE_KEY = "gptMessage";

export const EDGES_KEY = "edges";
export const EDGES_PROPERTIES_KEY = "edges_properties";


/***** Messages ******/

export const CONTENT_SCRIPT_CONSTANTS = "content_script_constants";
export const SYNC_WITH_CONTENT_SCRIPT = "sync_with_content_script";
export const HANDLE_NEW_BRANCH_CREATION = "handle_new_branch_creation";
export const UPDATE_NODE_MESSAGES = "update_node_messages";
export const SCROLL_TO_CHAT_MESSAGE = "scroll_to_chat_message";

export const HANDLE_NODE_RENAMING = "handle_node_renaming";
export const HANDLE_NODE_DELETION = "handle_node_deletion";

export const GET_NODE_TITLE = "get_node_title";
export const GET_NODE_DATA = "get_node_data";
export const GET_SELECTED_TEXT = "get_selected_text";
export const IS_BRANCH_BEING_CREATED = "is_branch_being_created";
export const ALERT = "alert";

/***** Selected Text Flags ******/
export const MAX_TEXT_SELECTION_LENGTH = 100;

export const NO_TEXT_SELECTED = "no_text_selected";
export const MAX_TEXT_SELECTION_LENGTH_EXCEEDED = "max_text_selection_length_exceeded";
export const TEXT_SPANS_MULTIPLE_MESSAGES = "text_spans_multiple_messages";
export const INVALID_TEXT_SELECTED = "invalid_text_selected";
export const VALID_TEXT_SELECTED = "valid_text_selected";

/***** Chrome Context Menu Items ******/

export const CONTEXT_MENU_CREATE_PARENT_NODE = "create_parent_node";
export const CONTEXT_MENU_CREATE_BRANCH_NODE = "create_branch_node";
export const CONTEXT_MENU_RESET = "reset";
export const CONTEXT_MENU_OPEN_GUI = "open_gui";


/****** Chat Type ******/
export const NODE_TYPE_NEW = "new_node";
export const NODE_TYPE_NEW_BRANCH = "new_branch_node";
export const NODE_TYPE_EXISTING = "existing_node";
export const NODE_TYPE_UNKNOWN = "unknown_node";   //i.e., it's a node but not stored in the extension

/****** User Notification Types ******/
export const ERROR = "Error";
export const INFO = "Info";
export const SUCCESS = "Success";
export const WARNING = "Warning";

/****** React Application Messages ******/
export const REACT_OPEN_CHAT = "open_chat";
export const REACT_GET_NODE_SPACE_KEYS = "react_get_node_space_keys";
export const REACT_APP_MOUNTED = "react_app_mounted";
export const GET_NODE_SPACE_DATA = "get_node_space_data";
export const HANDLE_OPEN_NODE_CHAT = "handle_open_node_chat";
export const REACT_UPDATE_NODE_SPACE_TITLE = "react_update_node_space_title";
export const REACT_DELETE_NODE_SPACE = "react_delete_node_space";