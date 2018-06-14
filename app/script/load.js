/** Collection of Javascript Functions to dynamically 
	load new content into the DOM.
	
	This includes Systems, Modules, Scripts, and Stylesheets
	
**/

/** Declare the Namespace for the AJAX Functions. **/
var LOAD = LOAD || {};

/** Load Registry to keep track of all loaded Tags. **/
LOAD.Registry = LOAD.Registry || [];

LOAD.Analytics = require("./script/googleanalytics.js");

/** Load the Module into the Interface Pane.
 Relies on the REGISTRY based on System and Module ID's. **/
LOAD.Module = function(System, Module) {
  console.log(System, Module);
  if (
    INTERFACE.Current.System != System ||
    INTERFACE.Current.Module != Module
  ) {
    /** Close any Modals that are Open. **/

    /** Show the Loader. **/
    AJAX.LOADER.Show();

    /** Handle the Fade in Styles. **/
    document
      .getElementById(INTERFACE.Dashboard)
      .classList.add("fade-transition");
    document.getElementById(INTERFACE.Dashboard).style.opacity = 0;

    /** Assign the Current Module. **/
    INTERFACE.Current.System = System;
    INTERFACE.Current.Module = Module;

    /** Reset the Module Callback Function. **/
    AJAX.CALLBACK.MODULE.Init = undefined;
    AJAX.CALLBACK.MODULE.Final = undefined;

    /** Remove previous Scripts / Stylesheets if previous Module has been loaded. **/
    for (var index = 0; index < LOAD.Registry.length; index++)
      LOAD.Registry[index].parentNode.removeChild(LOAD.Registry[index]);

    /** Clear the Load Registry. **/
    LOAD.Registry = [];
    LOAD.Analytics.GANALYTICS.SendScreen(
      REGISTRY.Systems[System].Modules[Module].Label
    );
    /** Load the External Module Stylesheets. **/
    for (
      var index = 0;
      index < REGISTRY.Systems[System].Modules[Module].Stylesheets.length;
      index++
    )
      LOAD.Style(REGISTRY.Systems[System].Modules[Module].Stylesheets[index]);

    /** Load the External Module Javascripts. **/
    LOAD.Scripts(System, Module, 0);
    //for(var index = 0; index < REGISTRY.Systems[System].Modules[Module].Scripts.length; index++)
    //	LOAD.Script(REGISTRY.Systems[System].Modules[Module].Scripts[index]);
  } /** Load the Pane File with AJAX. **/ else
    AJAX.ID(
      REGISTRY.Systems[System].Modules[Module].Location + "index.html",
      INTERFACE.Dashboard
    );
};

/** Load the Module into the Interface Pane.
 Relies on the REGISTRY based on System and Module ID's. **/
LOAD.Overview = function(System, Module, TagID) {
  /** Remove previous Scripts / Stylesheets if previous Module has been loaded. **/
  for (var index = 0; index < LOAD.Registry.length; index++)
    LOAD.Registry[index].parentNode.removeChild(LOAD.Registry[index]);

  /** Clear the Load Registry. **/
  LOAD.Registry = [];

  /** Reset the Module Callback Function. **/
  AJAX.CALLBACK.MODULE.Init = undefined;
  AJAX.CALLBACK.MODULE.Final = undefined;

  /** Load the External Module Stylesheets. **/
  for (
    var index = 0;
    index < REGISTRY.Systems[System].Modules[Module].Stylesheets.length;
    index++
  )
    LOAD.Style(REGISTRY.Systems[System].Modules[Module].Stylesheets[index]);

  /** Load the External Module Javascripts. **/
  for (
    var index = 0;
    index < REGISTRY.Systems[System].Modules[Module].Scripts.length;
    index++
  )
    LOAD.Script(REGISTRY.Systems[System].Modules[Module].Scripts[index]);

  /** Load the Pane File with AJAX. **/
  AJAX.ID(
    REGISTRY.Systems[System].Modules[Module].Location +
      "index.html?system=" +
      System,
    INTERFACE.Dashboard
  );

  /** Assign the Current Module. **/
  INTERFACE.Current.System = System;
  INTERFACE.Current.Module = Module;
};

/** Create a new Script Element in the Document Header.
 Name Attribute is to remove any inserted Scripts. **/
LOAD.Scripts = function(System, Module, Index) {
  if (Index == REGISTRY.Systems[System].Modules[Module].Scripts.length) {
    AJAX.ID(
      REGISTRY.Systems[System].Modules[Module].Location +
        "index.html?module=" +
        Module,
      INTERFACE.Dashboard
    );

    return;
  }

  /** Get the Head Element. **/
  var Head = document.getElementsByTagName("head").item(0);

  /** Create the Script Tag. **/
  var Script = document.createElement("script");
  Script.type = "text/javascript";
  Script.src = REGISTRY.Systems[System].Modules[Module].Scripts[Index];
  Script.onload = function() {
    LOAD.Scripts(System, Module, Index + 1);
  };

  /** Update the Registry. **/
  LOAD.Registry.push(Script);

  /** Insert the Script into the Head. **/
  Head.appendChild(Script);
};

/** Create a new Script Element in the Document Header.
 Name Attribute is to remove any inserted Scripts. **/
LOAD.Script = function(Location) {
  /** Get the Head Element. **/
  var Head = document.getElementsByTagName("head").item(0);

  /** Create the Script Tag. **/
  var Script = document.createElement("script");
  Script.type = "text/javascript";
  Script.src = Location;

  /** Update the Registry. **/
  LOAD.Registry.push(Script);

  /** Insert the Script into the Head. **/
  Head.appendChild(Script);
};

/** Create a new Link Element in the Document Header.
 Name Attribute is to remove any inserted Styles. **/
LOAD.Style = function(Location) {
  /** Get the Head Element. **/
  var Head = document.getElementsByTagName("head").item(0);

  /** Create the Script Tag. **/
  var Link = document.createElement("link");
  Link.type = "text/css";
  Link.rel = "stylesheet";
  Link.href = Location;

  /** Update the Registry. **/
  LOAD.Registry.push(Link);

  /** Insert the Script into the Head. **/
  Head.appendChild(Link);
};
