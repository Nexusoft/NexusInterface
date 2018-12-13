// Return Display Currency Nexus Value
// Returns the display currency based on the incoming currency using the incoming arracy as a look up
// Input:
//     inCurrency || String       || The Currency to display
//     inArray    || Object Array || The Array containing all the currency values
// Output:
//     String     || The Display Value for Each Nexus
export function ReturnDisplayCurrencyNexusValue(inCurrency, inArray) {
  let returnPrice = 0;
  inArray.forEach(element => {
    if (element.name == inCurrency) {
      returnPrice = element.price;
    }
  });
  return returnPrice;
}

// Return Currency Symbol
// Returns the display symbol based on the incoming currency using the incoming arracy as a look up
// Input:
//     inCurrency || String       || The Currency to display
//     inArray    || Object Array || The Array containing all the currency values
// Output:
//     String     || The Display  Symbol for the currency
export function ReturnCurrencySymbol(inCurrency, inArray) {
  let returnSymbol = '$'; //default

  inArray.forEach(element => {
    if (element.name === inCurrency) {
      returnSymbol = element.symbol;
    }
  });
  return returnSymbol;
}
