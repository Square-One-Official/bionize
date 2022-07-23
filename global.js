// Bridge between foreground and background (service worker) layer of extension
// Do not include anything to do with the DOM as it is unaccessible by the service worker

function getStorageKey(domain) {
	const groupSubDomains = true; // hard-coded, maybe add a toggle for this in the future
	const domain = groupSubDomains ? trimSubDomain(domain) : domain;

	return `TURNED-ON-FOR-${url}`;
}

function trimSubDomain(domain) {
	const parts = domain.split('.');
	if (parts.length > 2) {
		return parts.slice(1).join('.');
	}
	return domain;
}
