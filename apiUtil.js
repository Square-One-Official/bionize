async function fetchBionicText(text) {
	try {
		const options = getRequestOptions(text);

		const response = await fetch(
			'https://bionic-reading1.p.rapidapi.com/convert',
			options,
		).then(result => result.text());
		return response;
	} catch (err) {
		console.error(err);
		return null;
	}
}

function getRequestOptions(text) {
	const encodedParams = new URLSearchParams();
	encodedParams.append('content', text);
	encodedParams.append('response_type', 'html');
	encodedParams.append('request_type', 'html');
	encodedParams.append('fixation', '1');
	encodedParams.append('saccade', '10');

	const options = {
		method: 'POST',
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			'X-RapidAPI-Host': 'bionic-reading1.p.rapidapi.com',
			'X-RapidAPI-Key': '3cb87f961fmshf21bfd2a8e8a61cp1d535cjsncfc69f78c2a7',
		},
		body: encodedParams,
	};

	return options;
}
