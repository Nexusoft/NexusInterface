/** Collection of Javascript Functions to keep track of all
	Registered Resources in Use for Interface.
	
	This includes Systems, Modules, Scripts, and Stylesheets
	
**/

/** Declare the Namespace for the AJAX Functions. **/
var ANIMATE = ANIMATE || {};


/** 						
_____________________________________________________________________________________ 

		Image Rotator Animation
_____________________________________________________________________________________ **/

ANIMATE.Rotator = {
	Paused : true,
	
	
	Rotate : function(el,speed){
		var elem = document.getElementById(el);
		if(navigator.userAgent.match("Chrome")){
			elem.style.WebkitTransform = "rotate("+degrees+"deg)";
		} else if(navigator.userAgent.match("Firefox")){
			elem.style.MozTransform = "rotate("+degrees+"deg)";
		} else if(navigator.userAgent.match("MSIE")){
			elem.style.msTransform = "rotate("+degrees+"deg)";
		} else if(navigator.userAgent.match("Opera")){
			elem.style.OTransform = "rotate("+degrees+"deg)";
		} else {
			elem.style.transform = "rotate("+degrees+"deg)";
		}
		
		if(animate) {
			looper = setTimeout('rotateAnimation(\''+el+'\','+speed+')',speed);
			degrees--;
			if(degrees <= 0)
				degrees = 359;
		}
	},

	Start : function(){
		animate = true;
		
		rotateAnimation("img1",10);
	},

	Stop : function(){
		animate = false;
	}
};