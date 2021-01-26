import joplin from 'api';
import { MenuItemLocation, ToolbarButtonLocation, ContentScriptType } from 'api/types';

function escapeTitleText(text: string) {
	return text.replace(/(\[|\])/g, '\\$1');
}

joplin.plugins.register({
	onStart: async function () {
		//keyboard shortcut
		//top down append
		/*
		await joplin.settings.registerSection('embedSearchCustomSection', {
			label: 'Embed Search',
			iconName: 'fas fa-search',
		});
		await joplin.settings.registerSetting('embedSearchCustomSettingHeader', {
			value: "\\n\\n## Backlinks\\n",
			type: 2,
			section: 'myBacklinksCustomSection',
			public: true,
			label: 'Heading above list of backlinks (use "\\n" as a new line)',
		});

		await joplin.views.toolbarButtons.create('insertRefsToolbar', 'insertBackReferences', ToolbarButtonLocation.EditorToolbar);
		await joplin.views.menuItems.create('inserRefsMenu', 'insertBackReferences', MenuItemLocation.Note, { accelerator: "Ctrl+Alt+B" });
*/
		let contentScriptId = "embedSearch"
		let openNoteId = "openNote"
		await joplin.contentScripts.onMessage(openNoteId, async (message:any) => {
			await joplin.commands.execute('openNote', message);
		});
		
					
		await joplin.contentScripts.onMessage(contentScriptId, async (message:any) => {
			console.info('PostMessagePlugin (CodeMirror ContentScript): Got message:', message);
			//const response = message + '+responseFromCodeMirrorScriptHandler';
			//console.info('PostMessagePlugin (CodeMirror ContentScript): Responding with:', response);
			//return response;
			
				console.log("got search")
				//return "<b> testing html from command</b>"
				//get content
		
					console.log("getting content")
					
					let notes
					let has_more = true
					let page = 1
					let references =""
					while (has_more) {
						notes = await joplin.data.get(['search'], { query: message, fields: ['id', 'title', 'body', 'is_todo', 'todo_completed'], page: page });
						console.log(notes)
						
						for (let i = 0; i < notes.items.length; i++) {
							let element = notes.items[i];
							references = references + "" + `<a href="#" onclick="webviewApi.postMessage('${openNoteId}', '${element.id}')">${escapeTitleText(element.title)}</a><br>`;
							

						}
						if (notes.has_more) { page = page + 1 } else { has_more = false }
					}
					let newData = references
					
					let response = `${newData}`
					return response;


			

			});




		
		await joplin.contentScripts.register(
			ContentScriptType.MarkdownItPlugin,
			contentScriptId,
			'./fence.js'
		);



	},
});
