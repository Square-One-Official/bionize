// Bridge between foreground and background (service worker) layer of extension
// Do not include anything to do with the DOM as it is unaccessible by the service worker

/**
 *
 * @param {string} rawDomain domain with potential subdomain
 * @returns {string} local storage key for accessing toggle state of extension per website
 */
function getStorageKey(rawDomain) {
	const groupSubDomains = true; // hard-coded, maybe add a toggle for this in the future
	const domain = groupSubDomains ? trimSubDomain(rawDomain) : rawDomain;

	return `TURNED-ON-FOR-${domain}`;
}

function trimSubDomain(domain) {
	const parts = domain.split('.');
	if (parts.length > 2) {
		return parts.slice(1).join('.');
	}
	return domain;
}
