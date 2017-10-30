/**
 * Controller Template of the Parameters List Division
 * (Template is not 100% functional without making adjustments, USE AT OWN DISCRETION)
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
], function (jQuery, MessageToast, Controller, JSONModel, Filter, FilterOperator, ODataModel, VizChartControl, Fragment, Device) {
    "use strict";
    return Controller.extend("ScenarioMod.controller.ParametersList", {
        _oDataModel: null,
        _oBasePrioritiesModel: null,
        _inputTableURI: "/users/YFF865/WorkOptimiser/Project/ParametersListOData.xsodata",
        _modelParametersURI: "/users/YFF865/WorkOptimiser/Project/ParametersListSQL.xsjs",
        //var oThisObj = oEvent.getSource().getBindingContext().getObject();

        // Initialisation
        onInit: function () {
            var controller = this;

            // Dynamically add/remove UI5 elements (Panels, Tiles, etc)
            var oDynamicModel = new JSONModel();
            oDynamicModel.setData({
                dynamicParameterRowsBasePriorities: [],
                dynamicParameterRowsBasePrioritiesReset: [],
                dynamicParameterRowsStaffCount: [],
                dynamicParameterRowsTrainingStaff: [],
                dynamicParameterRowsWork: [],
                dynamicParameterRowsSickDays: [],
                dynamicParameterRowsStaffExperience: []
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
                    success: function (oData) {
                        controller.successCallBackBasePriorities(oData);
                    },
                    error: function (err) {
                        MessageToast.show(err);
                    }
                });
            }
        },

        // Dialog Control; Kill dialogs on Exit
        onExit: function () {
            if (this._oDialogBasePriorities) {
                this._oDialogBasePriorities.destroy();
            }
            if (this._oDialogTrainingStaff) {
                this._oDialogTrainingStaff.destroy();
            }
            if (this._oDialogWork) {
                this._oDialogWork.destroy();
            }
            if (this._oDialogStaffExperience) {
                this._oDialogStaffExperience.destroy();
            }
            // ADD FURTHER DIALOGS HERE
            // if (this._oDialogMoreHere) {
            //     this._oDialogMoreHere.destroy();
            // }
        },

        // ODATA callback function
        successCallBackBasePriorities: function (response) {
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

						// Add new row of inputs; so far hard-coded the objects variable
				// 		var oNewDynamicRowItem = {
				// 			dynamicParameterBasePrioritiesName: prop,
				// 			dynamicParameterBasePrioritiesValue: response.results[0][prop]
				// 		};
				// 		var oNewDynamicRowItemReset = {
				// 			dynamicParameterBasePrioritiesName: prop,
				// 			dynamicParameterBasePrioritiesValue: response.results[0][prop]
				// 		};
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

        // Create Base Priorities dialog, get the last entry row
        onBasePriorities: function (oEvent) {
            var oModel = new JSONModel();

            this._oDataModel.read("/Parameters", {
                urlParameters: {
                    $orderby: "DATE desc",
                    $top: 1
                },
                success: function (oData) {
                    // Reverse Pivot the Input table
                    var propArray = [];

                    // For every property/column in your data set.
                    for (var prop in oData.results[0]) {
                        // Split Slice Front String; can't call the function in ODATA read
                        var tokens1 = prop.split('_').slice(0, 2);
                        var frontString = tokens1.join('_');

                        // Add split string checker, check if front string belongs in the Parameter List
                        if (frontString === "AVG_PRIORITY") {
                            // Create a new JSON object.
                            var jObject = {
                                name: prop,
                                value: oData.results[0][prop]
                            };
                            // Push it into an array.
                            propArray.push(jObject);
                        }
                    }
                    console.log(propArray);
                    oModel.setData(propArray);
                },
                error: function (err) {
                    MessageToast.show(err);
                }
            });
            console.log(oModel);

            if (!this._oDialogBasePriorities) {
                this._oDialogBasePriorities = sap.ui.xmlfragment("ScenarioMod.view.DialogBasePriorities", this);

                // Use manifest Model + JSON model (if applicable)
                this._oDialogBasePriorities.setModel(oModel);
                this._oDialogBasePriorities.setModel(this.getOwnerComponent().getModel("i18n"), "i18n");
            }
            this._oDialogBasePriorities = this.createDialogSettings(this._oDialogBasePriorities, oEvent);

            // Open dialog
            this._oDialogBasePriorities.open();
        },

        // Create Training Staff dialog; DIRECTLY from JSON file
        onTrainingStaff: function (oEvent) {
            // set JSON model on this Dialog fragment
            var oExistingModel = new JSONModel();
            var oNewModel = new JSONModel();

            oExistingModel.loadData(jQuery.sap.getModulePath("ScenarioMod.localService.mockdata", "/TrainingStaff(Template).json"), "", false);
            var oData = oExistingModel.getProperty("/");

            // Pivot the Input table
            var propArray = [];
            // For every property/column in your data set.
            for (var index in oData) {
                // Create a new JSON object.
                var jObject = {
                    name: oData[index]['TRAINING_OPTION_ID'], // need to change this
                    value: oData[index]['TRAINING_OPTION_NAME'] // need to change this
                };
                // Push it into an array.
                propArray.push(jObject);
            }
            oNewModel.setData(propArray);

            if (!this._oDialogTrainingStaff) {
                this._oDialogTrainingStaff = sap.ui.xmlfragment("ScenarioMod.view.DialogTrainingStaff", this);

                // Use manifest Model + JSON model (if applicable)
                this._oDialogTrainingStaff.setModel(oNewModel);
                this._oDialogTrainingStaff.setModel(this.getOwnerComponent().getModel("i18n"), "i18n");
            }
            this._oDialogTrainingStaff = this.createDialogSettings(this._oDialogTrainingStaff, oEvent);

            // Open dialog
            this._oDialogTrainingStaff.open();
        },

        // Create Work dialog; DIRECTLY from JSON file
        onWork: function (oEvent) {
            // set JSON model on this Dialog fragment
            var oExistingModel = new JSONModel();
            var oNewModel = new JSONModel();

            oExistingModel.loadData(jQuery.sap.getModulePath("ScenarioMod.localService.mockdata", "/Work(Template).json"), "", false);
            var oData = oExistingModel.getProperty("/");

            // Pivot the Input table
            var propArray = [];
            // For every property/column in your data set.
            for (var index in oData) {
                // Create a new JSON object.
                var jObject = {
                    name: oData[index]['WORK_ID'], // need to change this
                    value: oData[index]['WORK_NAME'] // need to change this
                };
                // Push it into an array.
                propArray.push(jObject);
            }
            oNewModel.setData(propArray);

            if (!this._oDialogWork) {
                this._oDialogWork = sap.ui.xmlfragment("ScenarioMod.view.DialogWork", this);

                // Use manifest Model + JSON model (if applicable)
                this._oDialogWork.setModel(oNewModel);
                this._oDialogWork.setModel(this.getOwnerComponent().getModel("i18n"), "i18n");
            }

            this._oDialogWork = this.createDialogSettings(this._oDialogWork, oEvent);

            // Open dialog
            this._oDialogWork.open();
        },

        // ADD RESPECTIVE DIALOG FUNCTIONS
        // Create Staff Experience dialog; THIS IS NOT COMPLETED BECAUSE NO JSON DATA WAS CREATED FOR THE Training Staff dialog
        onStaffExperience: function (oEvent) {

        },

        // String split and slice at N occurrence of character, get the front part
        splitSliceFrontString: function (str, delimiter, start) {
            var tokens1 = str.split(delimiter).slice(0, start);
            return tokens1.join(delimiter);
        },

        // String split and slice at N occurrence of character, get the back part
        splitSliceBackString: function (str, delimiter, start) {
            var tokens2 = str.split(delimiter).slice(start);
            return tokens2.join(delimiter);
        },

        // Create all Dialogs using this dialog settings
        createDialogSettings: function (dialog, dialogEvent) {
            // Multi-select required
            var bMultiSelect = !!dialogEvent.getSource().data("multi");
            dialog.setMultiSelect(bMultiSelect);

            // Remember selections required
            var bRemember = !!dialogEvent.getSource().data("remember");
            dialog.setRememberSelections(bRemember);

            // Clear the old search filter
            dialog.getBinding("items").filter([]);

            // Toggle compact style
            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), dialog);

            return dialog;
        },

        // Handle Dialog searching; Very slow, need to ask Tom for help
        onDialogSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            console.log(sValue);
            // JSON filter, non-caps sensitive
            var oFilter1 = new Filter("value", FilterOperator.Contains, sValue);
            var oCombineFilter = new Filter([oFilter1]);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oCombineFilter]);
        },

        // Confirm or Close the dialog; Either Add or Remove dynamic Base Priorities categories
        onAddRemoveCategoryBasePriorities: function (oEvent) {
            // Display the MessageToast with the selected item description
            var aContexts = oEvent.getParameter("selectedContexts");
            if (aContexts.length) {
                MessageToast.show("You have chosen " + aContexts.map(function (oContext) {
                    return oContext.getObject().name;
                }).join(", "));
            }
            // Reset Dialog filter
            oEvent.getSource().getBinding("items").filter([]);

            // Get the ParametersList model itself
            var oParametersListModel = this.getView().getModel();

            // Get the array of the Dynamic Parameters CustomListItem
            var dynamicRowsItems = oParametersListModel.getProperty("/dynamicParameterRowsBasePriorities");

            // Get the objects list from the selected items within the Dialog context
            var oObjects = aContexts.map(function (oContext) {
                return oContext.getObject();
            });

            // If items are selected, add dynamically to the Dynamic Parameters List,
            // Else, remove dynamically from the Dynamic Parameters List
            dynamicRowsItems.splice(0, dynamicRowsItems.length);

            if (oObjects.length) {
                for (var i = 0; i < oObjects.length; i++) {
                    // Add new row of inputs; so far hard-coded the objects variable
                    var oNewDynamicRowItem = {
                        dynamicParameterBasePrioritiesName: oObjects[i].name,
                        dynamicParameterBasePrioritiesValue: oObjects[i].value
                    };
                    dynamicRowsItems.push(oNewDynamicRowItem);
                }
            }

            // Store the updated array back to the model
            oParametersListModel.setProperty("/dynamicParameterRowsBasePriorities", dynamicRowsItems);
        },

        // Confirm or Close the dialog; Either Add or Remove dynamic Training Staff categories
        onAddRemoveCategoryTrainingStaff: function (oEvent) {
            // Display the MessageToast with the selected item description
            var aContexts = oEvent.getParameter("selectedContexts");
            if (aContexts.length) {
                MessageToast.show("You have chosen " + aContexts.map(function (oContext) {
                    return oContext.getObject().name;
                }).join(", "));
            }
            // Reset Dialog filter
            oEvent.getSource().getBinding("items").filter([]);

            // Get the ParametersList model itself
            var oParametersListModel = this.getView().getModel();

            // Get the array of the Dynamic Parameters CustomListItem
            var dynamicRowsItems = oParametersListModel.getProperty("/dynamicParameterRowsTrainingStaff");

            // Get the objects list from the selected items within the Dialog context
            var oObjects = aContexts.map(function (oContext) {
                return oContext.getObject();
            });

            // If items are selected, add dynamically to the Dynamic Parameters List,
            // Else, remove dynamically from the Dynamic Parameters List
            dynamicRowsItems.splice(0, dynamicRowsItems.length);

            if (oObjects.length) {
                for (var i = 0; i < oObjects.length; i++) {
                    // Add new row of inputs; so far hard-coded the objects variable
                    var oNewDynamicRowItem = {
                        dynamicParameterTrainingStaffName: oObjects[i].name,
                        dynamicParameterTrainingStaffValue: oObjects[i].value
                    };
                    dynamicRowsItems.push(oNewDynamicRowItem);
                }
            }

            // Store the updated array back to the model
            oParametersListModel.setProperty("/dynamicParameterRowsTrainingStaff", dynamicRowsItems);
        },

        // Confirm or Close the dialog; Either Add or Remove dynamic Work categories
        onAddRemoveCategoryWork: function (oEvent) {
            // Display the MessageToast with the selected item description
            var aContexts = oEvent.getParameter("selectedContexts");
            if (aContexts.length) {
                MessageToast.show("You have chosen " + aContexts.map(function (oContext) {
                    return oContext.getObject().name;
                }).join(", "));
            }
            // Reset Dialog filter
            oEvent.getSource().getBinding("items").filter([]);

            // Get the ParametersList model itself
            var oParametersListModel = this.getView().getModel();

            // Get the array of the Dynamic Parameters CustomListItem
            var dynamicRowsItems = oParametersListModel.getProperty("/dynamicParameterRowsWork");

            // Get the objects list from the selected items within the Dialog context
            var oObjects = aContexts.map(function (oContext) {
                return oContext.getObject();
            });

            // If items are selected, add dynamically to the Dynamic Parameters List,
            // Else, remove dynamically from the Dynamic Parameters List
            dynamicRowsItems.splice(0, dynamicRowsItems.length);

            if (oObjects.length) {
                for (var i = 0; i < oObjects.length; i++) {
                    // Add new row of inputs; so far hard-coded the objects variable
                    var oNewDynamicRowItem = {
                        dynamicParameterRowsWorkName: oObjects[i].name,
                        dynamicParameterRowsWorkValue: oObjects[i].value
                    };
                    dynamicRowsItems.push(oNewDynamicRowItem);
                }
            }

            // Store the updated array back to the model
            oParametersListModel.setProperty("/dynamicParameterRowsWork", dynamicRowsItems);
        },

        // Confirm or Close the dialog; Either Add or Remove dynamic StaffExperience categories
        onAddRemoveStaffExperience: function (oEvent) {

        },

        // // Confirm or Close the dialog; Either Add or Remove dynamic type categories
        // onSampleAddRemoveCategoryType: function(oEvent) {
        // 	// Get the event's dialog xml ID
        // 	var sDialogID = oEvent.getParameter("id");
        // 	var splitDialogID = sDialogID.substr(sDialogID.indexOf('_') + 1);
        //
        // 	// Display the MessageToast with the selected item description
        // 	var aContexts = oEvent.getParameter("selectedContexts");
        // 	if (aContexts.length) {
        // 		MessageToast.show("You have chosen " + aContexts.map(function(oContext) {
        // 			var singleObject = oContext.getObject();
        // 			return singleObject['' + splitDialogID + '_ID'];
        // 		}).join(", "));
        // 	}
        // 	// Reset Dialog filter
        // 	oEvent.getSource().getBinding("items").filter([]);
        //
        // 	// Get the ParametersList model itself
        // 	var oParametersListModel = this.getView().getModel();
        //
        // 	// Get the array of the Dynamic Parameters CustomListItem
        // 	var dynamicRowsItems = oParametersListModel.getProperty("/dynamicParameterRowsType");
        //
        // 	// Get the objects list from the selected items within the Dialog context
        // 	var oObjects = aContexts.map(function(oContext) {
        // 		return oContext.getObject();
        // 	});
        //
        // 	// If items are selected, add dynamically to the Dynamic Parameters List,
        // 	// Else, remove dynamically from the Dynamic Parameters List
        // 	dynamicRowsItems.splice(0, dynamicRowsItems.length);
        //
        // 	if (oObjects.length) {
        // 		for (var i = 0; i < oObjects.length; i++) {
        // 			// Add new row of inputs; so far hard-coded the objects variable
        // 			var oNewDynamicRowItem = {
        // 				dynamicParameterTypeID: oObjects[i]['' + splitDialogID + '_ID'],
        // 				dynamicParameterTypeTitle: oObjects[i]['' + splitDialogID + '_NAME'],
        // 				dynamicParameterTypeInput: ""
        // 			};
        // 			// console.log(oObjects[i]);
        // 			dynamicRowsItems.push(oNewDynamicRowItem);
        // 		}
        // 	}
        //
        // 	// Store the updated array back to the model
        // 	oParametersListModel.setProperty("/dynamicParameterRowsType", dynamicRowsItems);
        // },

        // Model the parameters
        onParametersModel: function () {
            var controller = this;

            // Get the ParametersList model itself
            var oParametersListModel = this.getView().getModel();

            // Get the array of the Dynamic Parameters CustomListItem
            var dynamicRowsItems = oParametersListModel.getProperty("/dynamicParameterRowsBasePriorities");
            console.log(dynamicRowsItems);

            // Check if invalid inputs or empty inputs, if true instantly return out.
            for (var rowItem in dynamicRowsItems) {
                // Regex
                if (dynamicRowsItems[rowItem]['dynamicParameterBasePrioritiesValue'].match(/[^.\d]/)) { // Regex match parameter.match(/[^$,.\d]/
                    MessageToast.show("Invalid input on", dynamicRowsItems[rowItem]['dynamicParameterBasePrioritiesName'], ", must be numeric and not empty.");
                    return;
                }
                // Negative values
                if (dynamicRowsItems[rowItem]['dynamicParameterBasePrioritiesValue'] < 0){
                    MessageToast.show("Invalid input on" ,dynamicRowsItems[rowItem]['dynamicParameterBasePrioritiesName'], ", must be positive value");
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
                success: function (response) {
                    MessageToast.show(response);
                    controller.updateChart();
                },
                error: function (err) {
                    MessageToast.show(err);
                }
            });
        },

        // Call function to reload the chart
        updateChart: function () {
            // var comp = this.getOwnerComponent().getMetadata(); // this is the view i am referring to here.
            // var rootView = comp.getRootView();
            // console.log(rootView);

            var chartController = sap.ui.getCore().byId("__xmlview0--visualisation--vizChart").getController();
            chartController.loadChart();
        },

        // Reset the parameters
        onParametersReset: function () {
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