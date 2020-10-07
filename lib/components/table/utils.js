"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck @ts-ignore
const slate_1 = require("slate");
function checkTableIsExist(editor, table) {
    const cells = Array.from(slate_1.Editor.nodes(editor, {
        at: table[1],
        match: n => n.type === 'table-cell',
    }));
    return !!cells.length;
}
exports.checkTableIsExist = checkTableIsExist;
function isTableElement(type) {
    return (type === 'table' ||
        type === 'table-row' ||
        type === 'table-cell' ||
        type === 'table-content');
}
exports.isTableElement = isTableElement;
function isInSameTable(editor) {
    if (!editor.selection)
        return false;
    const [start, end] = slate_1.Editor.edges(editor, editor.selection);
    const [startTable] = slate_1.Editor.nodes(editor, {
        at: start,
        match: n => n.type === 'table',
    });
    const [endTable] = slate_1.Editor.nodes(editor, {
        at: end,
        match: n => n.type === 'table',
    });
    if (startTable && endTable) {
        const [, startPath] = startTable;
        const [, endPath] = endTable;
        if (slate_1.Path.equals(startPath, endPath)) {
            return true;
        }
    }
    return false;
}
exports.isInSameTable = isInSameTable;
//# sourceMappingURL=utils.js.map