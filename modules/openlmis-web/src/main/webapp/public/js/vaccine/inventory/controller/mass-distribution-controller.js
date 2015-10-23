/*
 * Electronic Logistics Management Information System (eLMIS) is a supply chain management system for health commodities in a developing country setting.
 *
 * Copyright (C) 2015 Clinton Health Access Initiative (CHAI). This program was produced for the U.S. Agency for International Development (USAID). It was prepared under the USAID | DELIVER PROJECT, Task Order 4.
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


function MassDistributionController($scope,$location, $window,programs,$timeout,facilityDistributed,homeFacility,FacilitiesWithProducts,VaccineIssueStock,SaveDistribution,localStorageService,$location, $anchorScroll) {

     $scope.userPrograms=programs;
     $scope.facilityDisplayName=homeFacility.name;
     $scope.toIssue=[];

     $scope.pageSize =8;
     $scope.currentPage=1;
    // console.log(facilityDistributed);
     $scope.loadSupervisedFacilities=function(programId,facilityId){
         FacilitiesWithProducts.get(programId,facilityId).then(function(data){
             $scope.allSupervisedFacilities=data;

//             var toExclude = _.pluck(facilityDistributed, 'toFacilityId');
//              $scope.allSupervisedFacilities = $.grep($scope.allSupervisedFacilities, function (facility) {
//                               return $.inArray(facility.id, toExclude) == -1;
//             });
           //  console.log($scope.toExclude);

             $scope.numberOfPages = Math.ceil( $scope.allSupervisedFacilities.length / $scope.pageSize) || 1;
             $scope.page();
         });
     };

     $scope.showLots=function(facility,product)
     {
          $scope.oldProductLots = angular.copy(product.lots);
          $scope.currentProduct=product;
          $scope.currentFacility=facility.name;
          $scope.currentLotsTotal=$scope.currentProduct.quantity;
          $scope.lotsModal = true;
     };

     $scope.closeModal=function(){
          $scope.currentProduct.lots=$scope.oldProductLots;
          evaluateTotal($scope.currentProduct);
          $scope.currentFacility=undefined;
          $scope.lotsModal=false;
     };
     $scope.saveLots=function(){
           evaluateTotal($scope.currentProduct);
           $scope.currentFacility=undefined;
           $scope.lotsModal=false;
     };
     $scope.updateCurrentTotal=function(){
           var totalCurrentLots = 0;
           $($scope.currentProduct.lots).each(function (index, lotObject) {
               if(lotObject.quantity !== undefined){
                     totalCurrentLots = totalCurrentLots + parseInt(lotObject.quantity,10);
               }
           });
           $scope.currentLotsTotal=totalCurrentLots;
     };
     function evaluateTotal(product){
           var totalLots = 0;
           $(product.lots).each(function (index, lotObject) {
                if(lotObject.quantity !== undefined){
                    totalLots = totalLots + parseInt(lotObject.quantity,10);
                 }

          });
          $scope.currentProduct.quantity=totalLots;
     }
     $scope.page=function(){
        if($scope.allSupervisedFacilities !== undefined)
        {
            $scope.supervisedFacilities = $scope.allSupervisedFacilities.slice($scope.pageSize * ($scope.currentPage - 1), $scope.pageSize * $scope.currentPage);
        }
     };
     if($scope.userPrograms.length > 1)
     {
          $scope.showPrograms=true;
          //TODO: load stock cards on program change
          $scope.loadSupervisedFacilities($scope.userPrograms[0].id,homeFacility.id);
     }
     else if($scope.userPrograms.length === 1){
           $scope.showPrograms=false;
           $scope.loadSupervisedFacilities($scope.userPrograms[0].id,homeFacility.id);
     }
     $scope.showIssueModal=function(facility){
        $scope.allProductsZero=true;
        $scope.facilityToIssue=_.findWhere($scope.supervisedFacilities, {name:facility.name});
        $scope.facilityToIssue.productsToIssue.forEach(function(product){

            if(product.quantity > 0)
            {
                $scope.allProductsZero=false;
            }
        });
        $scope.issueModal=true;
     };
     $scope.closeIssueModal=function(){
        $scope.facilityToIssue=undefined;
        $scope.issueModal=false;
     };
     $scope.pod=function(){
        var transaction = {};
        transaction.transactionList = [];

         VaccineIssueStock.update(transaction, function (data) {
                     $scope.message=data.success;
                     print();
                     $timeout(function(){
                          $scope.issueModal=false;
                          $scope.facilityToIssue={};
                          $scope.loadSupervisedFacilities($scope.userPrograms[0].id,homeFacility.id);
                          $scope.message=false;
                     },1500);

                });
     };

     $scope.distribute=function(){
            var distribution={};
            distribution.fromFacilityId = homeFacility.id;
            distribution.toFacilityId= $scope.facilityToIssue.id;
            distribution.distributionDate = $scope.facilityToIssue.issueDate;
            distribution.voucherNumber = $scope.facilityToIssue.issueVoucher;
            distribution.lineItems=[];
            distribution.distributionType="ROUTINE";
            distribution.status="PENDING";

            $scope.facilityToIssue.productsToIssue.forEach(function(product){
                if(product.quantity >0)
                {
                    var list = {};

                    list.productId = product.productId;
                    list.quantity=product.quantity;
                    if(product.lots !==undefined && product.lots.length >0)
                    {
                         list.lots = [];
                         product.lots.forEach(function(l)
                         {
                            if(l.quantity !==null && l.quantity >0)
                            {
                                var lot = {};
                                lot.lotId = l.lotId;
                                lot.vvmStatus=l.
                                lot.quantity = parseInt(l.quantity, 10);
                                list.lots.push(lot);
                            }

                         });
                    }

                    distribution.lineItems.push(list);
                }

            });
            console.log(JSON.stringify(distribution));
            SaveDistribution.save(distribution,function(data){
                  $scope.issueModal=false;
                  $scope.loadSupervisedFacilities($scope.userPrograms[0].id,homeFacility.id);
            });

     };

     var print = function(){
          var url = '/vaccine/orderRequisition/issue/print';
           $window.open(url, '_blank');

     };

     $scope.$watch('currentPage', function () {
          $scope.page();
     });

     $scope.loadRights = function () {
            $scope.rights = localStorageService.get(localStorageKeys.RIGHT);
     }();

     $scope.hasPermission = function (permission) {
            if ($scope.rights !== undefined && $scope.rights !== null) {
              var rights = JSON.parse($scope.rights);
              var rightNames = _.pluck(rights, 'name');
              return rightNames.indexOf(permission) > -1;
            }
            return false;
      };

      $scope.cancel=function(){
        $location.path('/stock-on-hand');
      };

     $scope.setSelectedFacility=function(facility)
     {
        if(facility)
        {
                $scope.selectedFacilityId=facility.id;
        }
        else
        {
                $scope.selectedFacilityId=null;
        }

     };

     $scope.getSelectedFacilityColor = function (facility) {
          if (!$scope.selectedFacilityId) {
            return 'none';
          }

          if ($scope.selectedFacilityId== facility.id) {
            return "background-color :#dff0d8; color: white !important";
          }
          else {
            return 'none';
          }
     };
     $scope.hasProductToIssue=function(facility)
     {
        var hasAtLeastOne=false;
        f=_.findWhere($scope.supervisedFacilities, {name:facility.name});
        if(f.productsToIssue !== undefined)
        {
             f.productsToIssue.forEach(function(p)
                    {
                        if(p.quantity >0)
                        {
                           hasAtLeastOne=true;
                        }
                    });
                    return hasAtLeastOne;
        }

     };

}
MassDistributionController.resolve = {

        homeFacility: function ($q, $timeout,UserFacilityList) {
            var deferred = $q.defer();
            var homeFacility={};

            $timeout(function () {
                   UserFacilityList.get({}, function (data) {
                           homeFacility = data.facilityList[0];
                           deferred.resolve(homeFacility);
                   });

            }, 100);
            return deferred.promise;
         },
        programs:function ($q, $timeout, VaccineInventoryPrograms) {
            var deferred = $q.defer();
            var programs={};

            $timeout(function () {
                     VaccineInventoryPrograms.get({},function(data){
                       programs=data.programs;
                        deferred.resolve(programs);
                     });
            }, 100);
            return deferred.promise;
         },

         facilityDistributed:function($q, $timeout,FacilityDistributed) {
             var deferred = $q.defer();
             var configurations={};
             $timeout(function () {
                FacilityDistributed.get(function(data)
                {
                      distributions=data.Distributions;
                      deferred.resolve(distributions);
                });
             }, 100);
             return deferred.promise;
        }
};