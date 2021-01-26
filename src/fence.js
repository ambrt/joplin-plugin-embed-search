

module.exports = {
	default: function(_context) { 
		return {
			plugin: function (markdownIt, _options) {
                console.log(_options)
                const contentScriptId = _context.contentScriptId;
                const pluginId = _context.pluginId;
 
                console.log("---ids----")
                console.log(contentScriptId)
                console.log(pluginId)

                const defaultRender = markdownIt.renderer.rules.fence.bind(markdownIt.renderer.rules)
                  
            
                markdownIt.renderer.rules.fence = function(tokens, idx, options, env, self) {
                    let token = tokens[idx];
                    if (token.info !== 'search') return defaultRender(tokens, idx, options, env, self);
    

                    
                    const postMessageWithResponseTest = `
                        webviewApi.postMessage('${contentScriptId}',{type:'getContent',query:'${token.content.trim()}'}).then(function(response) {
                            console.info('Got response from content script: ');
                            document.getElementById('embed-search2').innerHTML=response;

                        });
                        return false;
                    `;
    
                    return `
                    
                    <div id="embed-search">
                    <div id="embed-search2"></div>
                    
                    </div>
                    <style onload="${postMessageWithResponseTest.replace(/\n/g, ' ')}"></style>
                    `;
                };
            }, 
            assets: function() {
                return [
                    { name: 'fence.css' }
                ];
            },
            
			
		}
	},
}