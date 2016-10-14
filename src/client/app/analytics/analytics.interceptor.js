(function() {
    'use strict';

    angular
        .module('app.analytics')
        .factory('analyticsInterceptor', analyticsInterceptor);
    
    /* @ngInject */
    analyticsInterceptor.$inject = ['logger', 'common','config','$injector','$q','beerboard'];
    function analyticsInterceptor(logger,common,config,$injector,$q,beerboard) {

      
        var awsPostStorage=false;
     
        return {
		'request': function (config) {
            
			return config;
		},
        'response': function (response) {            
            
            
           if(response.config.skipIntercept){
             return response;
            }            
          
            if(response.config.url.indexOf(".html")< 0){
                    var deferred = $q.defer();//promise
                    var request={};
                    var date = new Date();
                    request.CreatedAt = date.toUTCString(); 
                    request.LocationId = bb_config.locationId;
                    request.TemplateId = bb_config.templateId; 
                    var req = JSON.stringify(request);
                    $injector.get('$http')({
                        method: 'POST',
                        url: bb_config.awsApiHost + 'hits',
                        data: {"analytics" : req}, //toto pass actual object with location id and template id.
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json'},
                        skipIntercept: true,
                        timeout: deferred.promise
                    }).then(function(response){                
                        return response;
                    })
                    .catch(function(){
                       return $q.reject("Failure");
                    }); 
              
                
            }
			return response || $q.when(response);
           
		}
    }
}})();



