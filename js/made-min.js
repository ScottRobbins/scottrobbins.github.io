!function(l){"use strict";var e=l("body").attr("data-page-url"),o=document.title,n=window.History;function t(){l(".page__content").find(".hero__image").imagesLoaded({background:!0},function(){l(".portfolio-wrap").imagesLoaded(function(){l(".portfolio-wrap").masonry({itemSelector:".portfolio-item",transitionDuration:0})}),l(".blog-wrap").imagesLoaded(function(){l(".blog-wrap").masonry({itemSelector:".blog-post",transitionDuration:0})}),l("body").removeClass("loading"),l("body").removeClass("menu--open")}),l(".active-link").removeClass("active-link"),l('a[href="'+e+'"]').addClass("active-link"),Waypoint.destroyAll();var o=0;l(".gallery").each(function(){var t=l(this),a="gallery-"+ ++o;t.attr("id",a);var e=t.attr("data-columns");t.append('<div class="gallery__wrap"></div>'),t.children("img").each(function(){l(this).appendTo("#"+a+" .gallery__wrap")}),t.find(".gallery__wrap img").each(function(){var a=l(this).attr("src");l(this).wrapAll('<div class="gallery__item"><a href="'+a+'" class="gallery__item__link"></div></div>').appendTo()}),t.imagesLoaded(function(){if("1"===e){t.addClass("gallery--carousel"),t.children(".gallery__wrap").addClass("owl-carousel"),t.children(".gallery__wrap").owlCarousel({items:1,loop:!0,mouseDrag:!1,touchDrag:!0,pullDrag:!1,dots:!0,autoplay:!1,autoplayTimeout:6e3,autoHeight:!0,animateOut:"fadeOut"});new Waypoint({element:document.getElementById(a),handler:function(a){"down"===a&&t.children(".gallery__wrap").trigger("stop.owl.autoplay"),"up"===a&&t.children(".gallery__wrap").trigger("play.owl.autoplay")},offset:"-100%"}),new Waypoint({element:document.getElementById(a),handler:function(a){"down"===a&&t.children(".gallery__wrap").trigger("play.owl.autoplay"),"up"===a&&t.children(".gallery__wrap").trigger("stop.owl.autoplay")},offset:"100%"})}else t.addClass("gallery--grid"),t.children(".gallery__wrap").masonry({itemSelector:".gallery__item",transitionDuration:0}),t.find(".gallery__item__link").fluidbox({loader:!0});t.addClass("gallery--on")})}),l(".project__images").each(function(){var a=l(this);a.imagesLoaded(function(){a.owlCarousel({items:1,touchDrag:!0,dots:!0,autoHeight:!0,margin:20})})}),l(".post__content p > img").each(function(){var a=l(this).parent("p");l(this).insertAfter(a),l(this).wrapAll('<div class="image-wrap"></div>'),a.remove()}),l(".post__content iframe").each(function(){if(0<=l(this).attr("src").indexOf("youtube")||0<=l(this).attr("src").indexOf("vimeo")){var a=l(this).attr("width"),t=l(this).attr("height")/a*100;l(this).wrapAll('<div class="video" style="padding-bottom:'+t+'%;"></div>')}})}n.Adapter.bind(window,"statechange",function(){var a=n.getState();l("body").addClass("loading"),l(".page-loader").load(a.hash+" .page__content",function(){l("body, html").animate({scrollTop:0},300);setTimeout(function(){l(".page .page__content").remove(),l(".page-loader .page__content").appendTo(".page"),l("body").attr("data-page-url",window.location.pathname),e=l("body").attr("data-page-url"),o=l(".page__content").attr("data-page-title"),document.title=o,t()},400)})}),l("body").hasClass("ajax-loading")&&l(document).on("click","a",function(a){var t=l(this).attr("href");l(this).hasClass("js-no-ajax")?(a.preventDefault(),window.location=t):l(this).hasClass("js-contact")?a.preventDefault():l(this).hasClass("js-signup")?(a.preventDefault(),l(".modal--signup").addClass("modal--on")):l(this).is(".gallery__item__link")?a.preventDefault():0<=t.indexOf("http")?(a.preventDefault(),window.open(t,"_blank")):(e=t,n.pushState(null,o,t))}),l(document).on("click",".js-contact",function(a){a.preventDefault(),l("body").removeClass("menu--open"),l(".contact").addClass("visible"),l(".page").addClass("locked"),l("body").addClass("locked"),l(".button--close-modal").on("click",function(){l(".contact").removeClass("visible"),l(".page").removeClass("locked"),l("body").removeClass("locked")})}),t(),l(document).on("click",".js-menu-toggle",function(){l("body").hasClass("menu--open")?l("body").removeClass("menu--open"):l("body").addClass("menu--open")}),l(document).on("click",".menu__list__item__link",function(){l(".menu").hasClass("menu--open")&&l(".menu").removeClass("menu--open")}),l(document).on("click",".post",function(){var a=l(this).find(".post__title a").attr("href");l("body").hasClass("ajax-loading")?(e=a,n.pushState(null,o,a)):window.location=a}),l(document).on("submit","#contact-form",function(a){l(".contact-form__item--error").removeClass("contact-form__item--error");var t=l('.contact-form__input[name="email"]'),e=l('.contact-form__input[name="name"]'),o=l('.contact-form__textarea[name="message"]'),n=l(".contact-form__gotcha");""===t.val()&&t.closest(".contact-form__item").addClass("contact-form__item--error"),""===e.val()&&e.closest(".contact-form__item").addClass("contact-form__item--error"),""===o.val()&&o.closest(".contact-form__item").addClass("contact-form__item--error"),""!==t.val()&&""!==e.val()&&""!==o.val()&&0===n.val().length||a.preventDefault()})}(jQuery);