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
     * @author Felipe Chang <fchang@gnln.com>
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
        field.defaultValue = "<div id='abd'><style>#abd{width:500px;height:200px}#abd_wrapper{width:100%;height:35%;padding-top:10px}#abd_input{height:30px}#add_by_field_table{width:100%;height:65%}.abd_entry{font-size:13px;cursor:pointer;color:#2d2eff;text-decoration:underline}.abd_entry:hover{text-decoration:none;color:#555}</style><script>const AddByFieldConfig={minTextSize:3,pageSize:5,availableOnly:!0,lookUpField:'description',html:{rowClass:'adb_class',inputId:'add_by_field_input',tableId:'add_by_field_results',nextText:'Next..',previousText:'Back..'}}</script><script>class AddByField{init=function(){this.configuration=AddByFieldConfig,this.storage={holdRun:!1,currentChunk:0,lastChunk:0,currentInput:'',lastInput:'',place:''},this.nodes={input:document.getElementById(this.configuration.html.inputId),table:document.getElementById(this.configuration.html.tableId)};const t=require('N/currentRecord').get();this.record=t,this.storage.place=t.getValue({fieldId:'location'}),console.log('Add By Field loaded...')};findNext=function(){this.validate()&&(this.storage.currentChunk+=this.configuration.pageSize,this.fetchItemField())};findPrevious=function(){const t=this;t.validate()&&(t.storage.currentChunk-=t.configuration.pageSize,t.storage.currentChunk<0&&(t.storage.currentChunk=0),t.fetchItemField())};find=function(){this.validate()&&(this.storage.currentChunk=0,this.fetchItemField())};insertItem=function(t){const e=this,i=e.record.findSublistLineWithValue({sublistId:'item',fieldId:'item',value:t});if(-1!==i){e.record.selectLine({sublistId:'item',line:i});const t=Number(e.record.getCurrentSublistValue({sublistId:'item',fieldId:'quantity'}));e.record.setCurrentSublistValue({sublistId:'item',fieldId:'quantity',value:t+1})}else{const i=e.record.getLineCount({sublistId:'item'});e.record.insertLine({sublistId:'item',line:i}),e.record.setCurrentSublistValue({sublistId:'item',fieldId:'item',value:t}),e.record.setCurrentSublistValue({sublistId:'item',fieldId:'quantity',value:1})}e.record.commitLine({sublistId:'item'})};getSearchFilters=function(){const t=require('N/search'),e=this.storage.currentInput,i=this.storage.place,n=this.configuration.lookUpField,r=[{name:'type',operator:t.Operator.ANYOF,values:['InvtPart','Kit']},{name:'isinactive',operator:t.Operator.IS,values:['F']},{name:'matrix',operator:t.Operator.IS,values:['F']},{name:'inventorylocation',operator:t.Operator.ANYOF,values:[i]}];this.configuration.availableOnly&&r.push({name:'locationquantityavailable',operator:t.Operator.GREATERTHAN,values:['0']});return e.split(' ').map((function(e){e&&r.push({name:n,operator:t.Operator.CONTAINS,values:[e]})})),r};validate=function(){if(this.storage.holdRun)return!1;if(!this.storage.place)return!1;if(!this.nodes.input)return!1;if(!this.nodes.table)return!1;if(this.storage.currentInput=(this.nodes.input.nodeValue||'').trim(),this.storage.currentInput.length<this.configuration.minTextSize)return!1;const t=this.storage.currentInput===this.storage.lastInput,e=this.storage.currentChunk===this.storage.lastChunk;return!(t||e)};buildLine=function(t,e){return'<span class=''+this.configuration.rowClass+'' onclick=''+t+''>'+e+'</span>'};addResult=function(t){const e=t.id,i=t.getValue({name:'itemid'}),n=Number(t.getValue({name:'locationquantityavailable'}));this.nodes.table.insertRow(-1).insertCell(0).innerHTML=this.buildLine('addByField.insertItem('+e+')',i+' ('+n+')')};fetchItemField=function(){const t=require('N/search'),e=this;e.storage.holdRun=!0,e.nodes.table.innerHTML='';const i=t.create.promise({type:t.Type.ITEM,filters:e.getSearchFilters(),columns:[{name:'itemid',sort:t.Sort.ASC},{name:'locationquantityavailable'}]});i.then((function(t){const i=t.run().getRange.promise({start:e.storage.currentChunk,end:e.storage.currentChunk+e.configuration.pageSize});let n=0;i.catch((function(t){console.error(t),e.storage.holdRun=!1})),i.then((function(t){t.map(e.addResult),n=t.length})),i.finally((function(){e.insertFooterRow(n),e.storage.holdRun=!1}))})),i.catch((function(t){console.error(t),e.storage.holdRun=!1}))};insertFooterRow=function(t){const e=this,i=e.nodes.table.insertRow(-1);if(0!==e.storage.currentChunk){i.insertCell(0).innerHTML=e.buildLine('addByField.findPrevious()',this.configuration.html.previousText)}if(t===e.configuration.pageSize){i.insertCell(0).innerHTML=e.buildLine('addByField.findNext()',this.configuration.html.nextText)}}}const addByField=new AddByField;addByField.init()</script><div id='abd_wrapper'><form onsubmit='return!1'><label for='add_by_field_input'>Search..</label> <input id='add_by_field_input' type='search' onkeyup='addByField.find()' onpaste='addByField.find()'></form></div><div id='add_by_field_table'><table id='add_by_field_results'></table></div></div>";
    };
});
