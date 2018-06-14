/** Collection of Javascript Functions to dynamically 
	insert corresponding Structures.
	
	This can include Tabs, Table Views, Filters, etc. 
	
**/

/** Declare the Namespace for the AJAX Functions. **/
var CREATE = CREATE || {};

/** Create a Small Button. **/
CREATE.Button = function(Small) {
	var Element = document.createElement('div');
	
	/** Add the Proper CSS Classes. **/
	//Element.classList.add('button');
	Element.classList.add('static');
	
	/** Append the Small Class if Submitted. **/
	if(Small !== undefined && Small == true)
		Element.classList.add('small');
		
	Element.classList.add('wwt');
	Element.classList.add('flat');
    
    /* Handle button transition classes. */
    Element.classList.add('border-transaition');
	
	return Element;
}
