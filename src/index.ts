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
	return string.replace(/[.*+?^${}()!|[\]\\]/g, '\\$&'); // $& means the whole matched string
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
			let searches = []
			let query = message.query.replace(/\_\_single_quote\_\_/g,'\'').replace(/\_\_double_quote\_\_/g,'\"')
			
			let sortAsc = query.includes("sort:asc")
			let sortDesc = query.includes("sort:desc")
			let isThisNotebook = query.includes("notebook:this")
			let isContent = query.includes("content:true")
			query = query.replace("sort:desc","").replace("sort:asc","").replace("notebook:this","").replace("content:true","")

			let queryOrg = query.trim()
			if(isThisNotebook){
				let fol =await joplin.data.get(['folders', currentNote.parent_id], {fields:['name']})
				query = query+" notebook:\""+fol.title+"\""
			}

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
					let tick;
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
					let body
					if(isContent){
						let bodyNotParsed = element.body
						let noteId
						
						body = bodyNotParsed.replace(/\[([^\]]*)\]\(([^)]*)\)/g, function (_, g1, g2) {
							if(g2.substr(0,2)==":/"){
								noteId = g2.substr(2).split("#")[0]
								return `<a href="#" onclick="webviewApi.postMessage('${contentScriptId}', {type:'openNote',id:'${noteId}'})">${g1}</a>	`
							}	else{
								return `<a href="${g2}">${g1}</a>`
							}
							
						}); 
						body=body.replace(/\n/g,"<br>")
						body=body.replace(/https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}/g, '<a href="$&">$&</a>')
					}
					let newItem =
						`<div style="${css['embed-search-flex-grid']}">${tick}
						<div style="${css['embed-search-col']}; ${css['embed-search-note']}">
						<a href="#" onclick="webviewApi.postMessage('${contentScriptId}', {type:'openNote',id:'${element.id}'})">${escapeHtmlTitle(element.title)}</a>
						${(()=>{if(isContent){return "<br><ul><li>"+body+"</li></ul><br><br>"} return ""})()}
						</div>
						</div>`
					if(element.id==currentNoteId){
						var re = new RegExp(escapeRegExp(queryOrg), 'g');
						console.log()
						let count
						try{
						 count = (element.body.match(re).length)
						}
						catch(err){
							//alert("re")
						}
						if(count>1){
							searches.push({title:escapeHtmlTitle(element.title),content:newItem})
						}
					}else{
						searches.push({title:escapeHtmlTitle(element.title),content:newItem})
					}
					
					

					
					
					//references = references + "" + `<a href="#" onclick="webviewApi.postMessage('${openNoteId}', '${element.id}')">${escapeTitleText(element.title)}</a><br>`;


				}
				if (notes.has_more) { page = page + 1 } else { has_more = false }
			}
			// loop here
			let newData=""
			function compareAsc( a, b ) {
				if ( a.title.toLowerCase() < b.title.toLowerCase() ){
				  return -1;
				}
				if ( a.title.toLowerCase() > b.title.toLowerCase() ){
				  return 1;
				}
				return 0;
			  }
			if (sortAsc){
				
				searches = searches.sort( compareAsc )
				for(let i=0;i<searches.length;i++){
					newData=newData+searches[i].content
				}
				  
				  
			}else if(sortDesc){
				searches = searches.sort( compareAsc ).reverse()
				  for(let i=0;i<searches.length;i++){
					  newData=newData+searches[i].content
				  }
			}else{
				for(let i=0;i<searches.length;i++){
					newData=newData+searches[i].content
				}
			}
			

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
