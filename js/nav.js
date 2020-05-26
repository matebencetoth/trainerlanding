$(function () {
			
	$("[data-action='totop']").click(function(){$('html, body').animate({scrollTop : 0},'slow');return false;});

	//nav popup
	$("[data-action='nav-button']").click(function() {
		$(this).toggleClass('active');
		$("[data-name='nav-popup']").toggleClass('open');
	});
	
	$(document).click(function(e) {
		if (!$(e.target).parents().addBack().is("[data-action='nav-button']")) {
			$("[data-name='nav-popup']").removeClass('open');
			$("[data-action='nav-button']").removeClass('active');
		}
	});
	
	$("[data-name='nav-popup']").click(function(e) {
		e.stopPropagation();
	});
	
});