/***** CHATGPT Specific Constants */
/*
 * Values specific to ChatGPT (like html element and attribute names, etc.)
 * Put here in case they change - best not to hard code them in the codebase
*/

/***** General Constants ******/
export const CHATGPT_ORIGIN = "https://chatgpt.com";
export const CHATGPT_HOSTNAME = "chatgpt.com";

/***** Storage Keys *****/

export const NODE_SPACES_KEY = "node_spaces";
export const NODES_KEY = "nodes";
export const NODES_PROPERTIES_KEY = "nodes_properties";
export const NODES_MESSAGES_KEY = "nodes_messages";
export const NODES_MESSAGES_USER_MESSAGE_KEY = "userMessage";
export const NODES_MESSAGES_GPT_MESSAGE_KEY = "gptMessage";

export const EDGES_KEY = "edges";
export const EDGES_PROPERTIES_KEY = "edges_properties";


/***** Messages ******/

export const CONTENT_SCRIPT_CONSTANTS = "content_script_constants";
export const UPDATE_CONTENT_SCRIPT_TEMP_DATA = "update_content_script_temp_data";
export const HANDLE_NEW_BRANCH_CREATION = "handle_new_branch_creation";
export const UPDATE_CHAT_MESSAGES = "update_chat_messages";
export const GET_CHAT_TITLE = "get_chat_title";
export const GET_CHAT_DATA = "get_chat_data";
export const GET_SELECTED_TEXT = "get_selected_text";
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

/****** Chat Type ******/
export const CHAT_TYPE_NEW_CHAT = "new_chat";
export const CHAT_TYPE_NEW_BRANCH_CHAT = "new_branch_chat";
export const CHAT_TYPE_EXISTING_CHAT = "existing_chat";
export const CHAT_TYPE_UNKNOWN_CHAT = "unknown_chat";   //i.e., it's a chat but not stored in the extension

/****** User Notification Types ******/
export const ERROR = "Error";
export const INFO = "Info";
export const SUCCESS = "Success";
export const WARNING = "Warning";