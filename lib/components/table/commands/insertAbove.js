"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck @ts-ignore
const slate_1 = require("slate");
const selection_1 = require("../selection");
const creator_1 = require("../creator");
function insertAbove(table, editor) {
    const { selection } = editor;
    if (!selection || !table)
        return;
    const yIndex = table[1].length;
    const { gridTable, getCol } = selection_1.splitedTable(editor, table);
    const [startCell] = slate_1.Editor.nodes(editor, {
        match: n => n.type === 'table-cell',
    });
    const [insertPositionCol] = getCol((c) => c.cell.key === startCell[0].key && c.isReal);
    let checkInsertEnable = true;
    const insertYIndex = insertPositionCol.path[yIndex];
    const insertCols = new Map();
    gridTable[insertYIndex].forEach((col) => {
        if (!col.isReal) {
            const [originCol] = getCol((c) => c.isReal && c.cell.key === col.cell.key);
            if (originCol.path[yIndex] === insertYIndex) {
                insertCols.set(originCol.cell.key, originCol);
            }
            else {
                checkInsertEnable = false;
                return;
            }
        }
        else {
            insertCols.set(col.cell.key, col);
        }
    });
    if (!checkInsertEnable) {
        return;
    }
    const newRow = creator_1.createRow(insertCols.size);
    [...insertCols.values()].forEach((col, index) => {
        newRow.children[index].colspan = col.cell.colspan || 1;
    });
    const [[, path]] = slate_1.Editor.nodes(editor, {
        match: n => n.type === 'table-row',
    });
    slate_1.Transforms.insertNodes(editor, newRow, {
        at: path,
    });
}
exports.insertAbove = insertAbove;
//# sourceMappingURL=insertAbove.js.map