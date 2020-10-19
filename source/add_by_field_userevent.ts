import {ContextType, executionContext} from "N/runtime";
import {EntryPoints} from "N/types";

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
export let beforeLoad: EntryPoints.UserEvent.beforeLoad = (context: EntryPoints.UserEvent.beforeLoadContext) => {

    if (executionContext !== ContextType.USER_INTERFACE) {
        return;
    }

    const VALID_TYPES = [
        context.UserEventType.EDIT,
        context.UserEventType.CREATE,
        context.UserEventType.COPY,
    ];

    if (VALID_TYPES.indexOf(context.type) === -1) {
        return;
    }

    const field = context.form.addField({
        id: "custpage_abd",
        label: "Add By Description",
        type: "INLINEHTML",
        container: "items"
    });

    field.defaultValue = "<%= out %>";
};
