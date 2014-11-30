if (localStorage.getItem('emStrgNumbersQuota') >= 50) localStorage.setItem('emStrgNumbersQuota','50');
if (localStorage.getItem('emStrgStarsQuota') >= 11) localStorage.setItem('emStrgStarsQuota','11');
$(function() {
	var totalKeys = 20, optNumber = localStorage.getItem('emStrgNumbersQuota') || 5, optStars = localStorage.getItem('emStrgStarsQuota') || 2,
		refreshKeys = function(element) {
			var toptNumber = $('#options input.numbers').val() || false,
				toptStars = $('#options input.stars').val() || false;
			if (element === false) { element = $('.euro-key'); }
			$(element).each(function() {
				$(this).html(buildKeyList(toptNumber,toptStars));
			});
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
				string += '<li class="makeshift-col"><ul class="pagination">'+buildKeyList(toptNumber,toptStars)+'</ul></li>';
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
				returnObj.numbers = returnBiggestCount(countNumber,5,51);
				returnObj.stars = returnBiggestCount(countStars,2,12);
				
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
		if (stars >= 11) stars = 11;
		if (number >= 50) number = 50;
		localStorage.setItem('emStrgNumbersQuota',number);
		localStorage.setItem('emStrgStarsQuota',stars);
		spawnElements(false);
	});


	
function returnBiggestCount(countObject, turns, max) {
	var turns, lazyNumbers, theVal, theKey, oldMax, x;
	while (turns > 0) {
		if (theKey) delete countObject[theKey];
		oldMax = 0;
		for (x = max; x > 0; x--) {
			theVal = countObject[x];
			if (theVal > oldMax) { oldMax = theVal; theKey = x; }
			if (x === 1) { lazyNumbers.push(theKey); }
		}
		turns--;
	}
	return lazyNumbers;
}

function randomMe(times,maxVal) {
	var x,z,list=[];
	for (x = times; x > 0; x--) {
		z = Math.floor(Math.random()*maxVal);
		while(z === 0 || list.indexOf(z) > -1) { z = Math.floor(Math.random()*maxVal); }
		list.push(z);
	}
	return list;
}
function buildKeyElementString(list,active,_class) {
	var string='',x,active= (active !== false) ? 'active' : '';
	for (x = 0; x < list.length; x++) {
		string += '<li class="'+active+'""><a class="'+_class+'">'+list[x]+'</a></li>'	
	}
	return string;
}
function buildKeyList(optNumber,optStars) {
	var howManyNumbers 		= optNumber || 5,
		howManyNumbersUnit 	= 51,
		howManyStars		= optStars || 2,
		howManyStarsUnit 	= 11,
		keys 				= {"keys":[],"stars":[]},
		mainNumberString 	= '',
		luckyStarString		= '',
		keyString,refreshString,santaCasaString;

	if (howManyStars >= 11) { localStorage.setItem('emStrgStarsQuota',11); howManyStars = 11; }
	if (howManyNumbers >= 50) { localStorage.setItem('emStrgNumbersQuota',50); howManyNumbers = 50; }

	keys.numbers = randomMe(howManyNumbers,howManyNumbersUnit);
	keys.numbers.sort(function(a,b){return (a - b)});

	keys.stars = randomMe(howManyStars,howManyStarsUnit);
	keys.stars.sort(function(a,b){return (a - b)});
	
	mainNumberString = buildKeyElementString(keys.numbers,false,'euro-key');
	luckyStarString = buildKeyElementString(keys.stars,true,'euro-star');
	
	refreshString = '<li class="refresh orange" data-refresh="unique"><a class="glyphicon glyphicon-refresh"></a></li>';
	santaCasaString = '<li class="santacasa green"><a class="glyphicon glyphicon-usd"></a></li>';
	keyString = refreshString+''+mainNumberString+''+luckyStarString+''+santaCasaString;

	return keyString;
}

spawnElements(false);
getLastWinningKey();


});