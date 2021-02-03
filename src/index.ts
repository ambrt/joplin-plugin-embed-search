import joplin from 'api';
import { MenuItemLocation, ToolbarButtonLocation, ContentScriptType } from 'api/types';

joplin.plugins.register({
	onStart: async function () {
		let contentScriptId = "embedSearch"

		await joplin.contentScripts.onMessage(contentScriptId, async (message: any) => {

			console.log("")
			return "some content";
		});




		await joplin.contentScripts.register(
			ContentScriptType.MarkdownItPlugin,
			contentScriptId,
			'./fence.js'
		);



	},
});
