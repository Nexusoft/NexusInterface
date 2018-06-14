/** Collection of Javascript Functions to keep track of all
	Registered Resources in Use for Interface.
	
	This includes Systems, Modules, Scripts, and Stylesheets
	
**/

/** Declare the Namespace for the AJAX Functions. **/
var REGISTRY = REGISTRY || {};

/** Declare the Namespace for Registration Functions. **/
REGISTRY.REGISTER = REGISTRY.REGISTER || {};
REGISTRY.UNREGISTER = REGISTRY.UNREGISTER || {};

/** 						
_____________________________________________________________________________________ 

		Systems Registry
_____________________________________________________________________________________ **/

/** Array to keep track of all System Resources. **/
REGISTRY.Systems = REGISTRY.Systems || {};

/** Registration Function to register a System. **/
REGISTRY.REGISTER.System = function(ID, Label, Icon) {
  REGISTRY.Systems[ID] = {};
  REGISTRY.Systems[ID].Label = Label;
  if (Icon === undefined) {
    Icon = "";
  }
  REGISTRY.Systems[ID].Icon = Icon;
  REGISTRY.Systems[ID].Modules = {};
};

/** Registration Function to register a Module to a System. 
	Module Registrations Contain Database Foreign Key for System,
  Primary Record key for Module, Filepath, Navigation Label, Meta **/
// When we register a module we pass in the label. We could also pass in the image src.
// To test i will need to add it here and to the index.html file for the app where the items are defined and passed into the registry.

REGISTRY.REGISTER.Module = function(
  System,
  ID,
  Location,
  Label,
  Scripts,
  Stylesheets,
  Icon,
  hidden
) {
  if (Icon === undefined) {
    Icon = "";
  }
  if (Scripts === undefined) {
    Scripts = "";
  }

  if (Stylesheets == undefined) {
    Stylesheets = "";
  }

  REGISTRY.Systems[System].Modules[ID] = {
    Location,
    Label,
    Scripts,
    Stylesheets,
    Icon,
    hidden
  };
};

/** 						
_____________________________________________________________________________________ 

		Themes Registry
_____________________________________________________________________________________ **/

/** Registration Function to register Theme Colors from Database. **/
REGISTRY.REGISTER.Theme = function(Color) {};

REGISTRY.REGISTER.ContextMenu = function() {
  return;
};
