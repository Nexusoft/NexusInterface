/** menu.js

	This Script File contains the Necessary Standard Functions to handle the Dynamic Menu from the Main Console.
	General Format for Namespace in this Framework is all CAPS.

	Created by Colin Cantrell.

**/

/** Declare the Namespace for the MENU Functions. **/
var MENU = MENU || {};

/** Declare the Loaded Menu ID. -1 is flag for all menu's collapsed. **/
MENU.SelectedIndex = -1;

/** 						
_____________________________________________________________________________________ 

		Menu Generate Functions.
_____________________________________________________________________________________ **/

MENU.Generate = function() {
  /** Locate the Main Menu DIV Element. **/
  var Menu = document.getElementById("navigation-menu");

  /** Iterate by Keys in Reverse Order. **/
  var Keys = {},
    Index = {};
  Keys.System = Object.keys(REGISTRY.Systems);

  /** Unregister Systems. **/
  var Removal = [];

  /** Iterate through the Systems. **/
  for (Index.System = 0; Index.System < Keys.System.length; Index.System++) {
    /** Declare the System Index. **/
    var System = Keys.System[Index.System];

    /** Skip System if no Modules Registered. **/
    Keys.Module = Object.keys(REGISTRY.Systems[System].Modules);
    // if (Sy)
    //	continue;

    if (!REGISTRY.Systems[System].Modules["1"].hidden) {
      /** Generate the Systems Level Button. **/
      var Element = CREATE.Button();
      Element.id = "system-" + System;
      Element.style.width = "95%";
      Element.innerHTML = REGISTRY.Systems[System].Label;

      /** Add the Menu Execution Script. **/
      Element.setAttribute("system-id", System);
      Element.setAttribute(
        "onclick",
        'MENU.Show(this.getAttribute("system-id"))'
      );
      if (REGISTRY.Systems[System].Icon != "") {
        Element.innerHTML =
          `<img src="` +
          REGISTRY.Systems[System].Icon +
          `" alt="` +
          REGISTRY.Systems[System].Label +
          `" style="display:block;">`;
      } else {
        Element.innerHTML = REGISTRY.Systems[System].Label;
      }

      /** Add the Systems Navigation to the DOM. **/
      Menu.appendChild(Element);
    }

    /** Generate the Modules Container. **/
    var SubMenu = document.createElement("div");
    SubMenu.id = "system-menu-" + System;
    SubMenu.classList.add("resize-transition");
    SubMenu.style.height = "0px";
    SubMenu.style.overflow = "hidden";
    Menu.appendChild(Element);

    if (Keys.Module.length == 1) {
      Element.setAttribute("module-id", Keys.Module[0]);
      Element.setAttribute(
        "onclick",
        'LOAD.Module(this.getAttribute("system-id"), this.getAttribute("module-id"))'
      );
    } else {
      /* Iterate the modules in the registry to generate the sub menu items. */
      for (
        Index.Module = 0;
        Index.Module < Keys.Module.length && Keys.Module.length != 0;
        Index.Module++
      ) {
        /** Declare the Module Index. **/
        var Module = Keys.Module[Index.Module];

        /** Generate the Module Menu Item. **/
        var Element = CREATE.Button(true);
        Element.id = "module-" + Module;
        if (REGISTRY.Systems[System].Modules[Module].Icon != "") {
          Element.innerHTML =
            `<img src="` +
            REGISTRY.Systems[System].Modules[Module].Icon +
            `" alt="` +
            REGISTRY.Systems[System].Modules[Module].Label +
            `" style="display:block;">`;
        } else {
          Element.innerHTML = REGISTRY.Systems[System].Modules[Module].Label;
        }

        /** Add the Menu Execution Script. **/
        Element.setAttribute("module-id", Module);
        Element.setAttribute("system-id", System);
        Element.setAttribute(
          "onclick",
          'LOAD.Module(this.getAttribute("system-id"), this.getAttribute("module-id"))'
        );

        //draggable="true" ondragstart="drag(event)"
        Element.setAttribute("draggable", "true");
        Element.setAttribute("ondragstart", "ACTION.MOVE.Drag(event);");

        Element.style.width = "95%";
        SubMenu.appendChild(Element);
      }

      /** Add the Sub Menu to the Systems Registry. **/
      REGISTRY.Systems[System].SubMenu = SubMenu;

      /** Add the Sub Menu to the DOM. **/
      Menu.appendChild(SubMenu);
    }
  }
};

/** 						
_____________________________________________________________________________________ 

		Menu Execute Functions.
_____________________________________________________________________________________ **/

/** Hide the Current Menu by TagID. **/
MENU.Hide = function(ID) {
  /** Size the Sub Menu to 0 pixels from the Registry. **/
  REGISTRY.Systems[ID].SubMenu.style.height = "0px";
};

/** Show the Current Menu by TagID. **/
MENU.Show = function(ID) {
  /** Hide any Previous Menus. **/
  if (MENU.SelectedIndex !== -1) {
    MENU.Hide(MENU.SelectedIndex);

    /** Just hide the Menu if Clicked Twice. **/
    if (MENU.SelectedIndex == ID) {
      MENU.SelectedIndex = -1;
      return;
    }
  }

  /** Change the Menu Height: TODO Register the Required Height by Number of Modules in Menu.
   Each Module Menu Item is 38px **/
  REGISTRY.Systems[ID].SubMenu.style.height =
    Object.keys(REGISTRY.Systems[ID].Modules).length * 40 + "px";

  /** Set the Selected Visible Menu Item. **/
  MENU.SelectedIndex = ID;
};

/** Menu Registry Function. Used to Store Menu Data in a Client Side Array. **/
MENU.Register = function(TagID, TotalModules, Dashboard) {
  MENU.Registry[TagID]["modules"] = TotalModules;
  MENU.Registry[TagID]["dashboard"] = Dashboard;
};

/**
_____________________________________________________________________________________ 

	DROP DOWN FUNCTIONS FOR SETTINGS MENU
_____________________________________________________________________________________ **/

/* When the user clicks on the image, toggle between hiding and showing the dropdown content */
function securityToggle() {
  document.getElementById("security").classList.toggle("show");
  document.getElementById("notifications-dd").classList.remove("show");
  document.getElementById("settings").classList.remove("show");
  document.getElementById("console").classList.remove("show");
  document.getElementById("stakeWeight").classList.remove("show");
  document.getElementById("trustWeight").classList.remove("show");
  document.getElementById("IntrestRate").classList.remove("show");
  document.getElementById("blockWeight").classList.remove("show");
}
function notificationsToggle() {
  document.getElementById("notifications-dd").classList.toggle("show");
  document.getElementById("settings").classList.remove("show");
  document.getElementById("security").classList.remove("show");
  document.getElementById("console").classList.remove("show");
  document.getElementById("stakeWeight").classList.remove("show");
  document.getElementById("trustWeight").classList.remove("show");
  document.getElementById("IntrestRate").classList.remove("show");
  document.getElementById("blockWeight").classList.remove("show");
}
function settingsToggle() {
  document.getElementById("settings").classList.toggle("show");
  document.getElementById("console").classList.toggle("show");
  document.getElementById("notifications-dd").classList.remove("show");
  document.getElementById("security").classList.remove("show");
  document.getElementById("stakeWeight").classList.remove("show");
  document.getElementById("trustWeight").classList.remove("show");
  document.getElementById("IntrestRate").classList.remove("show");
  document.getElementById("blockWeight").classList.remove("show");
}
function stakingToggle() {
  document.getElementById("stakeWeight").classList.toggle("show");
  document.getElementById("trustWeight").classList.toggle("show");
  document.getElementById("IntrestRate").classList.toggle("show");
  document.getElementById("blockWeight").classList.toggle("show");
  document.getElementById("settings").classList.remove("show");
  document.getElementById("console").classList.remove("show");
  document.getElementById("notifications-dd").classList.remove("show");
  document.getElementById("security").classList.remove("show");
}
// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches(".dropbtn")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};
