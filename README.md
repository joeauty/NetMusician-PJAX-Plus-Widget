Changelog
=========

HEAD
----

* added "nofrag" instantiation argument for older versions of IE (see "compatibility with older versions of IE" section, below)
* use YUI Node getHTML() and setHTML() to replace deprecated getContent() and setContent()

gallery-2012.10.03-20-02
----

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
			callbackFunc:Y.bind(pjaxCallback)  // callback triggered after content has been loaded
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