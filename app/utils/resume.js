//Borrowed from http://stackoverflow.com/questions/13798516/javascript-event-for-mobile-browser-re-launch-or-device-wake

var $window = $(window);
$window.__INACTIVITY_THRESHOLD = 60000;
$window.add(document.body);

var declare = function() {
	$window.__lastEvent = new Date();
}

$window.blur(declare);
$window.focus(function() {
	var diff = (new Date()) - $window.__lastEvent;
	if (diff > $window.__INACTIVITY_THRESHOLD) {
		$window.trigger("resume");
	}
});
