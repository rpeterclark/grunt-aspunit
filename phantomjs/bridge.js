(function(){
	'use strict';

	// Send messages to the parent PhantomJS process via alert! Good times!!
	function sendMessage() {
		var args = [].slice.call(arguments);
		alert(JSON.stringify(args));
	}

	// These methods connect ASPUnit to PhantomJS

	ASPUnit.onStart(function() {
		sendMessage('aspunit.start');
	});

	ASPUnit.onPageStart(function(details) {
		sendMessage('aspunit.pageStart', details);
	});

	ASPUnit.onPageSuccess(function(details) {
		sendMessage('aspunit.pageSuccess', details);
	});

	ASPUnit.onPageFail(function(details) {
		sendMessage('aspunit.pageFail', details);
	});

	ASPUnit.onPageFinish(function(details) {
		sendMessage('aspunit.pageFinish', details);
	});

	ASPUnit.onFinish(function() {
		sendMessage('aspunit.finish');
	});
}());