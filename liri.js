var keys = require('./keys.js');
var fs = require('fs');
var request = require('request');
var spotify = require('spotify');
var Twitter = require('twitter');

var twitterKeys = keys.twitterKeys;

var validArgs = ['my-tweets', 'spotify-this-song', 'movie-this', 'do-what-it-says'];

var logToFile = function(msg){
	fs.writeFile('./log.txt', msg + '\n',{flag: 'a', encoding: 'UTF-8'});
};

var validateInputAndRunCommand = function(){
	var args = process.argv;
	if(args.length < 3) {
		console.log('Invalid number of arguments. ');
		process.exit();
	}

	var command = args[2];
	if(validArgs.indexOf(command) <0) {
		console.log('Invalid command. Please enter one of the following: ' + validArgs);
		process.exit();	
	}

	var additionalCommand = args.length>3?args[3]:'';
	runCommand(command, additionalCommand);
};

var runCommand = function(command, additionalCommand) {
	switch(command) {
		case 'my-tweets': 
			showTweets();
		break;
		case 'spotify-this-song':
			spotifySong(additionalCommand);
		break;
		case 'movie-this':
			findMovie(additionalCommand);
		break;
		case 'do-what-it-says':
			readFileAndRunCommand();
		break;
	}
};

var readFileAndRunCommand = function(){
	var randomText = fs.readFileSync('./random.txt', 'UTF-8');
	console.log(randomText);
	var parts = randomText.split(',');
	runCommand(parts[0], parts[1]);	
};

var showTweets = function(){
	console.log('My tweets:');
	var client = new Twitter(twitterKeys);

	var params = {screen_name: '_kgurjit'};
	client.get('statuses/user_timeline', params, function(error, tweets, response){
		if (!error) {
			logToFile('Response for my tweets: ' + tweets);
			tweets.forEach(function(tweet){
				console.log(tweet.text);
			});
		} else {
			console.log('There was an error fetching tweets');
		}
	});
};

var spotifySong = function(song){
	if(!song || song === '') {
		song = 'what\'s my age again';
	}
	spotify.search({ type: 'track', query: song }, function(err, data) {
	    if ( err ) {
	        console.log('Error occurred: ' + err);
	        return;
	    }
	    logToFile('Response for song: ' + song + ' : ' + data);
	    console.log('Showing track info:');
	    if(data.tracks && data.tracks.items && data.tracks.items.length>0) {
	    	var item = data.tracks.items[0];
    		console.log('Artist: ' + item.artists[0].name);
    		console.log('Song Name: ' + item.name);
    		console.log('Preview link: ' + item.preview_url);
    		console.log('Album: ' + item.album.name);
	    }
	});
};

var findMovie = function(movie){
	if(!movie || movie === '') {
		 movie = 'Mr. Nobody';
	}
	var url = 'http://www.omdbapi.com/?tomatoes=true&t=' + movie;
	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var display = '';
			if(body !== ''){
				logToFile('Response for movie: ' + movie + ' : ' + body);
				var info = JSON.parse(body);
				console.log('Title: ' + info.Title);	
				console.log('Year: ' + info.Year);	
				console.log('IMDB Rating: ' + info.imdbRating);	
				console.log('Country: ' + info.Country);	
				console.log('Language: ' + info.Language);	
				console.log('Plot: ' + info.Plot);	
				console.log('Actors: ' + info.Actors);	
				console.log('Rotten tomatoes rating: ' + info.tomatoUserRating);	
				console.log('Rotten tomatoes URL: ' + info.tomatoURL);	
			}
		}
	});
};

validateInputAndRunCommand();