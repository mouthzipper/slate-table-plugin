"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck @ts-ignore
const slate_1 = require("slate");
const selection_1 = require("../selection");
const splitCell_1 = require("./splitCell");
function removeColumn(table, editor) {
    const { selection } = editor;
    if (!selection || !table)
        return;
    const { gridTable, getCol } = selection_1.splitedTable(editor, table);
    const xIndex = table[1].length + 1;
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
    const xLeft = startCol.path[xIndex];
    const xRight = endCol.path[xIndex];
    const topLeftCol = gridTable[0][xLeft];
    const bottomRight = gridTable[gridTable.length - 1][xRight];
    slate_1.Transforms.setSelection(editor, {
        anchor: slate_1.Editor.point(editor, topLeftCol.originPath),
        focus: slate_1.Editor.point(editor, bottomRight.originPath),
    });
    splitCell_1.splitCell(table, editor);
    const { gridTable: splitedGridTable } = selection_1.splitedTable(editor, table);
    const removedCells = splitedGridTable.reduce((p, c) => {
        const cells = c.slice(xLeft, xRight + 1);
        return [...p, ...cells];
    }, []);
    removedCells.forEach((cell) => {
        slate_1.Transforms.removeNodes(editor, {
            at: table[1],
            match: n => n.key === cell.cell.key,
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
    const rows = slate_1.Editor.nodes(editor, {
        at: table[1],
        match: n => n.type === 'table-row',
    });
    for (const row of rows) {
        let minRowHeight = Infinity;
        row[0].children.forEach((cell) => {
            const { rowspan = 1 } = cell;
            if (rowspan < minRowHeight) {
                minRowHeight = rowspan;
            }
        });
        if (minRowHeight > 1 && minRowHeight < Infinity) {
            row[0].children.forEach((cell) => {
                slate_1.Transforms.setNodes(editor, {
                    rowspan: (cell.rowspan || 1) - minRowHeight + 1,
                }, {
                    at: table[1],
                    match: n => n.key === cell.key,
                });
            });
        }
    }
    const { gridTable: removedGridTable } = selection_1.splitedTable(editor, table);
    if (!removedGridTable.length) {
        const contentAfterRemove = slate_1.Editor.string(editor, table[1]);
        if (!contentAfterRemove) {
            slate_1.Transforms.removeNodes(editor, {
                at: table[1],
            });
        }
        return;
    }
    for (let idx = 0; idx < removedGridTable[0].length; idx++) {
        let allColumnIsReal = true;
        let minColWidth = Infinity;
        for (let j = 0; j < removedGridTable.length; j++) {
            if (!removedGridTable[j][idx].isReal) {
                allColumnIsReal = false;
            }
            else {
                const { colspan = 1 } = removedGridTable[j][idx].cell;
                if (colspan < minColWidth) {
                    minColWidth = colspan;
                }
            }
        }
        if (allColumnIsReal && minColWidth < Infinity && minColWidth > 1) {
            for (let j = 0; j < removedGridTable.length; j++) {
                const { cell } = removedGridTable[j][idx];
                slate_1.Transforms.setNodes(editor, {
                    colspan: (cell.colspan || 1) - minColWidth + 1,
                }, {
                    at: table[1],
                    match: n => n.key === cell.key,
                });
            }
        }
    }
}
exports.removeColumn = removeColumn;
//# sourceMappingURL=removeColumn.js.map