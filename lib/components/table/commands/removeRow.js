"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck @ts-ignore
const slate_1 = require("slate");
const selection_1 = require("../selection");
const splitCell_1 = require("./splitCell");
function removeRow(table, editor) {
    const { selection } = editor;
    if (!selection || !table)
        return;
    const { gridTable, getCol } = selection_1.splitedTable(editor, table);
    const yIndex = table[1].length;
    const [start, end] = slate_1.Editor.edges(editor, selection);
    const [startNode] = slate_1.Editor.nodes(editor, {
        match: n => n.type === 'table-cell',
        at: start,
    });
    const [endNode] = slate_1.Editor.nodes(editor, {
        match: n => n.type === 'table-cell',
        at: end,
    });
    const [startCol] = getCol((col) => col.cell.key === startNode[0].key);
    const [endCol] = getCol((col) => col.cell.key === endNode[0].key);
    const yTop = startCol.path[yIndex];
    const yBottom = endCol.path[yIndex];
    const topLeftCol = gridTable[yTop][0];
    const bottomRight = gridTable[yBottom][gridTable[yBottom].length - 1];
    slate_1.Transforms.setSelection(editor, {
        anchor: slate_1.Editor.point(editor, topLeftCol.originPath),
        focus: slate_1.Editor.point(editor, bottomRight.originPath),
    });
    splitCell_1.splitCell(table, editor);
    const { gridTable: splitedGridTable } = selection_1.splitedTable(editor, table);
    const removeCols = splitedGridTable
        .slice(yTop, yBottom + 1)
        .reduce((p, c) => [...p, ...c], []);
    removeCols.forEach((col) => {
        slate_1.Transforms.removeNodes(editor, {
            at: table[1],
            match: n => n.key === col.cell.key,
        });
    });
    slate_1.Transforms.removeNodes(editor, {
        at: table[1],
        match: n => {
            if (n.type !== 'table-row') {
                return false;
            }
            if (!n.children ||
                n.children.findIndex((cell) => cell.type === 'table-cell') < 0) {
                return true;
            }
            return false;
        },
    });
    if (!slate_1.Editor.string(editor, table[1])) {
        slate_1.Transforms.removeNodes(editor, {
            at: table[1],
        });
    }
}
exports.removeRow = removeRow;
//# sourceMappingURL=removeRow.js.map