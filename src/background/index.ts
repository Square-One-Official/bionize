import { MENU_ITEMS } from "../shared/constants";
import { getSettings, getStateForUrl, setStateForUrl } from "../shared/storage";
import type { MessageType, ResponseType } from "../shared/types";

// Initialize context menus
chrome.runtime.onInstalled.addListener(() => {
  // Remove existing menus and create new ones
  chrome.contextMenus.removeAll(() => {
    MENU_ITEMS.forEach((item) => {
      chrome.contextMenus.create({
        id: item.id,
        title: item.title,
        contexts: ["action"],
      });
    });
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const menuItem = MENU_ITEMS.find((item) => item.id === info.menuItemId);
  if (menuItem?.url) {
    chrome.tabs.create({ url: menuItem.url });
  }
});

// Helper function to update icon state
async function updateIconState(tabId: number, url: string) {
  try {
    if (!url || !url.startsWith("http")) return;

    const isEnabled = await getStateForUrl(url);

    chrome.action.setIcon({
      path: isEnabled ? "assets/state_active.png" : "assets/state_inactive.png",
      tabId: tabId,
    });
  } catch (error) {
    console.error("Error updating icon state:", error);
  }
}

// Handle extension icon clicks
chrome.action.onClicked.addListener(async (tab) => {
  try {
    if (!tab.url || !tab.id || !tab.url.startsWith("http")) return;

    // Toggle state
    const currentState = await getStateForUrl(tab.url);
    const newState = !currentState;
    await setStateForUrl(tab.url, newState);

    // Update icon
    await updateIconState(tab.id, tab.url);

    // Notify content script using messaging
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: "toggleState",
        state: newState,
      });
    } catch (error) {
      // If content script isn't ready, inject it
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });
      // Try sending the message again
      await chrome.tabs.sendMessage(tab.id, {
        action: "toggleState",
        state: newState,
      });
    }
  } catch (error) {
    console.error("Error handling click:", error);
  }
});

// Handle tab updates (navigation, refresh, etc.)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.startsWith("http")
  ) {
    await updateIconState(tabId, tab.url);
  }
});

// Handle tab activation (switching between tabs)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url && tab.url.startsWith("http") && tab.id !== undefined) {
      await updateIconState(tab.id, tab.url);
    }
  } catch (error) {
    console.error("Error handling tab activation:", error);
  }
});

// Handle navigation within the same tab
chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId === 0 && details.url && details.url.startsWith("http")) {
    await updateIconState(details.tabId, details.url);
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener(
  (message: MessageType, sender, sendResponse) => {
    (async () => {
      let response: ResponseType = { success: false };

      try {
        if (message.action === "getSettings") {
          const settings = await getSettings();
          response = { success: true, settings };
        }

        if (message.action === "updateSettings" && message.settings) {
          // Handle settings update
          response = { success: true };
        }
      } catch (error) {
        console.error("Error handling message:", error);
        response = { success: false };
      }

      sendResponse(response);
    })();

    return true; // Keep the message channel open for async response
  }
);
