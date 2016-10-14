(function() {
    'use strict';

    angular
        .module('app.details')
        .controller('Details', Details);


    /* @ngInject */
    function Details($state,logger,routerHelper,common,config,DetailsService,beerboardservice,$rootScope) {
        var vm = this;
        vm.details= [];
        vm.title = "Details";
        vm.backbutton = true;
        activate();



        //logger function starts here

        function activate() {
              return getDetails().then(function() {
                //logger.info('Activated Details View');
            });
           
        }
        //logger function ends here
        
        //API call starts here

    function getDetails() {
             return  beerboardservice.getMenus({Id:$state.params.id,locationId : bb_config.locationId,bar_id : bb_config.bar_id,product_type : bb_config.product_type}).then(function(data) {

                /*Storing the primary,secondary font and color in localstorage starts here*/
                $rootScope.primaryfont = localStorage.primaryfont;
                $rootScope.secondaryfont = localStorage.secondaryfont;
                $rootScope.primaryColour = localStorage.primaryColour;
                $rootScope.secondaryColour = localStorage.secondaryColour;
                $rootScope.tempLogo =  localStorage.tempLogo;
                $rootScope.majorStyleFont =  localStorage.majorStyleFont ;
                $rootScope.beerNameFont = localStorage.beerNameFont;
                $rootScope.descriptionFont = localStorage.descriptionFont;
                $rootScope.nutritionFont = localStorage.nutritionFont;
                /*Storing the primary,secondary font and color in localstorage ends here*/
                vm.beerDetails = data.beerDetails;
                _.each(vm.beerDetails,function(result){
                    if(result.beerDetail.id == $state.params.id){
                        vm.details = result.beerDetail;
                    }
                    
                })
                return vm.details;
            });
        }
        common.$broadcast(config.events.viewLoaded, { backbutton: true });
    }
})();



