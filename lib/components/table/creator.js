"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
function createTable(columns, rows) {
    const rowNodes = [...new Array(rows)].map(() => createRow(columns));
    return {
        type: 'table',
        children: rowNodes,
        data: {},
    };
}
exports.createTable = createTable;
function createRow(columns) {
    const cellNodes = [...new Array(columns)].map(() => createCell());
    return {
        type: 'table-row',
        key: `row_${uuid_1.v4()}`,
        data: {},
        children: cellNodes,
    };
}
exports.createRow = createRow;
function createCell({ elements, colspan, rowspan, height, width, } = {}) {
    const content = createContent(elements);
    return {
        type: 'table-cell',
        key: `cell_${uuid_1.v4()}`,
        children: [content],
        width: width,
        height: height,
        colspan,
        rowspan,
    };
}
exports.createCell = createCell;
function createContent(elements) {
    return {
        type: 'table-content',
        children: elements || [{ type: 'paragraph', children: [{ text: '' }] }],
    };
}
exports.createContent = createContent;
//# sourceMappingURL=creator.js.map