// Bridge between foreground and background (service worker) layer of extension
// Do not include anything to do with the DOM as it is unaccessible by the service worker

/**
 *
 * @param {string} rawDomain domain with potential subdomain
 * @returns {string} local storage key for accessing toggle state of extension per website
 */
function getStorageKey(url) {
	return `TURNED-ON-FOR-${getDomainFromUrl(url)}`;
}

function getDomainFromUrl(domain) {
	let result = domain;
	const parts = domain.split('.');
	if (parts.length > 2) {
		result = parts.slice(1).join('.');
	}
	if (result.includes('/')) {
		result = result.split('/')[0];
	}
	return result;
}
