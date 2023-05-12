"use strict";

(function () {
	/**
	 * Global variables
	 */

	var userAgent = navigator.userAgent.toLowerCase(),
		initialDate = new Date(),

		$window = $(window),
		$document = $(document),
		$html = $('html'),
		$body = $("body"),

		isDesktop = $html.hasClass("desktop"),
		isIE = userAgent.indexOf("msie") != -1 ? parseInt(userAgent.split("msie")[1], 10) : userAgent.indexOf("trident") != -1 ? 11 : userAgent.indexOf("edge") != -1 ? 12 : false,
		isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
		windowReady = false,
		isNoviBuilder = false,
		livedemo = false,
		
		plugins = {
			bootstrapTooltip: $("[data-toggle='tooltip']"),
			copyrightYear: $(".copyright-year"),
			rdNavbar: $('.rd-navbar'),
			swiperSlider: $(".swiper-slider"),
			tooltipCustom: $('[data-toggle="tooltip"]'),
			owl: $('.owl-carousel'),
			preloader:               $( '.preloader' ),
			regula: $("[data-constraints]"),
			counter:                 document.querySelectorAll( '.counter' ),
			progressLinear:          document.querySelectorAll( '.progress-linear' ),
		};

	/**
	 * @desc Check the element was been scrolled into the view
	 * @param {object} elem - jQuery object
	 * @return {boolean}
	 */
	function isScrolledIntoView ( elem ) {
		if ( isNoviBuilder ) return true;
		return elem.offset().top + elem.outerHeight() >= $window.scrollTop() && elem.offset().top <= $window.scrollTop() + $window.height();
	}
	
	$window.on( 'load', function () {

		// Page loader & Page transition
		if (plugins.preloader.length && !isNoviBuilder) {
			pageTransition({
				target: document.querySelector( '.page' ),
				delay: 0,
				duration: 500,
				classIn: 'fadeIn',
				classOut: 'fadeOut',
				classActive: 'animated',
				conditions: function (event, link) {
					return link && !/(\#|javascript:void\(0\)|callto:|tel:|mailto:|:\/\/)/.test(link) && !event.currentTarget.hasAttribute('data-lightgallery');
				},
				onTransitionStart: function ( options ) {
					setTimeout( function () {
						plugins.preloader.removeClass('loaded');
					}, options.duration * .75 );
				},
				onReady: function () {
					plugins.preloader.addClass('loaded');
					windowReady = true;
				}
			});
		}
		
		// Counter
		if ( plugins.counter ) {
			for ( var i = 0.00; i < plugins.counter.length; i++ ) {
				var
					node = plugins.counter[i],
					counter = aCounter({
						node: node,
						duration: node.getAttribute( 'data-duration' ) || 1000
					}),
					scrollHandler = (function() {
						if ( Util.inViewport( this ) && !this.classList.contains( 'animated-first' ) ) {
							this.counter.run();
							this.classList.add( 'animated-first' );
						}
					}).bind( node ),
					blurHandler = (function() {
						this.counter.params.to = parseInt( this.textContent, 10 );
						this.counter.run();
					}).bind( node );

				scrollHandler();
				window.addEventListener( 'scroll', scrollHandler );
				node.addEventListener( 'blur', blurHandler );
			}
		}

		// Progress Bar
		if ( plugins.progressLinear ) {
			for ( var i = 0.00; i < plugins.progressLinear.length; i++ ) {
				var
					container = plugins.progressLinear[i],
					counter = aCounter({
						node: container.querySelector( '.progress-linear-counter' ),
						duration: container.getAttribute( 'data-duration' ) || 1000,
						onStart: function() {
							this.custom.bar.style.width = this.params.to + '%';
						}
					});

				counter.custom = {
					container: container,
					bar: container.querySelector( '.progress-linear-bar' ),
					onScroll: (function() {
						if ( Util.inViewport( this.custom.container ) && !this.custom.container.classList.contains( 'animated' ) ) {
							this.run();
							this.custom.container.classList.add( 'animated' );
						}
					}).bind( counter ),
					onBlur: (function() {
						this.params.to = parseInt( this.params.node.textContent, 10 );
						this.run();
					}).bind( counter )
				};

				counter.custom.onScroll();
				window.addEventListener( 'scroll', counter.custom.onScroll );
				counter.params.node.addEventListener( 'blur', counter.custom.onBlur );
			}
		}
	});

	$document.ready(function () {
		isNoviBuilder = window.xMode;
		
		/**
		 * @desc Sets the actual previous index based on the position of the slide in the markup. Should be the most recent action.
		 * @param {object} swiper - swiper instance
		 */
		function setRealPrevious( swiper ) {
			var element = swiper.$wrapperEl[0].children[ swiper.activeIndex ];
			swiper.realPrevious = Array.prototype.indexOf.call( element.parentNode.children, element );
		}

		/**
		 * @desc Animate captions on active slides
		 * @param {object} swiper - swiper instance
		 */
		function initCaptionAnimate( swiper ) {
			var
				animate = function ( caption ) {
					return function() {
						var duration;
						if ( duration = caption.getAttribute( 'data-caption-duration' ) ) caption.style.animationDuration = duration +'ms';
						caption.classList.remove( 'not-animated' );
						caption.classList.add( caption.getAttribute( 'data-caption-animate' ) );
						caption.classList.add( 'animated' );
					};
				},
				initializeAnimation = function ( captions ) {
					for ( var i = 0; i < captions.length; i++ ) {
						var caption = captions[i];
						caption.classList.remove( 'animated' );
						caption.classList.remove( caption.getAttribute( 'data-caption-animate' ) );
						caption.classList.add( 'not-animated' );
					}
				},
				finalizeAnimation = function ( captions ) {
					for ( var i = 0; i < captions.length; i++ ) {
						var caption = captions[i];
						if ( caption.getAttribute( 'data-caption-delay' ) ) {
							setTimeout( animate( caption ), Number( caption.getAttribute( 'data-caption-delay' ) ) );
						} else {
							animate( caption )();
						}
					}
				};

			// Caption parameters
			swiper.params.caption = {
				animationEvent: 'slideChangeTransitionEnd'
			};

			initializeAnimation( swiper.$wrapperEl[0].querySelectorAll( '[data-caption-animate]' ) );
			finalizeAnimation( swiper.$wrapperEl[0].children[ swiper.activeIndex ].querySelectorAll( '[data-caption-animate]' ) );

			if ( swiper.params.caption.animationEvent === 'slideChangeTransitionEnd' ) {
				swiper.on( swiper.params.caption.animationEvent, function() {
					initializeAnimation( swiper.$wrapperEl[0].children[ swiper.previousIndex ].querySelectorAll( '[data-caption-animate]' ) );
					finalizeAnimation( swiper.$wrapperEl[0].children[ swiper.activeIndex ].querySelectorAll( '[data-caption-animate]' ) );
				});
			} else {
				swiper.on( 'slideChangeTransitionEnd', function() {
					initializeAnimation( swiper.$wrapperEl[0].children[ swiper.previousIndex ].querySelectorAll( '[data-caption-animate]' ) );
				});

				swiper.on( swiper.params.caption.animationEvent, function() {
					finalizeAnimation( swiper.$wrapperEl[0].children[ swiper.activeIndex ].querySelectorAll( '[data-caption-animate]' ) );
				});
			}
		}

		/**
		 * @desc Initialize owl carousel plugin
		 * @param {object} c - carousel jQuery object
		 */
		function initOwlCarousel(c) {
			var aliaces = ["-", "-sm-", "-md-", "-lg-", "-xl-", "-xxl-"],
				values = [0, 576, 768, 992, 1200, 1600],
				responsive = {};

			for (var j = 0; j < values.length; j++) {
				responsive[values[j]] = {};
				for (var k = j; k >= -1; k--) {
					if (!responsive[values[j]]["items"] && c.attr("data" + aliaces[k] + "items")) {
						responsive[values[j]]["items"] = k < 0 ? 1 : parseInt(c.attr("data" + aliaces[k] + "items"), 10);
					}
					if (!responsive[values[j]]["stagePadding"] && responsive[values[j]]["stagePadding"] !== 0 && c.attr("data" + aliaces[k] + "stage-padding")) {
						responsive[values[j]]["stagePadding"] = k < 0 ? 0 : parseInt(c.attr("data" + aliaces[k] + "stage-padding"), 10);
					}
					if (!responsive[values[j]]["margin"] && responsive[values[j]]["margin"] !== 0 && c.attr("data" + aliaces[k] + "margin")) {
						responsive[values[j]]["margin"] = k < 0 ? 30 : parseInt(c.attr("data" + aliaces[k] + "margin"), 10);
					}
				}
			}

			// Enable custom pagination
			if (c.attr('data-dots-custom')) {
				c.on("initialized.owl.carousel", function (event) {
					var carousel = $(event.currentTarget),
						customPag = $(carousel.attr("data-dots-custom")),
						active = 0;

					if (carousel.attr('data-active')) {
						active = parseInt(carousel.attr('data-active'), 10);
					}

					carousel.trigger('to.owl.carousel', [active, 300, true]);
					customPag.find("[data-owl-item='" + active + "']").addClass("active");

					customPag.find("[data-owl-item]").on('click', function (e) {
						e.preventDefault();
						carousel.trigger('to.owl.carousel', [parseInt(this.getAttribute("data-owl-item"), 10), 300, true]);
					});

					carousel.on("translate.owl.carousel", function (event) {
						customPag.find(".active").removeClass("active");
						customPag.find("[data-owl-item='" + event.item.index + "']").addClass("active")
					});
				});
			}
			
			c.owlCarousel({
				autoplay: isNoviBuilder ? false : c.attr("data-autoplay") === "true",
				loop: isNoviBuilder ? false : c.attr("data-loop") !== "false",
				items: 1,
				center: c.attr("data-center") === "true",
				dotsContainer: c.attr("data-pagination-class") || false,
				navContainer: c.attr("data-navigation-class") || false,
				mouseDrag: isNoviBuilder ? false : c.attr("data-mouse-drag") !== "false",
				nav: c.attr("data-nav") === "true",
				dots: c.attr("data-dots") === "true",
				dotsEach: c.attr("data-dots-each") ? parseInt(c.attr("data-dots-each"), 10) : false,
				animateIn: c.attr('data-animation-in') ? c.attr('data-animation-in') : false,
				animateOut: c.attr('data-animation-out') ? c.attr('data-animation-out') : false,
				responsive: responsive,
				navText: c.attr("data-nav-text") ? $.parseJSON(c.attr("data-nav-text")) : [],
				navClass: c.attr("data-nav-class") ? $.parseJSON(c.attr("data-nav-class")) : ['owl-prev', 'owl-next']
			});
		}

		/**
		 * @desc Initialize Bootstrap tooltip with required placement
		 * @param {string} tooltipPlacement
		 */
		function initBootstrapTooltip(tooltipPlacement) {
			plugins.bootstrapTooltip.tooltip('dispose');

			if (window.innerWidth < 576) {
				plugins.bootstrapTooltip.tooltip({placement: 'bottom'});
			} else {
				plugins.bootstrapTooltip.tooltip({placement: tooltipPlacement});
			}
		}

		// attachFormValidator
		function attachFormValidator(elements) {
			for (var i = 0; i < elements.length; i++) {
				var o = $(elements[i]), v;
				o.addClass("form-control-has-validation").after("<span class='form-validation'></span>");
				v = o.parent().find(".form-validation");
				if (v.is(":last-child")) {
					o.addClass("form-control-last-child");
				}
			}

			elements
				.on('input change propertychange blur', function (e) {
					var $this = $(this), results;

					if (e.type != "blur") {
						if (!$this.parent().hasClass("has-error")) {
							return;
						}
					}

					if ($this.parents('.rd-mailform').hasClass('success')) {
						return;
					}

					if ((results = $this.regula('validate')).length) {
						for (i = 0; i < results.length; i++) {
							$this.siblings(".form-validation").text(results[i].message).parent().addClass("has-error")
						}
					} else {
						$this.siblings(".form-validation").text("").parent().removeClass("has-error")
					}
				})
				.regula('bind');

			var regularConstraintsMessages = [
				{
					type: regula.Constraint.Required,
					newMessage: "The text field is required."
				},
				{
					type: regula.Constraint.Email,
					newMessage: "The email is not a valid email."
				},
				{
					type: regula.Constraint.Numeric,
					newMessage: "Only numbers are required"
				},
				{
					type: regula.Constraint.Selected,
					newMessage: "Please choose an option."
				}
			];


			for (var i = 0; i < regularConstraintsMessages.length; i++) {
				var regularConstraint = regularConstraintsMessages[i];

				regula.override({
					constraintType: regularConstraint.type,
					defaultMessage: regularConstraint.newMessage
				});
			}
		}
		
		/**
		 * @module       Copyright
		 * @description  Evaluates the copyright year
		 */
		if (plugins.copyrightYear.length) {
			plugins.copyrightYear.text(initialDate.getFullYear());
		}

		/**
		 * IE Polyfills
		 * @description  Adds some loosing functionality to IE browsers
		 */
		if (isIE) {
			if (isIE < 10) {
				$html.addClass("lt-ie10");
			}

			if (isIE < 11) {
				if (plugins.pointerEvents) {
					$.getScript(plugins.pointerEvents)
						.done(function () {
							$html.addClass("lt-ie11");
							PointerEventsPolyfill.initialize({});
						});
				}
			}

			if (isIE === 11) {
				$("html").addClass("ie-11");
			}

			if (isIE === 12) {
				$("html").addClass("ie-edge");
			}
		}

		/**
		 * @module       WOW Animation
		 * @description  Enables scroll animation on the page
		 */
		if (!isNoviBuilder && isDesktop && $html.hasClass("wow-animation") && $(".wow").length) {
			new WOW().init();
		}

		/**
		 * @module       ToTop
		 * @description  Enables ToTop Plugin
		 */
		if (!isNoviBuilder && isDesktop) {
			$().UItoTop({
				easingType: 'easeOutQuart',
				containerClass: 'ui-to-top fa fa-angle-up'
			});
		}

		/**
		 * @module       RD Navbar
		 * @description  Enables RD Navbar Plugin
		 */
		if (plugins.rdNavbar.length) {
			var aliaces, i, j, len, value, values, responsiveNavbar;

			aliaces = ["-", "-sm-", "-md-", "-lg-", "-xl-", "-xxl-"];
			values = [0, 576, 768, 992, 1200, 1600];
			responsiveNavbar = {};

			for (i = j = 0, len = values.length; j < len; i = ++j) {
				value = values[i];
				if (!responsiveNavbar[values[i]]) {
					responsiveNavbar[values[i]] = {};
				}
				if (plugins.rdNavbar.attr('data' + aliaces[i] + 'layout')) {
					responsiveNavbar[values[i]].layout = plugins.rdNavbar.attr('data' + aliaces[i] + 'layout');
				}
				if (plugins.rdNavbar.attr('data' + aliaces[i] + 'device-layout')) {
					responsiveNavbar[values[i]]['deviceLayout'] = plugins.rdNavbar.attr('data' + aliaces[i] + 'device-layout');
				}
				if (plugins.rdNavbar.attr('data' + aliaces[i] + 'hover-on')) {
					responsiveNavbar[values[i]]['focusOnHover'] = plugins.rdNavbar.attr('data' + aliaces[i] + 'hover-on') === 'true';
				}
				if (plugins.rdNavbar.attr('data' + aliaces[i] + 'auto-height')) {
					responsiveNavbar[values[i]]['autoHeight'] = plugins.rdNavbar.attr('data' + aliaces[i] + 'auto-height') === 'true';
				}

				if (isNoviBuilder) {
					responsiveNavbar[values[i]]['stickUp'] = false;
				} else if (plugins.rdNavbar.attr('data' + aliaces[i] + 'stick-up')) {
					responsiveNavbar[values[i]]['stickUp'] = plugins.rdNavbar.attr('data' + aliaces[i] + 'stick-up') === 'true';
				}

				if (plugins.rdNavbar.attr('data' + aliaces[i] + 'stick-up-offset')) {
					responsiveNavbar[values[i]]['stickUpOffset'] = plugins.rdNavbar.attr('data' + aliaces[i] + 'stick-up-offset');
				}
			}


			plugins.rdNavbar.RDNavbar({
				anchorNav: !isNoviBuilder,
				stickUpClone: (plugins.rdNavbar.attr("data-stick-up-clone") && !isNoviBuilder) ? plugins.rdNavbar.attr("data-stick-up-clone") === 'true' : false,
				responsive: responsiveNavbar,
				callbacks: {
					onStuck: function () {
						var navbarSearch = this.$element.find('.rd-search input');

						if (navbarSearch) {
							navbarSearch.val('').trigger('propertychange');
						}
					},
					onDropdownOver: function () {
						return !isNoviBuilder;
					},
					onUnstuck: function () {
						if (this.$clone === null)
							return;

						var navbarSearch = this.$clone.find('.rd-search input');

						if (navbarSearch) {
							navbarSearch.val('').trigger('propertychange');
							navbarSearch.trigger('blur');
						}

					}
				}
			});


			if (plugins.rdNavbar.attr("data-body-class")) {
				document.body.className += ' ' + plugins.rdNavbar.attr("data-body-class");
			}
		}

		/**
		 * @module       Swiper Slider
		 * @description  Enables Swiper Plugin
		 */
		// Swiper
		if ( plugins.swiperSlider ) {
			for ( var i = 0; i < plugins.swiperSlider.length; i++ ) {
				var
					sliderMarkup = plugins.swiperSlider[i],
					swiper,
					options = {
						loop: sliderMarkup.getAttribute( 'data-loop' ) === 'true' || false,
						effect: sliderMarkup.getAttribute( 'data-effect' ) || 'fade',
						direction: sliderMarkup.getAttribute( 'data-direction' ) || 'horizontal',
						speed: sliderMarkup.getAttribute( 'data-speed' ) ? Number( sliderMarkup.getAttribute( 'data-speed' ) ) : 1000,
						allowTouchMove: false,
						preventIntercationOnTransition: true,
						runCallbacksOnInit: false,
						separateCaptions: sliderMarkup.getAttribute( 'data-separate-captions' ) === 'true' || false
					};

				$(sliderMarkup).find(".swiper-slide")
					.each(function () {
						var $this = $(this),
							url;
						if (url = $this.attr("data-slide-bg")) {
							$this.css({
								"background-image": "url(" + url + ")",
								"background-size": "cover"
							})
						}
					});

				if ( sliderMarkup.getAttribute( 'data-autoplay' ) ) {
					options.autoplay = {
						delay: Number( sliderMarkup.getAttribute( 'data-autoplay' ) ) || 3000,
						stopOnLastSlide: false,
						disableOnInteraction: true,
						reverseDirection: false,
					};
				}

				if ( sliderMarkup.getAttribute( 'data-keyboard' ) === 'true' ) {
					options.keyboard = {
						enabled: sliderMarkup.getAttribute( 'data-keyboard' ) === 'true',
						onlyInViewport: true
					};
				}

				if ( sliderMarkup.getAttribute( 'data-mousewheel' ) === 'true' ) {
					options.mousewheel = {
						releaseOnEdges: true,
						sensitivity: .1
					};
				}

				if ( sliderMarkup.querySelector( '.swiper-button-next, .swiper-button-prev' ) ) {
					options.navigation = {
						nextEl: '.swiper-button-next',
						prevEl: '.swiper-button-prev'
					};
				}

				if ( sliderMarkup.querySelector( '.swiper-pagination' ) ) {
					options.pagination = {
						el: '.swiper-pagination',
						type: 'bullets',
						clickable: true
					};
				}

				if ( sliderMarkup.querySelector( '.swiper-scrollbar' ) ) {
					options.scrollbar = {
						el: '.swiper-scrollbar',
						hide: true,
						draggable: true
					};
				}

				options.on = {
					init: function () {
						setRealPrevious( this );
						switch( options.effect ) {

						}
						initCaptionAnimate( this );

						// Real Previous Index must be set recent
						this.on( 'slideChangeTransitionEnd', function () {
							setRealPrevious( this );
						});
					}
				};

				swiper = new Swiper ( plugins.swiperSlider[i], options );
			}
		}
		
		// Bootstrap Tooltips
		if (plugins.bootstrapTooltip.length) {
			var tooltipPlacement = plugins.bootstrapTooltip.attr('data-placement');
			initBootstrapTooltip(tooltipPlacement);

			$window.on('resize orientationchange', function () {
				initBootstrapTooltip(tooltipPlacement);
			})
		}

		// Owl carousel
		if (plugins.owl.length) {
			for (var i = 0; i < plugins.owl.length; i++) {
				var c = $(plugins.owl[i]);
				plugins.owl[i].owl = c;

				initOwlCarousel(c);
			}
		}

		// RD Input Label
		if (plugins.rdInputLabel.length) {
			plugins.rdInputLabel.RDInputLabel();
		}

		// Regula
		if (plugins.regula.length) {
			attachFormValidator(plugins.regula);
		}
	});

	myID = document.getElementById("day2");

	var myScrollFunc = function() {
  		var y = window.scrollY;
  		if (y >= 800) {
    		myID.className = "cta show"
  		} 
		
		else {
    		myID.className = "cta hide"
  		}
	};

	window.addEventListener("scroll", myScrollFunc);
} 
	
}());
