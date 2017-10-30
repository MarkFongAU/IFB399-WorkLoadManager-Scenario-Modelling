/**
 * Controller of the Parameters List Division
 *
 * Author: Mark (YeeChen Fong)
 */
sap.ui.define([
    "jquery.sap.global",
    "sap/m/MessageToast",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/odata/v2/ODataModel",
    "ScenarioMod/controller/VizChart.controller",
    "sap/ui/core/Fragment",
    "sap/ui/Device"
], function(jQuery, MessageToast, Controller, JSONModel, Filter, FilterOperator, ODataModel, VizChartControl, Fragment, Device) {
	"use strict";
	return Controller.extend("ScenarioMod.controller.ParametersList", {
		_oDataModel: null,
		_oBasePrioritiesModel: null,
		_inputTableURI: "/users/YFF865/WorkOptimiser/Project/ParametersListOData.xsodata",
		_modelParametersURI: "/users/YFF865/WorkOptimiser/Project/ParametersListSQL.xsjs",
		//var oThisObj = oEvent.getSource().getBindingContext().getObject();

		// Initialisation
		onInit: function() {
			var controller = this;

			// Dynamically add/remove UI5 elements (Panels, Tiles, etc)
			var oDynamicModel = new JSONModel();
			oDynamicModel.setData({
				dynamicParameterRowsBasePriorities: [],
				dynamicParameterRowsBasePrioritiesReset: []
			});

			// Set dynamic model into this view; ParametersList.view.xml
			this.getView().setModel(oDynamicModel);

			// Load OData Model Settings from SAP HANA
			if (!this._oDataModel) {
				this._oDataModel = new ODataModel(
					this._inputTableURI);
				controller._oDataModel.bDisableHeadRequestForToken = false;
			}

			// Load Local BasePriorities JSONModel from SAP HANA
			if (!this._oBasePrioritiesModel) {
				this._oDataModel.read("/Parameters", {
					urlParameters: {
						$orderby: "DATE desc",
						$top: 1,
						$format: "json"
					},
					success: function(oData) {
						controller.successCallBackBasePriorities(oData);
					},
					error: function(err) {
						MessageToast.show(err);
					}
				});
			}
		},

		// Dialog Control; Kill dialogs on Exit
		onExit: function() {

		},

		// ODATA callback function
		successCallBackBasePriorities: function(response) {
			this._oBasePrioritiesModel = new JSONModel();
			var oFullNameModel = new JSONModel();

			// Get the complete naming of the work item type
			oFullNameModel.loadData(jQuery.sap.getModulePath("ScenarioMod.localService.mockdata", "/WorkItemType.json"), "", false);
			var oFullName = oFullNameModel.getProperty("/");

			// Get the ParametersList model itself
			var oParametersListModel = this.getView().getModel();

			// Get the array of the Dynamic Parameters CustomListItem
			var dynamicRowsItems = oParametersListModel.getProperty("/dynamicParameterRowsBasePriorities"); // Actual Editable List
			var dynamicRowsItemsReset = oParametersListModel.getProperty("/dynamicParameterRowsBasePrioritiesReset"); // Reset List

			// If items are selected, add dynamically to the Dynamic Parameters List,
			// Else, remove dynamically from the Dynamic Parameters List
			dynamicRowsItems.splice(0, dynamicRowsItems.length); // Actual Editable List
			dynamicRowsItemsReset.splice(0, dynamicRowsItemsReset.length); // Reset List

			//  Reverse Pivot the Input table
			var propArray = [];

			console.log(response);
			// For every property/column in your data set.
			for (var prop in response.results[0]) {
				if (prop !== "__metadata") {
					// Create a new JSON object.
					var jObject = {
						name: prop,
						value: response.results[0][prop]
					};
					// Push it into an array.
					propArray.push(jObject);

					// Split Slice Front String; can't call the function in ODATA read
					var tokens1 = prop.split('_').slice(0, 2); // "AVG_PRIORITY_"
					var frontString = tokens1.join('_');
					var tokens2 = prop.split('_').slice(2); // "ZIAM_MCA_NBE"
					var endString = tokens2.join('_');

					console.log(frontString);

					// Add split string checker, check if front string belongs in the Parameter List
					if (frontString === "AVG_PRIORITY") {
						for (var index in oFullName) {
							if (endString === oFullName[index]['WORK_ID']) {
								// Add new row of inputs; so far hard-coded the objects variable
								var oNewDynamicRowItem = {
								    dynamicParameterBasePrioritiesFullName:"Average Priority of " + oFullName[index]['WORK_NAME'],
									dynamicParameterBasePrioritiesName: prop,
									dynamicParameterBasePrioritiesValue: response.results[0][prop]
								};
								var oNewDynamicRowItemReset = {
								    dynamicParameterBasePrioritiesFullName:"Average Priority of " + oFullName[index]['WORK_NAME'],
									dynamicParameterBasePrioritiesName: prop,
									dynamicParameterBasePrioritiesValue: response.results[0][prop]
								};
							}
						}
						dynamicRowsItems.push(oNewDynamicRowItem); // Actual Editable List
						dynamicRowsItemsReset.push(oNewDynamicRowItemReset); // Reset List
					}
				}
			}
			this._oBasePrioritiesModel.setData(propArray);

			// Store the updated array back to the model
			oParametersListModel.setProperty("/dynamicParameterRowsBasePriorities", dynamicRowsItems);
			oParametersListModel.setProperty("/dynamicParameterRowsBasePrioritiesReset", dynamicRowsItemsReset);
		},

		// String split and slice at N occurrence of character, get the front part
		splitSliceFrontString: function(str, delimiter, start) {
			var tokens1 = str.split(delimiter).slice(0, start);
			return tokens1.join(delimiter);
		},

		// String split and slice at N occurrence of character, get the back part
		splitSliceBackString: function(str, delimiter, start) {
			var tokens2 = str.split(delimiter).slice(start);
			return tokens2.join(delimiter);
		},

		// Model the parameters
		onParametersModel: function() {
			var controller = this;

			// Get the ParametersList model itself
			var oParametersListModel = this.getView().getModel();

			// Get the array of the Dynamic Parameters CustomListItem
			var dynamicRowsItems = oParametersListModel.getProperty("/dynamicParameterRowsBasePriorities");
			console.log(dynamicRowsItems);

			// Check if invalid inputs or empty inputs, if true instantly return out.
			for (var rowItem in dynamicRowsItems) {
				// Regex
				if (dynamicRowsItems[rowItem]['dynamicParameterBasePrioritiesValue'].match(/[^.\d]/)) { // Regex: parameter.match(/[^$,.\d]/)
					MessageToast.show("Invalid input on" + dynamicRowsItems[rowItem]['dynamicParameterBasePrioritiesName'] +
						", must be positive numeric and not empty.");
					return;
				}
				// Negative values
				if (dynamicRowsItems[rowItem]['dynamicParameterBasePrioritiesValue'] < 0) {
					MessageToast.show("Invalid input on" + dynamicRowsItems[rowItem]['dynamicParameterBasePrioritiesName'] + ", must be positive value");
					return;
				}
			}

			// Get the Local BasePriorities JSONModel
			var oLocalModel = this._oBasePrioritiesModel;
			var localData = oLocalModel.getProperty("/");
			console.log(localData);

			// For every RowItem in the RowsItems data set, if RowItem's name matches the localModel's indexed Object's name,
			// update the indexed Object's value from RowItem's value
			for (var rowItem in dynamicRowsItems) {
				console.log(dynamicRowsItems[rowItem]['dynamicParameterBasePrioritiesName'], dynamicRowsItems[rowItem][
                    'dynamicParameterBasePrioritiesValue']);
				for (var index in localData) {
					if (localData[index]['name'] === dynamicRowsItems[rowItem]['dynamicParameterBasePrioritiesName']) {
						console.log(localData[index]['value']);
						localData[index]['value'] = dynamicRowsItems[rowItem]['dynamicParameterBasePrioritiesValue'];
						console.log(localData[index]['value']);
					}
				}
			}
			console.log(localData);

			// AJAX data object
			var ajaxDataArray = {};
			ajaxDataArray['cmd'] = "insertYTable";
			for (var index in localData) {
				// Split Slice Front String; can't call the function in ODATA read
				var tokens1 = localData[index]['name'].split('_').slice(0, 2); // "AVG_PRIORITY_"
				var frontString = tokens1.join('_');
				console.log(frontString);

				ajaxDataArray['' + localData[index]['name'] + ''] = localData[index]['value'];
			}
			// http://sap-a4d-db.csda.gov.au:8030/users/YFF865/WorkOptimiser/Project/ParametersListSQL.xsjs?cmd=insertYTable&AVG_PRIORITY_ZIAM_MCA_NBE=12&AVG_PRIORITY_ZIAM_NSA_NCL=49.576536&AVG_PRIORITY_ZCLM_ZYAS=57.077171&AVG_PRIORITY_ZIAM_AGE_NCL=50.839276&AVG_PRIORITY_ZIAM_DSP_NCL=57.26493&AVG_PRIORITY_ZIAM_PPL_NCL=13.139541&AVG_PRIORITY_ZIAM_CCF_NCL=8.955292&STDDEV_PRI_ZIAM_MCA_NBE=0&STDDEV_PRI_ZIAM_NSA_NCL=14.478921&STDDEV_PRI_ZCLM_ZYAS=24.67285&STDDEV_PRI_ZIAM_AGE_NCL=21.980775&STDDEV_PRI_ZIAM_DSP_NCL=22.740079&STDDEV_PRI_ZIAM_PPL_NCL=11.559519&STDDEV_PRI_ZIAM_CCF_NCL=9.283623
			console.log(ajaxDataArray);

			// AJAX GET call to SAP HANA
			$.ajax({
				url: this._modelParametersURI,
				method: 'GET',
				data: ajaxDataArray,
				success: function(response) {
					MessageToast.show(response);
					controller.updateChart();
				},
				error: function(err) {
					MessageToast.show(err);
				}
			});
		},

		// Call function to reload the chart
		updateChart: function() {
			// var comp = this.getOwnerComponent().getMetadata(); // Get the main root view
			// var rootView = comp.getRootView();
			// console.log(rootView);

			// Get the VizChart view by hierarchy
			var chartController = sap.ui.getCore().byId("__xmlview0--visualisation--vizChart").getController();
			chartController.loadChart();
		},

		// Reset the parameters
		onParametersReset: function() {
			// Get the ParametersList model itself
			var oParametersListModel = this.getView().getModel();

			// Get the array of the Dynamic Parameters CustomListItem
			var dynamicRowsItems = oParametersListModel.getProperty("/dynamicParameterRowsBasePriorities"); // Actual Editable List
			var dynamicRowsItemsReset = oParametersListModel.getProperty("/dynamicParameterRowsBasePrioritiesReset"); // Reset List

			// For every property/column in your data set.
			for (var prop in dynamicRowsItems) {
				dynamicRowsItems[prop].dynamicParameterBasePrioritiesName = dynamicRowsItemsReset[prop].dynamicParameterBasePrioritiesName;
				dynamicRowsItems[prop].dynamicParameterBasePrioritiesValue = dynamicRowsItemsReset[prop].dynamicParameterBasePrioritiesValue;
			}

			// Store the reset array back to the model
			oParametersListModel.setProperty("/dynamicParameterRowsBasePriorities", dynamicRowsItems);
		}
	});
});