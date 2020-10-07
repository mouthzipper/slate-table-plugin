"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck @ts-ignore
const slate_1 = require("slate");
const selection_1 = require("../selection");
const creator_1 = require("../creator");
function insertBelow(table, editor) {
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
    const insertCols = new Map();
    const y = insertPositionCol.path[yIndex] + (insertPositionCol.cell.rowspan || 1) - 1;
    gridTable[y].forEach((col) => {
        const [originCol] = getCol((n) => n.isReal && n.cell.key === col.cell.key);
        const { cell, path } = originCol;
        if (!gridTable[y + 1]) {
            insertCols.set(cell.key, originCol);
        }
        else if (path[yIndex] + (cell.rowspan || 1) - 1 === y) {
            insertCols.set(cell.key, originCol);
        }
        else {
            checkInsertEnable = false;
            return;
        }
    });
    if (!checkInsertEnable) {
        return;
    }
    const newRow = creator_1.createRow(insertCols.size);
    [...insertCols.values()].forEach((value, index) => {
        newRow.children[index].colspan = value.cell.colspan || 1;
    });
    const [[, path]] = slate_1.Editor.nodes(editor, {
        match: n => n.type === 'table-row',
    });
    for (let i = 1; i < startCell[0].rowspan; i++) {
        path[yIndex] += 1;
    }
    slate_1.Transforms.insertNodes(editor, newRow, {
        at: slate_1.Path.next(path),
    });
}
exports.insertBelow = insertBelow;
//# sourceMappingURL=insertBelow.js.map