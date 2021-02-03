

module.exports = {
	default: function(_context) { 
		return {
			plugin: function (markdownIt, _options) {
                
                
                const defaultRender = markdownIt.renderer.rules.fence.bind(markdownIt.renderer.rules)
                //This also doesn't work
                
                //const defaultRender = markdownIt.renderer.rules.fence || function(tokens, idx, options, env, self) {
				//	return self.renderToken(tokens, idx, options, env, self);
				//};
                  
            
                markdownIt.renderer.rules.fence = function(tokens, idx, options, env, self) {
                    let token = tokens[idx];

                    if (token.info !== 'search') return defaultRender(tokens, idx, options, env, self);
    
                    console.log('should log this for every preview')
                    
                    return "fence should show this in preview"
                    
                };
            }, 
            assets: function() {
                return [
                    
                ];
            },
            
			
		}
	},
}