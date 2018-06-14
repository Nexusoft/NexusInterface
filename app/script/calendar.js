var CALENDAR = CALENDAR || {};

CALENDAR.Calendar = function(model, options, date) {
  // Default Values
  this.Options = {
    Color: "",
    LinkColor: "",
    NavShow: true,
    NavVertical: false,
    NavLocation: "",
    DateTimeShow: true,
    DateTimeFormat: "mmm, yyyy",
    DatetimeLocation: "",
    EventClick: "",
    EventTargetWholeDay: false,
    DisabledDays: [],
    ModelChange: model
  };
  // Overwriting default values
  for (var key in options) {
    this.Options[key] =
      typeof options[key] == "string"
        ? options[key].toLowerCase()
        : options[key];
  }

  model ? (this.Model = model) : (this.Model = {});
  this.Today = new Date();

  this.Selected = this.Today;
  this.Today.Month = this.Today.getMonth();
  this.Today.Year = this.Today.getFullYear();
  if (date) {
    this.Selected = date;
  }
  this.Selected.Month = this.Selected.getMonth();
  this.Selected.Year = this.Selected.getFullYear();

  this.Selected.Days = new Date(
    this.Selected.Year,
    this.Selected.Month + 1,
    0
  ).getDate();
  this.Selected.FirstDay = new Date(
    this.Selected.Year,
    this.Selected.Month,
    1
  ).getDay();
  this.Selected.LastDay = new Date(
    this.Selected.Year,
    this.Selected.Month + 1,
    0
  ).getDay();

  this.Prev = new Date(this.Selected.Year, this.Selected.Month - 1, 1);
  if (this.Selected.Month == 0) {
    this.Prev = new Date(this.Selected.Year - 1, 11, 1);
  }
  this.Prev.Days = new Date(
    this.Prev.getFullYear(),
    this.Prev.getMonth() + 1,
    0
  ).getDate();
};

CALENDAR.createCalendar = function(calendar, element, adjuster) {
  try {
    document.getElementById("calendar").innerHTML = "";
  } catch (err) {}

  var mainSection = document.createElement("div");
  mainSection.className += "cld-main";
  calendar.Model = BACKUPS.schedule;
  if (typeof adjuster !== "undefined") {
    var newDate = new Date(
      calendar.Selected.Year,
      calendar.Selected.Month + adjuster,
      1
    );
    calendar = new CALENDAR.Calendar(calendar.Model, calendar.Options, newDate);
    element.innerHTML = "";
  } else {
    for (var key in calendar.Options) {
      typeof calendar.Options[key] != "function" &&
      typeof calendar.Options[key] != "object" &&
      calendar.Options[key]
        ? (element.className += " " + key + "-" + calendar.Options[key])
        : 0;
    }
  }
  var months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  if (calendar.Options.Color) {
    mainSection.innerHTML +=
      "<style>.cld-main{color:" + calendar.Options.Color + ";}</style>";
  }
  if (calendar.Options.LinkColor) {
    mainSection.innerHTML +=
      "<style>.cld-title a{color:" + calendar.Options.LinkColor + ";}</style>";
  }
  element.appendChild(mainSection);

  var status_bar = document.createElement("tr");
  status_bar.style.color = "green";

  var td1 = document.createElement("td");
  td1.id = "status_bar";
  td1.style = "width:400px;text-align:-webkit-center"; //move this to style?

  td1.appendChild(document.createTextNode(""));

  status_bar.appendChild(td1);
  element.appendChild(status_bar);

  if (calendar.Options.NavShow && calendar.Options.NavVertical) {
    AddSidebar();
  }
  if (calendar.Options.DateTimeShow) {
    AddDateTime(calendar, months, element, mainSection);
  }
  AddLabels(mainSection);
  AddDays(calendar, mainSection);
};

CALENDAR.calendar = function(el, data, settings) {
  var obj = new CALENDAR.Calendar(data, settings);
  CALENDAR.createCalendar(obj, el);
};

function AddSidebar() {
  var sidebar = document.createElement("div");
  sidebar.className += "cld-sidebar";

  var monthList = document.createElement("ul");
  monthList.className += "cld-monthList";

  for (var i = 0; i < months.length - 3; i++) {
    var x = document.createElement("li");
    x.className += "cld-month";
    var n = i - (4 - calendar.Selected.Month);
    // Account for overflowing month values
    if (n < 0) {
      n += 12;
    } else {
      if (n > 11) {
        n -= 12;
      }
    }
    // Add Appropriate Class
    if (i == 0) {
      x.className += " cld-rwd cld-nav";
      x.addEventListener("click", function PrevMonthBtn() {
        typeof calendar.Options.ModelChange == "function"
          ? (calendar.Model = calendar.Options.ModelChange())
          : (calendar.Model = calendar.Options.ModelChange);
        createCalendar(calendar, element, -1);
      });
      x.innerHTML +=
        '<svg height="15" width="15" viewBox="0 0 100 75" fill="rgba(255,255,255,0.5)"><polyline points="0,75 100,75 50,0"></polyline></svg>';
    } else {
      if (i == months.length - 4) {
        x.className += " cld-fwd cld-nav";
        x.addEventListener("click", function NextMonthBtn() {
          typeof calendar.Options.ModelChange == "function"
            ? (calendar.Model = calendar.Options.ModelChange())
            : (calendar.Model = calendar.Options.ModelChange);
          CALENDAR.createCalendar(calendar, element, 1);
        });
        x.innerHTML +=
          '<svg height="15" width="15" viewBox="0 0 100 75" fill="rgba(255,255,255,0.5)"><polyline points="0,0 100,0 50,75"></polyline></svg>';
      } else {
        if (i < 4) {
          x.className += " cld-pre";
        } else {
          if (i > 4) {
            x.className += " cld-post";
          } else {
            x.className += " cld-curr";
          }
        }
      }
    }
    //prevent losing var adj value (for whatever reason that is happening)
    (function() {
      var adj = i - 4;

      x.addEventListener("click", function() {
        typeof calendar.Options.ModelChange == "function"
          ? (calendar.Model = calendar.Options.ModelChange())
          : (calendar.Model = calendar.Options.ModelChange);
        CALENDAR.createCalendar(calendar, element, adj);
      });
      x.setAttribute("style", "opacity:" + (1 - Math.abs(adj) / 4));
      x.innerHTML += months[n].substr(0, 3);
    })(); // immediate invocation

    if (n == 0) {
      var y = document.createElement("li");
      y.className += "cld-year";
      if (i < 5) {
        y.innerHTML += calendar.Selected.Year;
      } else {
        y.innerHTML += calendar.Selected.Year + 1;
      }
      monthList.appendChild(y);
    }
    monthList.appendChild(x);
  }
  sidebar.appendChild(monthList);
  if (calendar.Options.NavLocation) {
    document.getElementById(calendar.Options.NavLocation).innerHTML = "";
    document.getElementById(calendar.Options.NavLocation).appendChild(sidebar);
  } else {
    element.appendChild(sidebar);
  }
}

function AddDateTime(calendar, months, element, mainSection) {
  // var calendar = document.getElementById('calendar');
  var datetime = document.createElement("div");
  datetime.className += "cld-datetime";
  if (calendar.Options.NavShow && !calendar.Options.NavVertical) {
    var rwd = document.createElement("div");
    rwd.className += " cld-rwd cld-nav";
    rwd.addEventListener("click", function() {
      CALENDAR.createCalendar(calendar, element, -1);
    });
    rwd.innerHTML =
      '<svg height="15" width="15" viewBox="0 0 75 100" fill="rgba(0,0,0,0.5)"><polyline points="0,50 75,0 75,100"></polyline></svg>';
    datetime.appendChild(rwd);
  }
  var today = document.createElement("div");
  today.className += " today";
  today.innerHTML =
    months[calendar.Selected.Month] + ", " + calendar.Selected.Year;
  datetime.appendChild(today);
  if (calendar.Options.NavShow && !calendar.Options.NavVertical) {
    var fwd = document.createElement("div");
    fwd.className += " cld-fwd cld-nav";
    fwd.addEventListener("click", function() {
      CALENDAR.createCalendar(calendar, element, 1);
    });
    fwd.innerHTML =
      '<svg height="15" width="15" viewBox="0 0 75 100" fill="rgba(0,0,0,0.5)"><polyline points="0,0 75,50 0,100"></polyline></svg>';
    datetime.appendChild(fwd);
  }
  if (calendar.Options.DatetimeLocation) {
    document.getElementById(calendar.Options.DatetimeLocation).innerHTML = "";
    document
      .getElementById(calendar.Options.DatetimeLocation)
      .appendChild(datetime);
  } else {
    mainSection.appendChild(datetime);
  }
}

function AddLabels(mainSection) {
  var labels = document.createElement("ul");
  labels.className = "cld-labels";
  var labelsList = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (var i = 0; i < labelsList.length; i++) {
    var label = document.createElement("li");
    label.className += "cld-label";
    label.innerHTML = labelsList[i];
    labels.appendChild(label);
  }
  mainSection.appendChild(labels);
}
function AddDays(calendar, mainSection) {
  // Create Number Element
  function DayNumber(n) {
    var number = document.createElement("p");
    number.className += "cld-number";
    number.innerHTML += n;
    return number;
  }
  var days = document.createElement("ul");
  days.className += "cld-days";
  // Previous Month's Days
  for (var i = 0; i < calendar.Selected.FirstDay; i++) {
    var day = document.createElement("li");
    day.className += "cld-day prevMonth";
    //Disabled Days
    var d = i % 7;
    for (var q = 0; q < calendar.Options.DisabledDays.length; q++) {
      if (d == calendar.Options.DisabledDays[q]) {
        day.className += " disableDay";
      }
    }
    var number = DayNumber(
      calendar.Prev.Days - calendar.Selected.FirstDay + (i + 1)
    );
    number.id =
      calendar.Selected.Month +
      " " +
      number.innerHTML +
      " " +
      calendar.Selected.Year;
    day.appendChild(number);
    days.appendChild(day);
  }
  // Current Month's Days

  for (var i = 0; i < calendar.Selected.Days; i++) {
    var day = document.createElement("li");
    day.className += "cld-day currMonth";

    //Disabled Days
    var d = (i + calendar.Selected.FirstDay) % 7;
    for (var q = 0; q < calendar.Options.DisabledDays.length; q++) {
      if (d == calendar.Options.DisabledDays[q]) {
        day.className += " disableDay";
      }
    }
    var number = DayNumber(i + 1);
    // Check Date against Event Dates
    for (var n = 0; n < calendar.Model.length; n++) {
      var evDate = new Date(calendar.Model[n].Date);
      var evType = calendar.Model[n].backuptype;
      var toDate = new Date(
        calendar.Selected.Year,
        calendar.Selected.Month,
        i + 1
      );

      if (
        evDate.getFullYear() == toDate.getFullYear() &&
        evDate.getMonth() == toDate.getMonth() &&
        evDate.getDate() == toDate.getDate()
      ) {
        if (evType == "automatic backup") {
          number.className += " eventday auto_backup";
        } else {
          number.className += " eventday manual_backup";
        }

        if (evDate < calendar.Today) {
          number.className += " past";
        }
      }
    }
    number.id =
      calendar.Selected.Month +
      1 +
      " " +
      number.innerHTML +
      " " +
      calendar.Selected.Year;
    //---if this day > than today we add ability to shuddle backup
    let thisDay = new Date(number.id);

    if (thisDay > calendar.Today) {
      number.setAttribute("onclick", `BACKUPS.Modal(this)`);
    }
    //-------------------------------------

    day.appendChild(number);
    // If Today..
    if (
      i + 1 == calendar.Today.getDate() &&
      calendar.Selected.Month == calendar.Today.Month &&
      calendar.Selected.Year == calendar.Today.Year
    ) {
      day.className += " today";
    }
    days.appendChild(day);
  }

  // Next Month's Days
  // Always same amount of days in calander
  var extraDays = 13;
  if (days.children.length > 35) {
    extraDays = 6;
  } else {
    if (days.children.length < 29) {
      extraDays = 20;
    }
  }

  for (var i = 0; i < extraDays - calendar.Selected.LastDay; i++) {
    var xday = document.createElement("li");
    xday.className += "cld-day nextMonth";
    //Disabled Days
    var d = (i + calendar.Selected.LastDay + 1) % 7;
    for (var q = 0; q < calendar.Options.DisabledDays.length; q++) {
      if (d == calendar.Options.DisabledDays[q]) {
        xday.className += " disableDay";
      }
    }

    var number = DayNumber(i + 1);
    number.id =
      calendar.Selected.Month +
      2 +
      " " +
      number.innerHTML +
      " " +
      calendar.Selected.Year;
    xday.appendChild(number);
    days.appendChild(xday);
  }
  mainSection.appendChild(days);
}

// looks like we are missing a function header.
