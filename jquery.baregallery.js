/*
	jQuery slider bare gallery plugin. 
	Version 0.5 alpha
	By Ian Hoar (http://www.ianhoar.com)
	TODO:
	Fix slider when custom size specified
	Fix and clean up full screen code
	Clean up code
	Add rewind false
	Add captionType title
	Teasers setup or removed
	Add documentation
	Add default skin
	Add more transitions
*/

(function($) {

	$.fn.baregallery = function(opts) {

		var gallery = $(this); // reference to this gallery

		// Set default options
		var defaults = {
			imageWidth			: '',
			imageHeight			: '',
			galleryWidth		: '',
			galleryHeight		: '',
			imageCount			: parseInt($('img', this).size()),
			imageNextPrev		: true, // image divided in half for Next and Previous clicks
			imageNext				: false,
			imagePrev				: false,
			imageCurrent		: 0, // this is also the start image
			fullScreen			: false,
			teasers					: false, // teaser, set id for teaser container
			captionType			: false, // title, class
			rewind					: false, // images can continually cycle or rewind at the end
			cycle						: true, // should images cycle automatically
			speed						: 600, // speed of transition
			cycleTime				: 4000, // time between transitions
			onHoverStop 		: true, // images stop cycling on hover
			pagerType 			: false, // false, dots, numbers
			transitionType	: 'slide' // slide, fade
		};

		// Get default options	
		var opts = $.extend(defaults, opts);
		
		function setImageDimensions() {
		
			// check if this is a full screen slider
			if(opts.fullScreen == true) {		
				$(gallery).css({
					'position' : 'fixed'
				});

				var w = $(window).width();
				var h = $(window).height();
		
				$(gallery).css({
					'width' : w,
					'height' : h
				});
				
				var ratio = $('img', gallery).height() / $('img', gallery).width();
				
				// Scale the image
				if ((h/w) > ratio){
				    $('f', gallery).height(h);
				    $('img', gallery).width(h / ratio);
				} else {
				    $('img', gallery).width(w);
				    $('img', gallery).height(w * ratio);
				}
				// Center the image
				if(opts.transitionType == 'fade') {
					$('img', gallery).css({'position' : 'absolute', 'left' : (w - $('img', gallery).width())/2});
					$('img', gallery).css({'position' : 'absolute', 'top' : (h - $('img', gallery).height())/2});
				}
			}
	
			else {
				opts.imageWidth == '' ? opts.imageWidth = $('img', gallery).width() : opts.imageWidth;
				opts.imageHeight == '' ? opts.imageHeight = $('img', gallery).height() : opts.imageHeight;
				opts.galleryWidth == '' ? opts.galleryWidth = opts.imageWidth : opts.galleryWidth;
				opts.galleryHeight == '' ? opts.galleryHeight = opts.imageHeight : opts.galleryHeight;
				if(opts.transitionType == 'fade') {
					$('img', gallery).css({'position' : 'absolute'}).hide();
					$('img', gallery).eq(0).show();
				}
			}
		}
		

		setImageDimensions();
		setCaptions();
		if(opts.pagerType) { pager(); }
		$(window).resize(function() {
			if(opts.fullScreen == true) { // if fullscreen setImageDimensions again on browser resize
				setImageDimensions();
			}
		});



		// create galleryWrapper div
		$(gallery).wrapInner('<div id="galleryWrapper"></div>');
		
		$(gallery).css({
			'position'	: 'relative',
			'overflow'	: 'hidden',
			'width' : opts.galleryWidth,
			'height' : opts.galleryHeight
		});	


		
		// set effects
	
		if(opts.transitionType == 'slide') {
			$('img', gallery).css({'float' : 'left'});
		} else {
			$('img', gallery).css({'float' : 'left'});
		}

		$(gallery).width(opts.galleryWidth);
		
		if(opts.transitionType == 'slide') {
			w = opts.imageWidth * opts.imageCount;
		} else {
			w = opts.imageWidth;
		}
		$('#galleryWrapper').width(w);
		
		return this.each(function() {
		
		// Image cycle
		if(opts.cycle == true){
			var refreshIntervalId = setInterval(nextImage, opts.cycleTime); // rotate images
			if(opts.onHoverStop == true) {
				$(gallery).hover(function () { // stop and resume rotate on rollover of main image. 
					clearInterval(refreshIntervalId);
				}, function () {
					refreshIntervalId = setInterval(nextImage, opts.cycleTime);
				});
			}
		}

		
		$('ul, li', this).css({
			'float' : 'left',
			'margin' : 0,
			'padding' : 0,
			'list-style' : 'none'
		});

		
		if(opts.imageNextPrev == true) {
			// Create Gallery Previous and next
				var galleryPrevious = '<div id="gallery-prev"></div>';
	   		var galleryNext = '<div id="gallery-next"></div>';
	   		$(gallery).append(galleryPrevious + galleryNext)
	   			
			// Postion Gallery Previous and Next
				
			$('#gallery-prev, #gallery-next', this).css({
				'position' : 'absolute',
				'zIndex' : 1,
				'height' : opts.galleryHeight,	
				'width' : (opts.imageWidth / 2), // prev and next take up half the image
				'cursor' : 'pointer'
				});
				
			$('#gallery-prev', this).css({
				'left' : 0
			});
			$('#gallery-next', this).css({
				'right' : 0
			});
		}
		// Hover actions
		if(opts.imageNext) {$('#gallery-next').hover(function() { $(this).addClass(opts.imageNext)},function() {$(this).removeClass(opts.imageNext)});}
		if(opts.imagePrev) {$('#gallery-prev').hover(function() { $(this).addClass(opts.imagePrev)},function() {$(this).removeClass(opts.imagePrev)});}
		// Clicks actions
		$('#gallery-prev', this).click(function() {prevImage();});
		$('#gallery-next', this).click(function() {nextImage();});
		$('#pager-prev').live('click', function() {prevImage();});
		$('#pager-next').live('click', function() {nextImage();});
		$('#pager .dot').live('click', function() {
			clearInterval(refreshIntervalId);
			var skipTo = $("#pager .dot").index(this);
			opts.imageLocation = opts.imageWidth*(skipTo+1)-opts.imageWidth;
			opts.imageCurrent = skipTo;
			refreshIntervalId = setInterval(nextImage, opts.cycleTime);
			transition();
		});
			
		$(window).keypress(function (event) {
			var keyCode = event.keyCode || event.which, 
				arrow = {left: 37, right: 39 };
				clearInterval(refreshIntervalId);
			switch (keyCode) {
				case arrow.left:
				prevImage();
			break;
				case arrow.right:
				nextImage();
			break;
			}
		});
	});

	function prevImage() {
		if(!$('div:first', gallery).is(':animated')) {
			opts.imageCurrent -= 1;
			if(opts.imageCurrent >= 0) {
				opts.imageLocation = opts.imageCurrent*opts.imageWidth;
			} else {
				opts.imageLocation = opts.imageWidth*opts.imageCount-opts.imageWidth;
				opts.imageCurrent = opts.imageCount-1;
			}
			transition(prev = 'prev');
		}
		if(opts.pager) {
			pager(true);
		}
	}
	function nextImage() {
			if(!$('div:first', gallery).is(':animated')) {
				opts.imageCurrent += 1;
				if(opts.imageCurrent < opts.imageCount) {
					opts.imageLocation = opts.imageCurrent*opts.imageWidth;
				} else {
					opts.imageLocation = 0;
					opts.imageCurrent = 0;
				}
				transition(next = 'next');
		}
	}
	function transition(action) {
		/*
		if(opts.transitionType == 'fade' && action == 'next') {
			$('img:last-child', gallery).stop(true, true).fadeOut(opts.speed, function(){ // wait for fadeout to complete before detach is preformed.
					$('img:last-child', gallery).detach().prependTo('#galleryWrapper', gallery);
					$('img', gallery).show();
			});
			if(opts.captionType != false) {
				setCaptions();
			}
		} else if(opts.transitionType == 'fade' && action == 'prev') {
			if(opts.transitionType == 'fade') {
				$('img:first-child', gallery).hide().detach().appendTo('#galleryWrapper', gallery);
				$('img:last-child', gallery).stop(true, true).fadeIn(opts.speed);
			}
		} */
		
		if(opts.transitionType == 'fade') {

			$('img', gallery).stop(true, true).fadeOut(opts.speed);
			$('img', gallery).eq(opts.imageCurrent).stop(true, true).fadeIn(opts.speed);
				

		} else {
			$('div:first', gallery).stop(true, false).animate({marginLeft:-opts.imageLocation}, opts.speed);
			if(opts.teasers != false) {
				$(opts.teasers).removeClass('active');
				$(opts.teasers).eq(opts.imageCurrent).addClass('active');
			}
		}
		if(opts.captionType != false) {
			setCaptions();
		}
		pager();
	}

	function setCaptions() {
		if(opts.captionType.charAt(0) == '.') {
			$(opts.captionType).css({
				'position' : 'absolute'
			});
			
			$(opts.captionType).fadeOut();
			$(opts.captionType).eq(opts.imageCurrent).stop(true, true).fadeIn();
		}
	}

	function pager() {
		$('#pager-dots, #pager-next, #pager-prev').remove();
		i=0;
		var pager = '<div id="pager-prev"></div><div id="pager-dots">';
			while(i < opts.imageCount) { // build pager
				if(i == opts.imageCurrent) {
					pager = pager + '<div class="dot active">'+(opts.pagerType == 'numbers' ? i+1 : "")+'<\/div>';
				} else {
					pager = pager + '<div class="dot">'+(opts.pagerType == 'numbers' ? i+1 : "")+'<\/div>';
				}
				i++;
			}
		pager = pager + '<\/div><div id="pager-next"></div>';
		$(opts.pagerType).append(pager);
	}


}
})(jQuery);