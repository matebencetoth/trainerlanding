
$("a[href^='#']").on('click', function (event) {
            event.preventDefault();
            var hash = this.hash;
			//$(this).addClass('current');
            $('html, body').animate({
                    scrollTop: $(hash).offset().top - 100
                }, 800);
});




ScrollReveal().reveal(".feature > li > img,.headline__feature > div > span",{duration:600,distance:"40px",easing:"cubic-bezier(0.5, -0.01, 0, 1.005)",interval:100,origin:"bottom",viewFactor:.5})
ScrollReveal().reveal(".feature > li > div > h3,.feature > li > div > p,.headline__title > h1,.headline__title > h5",{duration:1000,distance:"40px",easing:"cubic-bezier(0.5, -0.01, 0, 1.005)",origin:"bottom",interval:150})






window.isMobile = false;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) { window.isMobile = true; }

jQuery(function($) {
	if (!window.isMobile) {
		$(".background.youtube").mb_YTPlayer();
	}
});



$('.videos').owlCarousel({
        items:1,
        merge:true,
        loop:true,
        margin:0,
		videoWidth:560,
		videoHeight:315,
        video:true,
        lazyLoad:true,
        center:true,
        responsive:{
            480:{
                items:1
            },
            768:{
                items:1
            }
        }
    })


$('.team,.pricing').owlCarousel({loop:false,nav:false,responsive:{0:{items:1,margin:50},600:{items:2,margin:40},1000:{items:3,margin:80}}});