$(function() {

	var totalKeys = 5,
		refreshKeys = function(element) {
			if (element === false) { element = $('.euro-key'); }
			$(element).each(function() {
				$(this).html(spawnKey());
			});
		},
		spawnKey = function() {
			var mainNumbers 		= 5,
				mainNumbersUnit 	= 51,
				luckyStar 			= 2,
				luckyStarUnit 		= 12,
				mainNumberString 	= '',
				luckyStarString		= '',
				x,y,z,prevZ=0,keyString;
			for (x = mainNumbers; x > 0; x--) {
				z = Math.floor(Math.random()*mainNumbersUnit);
				while(z === 0 || z === prevZ) { z = Math.floor(Math.random()*mainNumbersUnit); }
				prevZ = z;
				mainNumberString += '<li><a class="euro-key">'+z+'</a></li>';

			}
			prevZ = 0;
			for (y = luckyStar; y > 0; y--) {
				z = Math.floor(Math.random()*luckyStarUnit);
				while(z === 0 || z === prevZ) { z = Math.floor(Math.random()*luckyStarUnit); }
				prevZ = z;
				luckyStarString += '<li class="active"><a class="euro-key">'+z+'</a></li>';
			}
			keyString = mainNumberString+''+luckyStarString+'<li class="refresh" data-refresh="unique"><a>R</a></li>';
			return keyString;
		},
		spawnElements = function(howMany) {
			var string = '',
				elementSpot = $('[name=content] .row ul');
			if (howMany === false) { howMany = totalKeys; }
			elementSpot.empty();
			$('.howManyKeys').val(howMany);
			while (howMany > 0) {
				string += '<li class=""><ul class="pagination">'+spawnKey()+'</ul></li>';
				howMany--;
			}
			elementSpot.append(string);
		},
		constructLazyPrediction = function(object,lastKey) {
			var	string = '<li class="predictionKey"><ul class="pagination">';
			 string = '<li class="last-key"><ul class="pagination">';
			$.each(object.numbers,function(){
				string += '<li><a class="euro-key">'+this+'</a></li>';
			});
			$.each(object.stars,function(){
				string += '<li class="active"><a class="euro-key">'+this+'</a></li>';
			});
			string += '</ul></li>';
			if (lastKey === false) $('.lazy-prediction .list-unstyled').append(string);
			else $('.last-key-spot .list-unstyled').append(string);
		},
		lazyPredictKey = function() {
			$.get('./getKeys.php',function(data) {
				var keys = data.drawn,
					numberString='',starString='',
					x,y,c,countNumber = {},countStars = {},
					lazyNumbers=[],lazyStars=[],maxVal,oldMax=0,theVal,theKey,
					turns=5,returnObj={};
				$.each(keys,function() {
					numberString += this.numbers+' ';
					starString += this.stars+' ';
				});
				for (x = 50; x > 0; x--) {
					c = new RegExp("\\b"+x+"\\b","g");
					//var x=1, c = ; 
					countNumber[""+x] = numberString.match(c).length;
					if (x < 12) {
						c = new RegExp("\\b"+x+"\\b","g");
						countStars[""+x] = starString.match(c).length;
					}
				}
				while (turns > 0) {
					if (theKey) delete countNumber[theKey];
					oldMax = 0;
					for (x = 50; x > 0; x--) {
						theVal = countNumber[x];
						if (theVal > oldMax) { oldMax = theVal; theKey = x; }
						if (x === 1) { lazyNumbers.push(theKey); }
					}
					turns--;
				}
				turns = 2;
				while (turns > 0) {
					if (theKey) delete countStars[theKey];
					oldMax = 0;
					for (x = 12; x > 0; x--) {
						theVal = countStars[x];
						if (theVal > oldMax) { oldMax = theVal; theKey = x; }
						if (x === 1) { lazyStars.push(theKey); }
					}
					turns--;
				}
				returnObj.numbers = lazyNumbers;
				returnObj.stars = lazyStars; 
				constructLazyPrediction(returnObj,false);
			});
		},
		getLastWinningKey = function() {
			$.get('./getKeys.php?last=true',function(data){
				var keys = data.drawn.numbers.split(' '),
					stars = data.drawn.stars.split(' '),
					object = {};
				object.numbers = keys;
				object.stars = stars;
				constructLazyPrediction(object,true);
			});
		};
		
	$('body').on('click','.refresh',function() {
		var _this = $(this),
			_howMany = _this.siblings('.howManyKeys').val();
		if (_howMany !== undefined) {
			if (_howMany !== totalKeys) {
				spawnElements(_howMany);
				return false;
			}
		}
		if (_this.attr('data-refresh') === "unique") { refreshKeys(_this.closest('.pagination')) }
		else refreshKeys(false); 
	});
	$('input').on('change',function() {
		var _this = $(this);
		if (_this.val().search(/\d/g) < 0) { _this.val(totalKeys); }
	});
	$('.lazyPrediction').on('click',function(){lazyPredictKey();});
	$('[data-toggle=tooltip]').tooltip();
	spawnElements(false);
	getLastWinningKey();
});