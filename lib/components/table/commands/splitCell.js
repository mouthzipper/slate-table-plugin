"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck @ts-ignore
const slate_1 = require("slate");
const selection_1 = require("../selection");
const creator_1 = require("../creator");
function splitCell(table, editor) {
    const { selection } = editor;
    if (!selection || !table)
        return;
    const yIndex = table[1].length;
    const xIndex = table[1].length + 1;
    const { getCol } = selection_1.splitedTable(editor, table);
    const [start, end] = slate_1.Editor.edges(editor, selection);
    const [startNode] = slate_1.Editor.nodes(editor, {
        match: n => n.type === 'table-cell',
        at: start,
    });
    const [endNode] = slate_1.Editor.nodes(editor, {
        match: n => n.type === 'table-cell',
        at: end,
    });
    if (!startNode || !endNode)
        return;
    const [startCell] = getCol((n) => n.cell.key === startNode[0].key);
    const [endCell] = getCol((n) => n.cell.key === endNode[0].key);
    const [yStart, yEnd] = [startCell.path[yIndex], endCell.path[yIndex]];
    const [xStart, xEnd] = [startCell.path[xIndex], endCell.path[xIndex]];
    const sourceCells = [];
    const selectedCols = getCol((n) => {
        if (n.cell.selectedCell) {
            return true;
        }
        const [y, x] = n.path.slice(yIndex, xIndex + 1);
        if (y >= yStart && y <= yEnd && x >= xStart && x <= xEnd) {
            if (!n.isReal) {
                const [sourceCell] = getCol((s) => s.isReal && s.cell.key === n.cell.key);
                sourceCells.push(sourceCell);
            }
            return true;
        }
        return false;
    });
    selectedCols.push(...sourceCells);
    const filterColsObject = selectedCols.reduce((p, c) => {
        if (c.isReal) {
            p[c.cell.key] = c;
        }
        return p;
    }, {});
    Object.values(filterColsObject).forEach((col) => {
        const { cell, isReal, originPath } = col;
        const { rowspan = 1, colspan = 1, children } = cell;
        if (isReal && (rowspan !== 1 || colspan !== 1)) {
            slate_1.Transforms.delete(editor, {
                at: originPath,
            });
            for (let i = 0; i < rowspan; i++) {
                for (let j = 0; j < colspan; j++) {
                    const newPath = Array.from(originPath);
                    newPath[yIndex] += i;
                    const newCell = creator_1.createCell({
                        width: 0,
                        height: 0,
                        elements: i === 0 && j === colspan - 1 ? children[0].children : null,
                    });
                    slate_1.Transforms.insertNodes(editor, newCell, {
                        at: newPath,
                    });
                }
            }
        }
    });
}
exports.splitCell = splitCell;
//# sourceMappingURL=splitCell.js.map