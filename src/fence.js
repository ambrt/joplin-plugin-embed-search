

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

                const defaultRender = markdownIt.renderer.rules.fence || function(tokens, idx, options, env, self) {
                    return self.renderToken(tokens, idx, options, env, self);
                };
            
                markdownIt.renderer.rules.fence = function(tokens, idx, options, env, self) {
                    const token = tokens[idx];
                    if (token.info !== 'search') return defaultRender(tokens, idx, options, env, self);
    


                    const postMessageWithResponseTest = `
                        webviewApi.postMessage('${pluginId}', '${contentScriptId}').then(function(response) {
                            console.info('Got response in content script: ' + response);
                        });
                        return false;
                    `;
    
                    return `
                        <div class="just-testing">
                            <p>JUST TESTING: <pre>${token.content.trim()}</pre></p>
                            <p><a href="#" onclick="${postMessageWithResponseTest.replace(/\n/g, ' ')}">Click to post a message "justtesting" to plugin and check the response in the console</a></p>
                        </div>
                    `;
                };
            }
            
			
		}
	},
}