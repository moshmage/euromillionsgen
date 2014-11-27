$(function() {

	var totalKeys = 20, optNumber = localStorage.getItem('emStrgNumbersQuota') || 5, optStars = localStorage.getItem('emStrgStarsQuota') || 2,
		refreshKeys = function(element) {
			var toptNumber = $('#options input.numbers').val() || false,
				toptStars = $('#options input.stars').val() || false;
			if (element === false) { element = $('.euro-key'); }
			$(element).each(function() {
				$(this).html(spawnKey(toptNumber,toptStars));
			});
		},
		spawnKey = function(optNumber,optStars) {
			var mainNumbers 		= optNumber || 5,
				mainNumbersUnit 	= 51,
				luckyStar 			= optStars || 2,
				luckyStarUnit 		= 12,
				mainNumberString 	= '',
				luckyStarString		= '',
				x,y,z,prevZ=[],keyString,
				refreshString,santaCasaString;
			for (x = mainNumbers; x > 0; x--) {
				z = Math.floor(Math.random()*mainNumbersUnit);
				while(z === 0 || prevZ.indexOf(z) > -1) { z = Math.floor(Math.random()*mainNumbersUnit); }
				prevZ.push(z);
				mainNumberString += '<li><a class="euro-key">'+z+'</a></li>';
			}
			prevZ = [];
			for (y = luckyStar; y > 0; y--) {
				z = Math.floor(Math.random()*luckyStarUnit);
				while(z === 0 || prevZ.indexOf(z) > -1) { z = Math.floor(Math.random()*luckyStarUnit); }
				prevZ.push(z);
				luckyStarString += '<li class="active"><a class="euro-star">'+z+'</a></li>';
			}
			refreshString = '<li class="refresh orange" data-refresh="unique"><a class="glyphicon glyphicon-refresh"></a></li>';
			santaCasaString = '<li class="santacasa green"><a class="glyphicon glyphicon-usd"></a></li>';
			keyString = refreshString+''+mainNumberString+''+luckyStarString+''+santaCasaString;
			return keyString;
		},
		spawnElements = function(howMany) {
			var string = '',
				elementSpot = $('[name=content] .row ul'),
				toptNumber = $('#options input.numbers').val() || false,
				toptStars = $('#options input.stars').val() || false,
				morethanfive = false;
			if (howMany === false) { howMany = totalKeys; }
			if (howMany > 5) morethanfive = true;
			elementSpot.empty();
			$('.howManyKeys').val(howMany);
			while (howMany > 0) {
				string += '<li class="makeshift-col"><ul class="pagination">'+spawnKey(toptNumber,toptStars)+'</ul></li>';
				howMany--;
			}
			elementSpot.append(string);
			if (morethanfive == true) {
				console.log('this was called');
				$('.content .pagination').toggleClass('morethanfive');
				$('.content .list-unstyled li:nth-child(5n) ul').css('clear','right');
				$('.content .makeshift-col').toggleClass('col-centered');
			}
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
		},
		gotoSantaCasa = function(element) {
			var _this,key2send={"key":[],"stars":[]},scString;
			$('li',element).each(function(){
				_this = $('.euro-key,.euro-star',$(this));
				if (_this.length > 0) {
					if (_this.hasClass('euro-key')) key2send.key.push(_this.text());
					else key2send.stars.push(_this.text());
				}
			});
			scString = JSON.stringify(key2send);
			window.open('https://www.jogossantacasa.pt/web/JogarEuromilhoes/#'+scString,'emSantaCasa');
		};
		
	$('body').on('click','.refresh',function() {
		var _this = $(this),
			_howMany = $('.howManyKeys',_this.parent().parent()).val();
		if (_howMany !== undefined) {
			console.log('not equal to totalkeys '+_howMany+' vs '+totalKeys);
			spawnElements(_howMany);
			return false;
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
	$('body').on('click','.santacasa',function(){
		gotoSantaCasa($(this).parent());
	});
	$('#options .numbers').val(optNumber);
	$('#options .stars').val(optStars);
	$('#options .btn').on('click',function(){
		var options = $('#options'),
			number = $('.numbers',options).val(),
			stars = $('.stars',options).val();
		localStorage.setItem('emStrgNumbersQuota',number);
		localStorage.setItem('emStrgStarsQuota',stars);
		spawnElements(false);
	});
	spawnElements(false);
	getLastWinningKey();

});