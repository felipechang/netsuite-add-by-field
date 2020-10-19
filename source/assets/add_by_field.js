class AddByField {

    /** Start application */
    init = function () {
        this.configuration = AddByFieldConfig;
        this.storage = {
            holdRun: false,
            currentChunk: 0,
            lastChunk: 0,
            currentInput: '',
            lastInput: '',
            place: '',
        };
        this.nodes = {
            input: document.getElementById(this.configuration.html.inputId),
            table: document.getElementById(this.configuration.html.tableId),
        };
        const currentRecord = require('N/currentRecord');
        const record = currentRecord.get();
        this.record = record;
        this.storage.place = record.getValue({
            fieldId: 'location'
        });
        console.log('Add By Field loaded...');
    };

    /** Fetch Next Page */
    findNext = function () {
        const _this = this;
        if (!_this.validate()) {
            return;
        }
        _this.storage.currentChunk += _this.configuration.pageSize;
        _this.fetchItemField();
    };

    /** Fetch Previous Page */
    findPrevious = function () {
        const _this = this;
        if (!_this.validate()) {
            return;
        }
        _this.storage.currentChunk -= _this.configuration.pageSize;
        if (_this.storage.currentChunk < 0) {
            _this.storage.currentChunk = 0;
        }
        _this.fetchItemField();
    };

    /** Fetch Current Page */
    find = function () {
        const _this = this;
        if (!_this.validate()) {
            return;
        }
        _this.storage.currentChunk = 0;
        _this.fetchItemField();
    };

    /** Insert a line item */
    insertItem = function (item) {
        const _this = this;
        const line = _this.record.findSublistLineWithValue({
            sublistId: 'item',
            fieldId: 'item',
            value: item
        });
        if (line !== -1) {
            _this.record.selectLine({
                sublistId: 'item',
                line: line
            });
            const qty = Number(_this.record.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantity'
            }));
            _this.record.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                value: (qty + 1)
            });
        } else {
            const count = _this.record.getLineCount({
                sublistId: 'item'
            });
            _this.record.insertLine({
                sublistId: 'item',
                line: count
            });
            _this.record.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: item
            });
            _this.record.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                value: 1
            });
        }
        _this.record.commitLine({
            sublistId: 'item'
        });
    };

    /** Split input by words and return a filter array */
    getSearchFilters = function () {
        const search = require('N/search');
        const _this = this;
        const input = _this.storage.currentInput;
        const place = _this.storage.place;
        const name = _this.configuration.lookUpField;
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
        if (_this.configuration.availableOnly) {
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
    };

    /** Validate what we need to run */
    validate = function () {
        const _this = this;
        if (_this.storage.holdRun) {
            return false;
        }
        if (!_this.storage.place) {
            return false;
        }
        if (!_this.nodes.input) {
            return false;
        }
        if (!_this.nodes.table) {
            return false;
        }
        _this.storage.currentInput = (_this.nodes.input.nodeValue || '').trim();
        if (_this.storage.currentInput.length < _this.configuration.minTextSize) {
            return false;
        }
        const sameInput = _this.storage.currentInput === _this.storage.lastInput;
        const sameChunk = _this.storage.currentChunk === _this.storage.lastChunk;
        return !(sameInput || sameChunk);
    };

    /** Build row line string */
    buildLine = function (action, text) {
        const _this = this;
        return '<span class=\'' + _this.configuration.rowClass + '\' onclick=\'' + action + '\'>' + text + '</span>';
    };

    /** Add result row to table */
    addResult = function (result) {
        const _this = this;
        const id = result.id;
        const name = result.getValue({
            name: 'itemid'
        });
        const qty = Number(result.getValue({
            name: 'locationquantityavailable'
        }));
        const row = _this.nodes.table.insertRow(-1);
        const cell = row.insertCell(0);
        cell.innerHTML = _this.buildLine('addByField.insertItem(' + id + ')', name + ' (' + qty + ')');
    };

    /** Query and get item information */
    fetchItemField = function () {
        const search = require('N/search');
        const _this = this;
        _this.storage.holdRun = true;
        // Clear Table
        _this.nodes.table.innerHTML = '';
        const searchPromise = search.create.promise({
            type: search.Type.ITEM,
            filters: _this.getSearchFilters(),
            columns: [
                {name: 'itemid', sort: search.Sort.ASC},
                {name: 'locationquantityavailable'}
            ]
        });
        searchPromise.then(function (search) {
            const range = search.run();
            const rangePromise = range.getRange.promise({
                start: _this.storage.currentChunk,
                end: (_this.storage.currentChunk + _this.configuration.pageSize)
            });
            let resultCount = 0;
            rangePromise.catch(function (e) {
                console.error(e);
                _this.storage.holdRun = false;
            });
            rangePromise.then(function (results) {
                results.map(_this.addResult);
                resultCount = results.length;
            });
            rangePromise.finally(function () {
                _this.insertFooterRow(resultCount);
                _this.storage.holdRun = false;
            });
        });
        searchPromise.catch(function (e) {
            console.error(e);
            _this.storage.holdRun = false;
        });
    };

    /** Insert table footer row */
    insertFooterRow = function (resultCount) {
        const _this = this;
        const finalRow = _this.nodes.table.insertRow(-1);
        // Counter is not zero insert back button
        if (_this.storage.currentChunk !== 0) {
            const backCel = finalRow.insertCell(0);
            backCel.innerHTML = _this.buildLine('addByField.findPrevious()', this.configuration.html.previousText);
        }
        // If not at the end insert next button
        if (resultCount === _this.configuration.pageSize) {
            const nextCel = finalRow.insertCell(0);
            nextCel.innerHTML = _this.buildLine('addByField.findNext()', this.configuration.html.nextText);
        }
    };
}

const addByField = new AddByField();
addByField.init();