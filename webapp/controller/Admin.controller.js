sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, UIComponent, Fragment, Filter, FilterOperator, MessageToast, History) {
    "use strict";

    return Controller.extend("project1.controller.Admin", {
        onInit: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteAdmin").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function () {
            this._updateStats();
        },

        _updateStats: function () {
            var oModel = this.getView().getModel("maintenance");
            var aTickets = oModel.getProperty("/tickets");

            // --- Admin Stats ---
            var iPending = aTickets.filter(function(t){ return t.status === 'Pending'; }).length;
            var iInProgress = aTickets.filter(function(t){ return t.status === 'In Progress'; }).length;
            var iCompleted = aTickets.filter(function(t){ return t.status === 'Completed'; }).length;

            oModel.setProperty("/stats/pending", iPending);
            oModel.setProperty("/stats/inprogress", iInProgress);
            oModel.setProperty("/stats/completedAdmin", iCompleted);

            // --- Sync Student Stats (Global Consistency) ---
            // Active = Pending + In Progress (Everything not completed)
            var iStudentActive = aTickets.filter(function(t){ return t.status !== 'Completed'; }).length;
            var iStudentCompleted = iCompleted;

            oModel.setProperty("/stats/active", iStudentActive);
            oModel.setProperty("/stats/completed", iStudentCompleted);
        },

        onFilterSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            var oTable = this.byId("adminTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            if (sKey !== "All") {
                aFilters.push(new Filter("status", FilterOperator.EQ, sKey));
            }

            oBinding.filter(aFilters);
        },

        onPressAction: function (oEvent) {
            var oItem = oEvent.getSource().getParent();
            var oContext = oItem.getBindingContext("maintenance");
            this._sPath = oContext.getPath();
            var oData = oContext.getObject();

            if (oData.status === "Pending") {
                this._openAssignDialog();
            } else if (oData.status === "In Progress") {
                this._openCompleteDialog();
            } else {
                 this._openDetailsDialog(oContext);
            }
        },

        onListItemPress: function (oEvent) {
             var oContext = oEvent.getSource().getBindingContext("maintenance");
             this._openDetailsDialog(oContext);
        },

        _openDetailsDialog: function (oContext) {
             var oView = this.getView();
            if (!this._pDetailsDialog) {
                this._pDetailsDialog = Fragment.load({
                    id: oView.getId(),
                    name: "project1.view.fragments.TicketDetails",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pDetailsDialog.then(function (oDialog) {
                oDialog.setBindingContext(oContext, "maintenance");
                oDialog.open();
            });
        },

        onCloseDetails: function () {
             this._pDetailsDialog.then(function (oDialog) {
                oDialog.close();
            });
        },

        _openAssignDialog: function () {
            var oView = this.getView();
            if (!this._pAssignDialog) {
                this._pAssignDialog = Fragment.load({
                    id: oView.getId(),
                    name: "project1.view.fragments.AssignTechnician",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pAssignDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onConfirmAssign: function () {
            // Get selected tech
            var oSelect = this.byId("techSelect");
            var sTech = oSelect.getSelectedKey(); // Simple simulation

            var oModel = this.getView().getModel("maintenance");
            oModel.setProperty(this._sPath + "/status", "In Progress");
            oModel.setProperty(this._sPath + "/technician", sTech); // Assuming we added technician field logic or mock

            this._pAssignDialog.then(function(oDialog){ oDialog.close(); });
            MessageToast.show("Technician Assigned Successfully");
            this._updateStats();
        },

        onCancelAssign: function () {
             this._pAssignDialog.then(function(oDialog){ oDialog.close(); });
        },

        _openCompleteDialog: function () {
            var oView = this.getView();
            if (!this._pCompleteDialog) {
                this._pCompleteDialog = Fragment.load({
                    id: oView.getId(),
                    name: "project1.view.fragments.CompleteTicket",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pCompleteDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onConfirmComplete: function () {
            var oModel = this.getView().getModel("maintenance");
            oModel.setProperty(this._sPath + "/status", "Completed");

            this._pCompleteDialog.then(function(oDialog){ oDialog.close(); });
            MessageToast.show("Ticket Completed");
             this._updateStats();
        },

        onCancelComplete: function () {
            this._pCompleteDialog.then(function(oDialog){ oDialog.close(); });
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("RouteHome", {}, true);
            }
        }
    });
});
