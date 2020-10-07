"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck @ts-ignore
const slate_1 = require("slate");
const creator_1 = require("../creator");
function insertTable(editor) {
    if (!editor.selection)
        return;
    const node = slate_1.Editor.above(editor, {
        match: n => n.type === 'table',
    });
    const isCollapsed = slate_1.Range.isCollapsed(editor.selection);
    if (!node && isCollapsed) {
        const table = creator_1.createTable(3, 3);
        slate_1.Transforms.insertNodes(editor, table);
    }
}
exports.insertTable = insertTable;
//# sourceMappingURL=insertTable.js.map