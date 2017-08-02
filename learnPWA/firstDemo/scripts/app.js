
if('caches' in window) {
	caches.match(url).then(function(response) {
		if(response) {
			response.json().then(function updateFormCache(json) {
				var results = json.query.results;
				results.key = key;
				results.label = label;
				results.created = json.query.created;
				app.updateForecastCard(results);
			})
		}
	})
}