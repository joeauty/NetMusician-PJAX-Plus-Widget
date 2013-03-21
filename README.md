Changelog
=========

HEAD
----

* bugfixes for yui3-pjax class creation/link triggers

gallery-2013.02.07-15-27
------------------------

* added "nofrags" instantiation argument for older versions of IE (see the "Compatibility with Older Versions of IE" section, below)
* use YUI Node getHTML() and setHTML() to replace deprecated getContent() and setContent()

gallery-2012.10.03-20-02
------------------------

* startCallbackFunc should be fired unconditionally

gallery-2012.08.22-20-00
------------------------

* AJAX calls of paths and not URLs (URLs were encoding hashes)
* Pass along URL query strings with payload
* Prepend leading slashes to payload paths for IE

gallery-2012.08.08-20-03
------------------------

* initial release

Code Sample
===========

	YUI().use('gallery-nmpjaxplus', function(Y) {
		var PjaxPlus = new Y.PjaxPlus({
			findLinksIn:document.body,  // look for links to init within this region
			container:'#page',  // YUI PJAX argument - see http://yuilibrary.com/yui/docs/pjax/
			contentSelector:'#main',  // YUI PJAX argument - see http://yuilibrary.com/yui/docs/pjax/
			omitLinkClass:'noajax',  // skip initing this widget on links assigned to this class
			permittedFileExts:['php'],  // in addition to REST-like URLs that do not have file extensions, init URLs with these extensions
			startCallbackFunc:Y.bind(startPjaxCallback),  // callback that is triggered before content is loaded
			callbackFunc:Y.bind(pjaxCallback),  // callback triggered after content has been loaded
			nofrags:false  // optional argument for older versions of IE (see below)
		});
		PjaxPlus.initAjaxLinks();  // initialize PjaxPlus
	
		function startPjaxCallback(payload) {
			// this callback is triggered before page loads.
			// You can set CSS classes that will enable progress bars to indicate that
			// new content is being loaded. Here, the opacity is set on the content region

			Y.one('#page').setStyle('opacity', 0.5);
		}
	
		function pjaxCallback(payload) {
			// this callback is triggered once the new content has been loaded.
			// You can do stuff such as setting classes on your body tag, or reiniting
			// various other Javascript widgets and controls on the page, as necessary
		
			var responseHTML = Y.Node.create(payload.responseText);  // YUI node object of loaded content
	
			Y.one('#page').setStyle('opacity', '');
			//initJSContent();
		}
	});
	
Compatibility with Older Versions of IE
=======================================

This library uses document fragments created via Y.Node.Create in browsers that don't support HTML5 history. This seems to work fine in IE 9, but we have found that IE 8 and presumably earlier versions have difficulty with unsupported tags such as <audio> and <video>. In these cases, some markup is dropped from the final output.
	
As a workaround for this issue, there is an optional option called "nofrags" that when set to true, will not create document fragments and will instead output the entire XHR response (i.e. payload.responseText) to the contentSelector area. Since in many cases this XHR output will include the header and footer to the site, a query string *nofrag* is sent with the request so that on your backend you can omit outputting this content if this HTTP GET variable has been set.
