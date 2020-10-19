/** Configuration profile */
const AddByFieldConfig = {

    /** How many letters before we start querying the db */
    minTextSize: 3,

    /** How many items o show per page */
    pageSize: 5,

    /** Set to true will show only available items */
    availableOnly: true,

    /** Field read on the item record */
    lookUpField: 'description',

    /** HTML elements */
    html: {

        /** Class for rows created */
        rowClass: 'adb_class',

        /** Input field ID */
        inputId: 'add_by_field_input',

        /** Render Table ID */
        tableId: 'add_by_field_results',

        /** Pagination text next page */
        nextText: 'Next..',

        /** Pagination text previous page */
        previousText: 'Back..',
    }
}