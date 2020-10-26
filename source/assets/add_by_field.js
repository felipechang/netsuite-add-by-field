jQuery(document).ready(function () {

    const AddByField = {

        /** Start application */
        init: function () {
            this.configuration = AddByFieldConfig;
            this.storage = {
                currentChunk: 0,
                lastChunk: -1,
                currentInput: '',
                lastInput: '',
                place: '',
            };
            this.nodes = {
                input: document.getElementById(this.configuration.html.inputId),
                table: document.getElementById(this.configuration.html.tableId),
            };
            require(['N/currentRecord'], (currentRecord) => {
                const record = currentRecord.get();
                this.record = record;
                this.storage.place = record.getValue({
                    fieldId: 'location'
                });
                console.info('Add By Field loaded...');
            });
        },

        /** Fetch Next Page */
        findNext: function () {
            if (!AddByField.validate()) {
                return;
            }
            AddByField.storage.currentChunk += AddByField.configuration.pageSize;
            AddByField.fetchItemField();
        },

        /** Fetch Previous Page */
        findPrevious: function () {
            if (!AddByField.validate()) {
                return;
            }
            AddByField.storage.currentChunk -= AddByField.configuration.pageSize;
            if (AddByField.storage.currentChunk < 0) {
                AddByField.storage.currentChunk = 0;
            }
            AddByField.fetchItemField();
        },

        /** Fetch Current Page */
        find: function () {
            if (!AddByField.validate()) {
                return;
            }
            AddByField.storage.currentChunk = 0;
            AddByField.fetchItemField();
        },

        /** Insert a line item */
        insertItem: function (item) {
            const line = AddByField.record.findSublistLineWithValue({
                sublistId: 'item',
                fieldId: 'item',
                value: item
            });
            if (line !== -1) {
                AddByField.record.selectLine({
                    sublistId: 'item',
                    line: line
                });
                const qty = Number(AddByField.record.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity'
                }));
                AddByField.record.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: (qty + 1)
                });
            } else {
                const count = AddByField.record.getLineCount({
                    sublistId: 'item'
                });
                AddByField.record.insertLine({
                    sublistId: 'item',
                    line: count
                });
                AddByField.record.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: item
                });
                AddByField.record.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: 1
                });
            }
            AddByField.record.commitLine({
                sublistId: 'item'
            });
        },

        /** Split input by words and return a filter array */
        getSearchFilters: function (search) {
            const input = AddByField.storage.currentInput;
            const place = AddByField.storage.place;
            const name = AddByField.configuration.lookUpField;
            const filters = [{
                name: 'type',
                operator: search.Operator.ANYOF,
                values: ['InvtPart', 'Kit']
            }, {
                name: 'isinactive',
                operator: search.Operator.IS,
                values: ['F']
            }, {
                name: 'matrix',
                operator: search.Operator.IS,
                values: ['F']
            }, {
                name: 'inventorylocation',
                operator: search.Operator.ANYOF,
                values: [place]
            }];
            if (AddByField.configuration.availableOnly) {
                filters.push({
                    name: 'locationquantityavailable',
                    operator: search.Operator.GREATERTHAN,
                    values: ['0']
                });
            }
            const inputArr = input.split(' ');
            inputArr.map(function (item) {
                if (!item) {
                    return;
                }
                filters.push({
                    name: name,
                    operator: search.Operator.CONTAINS,
                    values: [item]
                });
            });

            return filters;
        },

        /** Validate what we need to run */
        validate: function () {
            if (!AddByField.storage.place) {
                return false;
            }
            if (!AddByField.nodes.input) {
                return false;
            }
            if (!AddByField.nodes.table) {
                return false;
            }
            AddByField.storage.currentInput = (AddByField.nodes.input.value || '').trim();
            if (AddByField.storage.currentInput.length < AddByField.configuration.minTextSize) {
                return false;
            }
            const sameInput = AddByField.storage.currentInput === AddByField.storage.lastInput;
            const sameChunk = AddByField.storage.currentChunk === AddByField.storage.lastChunk;
            return !(sameInput || sameChunk);
        },

        /** Build row line string */
        buildLine: function (action, text) {
            return '<span class=' + AddByField.configuration.html.rowClass + ' onclick=' + action + '>' + text + '</span>';
        },

        /** Add result row to table */
        addResult: function (result) {
            const id = result.id;
            const name = result.getValue({
                name: 'itemid'
            });
            const qty = Number(result.getValue({
                name: 'locationquantityavailable'
            }));
            const row = AddByField.nodes.table.insertRow(-1);
            const cell = row.insertCell(0);
            cell.innerHTML = AddByField.buildLine('document.addByField.insertItem(' + id + ')', name + ' (' + qty + ')');
        },

        /** Add result row to table */
        addEmpty: function () {
            const row = AddByField.nodes.table.insertRow(-1);
            const cell = row.insertCell(0);
            const emptyClass = 'add_by_field_empty';
            cell.innerHTML = '<span class=' + emptyClass + '>_</span>';
        },

        /** Query and get item information */
        fetchItemField: function () {
            require(['N/search'], (search) => {
                const searchPromise = search.create.promise({
                    type: search.Type.ITEM,
                    filters: AddByField.getSearchFilters(search),
                    columns: [
                        {name: 'itemid', sort: search.Sort.ASC},
                        {name: 'locationquantityavailable'}
                    ]
                });
                searchPromise.then(function (search) {
                    const range = search.run();
                    const rangePromise = range.getRange.promise({
                        start: AddByField.storage.currentChunk,
                        end: (AddByField.storage.currentChunk + AddByField.configuration.pageSize)
                    });
                    let resultCount = 0;
                    rangePromise.catch(function (e) {
                        console.error(e);
                    });
                    rangePromise.then(function (results) {
                        // Clear Table
                        AddByField.nodes.table.innerHTML = '';
                        results.map(AddByField.addResult);
                        resultCount = results.length;
                    });
                    rangePromise.finally(function () {
                        for (let i = 0; i < (AddByField.configuration.pageSize - resultCount); i++) {
                            AddByField.addEmpty();
                        }
                        AddByField.insertFooterRow(resultCount);
                    });
                });
                searchPromise.catch(function (e) {
                    console.error(e);
                });
            });
        },

        /** Insert table footer row */
        insertFooterRow: function (resultCount) {
            const finalRow = AddByField.nodes.table.insertRow(-1);
            const nextCel = finalRow.insertCell(0);
            let innerHTML = "";

            // Counter is not zero insert back button
            if (AddByField.storage.currentChunk !== 0) {
                innerHTML += AddByField.buildLine('document.addByField.findPrevious()', this.configuration.html.previousText);
            }
            // If not at the end insert next button
            if (resultCount === AddByField.configuration.pageSize) {
                innerHTML += AddByField.buildLine('document.addByField.findNext()', this.configuration.html.nextText);
            }

            nextCel.innerHTML = innerHTML
        },
    }

    document.addByField = AddByField;
    document.addByField.init();
});

