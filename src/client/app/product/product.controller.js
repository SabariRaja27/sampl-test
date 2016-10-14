(function() {
    'use strict';

    angular
        .module('app.product',['indexedDB'])
        .controller('Product', Product);
        
    /* @ngInject */
    function Product($state, routerHelper,logger,common,config,ProductService,beerboardservice,beerboard,_,$sce,$rootScope,$scope,$timeout,$document,$window) {    
      
        var vm = this;
        //$scope.product = product;
        vm.products = [];
        vm.imageContext = bb_config.imageContext;
        vm.draftBeers = [];
        vm.videoAssets = [];
        vm.imageAssets = [];
        vm.typeSequences=[];
        vm.assets=[];
        vm.allAssets=[];
        vm.locationPromotions = [];
        vm.title = 'Products';
        vm.backbutton = false;
        vm.locationId = bb_config.locationId;
        $rootScope.promotions=false;
        $rootScope.promoVisiblity = {};
        vm.timer=null;    
        vm.timerForChanges=null;         
        vm.runningTypeSequence =0;
        vm.runningAssetSequence=0;
        $rootScope.beerListIndex=1;
        $rootScope.slideLength=0;
        $rootScope.slideMaxBeerList=0;
        $rootScope.runSlider=true;
        var isLastAsset = false;
        var timeDelay =0;
        $rootScope.initialBeerList=[];
        $rootScope.currentBeerList=[];
        $rootScope.locationSpecils =false;
        $rootScope.isBeerDataChanged = false;
        $rootScope.comparedBeerData = false;
        var j = 0;
        vm.marketingBeerList=[];
        vm.runningMarketBeerListSequence=0;
        $rootScope.showMarketingBeerItem=false;
        $rootScope.indexedBlobUrl = [];
        $rootScope.indexedAssetUrl = [];
        $rootScope.isIframe = false;
        $rootScope.isIpad = true;
        $rootScope.displayGlass = true;
        $scope.sequenceTypeArray = [];
        vm.uniqueTypeSeq = [];
        vm.isSequenceDataAvailable = true;
        $scope.isBeerListLoaded = false;
        $scope.totalAssestsLength = 0;
        $scope.DBinsertedAssets = {};
        $scope.DBinsertedAssets.count = 0 ;
        $scope.allAssetsLoaded = false;
        $scope.promoDisplay = true;
        $scope.isIndexDBSupport = true;
        $scope.promoDisplay = true;
        
        if((localStorage["angular-cache.caches.menusCache.data." + bb_config.restApiHost + "bbtv/getBeerBoardMenuData?locationId=" + bb_config.locationId + "&bar_id=" + bb_config.bar_id + "&product_type=" + bb_config.product_type] != undefined)
         ||(localStorage["angular-cache.caches.menusCache.data." + bb_config.restApiHost + "bbtv/getBeerBoardMenuData?locationId=" + bb_config.locationId + "&bar_id=" + bb_config.bar_id + "&product_type=" + bb_config.product_type] != null))
        {
            $scope.isBeerListLoaded = true;
        }

        //It is the condition to hide the glass logo for the window width less than 1025
        if(window.screen.availWidth<1025){
                $rootScope.isIpad = false;
                $rootScope.displayGlass = false;
            }

        //It is the condition to check whether the URL is opened in i-frame or not
        if (window.self !== window.top){
           //console.log('opend in i frame');
           $rootScope.isIframe = true;
           $rootScope.promotions = false; 
            }
       else{
          // console.log('not opened in i frame');
           $rootScope.isIframe = false;
            }


        //************************************************************************************
        //In the product.html, if we determine id="promoDisplay", then promotions will not 
        //display for desktop view.This condition is especially for iFrame templates.
        //*************************************************************************************
       
        
        if(document.getElementById("promoDisplay") != null){
            $scope.promoDisplay = false;
            console.log('promoDisplay: ' + $scope.promoDisplay);
        }         
        
        //************************************************************************************
        //Indexed db will be applicable only for non-iFrame templates,so we are initializing 
        //indexed db only if promoDisplay flag is true and isIframe flag is false
        //*************************************************************************************
      
        if($scope.promoDisplay){
            if(!$rootScope.isIframe)
            {
                /*initialization of indexedDB starts*/
                var indexedDB = $window.$indexedDB || $window.mozIndexedDB || $window.webkitIndexedDB || $window.msIndexedDB;
                IDBTransaction = $window.IDBTransaction || $window.webkitIDBTransaction || $window.msIDBTransaction;
                IDBKeyRange = $window.IDBKeyRange || $window.webkitIDBKeyRange || $window.msIDBKeyRange
                /*Initialization of indexedDB ends*/   
                /*If our browser doesn't support the IndexedDB version*/    
                if (!indexedDB) {
                    $window.alert("Your browser doesn't support a stable version of IndexedDB.")
                 }

                 /*creating variables for db-name,db-version and objectStore name*/
                var DB_NAME = 'Beerboard';
                var DB_VERSION = 1;
                var STORE_NAME = 'Promotions';
                var db;
                /*opening indexedDB with its name and version no.*/
                var request = indexedDB.open(DB_NAME, DB_VERSION);
               
                /*If the database does exist but we are specifying an upgraded version number, an onupgradeneeded event is triggered 
                straight away, allowing you to provide an updated schema*/
                request.onupgradeneeded = function() {
                      /* Create a new object store if this is the first time we're using
                       this DB_NAME/DB_VERSION combo.*/
                     request.result.createObjectStore(STORE_NAME,{autoIncrement: true});
                };
                /*on success of the db opening without any error.*/
                var requestCompleted=false;
                request.onsuccess = function() {
                    console.log('DB connection opend');
                    requestCompleted = true;
                     db = request.result;         
                    
                };
            }        
        }
       
        activate();
        //************************************************************************************
        //This is the key function to logo, for indexed db functions and blob URL conversion
        //
        //************************************************************************************
        function blobLogo(){
           
                $scope.type = "logo";
                vm.logo =  getDBObject($scope.apiLogo,$scope.type);
                if(localStorage.getItem('templateLogo '+ bb_config.locationId + '.' + bb_config.templateId) != null){
                    vm.tempLogo = localStorage.getItem('templateLogo '+ bb_config.locationId + '.' + bb_config.templateId);
                }
                else{
                    vm.tempLogo = $scope.apiLogo;
                }
                      
        }
        //************************************************************************************
        //This is the key function to assets, for indexed db functions and blob URL conversion
        //
        //************************************************************************************
        function initalizeAssets(){
         
            if(vm.allAssets.length>0){
                $scope.totalAssestsLength =vm.allAssets.length;
                   _.each(vm.allAssets, function(assetUrl) {                       
                       /*checking whether the promotion is image format*/
                       if(assetUrl.url.endsWith(".jpg") || assetUrl.url.endsWith(".png") || assetUrl.url.endsWith(".mp4"))
                       {
                        /*calling getDBObject function for the resprctive promotion(image)*/
                        $scope.type = "promotion";

                        getDBObject(assetUrl.url,$scope.type);                        
                       }
                    });
                }
                else{
                    $scope.allAssetsLoaded = true;
                }
          
        }        
     
        function activate() { 
                    
            /*Added by senthil on 01-MAY-2016 to Test the beerboard service (Start)*/            
             beerboardservice.getLocations({}).then(function(data) {    
              //logger.info('Total Location = [' + data.locations.length + ']');               
            });
            /*Added by senthil on 01-MAY-2016 to Test the beerboard service (End)*/                  
            return getBeers().then(function() {                
            });
           /*Clear font and color from local storage*/
            localStorage.clear();
        }

        function getProducts() {
            return ProductService.getProducts({}).then(function(data) {
                vm.products = data;
                return vm.products;
            });
        }
        /*Once the db is connected, we are calling the logo function and assets functions to be blobed and inserted into indexedDb*/
        function dbConectionOpend(){ 

            if(db == undefined){                
                $timeout(function() {
                        dbConectionOpend();
                    },1000);
            }
            else{ 
                blobLogo();
                initalizeAssets();
            }
        }
        
        
        
        //************************************************************************************
        //This is the key function to get all beerDetails from locationId API.
        //
        //*************************************************************************************
        function getBeers(){          
       
             return beerboardservice.getMenus({locationId : bb_config.locationId,bar_id : bb_config.bar_id,product_type : bb_config.product_type}).then(function(data) {   
                 //logger.info( JSON.stringify(_.groupBy(_.pluck(data.draftBeers, 'draftBeer'),'majorStyle' )));
                 if(data !== null || data !== undefined){ 
                     $scope.isBeerListLoaded = true;
                 }
                
                 if(data.locationColors.length>0)
                 $scope.apiLogo =  data.locationColors[0].logo;
                 vm.allAssets = data.assets;
                           
                 if($scope.promoDisplay)
                 { 
                     if(!$rootScope.isIframe){
                        dbConectionOpend();     
                      }                                   
                 }                
              
                 $rootScope.initialBeerList = JSON.stringify(data);
                     
                 vm.locationSequence = data.locationSequence;
                 vm.draftBeers = [];
                 vm.draftBeers =  data.draftBeers;
                 vm.marketingBeerList = _.filter(vm.draftBeers, function(item){ return item.draftBeer.local>0 || item.draftBeer.featured>0 || item.draftBeer.cask>0 });
                 _.each(data.beerDetails,function(res){
                    var brewery = res.beerDetail.brewery;
                 });
                 if(vm.locationSequence !=undefined || vm.locationSequence !=null){
                  
                    if($scope.promoDisplay)                      
                    {
                        if(!$rootScope.isIframe)
                        {
                            $scope.sequenceCheck();
                        }                     
                    }
                 
                 }
                 $rootScope.draftBeersFeaturedList =  data.draftBeers;
                 var quantityArray = [];
                 _.each(data.draftBeers,function(res){
                    $scope.priceList = res.draftBeer.prices;
                       j = 0;
                       var qunatityData = {};
                     _.each($scope.priceList,function(num){
                         j= j+1;
                        var splitPrice = num.price.split(":");
                        var quantity = splitPrice[0];
                        var quantityPrice = splitPrice[1];

                     //   var StringAvailabilty = containsAny(quantity, vm.quantityArray);
                     var StringAvailabilty = _.find(quantityArray,function(string){
                         return string == quantity;

                     })
                     //  console.log('StringAvailabilty = ' + StringAvailabilty);
                       if(StringAvailabilty == undefined){
                           quantityArray.push(quantity); 
                       } 
                  
                    res.draftBeer['beerQuantity' + j]  = quantity;   
                    res.draftBeer['beerQuantityPrice' + j]  = quantityPrice; 
                    $scope.beerQuantity1 = res.draftBeer.beerQuantity1;
                    $scope.beerQuantity2 = res.draftBeer.beerQuantity2;
                    $scope.beerQuantity3 = res.draftBeer.beerQuantity3;
                    $scope.beerQuantityPrice1 = res.draftBeer.beerQuantityPrice1;
                    $scope.beerQuantityPrice2 = res.draftBeer.beerQuantityPrice2;
                    $scope.beerQuantityPrice3 = res.draftBeer.beerQuantityPrice3;
                  })
                     
                });
                        
                 $scope.quantityTypeName = quantityArray;
                 vm.locationspecials=data.locationSpecials;
                 if(data.locationProperties[0]!=undefined)
                  {
                    $rootScope.menuDelay = data.locationProperties[0].menuDelay;
                  }
                 if(vm.locationspecials.length>0){
                    $rootScope.locationSpecils =true;
                 }
                  if(data.locationColors[0]!=undefined)
                    {    
                     /*Storing the primary,secondary fontstyle and color in localstorage starts here*/           
                     
                     localStorage.primaryfont = data.locationColors[0].primaryFont;
                     localStorage.secondaryfont = data.locationColors[0].secondaryFont;
                     localStorage.primaryColour = data.locationColors[0].primaryColor;
                     localStorage.secondaryColour = data.locationColors[0].secondaryColor;
                    //  localStorage.tempLogo =  data.locationColors[0].logo;
                     localStorage.majorStyleFont = data.locationColors[0].majorStyleFont;
                     localStorage.beerNameFont = data.locationColors[0].beerNameFont;
                     localStorage.descriptionFont = data.locationColors[0].descriptionFont;
                     localStorage.nutritionFont = data.locationColors[0].nutritionFont;
                     localStorage.background = data.locationColors[0].background;
                     localStorage.backgroundImage = data.locationColors[0].backgroundImage;
                     localStorage.specialsFont = data.locationColors[0].specialsFont;
                     localStorage.specialsColor = data.locationColors[0].specialsColor;
                     localStorage.color = data.locationColors[0].color;
                     /*Storing the primary,secondary fontstyle and color in localstorage ends here*/
                     

                     /* Getting a primary,secondary fontstyle and color from localstorage starts here*/
                      $rootScope.primaryfont = localStorage.primaryfont;
                      $rootScope.secondaryfont = localStorage.secondaryfont;
                      $rootScope.primaryColour = localStorage.primaryColour;
                      $rootScope.secondaryColour = localStorage.secondaryColour;
                    //  $rootScope.tempLogo = localStorage.tempLogo;
                      $rootScope.majorStyleFont = localStorage.majorStyleFont;
                      $rootScope.beerNameFont = localStorage.beerNameFont;
                      $rootScope.descriptionFont = localStorage.descriptionFont;
                      $rootScope.nutritionFont = localStorage.nutritionFont;
                      $rootScope.background = localStorage.background;
                      $rootScope.backgroundImage = localStorage.backgroundImage;
                      $rootScope.specialsFont = localStorage.specialsFont;
                      $rootScope.specialsColor = localStorage.specialsColor;
                      $rootScope.color = localStorage.color;
                     /* Getting a primary,secondary font from localstorage ends here*/
                    }                      
                 
                 
                    
                    //    vm.tempLogo =  getDBObject(apiLogo);/*getting logo from api*/                
                 if(_.isObject(data.locationPromotions) && (data.locationPromotions.length > 0 || vm.marketingBeerList.length>0)){   
                     vm.typeSequences = _.sortBy(_.pluck(data.locationSequence, 'sequence'),'sequence' );                     
                     vm.assets= _.sortBy(_.pluck(data.locationPromotions, 'locationPromotion'),'sequence' );
                    
                     if($scope.promoDisplay)
                     {
                        if(!$rootScope.isIframe){
                           vm.videoAssets = _.filter(data.locationPromotions,function(asset){return asset.locationPromotion.url.endsWith(".mp4")});
                           vm.imageAssets = _.filter(data.locationPromotions,function(asset){return asset.locationPromotion.url.endsWith(".jpg") || asset.locationPromotion.url.endsWith(".png")});
                        }
                        
                     }  
                                    
                     vm.locationPromotions = data.locationPromotions;   

                 }
                 
                 return angular.noop;
            });           
           
        }  
        
        
        //************************************************************************************
        //This is the key function to check the sequence is defined/undefined also to check 
        //whether the sequence is having data or not.
        //
        //If there is any exception,then the email will be send to the admin with the 
        //respective exception.
        //************************************************************************************* 
       
            $scope.sequenceCheck = function(){
            
            $scope.dataNotAvailableException = {};
            
            $scope.sequenceUndefinedException = {};
            
            _.each(vm.locationSequence,function(result){  
                      
               var sequenceType = result.sequence.type;
               
               $scope.sequenceTypeArray.push(sequenceType); 
                                               
            });
           
            vm.uniqueTypeSeq = _.sortBy(_.uniq($scope.sequenceTypeArray));
           
            var type1Exists =  _.contains(vm.uniqueTypeSeq, 1);
            var type3Exists =  _.contains(vm.uniqueTypeSeq, 3);
            var type4Exists =  _.contains(vm.uniqueTypeSeq, 4);
           
            
            if(type1Exists)
            {
                
              if(vm.draftBeers.length == 0)
                {
                    $scope.dataNotAvailableException.Type1 = "Type 1(beer menus) data is not available, please include it.";  
                                      
                }
            }
            
            if(type3Exists)
            {
                
              if(vm.allAssets.length == 0)                
                {
                    $scope.dataNotAvailableException.Type3 = "Type 3(promotions) data is not available, please include it.";
                
                }  
            }
            
            if(type4Exists)
            {
                
              if(vm.marketingBeerList.length == 0)
                {
                    $scope.dataNotAvailableException.Type4 = "Type 4(marketing promotions) data is not available, please include it.";
                
                }
            }  
            
            var remainingSequence = _.filter(vm.uniqueTypeSeq, function(item) {return (item !== 1 && item !== 3 && item !== 4)});
            
            if(remainingSequence.length>0){
                $scope.sequenceUndefinedException = "The following are undefined sequence type(s): " + remainingSequence;
            
            }
            
            if(Object.keys($scope.dataNotAvailableException).length>0 || Object.keys($scope.sequenceUndefinedException).length>0)
            {
                
                var request = {};
                var message = {};
                if(Object.keys($scope.dataNotAvailableException).length>0){
                    message.dataNotAvailableException = $scope.dataNotAvailableException;
                    
                }     
                if(Object.keys($scope.sequenceUndefinedException).length>0){        
                    message.sequenceUndefinedException = $scope.sequenceUndefinedException; 
                    
                }  
                request.message =  message;             
                request.location_id = bb_config.locationId;
                
                return beerboardservice.sendEmail(request).then(function(res){ })
            }
           
        }
          
        //************************************************************************************
        //This function is for page reload.Page reload should happens only,if there is any change  
        //in the API data with old data.
        //*************************************************************************************
        function anyChangesInBeerList(){   
        //    $scope.$on('$destroy', function(){$timeout.cancel(vm.timerForChanges);});
            if($rootScope.isBeerDataChanged)
            {
                    $timeout(function() {
                    $rootScope.savedBeerList = null;
                    //$state.go($state.current, {}, {reload: true});
                    console.log('website got refreshed');
                    $window.location.reload();                    
                    $rootScope.isBeerDataChanged = false;
                    })
           }              
                        
         }


        //************************************************************************************
        //This is the function to run the play type on based on sequence,if the sequence is 
        //undefined or data is not available then it will skip to next sequence.
        //*************************************************************************************
        function setPlayType() {
            $rootScope.showMarketingBeerItem=false;
            $rootScope.promotions=false;
            $rootScope.runSlider=false;

            if(vm.runningTypeSequence==vm.typeSequences.length)
            {
                vm.timerForChanges =  $timeout(function() {anyChangesInBeerList();}, $rootScope.menuDelay);
                vm.runningTypeSequence=0;
            }         
            if(vm.typeSequences.length==0 || vm.typeSequences[vm.runningTypeSequence].type==1)
            {
                if(vm.draftBeers.length > 0){
                    showBeerList(); 
                }
                else{
                   vm.isSequenceDataAvailable = false; 
                }     
            }
            else if(vm.typeSequences[vm.runningTypeSequence].type==4)
            {
                if(vm.marketingBeerList.length > 0){
                   $scope.showMarketingSlide();
                   
                }
                else{
                   vm.isSequenceDataAvailable = false;
                }
            }
            else if(vm.typeSequences[vm.runningTypeSequence].type==3)
            {
                if(vm.allAssets.length > 0){
                   $rootScope.runSlider=false;
                   $scope.showPromotions(); 
                   
                }
                else{
                   vm.isSequenceDataAvailable = false;
                }                
            }
            else
            {
                vm.isSequenceDataAvailable = false;
            }
            
              vm.runningTypeSequence++;  
              if(!vm.isSequenceDataAvailable)
              {
                vm.isSequenceDataAvailable = true;
                setPlayType();                
              }
                        
        }

        //************************************************************************************
        // This is the key function to dynamically play marketing beerlist.
        //
        //*************************************************************************************         
         $scope.showMarketingSlide = function() { 
            if($rootScope.isIframe){
            $rootScope.showMarketingBeerItem=false;   
            }
            else{
            $rootScope.promotions=false;
            $rootScope.runSlider=true;
            $rootScope.showMarketingBeerItem=true;
            isLastAsset = false;
            
            // Added by kamal, If promotions are available and ready to display last asset in a sequence / iterator 
            // make isLastAsset value as true
            if(vm.runningMarketBeerListSequence==vm.marketingBeerList.length-1){
                    isLastAsset = true;
            }
            // checking All Assets completed one loop           
            if(vm.runningMarketBeerListSequence==vm.marketingBeerList.length)
            {
                vm.runningMarketBeerListSequence=0;
                
            // call the activate function to reflect the local cache data into browser (Added by kamal) 
            //  $scope.$apply(function () {
            //      activate();
            //  });
            }
            var delay = 0;
            var asset = vm.marketingBeerList[vm.runningMarketBeerListSequence];
            vm.runningMarketBeerListSequence++;
            vm.timer = $timeout(setPlayType, $rootScope.menuDelay);
            $rootScope.marketingBeerItem = asset.draftBeer;
            }            
            
        }
        

        //************************************************************************************
        //This is the function to show the beerlist and fixing the time delay for all the  
        //sliders on based on the slide length and delay paramater from the API
        //*************************************************************************************
         function showBeerList(){ 
            $rootScope.promotions=false;
            $rootScope.runSlider=true;
            if($rootScope.slideLength>0 && vm.typeSequences.length>0)
            {
                vm.timer = $timeout(setPlayType, $rootScope.menuDelay * $rootScope.slideLength);
            }
            // Added by kamal , if no promotions available , after completion of All slides related to menu 
            // refresh the page to get the latest cache memory data         
            else{
                vm.timerForChanges =  $timeout(function() {anyChangesInBeerList();}, $rootScope.menuDelay);
               /*$timeout(function() {
                $state.go($state.current, {}, {reload: true});
                }, $rootScope.menuDelay * $rootScope.slideLength)*/
            }
         }
        

        //************************************************************************************
        //This is the function to be called when we need to display the beerList/slides with
        //Grouping
        //*************************************************************************************
         $scope.getBeersBucket_ByStyleGroup = function(maxBucket,idx,maxList){ 
           
         //  if($scope.isBeerListLoaded == true){
            $rootScope.slideMaxBeerList=maxBucket;
            var sortByStyle = sortDraftbeersByMajorStyle(vm.draftBeers,'majorStyle');
           
            if(bb_config.enableGroup){
                var beerLists=chunkByGroupAndMaxBuckets(sortByStyle,maxBucket,maxList);
            }
            else{
                var beerLists=chunkByMaxBuckets(sortByStyle,maxBucket,maxList);
            }
    
            var result=[];
               for (var i = 0; i<beerLists[idx].length; i++) {
                 result.push(_.groupBy(beerLists[idx][i],'majorStyle'))
               };

               if(vm.runningTypeSequence==0)
           {
                $rootScope.slideLength=result.length;
                setPlayType();
           }
            
            //logger.info("getBeersBucket(" + maxBucket + "," + idx + ")");
            return result;
          
            

         }
        //************************************************************************************
        //This is the function to chunk the maxBuckets when enable grouping is false
        //
        //*************************************************************************************
         function chunkByMaxBuckets(beers,maxBucket,maxList)
         {
             var chunkByMaxBucket =  _.chain(beers).groupBy(function(element, index){            
            return Math.floor(index/(maxBucket));
            }).toArray()
            .value();
            var beerLists = [];
            for(var i=0;i<maxList;i++)
            {
                beerLists.push([]);
            }
            var listIndex=0;
            for(var i=0;i<chunkByMaxBucket.length;i++)
            {
                if(listIndex==maxList)
                    listIndex=0;
                beerLists[listIndex].push(chunkByMaxBucket[i]);
                listIndex++;
            }
            return beerLists;
         }
        //************************************************************************************
        //This is the function to chunk the maxBuckets when enable grouping is true        
        //*************************************************************************************
         function chunkByGroupAndMaxBuckets(beers,maxBucket,maxList)
         {
            
            var groupList = _.groupBy(beers,'majorStyle');
            
            var listIndex=0;
            var bucketCount=0;
            var beerLists = [];
            for(var i=0;i<maxList;i++)
            {
                beerLists.push([]);
            }
            var chunkList =[];

            angular.forEach(groupList, function(element, key) {
                 var j=0;

                angular.forEach(element, function(item, groupName) 
                {

                    if((bucketCount==maxBucket-1) || (j==0 && bucketCount==maxBucket-2)  )
                    {
                        bucketCount=0;
                        if(listIndex==maxList)
                            listIndex=0;
                        beerLists[listIndex].push(chunkList);
                        listIndex++;
                        chunkList=[]; 
                    }
                    if(j==0 && bucketCount>0)
                        bucketCount++;

                    if((bucketCount<maxBucket-1) )
                        chunkList.push(item);

                    j++;
                    bucketCount++;

                })

            })
            if(listIndex==beerLists.length)
                listIndex=0;

            if(chunkList!=null && chunkList.length>0)
                beerLists[listIndex].push(chunkList);


            return beerLists;
         }
        //************************************************************************************
        //This is the function to be called when we need to display the beerList/slides with
        //Grouping and duplication check(09.template)        
        //*************************************************************************************
         $scope.getBeersBucket_DuplicationChk = function(maxBucket,idx,maxList,individualMaxBucket){    

            $rootScope.slideMaxBeerList=maxBucket;
           // vm.draftBeers1 = vm.draftBeers;
           // $scope.$apply();
            var sortByStyle = sortDraftbeersByMajorStyle(vm.draftBeers,'majorStyle');

            if(bb_config.enableGroup){
                var beerLists=chunkByGroupAndMaxBucketsDuplicationChk(sortByStyle);
            }
            else{
                var beerLists=chunkByMaxBucketsDuplicationChk(sortByStyle,maxBucket,maxList,idx,individualMaxBucket);
            }
            
            var result=[];
               for (var i = 0; i<beerLists[idx].length; i++) {
                 result.push(_.groupBy(beerLists[idx][i],'majorStyle'))
               };

               if(vm.runningTypeSequence==0)
           {
                $rootScope.slideLength=result.length;
                setPlayType();
           }
            
            //logger.info("getBeersBucket(" + maxBucket + "," + idx + ")");
            return result;

         }
        //************************************************************************************
        //This is the function to chunk the maxBuckets when enable grouping is true &
        //duplication check(09.Template)
        //*************************************************************************************
         function chunkByGroupAndMaxBucketsDuplicationChk(beers)
         {
            
            if($rootScope.savedBeerList==null || $rootScope.savedBeerList==undefined)
            {
                var groupList = _.groupBy(beers,'majorStyle');
                var maxBucketLists = beerboard.maxBucketLists;
                var maxList = maxBucketLists.length;
                
                var listIndex=0;
                var bucketCount=0;
                var beerLists = [];
                var genericBucketSize = maxBucket;
                for(var i=0;i<maxBucketLists.length;i++)
                {
                    beerLists.push([]);
                }
                var chunkList =[];
                
                var maxBucket = maxBucketLists[0];
                if(!bb_config.enableGroup){
                    maxBucket++;
                }
                angular.forEach(groupList, function(element, key) {
                     var j=0;

                    angular.forEach(element, function(item, groupName) 
                    {
                        if((bucketCount==maxBucket-1) || (j==0 && bucketCount==maxBucket-2) )
                        {
                            bucketCount=0;
                            beerLists[listIndex].push(chunkList);
                            listIndex++;
                            chunkList=[]; 
                            if(listIndex==maxList)
                                listIndex=0;
                            
                            maxBucket = maxBucketLists[listIndex];
                            if(!bb_config.enableGroup){
                            maxBucket++;
                            }
                           // console.log(maxBucket);

                        }
                        if(j==0 && bucketCount>0)
                            bucketCount++;

                        if((bucketCount<maxBucket-1)  )
                        {
                            chunkList.push(item);
                        }

                        j++;
                        bucketCount++;

                    })

                })
                beerLists[listIndex].push(chunkList);
                $rootScope.savedBeerList = beerLists;
              //  console.log(beerLists);
                return beerLists;
              //  $scope.$apply();

            }
            else
            {
                return $rootScope.savedBeerList;
               // $scope.$apply();
            }
            
            
         }
        //************************************************************************************
        //This is the function to chunk the maxBuckets when enable grouping is false with 
        //duplication check(09.Template)
        //*************************************************************************************
         function chunkByMaxBucketsDuplicationChk(beers,blankPage)
         {
            if($rootScope.savedBeerList==null || $rootScope.savedBeerList==undefined)
            {

                var maxBucketLists = beerboard.maxBucketLists;
                var maxList = maxBucketLists.length;
                
                var listIndex=0;
                var bucketCount=0;
                var beerLists = [];
                var genericBucketSize = maxBucket;
                for(var i=0;i<maxBucketLists.length;i++)
                {
                    beerLists.push([]);
                }
                var chunkList =[];
                var maxBucket = maxBucketLists[0];
                angular.forEach(beers, function(item, index) 
                    {
                        if(bucketCount==maxBucket || index == beers.length-1)
                        {
                            bucketCount=0;
                            beerLists[listIndex].push(chunkList);
                            listIndex++;
                            chunkList=[]; 
                            if(listIndex==maxList)
                                listIndex=0;
                            maxBucket = maxBucketLists[listIndex];

                        }
                        
                        if((bucketCount<maxBucket)  )
                        {
                            chunkList.push(item);
                        }

                        bucketCount++;

                    })
                
                if(blankPage && beerLists[maxList-1].length%2 !=0)
                    beerLists[maxList-1].push([]);
                    beerLists[listIndex].push(chunkList);
                    $rootScope.savedBeerList = beerLists;
                    return beerLists;
                   // $scope.$apply();
             }
             else
                return $rootScope.savedBeerList;
              //  $scope.$apply();
         }
        //************************************************************************************
        //This is the function to be called when we need to display the beerList/slides without
        //Grouping and numbering issue fixed(06.Template)        
        //*************************************************************************************
         $scope.getNumberedBeersBucket = function(maxBucket,idx,maxList,blankPage){ 
            $rootScope.slideMaxBeerList=vm.draftBeers.length;
            var sortByName = sortDraftbeersByMajorStyle(vm.draftBeers,'name');
            _.each(sortByName, function(element, index) {
                _.extend(element, {idx: index});
            });

            var beerLists=chunkByNumberedMaxBuckets(sortByName,maxBucket,maxList,blankPage);
            
            if(vm.runningTypeSequence==0)
           {
                $rootScope.slideLength=beerLists[idx].length;
                setPlayType();
           }

            return beerLists[idx];
            //logger.info("getBeersBucket(" + maxBucket + "," + idx + ")");
            
         }
        //************************************************************************************
        //This is the function to chunk the maxBuckets when the content(beerList) is less and
        //numbering occurs for beerList(06.Template)        
        //*************************************************************************************
          function chunkByNumberedMaxBuckets(beers,maxBucket,maxList,blankPage)
         {
             var chunkByMaxBucket =  _.chain(beers).groupBy(function(element, index){            
            return Math.floor(index/(maxBucket));
            }).toArray()
            .value();
             var beerLists = [];
            for(var i=0;i<maxList;i++)
            {
                beerLists.push([]);
            }
            var listIndex=0;
            for(var i=0;i<chunkByMaxBucket.length;i++)
            {
                if(listIndex==maxList)
                    listIndex=0;
                beerLists[listIndex].push(chunkByMaxBucket[i]);
                listIndex++;
            }
            if(blankPage && chunkByMaxBucket.length%2 !=0)
                beerLists[maxList-1].push([]);

            return beerLists;
         }
        //************************************************************************************
        //This is the function to be called when we need to display the beerList/slides with
        //Grouping
        //*************************************************************************************
         $scope.getBeersBucket = function(maxBucket,idx,maxList){ 
            $rootScope.slideMaxBeerList=vm.draftBeers.length;
            var sortByName = sortDraftbeersByMajorStyle(vm.draftBeers,'name');
            _.each(sortByName, function(element, index) {
                _.extend(element, {idx: index});
            });

            var beerLists=chunkByMaxBuckets(sortByName,maxBucket,maxList);
            
            if(vm.runningTypeSequence==0)
           {
                $rootScope.slideLength=beerLists[idx].length;
                setPlayType();
           }

            return beerLists[idx];
            //logger.info("getBeersBucket(" + maxBucket + "," + idx + ")");
            
         }

             
        //************************************************************************************
        //This is the function to sort the draftBeers from the API response on based on its
        //majorStyle parameter
        //*************************************************************************************
        function sortDraftbeersByMajorStyle(beers,sortElement){   
          var sortByStyle = _.sortBy(_.pluck(beers, 'draftBeer'),sortElement );
            return sortByStyle;
           
        } 

         $scope.showPromotions = function() { 
            if(window.screen.availWidth<1025 || !$scope.promoDisplay || $rootScope.isIframe)
            {
               $rootScope.promotions = false; 
            }
            else{
            $rootScope.promotions = true;
            isLastAsset = false;
            
            // Added by kamal, If promotions are available and ready to display last asset in a sequence / iterator 
            // make isLastAsset value as true
            if(vm.runningAssetSequence==vm.assets.length-1){
                    isLastAsset = true;
            }
            // checking All Assets completed one loop           
            if(vm.runningAssetSequence==vm.assets.length)
            {
                vm.runningAssetSequence=0;
                
            // call the activate function to reflect the local cache data into browser (Added by kamal) 
            //  $scope.$apply(function () {
            //      activate();
            //  });          
                           
            }            
            var delay = 0;
            var asset = vm.assets[vm.runningAssetSequence];
            vm.runningAssetSequence++;
            vm.timer = $timeout(setPlayType, asset.delay);
            $scope.playPromotions(asset);                   
            }
         }
        //************************************************************************************
        //This is the key function to dynamically play background full video and image.
        //
        //*************************************************************************************
        $scope.playPromotions = function(item) {  
            
            $scope.resetpromoVisiblity();
            if($scope.promoDisplay)
            {
             if(item.url.endsWith(".mp4"))
                { 
                     //logger.info('item.locationPromotion.creative=' + JSON.stringify(item));             
                    var vid = document.getElementById(item.creative);
                    if(vid!=null)
                        vid.currentTime=0;      
                    // get Video time delay
                   // timeDelay = item.delay;               
                }
            }
            /*setting time delay with respect to api response to reload the page*/
             timeDelay = item.delay; 
            
            // Added by kamal, If promotions are available and last Asset is ready to play, call a refresh function
            // with a time out to get latest updated cache data         
            /*if(isLastAsset == true){
                $timeout(function() {
                $state.go($state.current, {}, {reload: true});
                }, timeDelay)
            }*/  

            _.each($rootScope.indexedAssetUrl,function(res){
                if(res == item.url){
                     
                     var assetIndex = $rootScope.indexedAssetUrl.indexOf(res);
                     item.url = $rootScope.indexedBlobUrl[assetIndex];
                     
                }
                else{
                        item.url = item.url;
                     }

            })
            $rootScope.promoVisiblity[item.url]=true;   
            
                    
        }
               
        $scope.resetpromoVisiblity = function(){            
             _.each(vm.locationPromotions, function(promo) {               
              $rootScope.promoVisiblity[promo.locationPromotion.url] = false;
            })
        }
        //************************************************************************************
        //This is the function to display the  untrusted video/image url as a trusted url
        //
        //*************************************************************************************         
        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        }
         
        function chunk(data,n){ 
            var page = Math.ceil(data.length/n); 
            var result =  _.chain(data).groupBy(function(element, index){            
            return Math.floor(index/page);
            }).toArray()
            .value();        
            /*if(result.length > n){
                 //logger.info('result.length is greater than [' + n + ']');  
                result[result.length-2] = $.merge(result[result.length-2],result[result.length-1])               
            } */    
            try{
                //result = result.splice(0,n);
                //logger.info('result.length after= [' + result.length + ']');  
            }catch(e){
                 logger.info('Exception coccured [' + e + ']');     
            }            
            return result;
        }   

        //************************************************************************************
        //This is the function for adding the data to the indexedDB with the actuall assetURL 
        //and converted blobURL
        //*************************************************************************************
        
        function addDBObject (assetUrl,blobUrl){ 
            /*creation of transaction with respective to storeName which will be readwrite*/
            var transaction = db.transaction(STORE_NAME, 'readwrite');
            /*creation of objectStore with respective to storeName*/
            var objectStore = transaction.objectStore(STORE_NAME);
            
            /*inserting the assetURL and blobURL into objectStore*/
            objectStore.put(blobUrl, assetUrl).onsuccess = function() {
             };          
        } 
          
        //************************************************************************************
        //This is the function for Getting the db object for actuall asstURL
        //*************************************************************************************
       
        function  getDBObject (url,type){ 
           var blobUrl = null;
           /*creation of transaction with respective to storeName which will be readonly*/      
           if(db!=null)      
           {
           var transaction = db.transaction(STORE_NAME, 'readonly');
           /*creation of objectStore with respective to storeName*/
           var objectStore = transaction.objectStore(STORE_NAME);
           /*transaction is taking time to complete,so we are making the function to be execute 
                            once the transaction get complete*/
          // transaction.oncomplete = function(event) { 

               var blobUrl = null;
            //  try{
                    objectStore.get(url).onsuccess = function(event) {
                    if(typeof(event.target.result) != "undefined"){

                            blobUrl = event.target.result;
                            blobUrl = URL.createObjectURL(blobUrl);
                            if(type == "logo"){
                              localStorage.setItem('templateLogo '+ bb_config.locationId + '.' + bb_config.templateId,blobUrl);
                              vm.tempLogo = localStorage.getItem('templateLogo '+ bb_config.locationId + '.' + bb_config.templateId);
                                
                            }
                            else{

                                $scope.DBinsertedAssets.count = $scope.DBinsertedAssets.count +1;
                                $scope.$apply();
                                if($scope.totalAssestsLength == $scope.DBinsertedAssets.count){
                                    $scope.allAssetsLoaded = true;
                                    $scope.$apply();
                                }

                                $rootScope.indexedBlobUrl.push(blobUrl);
                                $rootScope.indexedAssetUrl.push(url);   
                            }
                                                    
                }                
                if (blobUrl == null || blobUrl == undefined){ 
                    /*conversion of normal url to blob url starts*/       
                    var xhr = new XMLHttpRequest(),
                    binary_data;
                    xhr.open("GET", url, true);
                    xhr.responseType = "blob";
                    xhr.addEventListener("load", function () {
                    /*if the xhr status if success*/
                    if (xhr.status === 200) {    
                        /*URL.createObjectURL() will gives the blob form of the respective URL*/    
                         binary_data = URL.createObjectURL(xhr.response);
                         if(type == "logo"){
                            addDBObject(url ,xhr.response);                             
                           // localStorage.tempLogo(bb_config.locationId + '.' + bb_config.templateId) = binary_data;
                            localStorage.setItem('templateLogo '+ bb_config.locationId + '.' + bb_config.templateId,binary_data);
                            vm.tempLogo = localStorage.getItem('templateLogo '+ bb_config.locationId + '.' + bb_config.templateId);
                           
                         }
                         else{
                            /*calling addDBObject() with asstURL and blobURL to add into the db*/
                             addDBObject(url ,xhr.response);
                             $scope.DBinsertedAssets.count = $scope.DBinsertedAssets.count +1;
                             $scope.$apply();
                                if($scope.totalAssestsLength == $scope.DBinsertedAssets.count){
                                    $scope.allAssetsLoaded = true;
                                    $scope.$apply();
                                }
                             $rootScope.indexedBlobUrl.push(binary_data);
                             $rootScope.indexedAssetUrl.push(url);
                         }

                        //  document.getElementById("blobVideo").src = binary_data;
                        
                            //  return binary_data;
                    }
                        }, false);                 
                           xhr.send();   
                    /*conversion of normal url to blob url ends*/           
            }
        }
            } 
//$scope.assetsLoadingProgressStatus = $scope.DBinsertedAssets + ' out of ' + $scope.totalAssestsLength + ' loaded ';
       }
        
        
        
        common.$broadcast(config.events.viewLoaded, { backbutton: false });        
        $scope.$on('$destroy', function(){$timeout.cancel(vm.timer);});

        
    }
    
})();
