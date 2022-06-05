function replaceText() {
	const texts = document.querySelectorAll(
		'p, span, a, li, strong, i, em, h1, h2, h3, h4, h5, h6',
	);

	for (let text of texts) {
		text.textContent = 'Dr. Phil';
	}
}

setInterval(replaceText, 2000);
