async function toggleState() {
    try {
        // Get current hostname
        const hostname = window.location.hostname;
        
        // Get current state
        const currentState = await window.getStateFromStorage(hostname);
        
        // Toggle state
        const newState = !currentState;
        
        // Save new state
        await window.setStateInStorage(hostname, newState);
        
        // Toggle text elements
        const event = new CustomEvent('bionizeStateChanged', { detail: { state: newState } });
        window.dispatchEvent(event);
        
        return newState;
    } catch (error) {
        console.error('Error toggling state:', error);
        return false;
    }
}

// Execute toggle
toggleState();
