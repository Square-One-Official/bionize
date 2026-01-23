// Storage utility functions for Bionize
const StorageUtils = {
    async getState(url) {
        return new Promise((resolve) => {
            try {
                if (!chrome?.storage?.sync) {
                    resolve(false);
                    return;
                }
                
                if (!chrome.runtime?.id) {
                    resolve(false);
                    return;
                }

                const key = this.getKey(url);
                chrome.storage.sync.get([key], function(result) {
                    if (chrome.runtime.lastError) {
                        console.warn('Storage error:', chrome.runtime.lastError);
                        resolve(false);
                        return;
                    }
                    resolve(result[key] ?? false);
                });
            } catch (error) {
                console.warn('Storage error:', error);
                resolve(false);
            }
        });
    },

    async setState(url, value) {
        return new Promise((resolve) => {
            try {
                if (!chrome?.storage?.sync) {
                    resolve();
                    return;
                }
                
                if (!chrome.runtime?.id) {
                    resolve();
                    return;
                }

                const key = this.getKey(url);
                chrome.storage.sync.set({ [key]: value }, function() {
                    if (chrome.runtime.lastError) {
                        console.warn('Storage error:', chrome.runtime.lastError);
                        resolve();
                        return;
                    }
                    resolve();
                });
            } catch (error) {
                console.warn('Storage error:', error);
                resolve();
            }
        });
    },

    getKey(url) {
        return `bionize_state_${url}`;
    }
};

// Make it available in both content scripts and background script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageUtils;
} else {
    window.StorageUtils = StorageUtils;
} 