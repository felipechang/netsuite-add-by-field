(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "N/runtime"], factory);
    }
})(function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.beforeLoad = void 0;
    var runtime_1 = require("N/runtime");
    /**
     * User Event script file
     *
     * WARNING:
     * TypeScript generated file, do not edit directly
     * source files are located in the the repository
     *
     * @description: Adds an input box to search and add an item by a custom field
     * @records: sales order, purchase order
     *
     * @author Felipe Chang <felipechang@hardcake.org>
     *
     * @NApiVersion 2.x
     * @NModuleScope SameAccount
     * @NScriptType UserEventScript
     */
    /** beforeLoad event handler */
    exports.beforeLoad = function (context) {
        if (runtime_1.executionContext !== runtime_1.ContextType.USER_INTERFACE) {
            return;
        }
        var VALID_TYPES = [
            context.UserEventType.EDIT,
            context.UserEventType.CREATE,
            context.UserEventType.COPY,
        ];
        if (VALID_TYPES.indexOf(context.type) === -1) {
            return;
        }
        var field = context.form.addField({
            id: "custpage_abd",
            label: "Add By Description",
            type: "INLINEHTML",
            container: "items"
        });
        field.defaultValue = "<div id='add_by_field'><style>#add_by_field{width:500px;height:200px}#add_by_field_wrapper{width:100%;padding-top:10px;padding-bottom:10px}#add_by_field_input{height:30px;margin-left:10px;padding-left:5px}#add_by_field_table{width:100%;height:65%}#add_by_field_results{width:100%}.add_by_field_entry{cursor:pointer;text-decoration:underline}.add_by_field_entry:hover{text-decoration:none;color:#292929}.add_by_field_empty{color:#fff}</style><script>const AddByFieldConfig={minTextSize:3,pageSize:7,availableOnly:!0,lookUpField:'description',html:{rowClass:'smallgraytextnolink add_by_field_entry',inputId:'add_by_field_input',tableId:'add_by_field_results',nextText:'..Next >',previousText:'< Back..'}}</script><script>jQuery(document).ready((function(){const e={init:function(){this.configuration=AddByFieldConfig,this.storage={currentChunk:0,lastChunk:-1,currentInput:'',lastInput:'',place:''},this.nodes={input:document.getElementById(this.configuration.html.inputId),table:document.getElementById(this.configuration.html.tableId)},require(['N/currentRecord'],e=>{const t=e.get();this.record=t,this.storage.place=t.getValue({fieldId:'location'}),console.info('Add By Field loaded...')})},findNext:function(){e.validate()&&(e.storage.currentChunk+=e.configuration.pageSize,e.fetchItemField())},findPrevious:function(){e.validate()&&(e.storage.currentChunk-=e.configuration.pageSize,e.storage.currentChunk<0&&(e.storage.currentChunk=0),e.fetchItemField())},find:function(){e.validate()&&(e.storage.currentChunk=0,e.fetchItemField())},insertItem:function(t){const n=e.record.findSublistLineWithValue({sublistId:'item',fieldId:'item',value:t});if(-1!==n){e.record.selectLine({sublistId:'item',line:n});const t=Number(e.record.getCurrentSublistValue({sublistId:'item',fieldId:'quantity'}));e.record.setCurrentSublistValue({sublistId:'item',fieldId:'quantity',value:t+1})}else{const n=e.record.getLineCount({sublistId:'item'});e.record.insertLine({sublistId:'item',line:n}),e.record.setCurrentSublistValue({sublistId:'item',fieldId:'item',value:t}),e.record.setCurrentSublistValue({sublistId:'item',fieldId:'quantity',value:1})}e.record.commitLine({sublistId:'item'})},getSearchFilters:function(t){const n=e.storage.currentInput,i=e.storage.place,r=e.configuration.lookUpField,o=[{name:'type',operator:t.Operator.ANYOF,values:['InvtPart','Kit']},{name:'isinactive',operator:t.Operator.IS,values:['F']},{name:'matrix',operator:t.Operator.IS,values:['F']},{name:'inventorylocation',operator:t.Operator.ANYOF,values:[i]}];e.configuration.availableOnly&&o.push({name:'locationquantityavailable',operator:t.Operator.GREATERTHAN,values:['0']});return n.split(' ').map((function(e){e&&o.push({name:r,operator:t.Operator.CONTAINS,values:[e]})})),o},validate:function(){if(!e.storage.place)return!1;if(!e.nodes.input)return!1;if(!e.nodes.table)return!1;if(e.storage.currentInput=(e.nodes.input.value||'').trim(),e.storage.currentInput.length<e.configuration.minTextSize)return!1;const t=e.storage.currentInput===e.storage.lastInput,n=e.storage.currentChunk===e.storage.lastChunk;return!(t||n)},buildLine:function(t,n){return'<span class='+e.configuration.html.rowClass+' onclick='+t+'>'+n+'</span>'},addResult:function(t){const n=t.id,i=t.getValue({name:'itemid'}),r=Number(t.getValue({name:'locationquantityavailable'}));e.nodes.table.insertRow(-1).insertCell(0).innerHTML=e.buildLine('document.addByField.insertItem('+n+')',i+' ('+r+')')},addEmpty:function(){e.nodes.table.insertRow(-1).insertCell(0).innerHTML='<span class=add_by_field_empty>_</span>'},fetchItemField:function(){require(['N/search'],t=>{const n=t.create.promise({type:t.Type.ITEM,filters:e.getSearchFilters(t),columns:[{name:'itemid',sort:t.Sort.ASC},{name:'locationquantityavailable'}]});n.then((function(t){const n=t.run().getRange.promise({start:e.storage.currentChunk,end:e.storage.currentChunk+e.configuration.pageSize});let i=0;n.catch((function(e){console.error(e)})),n.then((function(t){e.nodes.table.innerHTML='',t.map(e.addResult),i=t.length})),n.finally((function(){for(let t=0;t<e.configuration.pageSize-i;t++)e.addEmpty();e.insertFooterRow(i)}))})),n.catch((function(e){console.error(e)}))})},insertFooterRow:function(t){const n=e.nodes.table.insertRow(-1).insertCell(0);let i='';0!==e.storage.currentChunk&&(i+=e.buildLine('document.addByField.findPrevious()',this.configuration.html.previousText)),t===e.configuration.pageSize&&(i+=e.buildLine('document.addByField.findNext()',this.configuration.html.nextText)),n.innerHTML=i}};document.addByField=e,document.addByField.init()}))</script><div id='add_by_field_wrapper'><form onsubmit='return!1'><label for='add_by_field_input'>Find:</label> <input id='add_by_field_input' type='search' onkeyup='document.addByField.find()' onpaste='document.addByField.find()'></form></div><div id='add_by_field_table'><table id='add_by_field_results'></table></div></div>";
    };
});
