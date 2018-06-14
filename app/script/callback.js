/** Callback.js

	This Script File contains the Necessary Standard Callback Functions to be used in General AJAX Requests.
	
	This also handles the three layers such as System, Module, Tab, and Table Level Views.
	Table Level Views are generally coded into the higher level codes, this can contain special callback functions
	that help in the dynamic insertion of a new row for table data expansion based on link.
	
	TODO: Create Script Files that allow the calling of specific function to auto generate the table data.
	This would require properly JSON formatted arrays as part of the input parameters. Should allow the creation
	of a table dynamically via Javascript. This might be a better PHP utility...

	Created by Colin Cantrell

**/

/** Declare the Namespace for the AJAX Functions. **/
var AJAX = AJAX || {};

/** 						
_____________________________________________________________________________________ 

		Loader Handlers
_____________________________________________________________________________________ **/

/** Declare the Namespace for the AJAX LOADER Handlers. **/
AJAX.LOADER = AJAX.LOADER || {};

/** Basic Loader Animation Handler for Future Callback Functions per Module. **/
AJAX.LOADER.Show = function(LoaderID) {
  if (LoaderID == undefined) LoaderID = "Loader";

  /** Set the Loader Opacity. **/
  let loader = document.getElementById(LoaderID);
  loader.style.opacity = 1;
  loader.style.visibility = "visible";
};

/** Basic Loader Animation Handler for Future Callback Functions per Module. **/
AJAX.LOADER.Hide = function(LoaderID) {
  if (LoaderID == undefined) LoaderID = "Loader";

  /** Set the Loader Opacity. **/
  let loader = document.getElementById(LoaderID);
  loader.style.visibility = "hidden";
  loader.style.opacity = 0;
};

/** 						
_____________________________________________________________________________________ 

		Callback Functions.
_____________________________________________________________________________________ **/

/** Declare the Namespace for the AJAX LOADER Handlers. **/
AJAX.CALLBACK = AJAX.CALLBACK || {};

/** Declare the Module Namespace. **/
AJAX.CALLBACK.MODULE = AJAX.CALLBACK.MODULE || {};

/** Standard Function to Handle Initial AJAX Transitions / Loaders. **/
AJAX.CALLBACK.Init = function(ResponseObject, TagID) {
  /** Show Loader on Ready State 1. **/
  if (ResponseObject.readyState == 1) {
    /** Show the Loader. **/
    AJAX.LOADER.Show();

    /** Handle the Fade in Styles. **/
    if (TagID !== undefined && TagID !== "") {
      document.getElementById(TagID).classList.add("fade-transition");
      document.getElementById(TagID).style.opacity = 0;
    }
  }

  return ResponseObject.readyState != 4;
};

/** Standard Function to Handle Final AJAX Transitions / Loaders. **/
AJAX.CALLBACK.Execute = function(ResponseObject, TagID) {
  /** Set the Content of the TagID from Response Object. **/
  if (ResponseObject.status == 200 && TagID !== undefined && TagID !== "")
    document.getElementById(TagID).innerHTML = ResponseObject.responseText;
  else if (TagID !== undefined && TagID !== "")
    /** Displace space with 404 Error if Response Status Code is not 200. **/
    document.getElementById(TagID).innerHTML =
      "<img src='images/404.png' class='center-screen'>";
};

/** Standard Function to Handle Final AJAX Transitions / Loaders. **/
AJAX.CALLBACK.Final = function(ResponseObject, TagID) {
  /** Handle Loaders. **/
  AJAX.LOADER.Hide();

  /** Handle the Fades in Styles. **/
  if (TagID !== undefined && TagID !== "") {
    document.getElementById(TagID).style.opacity = 1;

    /** Remove the Class from Tag after 2 seconds. **/
    setTimeout(function() {
      document.getElementById(TagID).classList.remove("fade-transition");
    }, 300);
  }
};

/** Standard Callback Function. Requires Ajax Object, Address, and DIV of the tag that is being changed. **/
AJAX.CALLBACK.Standard = function(ResponseObject, Address, TagID) {
  /** Handle the Generic Initialization. **/
  if (AJAX.CALLBACK.Init(ResponseObject, TagID)) return;

  /** Standard AJAX Module "On Load" Event Function. **/
  if (AJAX.CALLBACK.MODULE.Init !== undefined)
    AJAX.CALLBACK.MODULE.Init(ResponseObject, Address, TagID);

  /** Handle The Populating of AJAX Data to Body **/
  AJAX.CALLBACK.Execute(ResponseObject, TagID);

  /** Standard AJAX Module "On Load" Event Function. **/
  if (AJAX.CALLBACK.MODULE.Final !== undefined)
    AJAX.CALLBACK.MODULE.Final(ResponseObject, Address, TagID);

  /** Handle Final Callback for Fades and Loaders. **/
  setTimeout(function() {
    AJAX.CALLBACK.Final(ResponseObject, TagID);
  }, 250);
};

/** Basic Callback Function. Requires Ajax Object, Address, and DIV of the tag that is being changed. **/
AJAX.CALLBACK.Basic = function(ResponseObject, Address, TagID) {
  /** Handle the Generic Initialization. **/
  if (AJAX.CALLBACK.Init(ResponseObject, TagID)) return;

  /** Handle The Populating of AJAX Data to Body **/
  AJAX.CALLBACK.Execute(ResponseObject, TagID);

  /** Handle Final Callback for Fades and Loaders. **/
  setTimeout(function() {
    AJAX.CALLBACK.Final(ResponseObject, TagID);
  }, 250);
};

/** Standard Callback Function. Requires Ajax Object, Address, and DIV of the tag that is being changed. **/
AJAX.CALLBACK.Post = function(ResponseObject, Address, PostData, TagID) {
  /** Handle the Generic Initialization. **/
  if (AJAX.CALLBACK.Init(ResponseObject, TagID)) return;

  /** Handle Final Callback for Fades and Loaders. **/
  AJAX.CALLBACK.Execute(ResponseObject, TagID);

  /** Handle Final Callback for Fades and Loaders. **/
  setTimeout(function() {
    AJAX.CALLBACK.Final(ResponseObject, TagID);
  }, 250);
};
