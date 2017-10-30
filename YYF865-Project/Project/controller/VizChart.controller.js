/**
 * Controller of the VizChart
 *
 * Author: Frank (PengYuan Ge)
 */
sap.ui.define([
    "jquery.sap.global",
    "sap/m/MessageToast",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/format/ChartFormatter",
    "sap/viz/ui5/api/env/Format",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
], function(jQuery, MessageToast, Controller, JSONModel, FlattenedDataset, ChartFormatter, Format, ODataModel) {
	"use strict";
	return Controller.extend("ScenarioMod.controller.VizChart", {
		_oDataModel: null,
		_inputTableURI: "/users/YFF865/WorkOptimiser/Project/ParametersListOData.xsodata",

		onInit: function() {
			var controller = this;
			controller.loadChart();
		},

		loadChart: function() {
			var controller = this;

			Format.numericFormatter(ChartFormatter.getInstance());
			var formatPattern = ChartFormatter.DefaultPattern;

			var oVizFrameCompleted = this.getView().byId("columnChartCompleted");
			oVizFrameCompleted.setVizProperties({
				plotArea: {
					dataLabel: {
						formatString: formatPattern.SHORTFLOAT_MFD2,
						visible: true
					}
				},
				valueAxis: {
					label: {
						formatString: formatPattern.SHORTFLOAT
					},
					title: {
						visible: true
					}
				},
				categoryAxis: {
					title: {
						visible: true
					}
				},
				title: {
					visible: true,
					text: 'Number of items Completed'
				}
			});
			var oVizFrameOverdue = this.getView().byId("columnChartOverdue");
			oVizFrameOverdue.setVizProperties({
				plotArea: {
					dataLabel: {
						formatString: formatPattern.SHORTFLOAT_MFD2,
						visible: true
					}
				},
				valueAxis: {
					label: {
						formatString: formatPattern.SHORTFLOAT
					},
					title: {
						visible: true
					}
				},
				categoryAxis: {
					title: {
						visible: true
					}
				},
				title: {
					visible: true,
					text: 'Number of Overdue items completed'
				}
			});

			// Dynamically combine columns of tables into a model;
			// e.g. Input table column 1 + Output table column 1
			var oDynamicModel = new JSONModel();
			oDynamicModel.setData({
				CompletedWorkItems: [],
				OverdueWorkItems: []
				// CompletedWorkItems: [{ // Example
				//     Name: "2nd Jan",
				//     HistoricValue: "400",
				//     PredictedValue: "600"
				// }, {
				//     Name: "2nd Feb",
				//     HistoricValue: "275",
				//     PredictedValue: "600"
				// }, {
				//     Name: "4th May",
				//     HistoricValue: "356",
				//     PredictedValue: "600"
				// }, {
				//     Name: "6th June",
				//     HistoricValue: "310",
				//     PredictedValue: "600"
				// }],
				// OverdueWorkItems: [{ // Example
				//     Name: "2nd Jan",
				//     HistoricValue: "400",
				//     PredictedValue: "600"
				// }, {
				//     Name: "2nd Feb",
				//     HistoricValue: "275",
				//     PredictedValue: "600"
				// }, {
				//     Name: "4th May",
				//     HistoricValue: "356",
				//     PredictedValue: "600"
				// }, {
				//     Name: "6th June",
				//     HistoricValue: "310",
				//     PredictedValue: "600"
				// }]
			});

			// Set dynamic model into this view; Async
			oVizFrameCompleted.setModel(oDynamicModel);
			oVizFrameOverdue.setModel(oDynamicModel);

			var oPopOverCompleted = this.getView().byId("popOverCompleted");
			oPopOverCompleted.connect(oVizFrameCompleted.getVizUid());
			oPopOverCompleted.setFormatString(formatPattern.STANDARDFLOAT);

			var oPopOverOverdue = this.getView().byId("popOverOverdue");
			oPopOverOverdue.connect(oVizFrameOverdue.getVizUid());
			oPopOverOverdue.setFormatString(formatPattern.STANDARDFLOAT);

			// Async OData call
			// Load OData Model Settings from SAP HANA
			if (!this._oDataModel) {
				this._oDataModel = new ODataModel(
					this._inputTableURI);
				controller._oDataModel.bDisableHeadRequestForToken = false;
			}

			// Load Historic JSONModel from SAP HANA
			this._oDataModel.read("/Parameters", {
				urlParameters: {
					$orderby: "DATE desc",
					$top: 1,
					$format: "json"
				},
				success: function(oData) {
					controller.successCallBackHistoric(oData);
				},
				error: function(err) {
					MessageToast.show(err);
				}
			});

			// Load Predicted JSONModel from SAP HANA
			this._oDataModel.read("/Predicted", {
				urlParameters: {
					$orderby: "ID desc",
					$top: 1,
					$format: "json"
				},
				success: function(oData) {
					controller.successCallBackPredicted(oData);
				},
				error: function(err) {
					MessageToast.show(err);
				}
			});
		},

		// ODATA callback function Historic
		successCallBackHistoric: function(response) {
			var oFullNameModel = new JSONModel();

			// Get the complete naming of the work item type
			oFullNameModel.loadData(jQuery.sap.getModulePath("ScenarioMod.localService.mockdata", "/WorkItemType.json"), "", false);
			var oFullName = oFullNameModel.getProperty("/");

			// Get the Chart model itself
			var oVizFrameCompleted = this.getView().byId("columnChartCompleted");
			var oChartModelCompleted = oVizFrameCompleted.getModel();
			var oVizFrameOverdue = this.getView().byId("columnChartOverdue");
			var oChartModelOverdue = oVizFrameOverdue.getModel();

			// Get the array of the CompletedWorkItems and OverdueWorkItems
			var CompletedWorkItems = oChartModelCompleted.getProperty("/CompletedWorkItems");
			var OverdueWorkItems = oChartModelOverdue.getProperty("/OverdueWorkItems");

			// Clear old data in the model
			CompletedWorkItems.splice(0, CompletedWorkItems.length);
			OverdueWorkItems.splice(0, OverdueWorkItems.length);

			//  Reverse Pivot the Input table and the Output table
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

					// Split Slice Front String
					var tokens1 = prop.split('_').slice(0, 2); // "AVG_PRIORITY_" --> "AVG PRIORITY"
					var frontString = tokens1.join('_');
					var tokens2 = prop.split('_').slice(2); // "ZIAM_MCA_NBE"
					var endString = tokens2.join('_');
					// console.log(frontString);

					// Add split string checker, check if front string belongs in the CompletedWorkItems List
					if (frontString === "COMPLETED_COUNT") {
						for (var index in oFullName) {
							if (endString === oFullName[index]['WORK_ID']) {
								var oNewCompletedWorkItems = {
									FullName: oFullName[index]['WORK_NAME'],
									Name: prop,
									HistoricValue: response.results[0][prop],
									PredictedValue: ""
								};
							}
						}
						CompletedWorkItems.push(oNewCompletedWorkItems);
					} else if (frontString === "OVERDUE_COUNT") {
						for (var index in oFullName) {
							if (endString === oFullName[index]['WORK_ID']) {
								var oNewOverdueWorkItems = {
									FullName: oFullName[index]['WORK_NAME'],
									Name: prop,
									HistoricValue: response.results[0][prop],
									PredictedValue: ""
								};
							}
						}
						OverdueWorkItems.push(oNewOverdueWorkItems);
					}
				}
			}
			// console.log(CompletedCountColumnItems);
			// console.log(OverdueCountColumnItems);

			// Store the updated array back to the model
			oChartModelCompleted.setProperty("/CompletedWorkItems", CompletedWorkItems);
			oChartModelOverdue.setProperty("/OverdueWorkItems", OverdueWorkItems);

		},

		// ODATA callback function Predicted
		successCallBackPredicted: function(response) {
			// Get the Chart model itself
			var oVizFrameCompleted = this.getView().byId("columnChartCompleted");
			var oChartModelCompleted = oVizFrameCompleted.getModel();
			var oVizFrameOverdue = this.getView().byId("columnChartOverdue");
			var oChartModelOverdue = oVizFrameOverdue.getModel();

			// Get the array of the CompletedWorkItems and OverdueWorkItems
			var CompletedWorkItems = oChartModelCompleted.getProperty("/CompletedWorkItems");
			var OverdueWorkItems = oChartModelOverdue.getProperty("/OverdueWorkItems");

			console.log(CompletedWorkItems);
			console.log(OverdueWorkItems);

			//  Reverse Pivot the Input table and the Output table
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

					// Split Slice Front String
					var tokens1 = prop.split('_').slice(0, 2); // "AVG_PRIORITY_" --> "AVG PRIORITY"
					var frontString = tokens1.join('_');
					// console.log(frontString);

					// Add split string checker, check if front string belongs in the CompletedWorkItems List
					if (frontString === "COMPLETED_COUNT") {
						// Loop through CompletedWorkItems to place Predicted variables
						for (var index in CompletedWorkItems) {
							if (CompletedWorkItems[index].Name === prop) {
								CompletedWorkItems[index].PredictedValue = response.results[0][prop];
							}
						}
					} else if (frontString === "OVERDUE_COUNT") {
						// Loop through OverdueWorkItems to place Predicted variables
						for (var index in OverdueWorkItems) {
							if (OverdueWorkItems[index].Name === prop) {
								OverdueWorkItems[index].PredictedValue = response.results[0][prop];
							}
						}
					}
				}
			}
			console.log(CompletedWorkItems);
			console.log(OverdueWorkItems);

			// Store the updated array back to the model
			oChartModelCompleted.setProperty("/CompletedWorkItems", CompletedWorkItems);
			oChartModelOverdue.setProperty("/OverdueWorkItems", OverdueWorkItems);
		}
	});
});