/** Javascript Functions to Handle Interface Specific Javascripts.
	menu.js handles the side menu navigation, if more functionality
	is wanted to incorporate into the generic interface beyond modules
	and the menu, put them in this source file and namespace.
	
	INTERFACE.Initialize() is the First Function called to Initialize the
	System.
**/

/**  **/
var INTERFACE = INTERFACE || {};	

/** Registry of Current Loaded Module. -1 is Flag for Generic Overview of Entire Interface. **/
INTERFACE.Current = { System: -1, Module: -1 };

INTERFACE.DefaultModule = { System: 1, Module: 1 };

/** Main Interface Tag ID. **/
INTERFACE.Dashboard = 'Dashboard';

/** Interface Alerts Sub Namespace. **/
INTERFACE.ALERTS = INTERFACE.ALERTS || {};

/** Handle Alerts Count. **/
INTERFACE.ALERTS.Count = INTERFACE.ALERTS.Count || {};
	
/** Initialize the Interface. **/
INTERFACE.Initialize = function() {

	/** Initialize the Modules into Registry. **/
	REGISTRY.Initialize();
	
	/** Generate the Module Registries. **/
	MENU.Generate();
		
	/** Generic first Pane to Load into the Interface. **/
	INTERFACE.Default();

	//LOAD.Module(INTERFACE.DefaultModule.System, INTERFACE.DefaultModule.Module);
};

INTERFACE.ALERTS.Reduce  = function(Amount) {
	INTERFACE.ALERTS.Count -= Amount;
	INTERFACE.ALERTS.Update();
};


INTERFACE.ALERTS.Update  = function() {
	if(INTERFACE.ALERTS.Count <= 0)
		document.getElementById('alerts-bubble').style.display = "none";
	else
		document.getElementById('alerts-bubble').innerHTML = INTERFACE.ALERTS.Count;
};


INTERFACE.ALERTS.Initialize  = function(Alerts) {
	INTERFACE.ALERTS.Count = Alerts;
	INTERFACE.ALERTS.Update();
};

/** Wrapper to Load Default Registered Module.
	Default Module Generated from Database. **/
INTERFACE.Default = function() {
	LOAD.Module(INTERFACE.DefaultModule.System, INTERFACE.DefaultModule.Module);
	
	/** Reset the Module Callback Function. **/
	// AJAX.CALLBACK.MODULE.Init  = undefined;
	// AJAX.CALLBACK.MODULE.Final = undefined;
	
	// AJAX.ID("modules/overview/index.html", "Dashboard", AJAX.CALLBACK.Standard);
};

/** Refresh the Interface based on the Current Loaded Module. **/
INTERFACE.Refresh = function() {
	AJAX.ID(REGISTRY.Systems[INTERFACE.Current.System].Modules[INTERFACE.Current.Module].Location + "?module=" + INTERFACE.Current.Module, INTERFACE.Dashboard);
    
	//LOAD.Module(INTERFACE.Current.System, INTERFACE.Current.Module);
};
