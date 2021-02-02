import joplin from 'api';
import { MenuItemLocation, ToolbarButtonLocation, ContentScriptType } from 'api/types';

function escapeTitleText(text: string) {
	return text.replace(/(\[|\])/g, '\\$1');
}
function escapeHtmlTitle(text:string){
	return text.replace(/[\u00A0-\u9999<>\&]/g, function(i) {
		return '&#'+i.charCodeAt(0)+';';
	 });

}

function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
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

		/*
		await joplin.contentScripts.onMessage(openNoteId, async (message: any) => {
			await joplin.commands.execute('openNote', message);
		});
		await joplin.contentScripts.onMessage(toggleTodoId, async (message: any) => {
			alert(message)
			//await joplin.commands.execute('openNote', message);
		});
		*/
		await joplin.contentScripts.onMessage(contentScriptId, async (message: any) => {
			//console.info('PostMessagePlugin (CodeMirror ContentScript): Got message:', message);
			//const response = message + '+responseFromCodeMirrorScriptHandler';
			//console.info('PostMessagePlugin (CodeMirror ContentScript): Responding with:', response);
			//return response;

			console.log("got search")
			//return "<b> testing html from command</b>"
			//get content
			if (message.type == "getContent"){
				//console.log(message.query)
			let currentNote= await joplin.workspace.selectedNote();
			let currentNoteId=currentNote.id
			//let notes =[]
			let has_more = true
			let page = 1
			let searches = ""
			let query = message.query.replace(/\_\_single_quote\_\_/g,'\'').replace(/\_\_double_quote\_\_/g,'\"')
			console.log(query)
			// css bug bug work around
			let css={};
			 css['embed-search-flex-grid'] = `
				
			display: flex;
				justify-content:flex-start;
			  `
			   css['embed-search-col']=`
				flex: 1;
			  `
			  css['embed-search-tick']=`
				max-width:22px;
			  
			  `
			  css['embed-search-note']=`
				margin-top:-2px;
				font-size: 15px;
			  `
			while (has_more) {

				let notes = await joplin.data.get(['search'], { query: query, fields: ['id', 'title', 'body', 'is_todo', 'todo_completed'], page: page });
				console.log(notes)

				for (let i = 0; i < notes.items.length; i++) {
					let element = notes.items[i];
					let tick
					if (element.is_todo) {
						let onClickFunction = `onclick="webviewApi.postMessage('${contentScriptId}',{type:'toggleTodo',id:'${element.id}'});"`
						let checked

						if (element.todo_completed>0) {
							checked="checked"
						} else {
							checked=""
						}
							tick = `<div style="${css['embed-search-col']}; ${css['embed-search-tick']}"><input  type="checkbox" ${onClickFunction} ${checked} /></div>`

					} else {
						tick = `<div style="${css['embed-search-col']}; ${css['embed-search-tick']}"></div>`
					}


					let newItem =
						`<div style="${css['embed-search-flex-grid']}">${tick}
						<div style="${css['embed-search-col']}; ${css['embed-search-note']}">
						<a href="#" onclick="webviewApi.postMessage('${contentScriptId}', {type:'openNote',id:'${element.id}'})">${escapeHtmlTitle(element.title)}</a>
						</div>
						</div>`
					if(element.id==currentNoteId){
						var re = new RegExp(escapeRegExp(query), 'g');
						
						let count = (element.body.match(re).length)
						if(count>1){
							searches = searches+newItem
						}
					}else{
						searches = searches+newItem
					}
					
					

					
					
					//references = references + "" + `<a href="#" onclick="webviewApi.postMessage('${openNoteId}', '${element.id}')">${escapeTitleText(element.title)}</a><br>`;


				}
				if (notes.has_more) { page = page + 1 } else { has_more = false }
			}
			let newData = searches

			let response = `${newData}`
			return response;


		}else if(message.type=="openNote"){
			await joplin.commands.execute('openNote', message.id);	
		}else if(message.type=="toggleTodo"){

			let note = await joplin.data.get(['notes', message.id], { fields: ['id', 'todo_completed']});
			if(note.todo_completed==0){
				await joplin.data.put(['notes', note.id], null, { todo_completed: Date.now() });
				
			}else{
				await joplin.data.put(['notes', note.id], null, { todo_completed: 0 });
			}
			//await joplin.commands.execute('openNote', message.id);	
		}

		});





		await joplin.contentScripts.register(
			ContentScriptType.MarkdownItPlugin,
			contentScriptId,
			'./fence.js'
		);



	},
});
