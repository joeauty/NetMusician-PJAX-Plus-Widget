YUI.add('gallery-pjaxplus', function(Y){    
	
    Y.PjaxPlus = Y.Base.create('pjaxplus', Y.Widget, [], { 
		initializer : function( config ) {
			// error checking for missing required variables
			
			this.set('history', new Y.HistoryHash());
			//this.set('html5support', Y.HistoryBase.html5);
			this.set('html5support', false);
			this.ppCache = new Y.Cache({max:this.get('cacheNum')});
			
			// remove leading dot from omitLinkClass, if any
			if (this.get('omitLinkClass').match(/^\./)) {
				this.set('omitLinkClass', this.get('omitLinkClass').replace(/^\./,''));
			}
		},
		
		initAjaxLinks : function() {
			var clickedLink;
			
			if (this.get('html5support')) {
				Y.all('a:not(.' + this.get('omitLinkClass') + ')').addClass('yui3-pjax');
				
				var PjaxLoader = new Y.Pjax({
					addPjaxParam : this.get('addPjaxParam'),
					container: this.get('container'),
					contentSelector: this.get('contentSelector'),
					linkSelector: this.get('linkSelector'),
					navigateOnHash: this.get('navigateOnHash'),
					scrollToTop: this.get('scrollToTop'),
					timeout: this.get('timeout'),
					titleSelector: this.get('titleSelector')
				});
			
				// trigger start callback
				PjaxLoader.on('navigate', function(e) {
					// set var for currently clicked link
					clickedLink = e.originEvent.target.get('href');
					e.html5support = this.get('html5support');
					
					if (this.get('startCallbackFunc') && !this.ppCache.retrieve(clickedLink)) {		
						//Y.log('trigger start callback');
						this.get('startCallbackFunc').call(null, e, this);
					}
				}, this);
			
				// trigger callback
				PjaxLoader.after('load', function(e) {
					if (this.get('callbackFunc')) {
						this.get('callbackFunc').call(null, e, this);
					}
				
					Y.all(this.get('container') + ' a:not(.' + this.get('omitLinkClass') + ')').addClass('yui3-pjax');
					//Y.log('add ' + clickedLink + ' to cache');
					// add content to cache
					this.ppCache.add(clickedLink, Y.one(this.get('contentSelector')).getContent());
				}, this);
				
				Y.delegate('click', function(e) {
					//Y.log('checking cache for ' + e.target.get('href'));
					if (this.ppCache.retrieve(e.target.get('href'))) {
						//Y.log('CACHE FOUND');
						Y.one(this.get('contentSelector')).setContent(this.ppCache.retrieve(e.target.get('href')).response);
					}
				}, document.body, 'a.yui3-pjax', this);
			}
			else {
				var thisdomain = new RegExp('^(http|https):\/\/' + window.location.hostname.replace('.','\.'));
				
				if (this.get('history').get().page) {
					// load initial page set in bookmark
					var initialurl = this.get('history').get().page.replace(/_/g,'/');
					this.startAjaxLoad({
						clickTarget:null,
						path:initialurl,
						url:thisdomain + '/' + initialurl,
						historyhash:this.get('history').get().page
					});
				}
				Y.delegate('click', function(e) {
					if (typeof e.target.get('pathname') !== "undefined") {
						var historyhash = e.target.get('pathname').replace(/_/g,'-');
						historyhash = e.target.get('pathname').replace(/\//g,'_');	
					
						if (this.ppCache.retrieve(e.target.get('href'))) {
							// output cache, set history token
							Y.one(this.get('contentSelector')).setContent(this.ppCache.retrieve(e.target.get('href')).response);
						
							this.get('history').add({
								page:historyhash
							});
							return;
						}	
					}
					
					var goodext = false;
					if (typeof e.target.get('pathname') == "undefined") {
						// no path provided, default to homepage
						e.preventDefault();
						this.startAjaxLoad({
							clickTarget:e.target,
							url:'/'
						});
					}
					else {
						var pathnamearr = e.target.get('pathname').split(/\//);
						var pathnameidx = pathnamearr.length - 1;
						var filename = pathnamearr[pathnameidx];
						
						if (!filename.match(/\./)) {
							// no file extension, REST-like URL
							goodext = true;
						}
						else {
							// URL contains file extensions, look for permitted file extensions
							var goodext = Y.Array.some(this.get('permittedFileExts'), function(ext) {
								var thisregex = new RegExp('\.' + ext + '$');
								if (filename.match(thisregex)) {
									return true;
								}
							});
						}	
						
						if (goodext && !e.target.get('href').match(/^(mailto|javascript):/) && !e.target.get('href').match(/^#/) && 
							e.target.get('href').match(thisdomain) && !e.target.hasClass(this.get('omitLinkClass'))) {
								e.preventDefault();
								this.startAjaxLoad({
									clickTarget:e.target,
									path:e.target.get('pathname'),
									url:e.target.get('href'),
									historyhash:historyhash
								});
							}
					}
								
				}, this.get('findLinksIn'), 'a:not(.' + this.get('omitLinkClass') + ')', this);
				
			}
		},
		
		startAjaxLoad : function(configObj) {
			if (this.get('startCallbackFunc') && !this.ppCache.retrieve(configObj.url)) {
				//Y.log('trigger start callback - AJAX');
				configObj.html5support = this.get('html5support');
				this.get('startCallbackFunc').call(null, configObj, this);
			}	
			
			var cfg = {
				timeout: this.get('timeout'),
				on : {
					complete:Y.bind(function(id, transport) {
						var frag = Y.Node.create(transport.responseText);
						Y.one(this.get('contentSelector')).setContent(frag.one(this.get('contentSelector')).getContent());
						
						// set history token
						this.get('history').add({
							page:configObj.historyhash
						});
						
						// cache output
						this.ppCache.add(configObj.url, frag.one(this.get('contentSelector')).getContent());
						
					}, this),
					
					success:Y.bind(function(id, transport) {
						// add content to cache
						
						if (this.get('callbackFunc')) {	
							// invoke custom function
						    this.get('callbackFunc').call(null, transport, this);
						}
					}, this)
				}
			}
			
			Y.io(configObj.url, cfg);
		}
		        
    }, {
        ATTRS : { 
			findLinksIn : {
				value : document.body
			},
			
			container : {

			},
			
			timeout : {
				value : 30000
			},
			
			addPjaxParam : {
				value : true
			},
			
			linkSelector : {
				value : 'a.yui3-pjax'
			},
			
			scrollToTop : {
				value : true
			},
			
			navigateOnHash : {
				value : false
			},
			
			titleSelector : {
				value : 'title'
			},
			
			contentSelector : {
				
			},
			
			omitLinkClass : {

			},
			
			permittedFileExts : {
				
			},
			
			startCallbackFunc : {

			},
			
			callbackFunc : {
				
			},
			
			cacheNum : {
				value : 10
			}
		}
    });
    
}, '@version@', {requires: ['base-build', 'widget', 'node', 'io', 'history', 'pjax', 'event-delegate', 'cache-base']});
