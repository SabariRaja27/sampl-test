(function() {
    'use strict';
    angular
        .module('blocks.underscore')
        .factory('_', function() {
		return window._; // assumes underscore has already been loaded on the page
	});

}());
