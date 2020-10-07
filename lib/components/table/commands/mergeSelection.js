"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck @ts-ignore
const slate_1 = require("slate");
const selection_1 = require("../selection");
function mergeSelection(table, editor) {
    if (!table || !editor.selection)
        return;
    const startPoint = slate_1.Editor.start(editor, editor.selection);
    const [startCell] = slate_1.Editor.nodes(editor, {
        match: n => n.selectedCell,
        at: startPoint,
    });
    if (!startCell)
        return;
    const { gridTable } = selection_1.splitedTable(editor, table, startCell[0].key);
    const selectedTable = checkMerge(gridTable);
    if (!selectedTable)
        return;
    const insertPositionCol = selectedTable[0][0];
    const tmpContent = {};
    gridTable.forEach((row) => {
        row.forEach((col) => {
            if (col.cell.selectedCell &&
                col.cell.key !== insertPositionCol.cell.key &&
                col.isReal) {
                const [node] = slate_1.Editor.nodes(editor, {
                    match: n => n.key === col.cell.key,
                    at: [],
                });
                if (node) {
                    if (slate_1.Editor.string(editor, node[1])) {
                        tmpContent[col.cell.key] = node[0].children;
                    }
                    slate_1.Transforms.removeNodes(editor, {
                        at: table[1],
                        match: n => n.key === col.cell.key,
                    });
                }
            }
        });
    });
    slate_1.Transforms.setNodes(editor, {
        height: 0,
        width: 0,
        colspan: selectedTable[0].length,
        rowspan: selectedTable.length,
    }, {
        at: table[1],
        match: n => n.key === insertPositionCol.cell.key,
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
                    height: 0,
                    width: 0,
                    rowspan: (cell.rowspan || 1) - minRowHeight + 1,
                }, {
                    at: table[1],
                    match: n => n.key === cell.key,
                });
            });
        }
    }
    const { gridTable: mergedGridTable } = selection_1.splitedTable(editor, table);
    for (let idx = 0; idx < mergedGridTable[0].length; idx++) {
        let allColumnIsReal = true;
        let minColWidth = Infinity;
        for (let j = 0; j < mergedGridTable.length; j++) {
            if (!mergedGridTable[j][idx])
                continue;
            if (!mergedGridTable[j][idx].isReal) {
                allColumnIsReal = false;
            }
            else {
                const { colspan = 1 } = mergedGridTable[j][idx].cell;
                if (colspan < minColWidth) {
                    minColWidth = colspan;
                }
            }
        }
        if (allColumnIsReal && minColWidth < Infinity && minColWidth > 1) {
            for (let j = 0; j < mergedGridTable.length; j++) {
                const { cell } = mergedGridTable[j][idx];
                slate_1.Transforms.setNodes(editor, {
                    height: 0,
                    width: 0,
                    colspan: (cell.colspan || 1) - minColWidth + 1,
                }, {
                    at: table[1],
                    match: n => n.key === cell.key,
                });
            }
        }
    }
    const [insertContents] = slate_1.Editor.nodes(editor, {
        at: insertPositionCol.originPath,
        match: n => n.type === 'table-content',
    });
    Object.values(tmpContent).forEach(content => {
        if (content[0] && content[0].children) {
            slate_1.Transforms.insertNodes(editor, content[0].children, {
                at: slate_1.Editor.end(editor, insertContents[1]),
            });
        }
    });
}
exports.mergeSelection = mergeSelection;
function checkMerge(table) {
    let selectedCount = 0;
    const selectedTable = table.reduce((t, row) => {
        const currRow = row.filter((col) => col.cell.selectedCell);
        if (currRow.length) {
            t.push(currRow);
            selectedCount += currRow.length;
        }
        return t;
    }, []);
    if (selectedCount < 2) {
        return;
    }
    const selectedWidth = selectedTable[0].length;
    let couldMerge = true;
    selectedTable.forEach((row) => {
        if (row.length !== selectedWidth) {
            couldMerge = false;
        }
    });
    if (!couldMerge) {
        return;
    }
    return selectedTable;
}
//# sourceMappingURL=mergeSelection.js.map