"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck @ts-ignore
const slate_1 = require("slate");
const selection_1 = require("../selection");
const creator_1 = require("../creator");
function insertLeft(table, editor) {
    const { selection } = editor;
    if (!selection || !table)
        return;
    const xIndex = table[1].length + 1;
    const { gridTable, getCol } = selection_1.splitedTable(editor, table);
    const [startCell] = slate_1.Editor.nodes(editor, {
        match: n => n.type === 'table-cell',
    });
    const [insertPositionCol] = getCol((c) => c.cell.key === startCell[0].key && c.isReal);
    const x = insertPositionCol.path[xIndex];
    const insertCols = new Map();
    let checkInsertable = true;
    gridTable.forEach((row) => {
        const col = row[x];
        if (col.isReal) {
            insertCols.set(col.cell.key, col);
        }
        else {
            const [originCol] = getCol((n) => n.cell.key === col.cell.key && n.isReal);
            const { cell, path } = originCol;
            if (path[xIndex] === x) {
                insertCols.set(cell.key, originCol);
            }
            else {
                checkInsertable = false;
                return;
            }
        }
    });
    if (!checkInsertable) {
        return;
    }
    insertCols.forEach((col) => {
        const newCell = creator_1.createCell({
            rowspan: col.cell.rowspan || 1,
        });
        slate_1.Transforms.insertNodes(editor, newCell, {
            at: col.originPath,
        });
    });
}
exports.insertLeft = insertLeft;
//# sourceMappingURL=insertLeft.js.map