"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck @ts-ignore
const slate_1 = require("slate");
exports.splitedTable = (editor, table, startKey) => {
    const tableDepth = table[1].length;
    const cells = [];
    const nodes = slate_1.Editor.nodes(editor, {
        at: table[1],
        match: n => n.type === 'table-cell',
    });
    for (const node of nodes) {
        const [cell, path] = node;
        cells.push({
            cell,
            path,
            realPath: [...path],
        });
    }
    const gridTable = [];
    let insertPosition = null;
    for (let i = 0; i < cells.length; i++) {
        const { cell, path, realPath } = cells[i];
        const { rowspan = 1, colspan = 1 } = cell;
        let y = path[tableDepth];
        let x = path[tableDepth + 1];
        if (!gridTable[y]) {
            gridTable[y] = [];
        }
        while (gridTable[y][x]) {
            x++;
        }
        for (let j = 0; j < rowspan; j++) {
            for (let k = 0; k < colspan; k++) {
                let _y = y + j;
                let _x = x + k;
                if (!gridTable[_y]) {
                    gridTable[_y] = [];
                }
                gridTable[_y][_x] = {
                    cell,
                    path: [...realPath.slice(0, tableDepth), _y, _x],
                    isReal: (rowspan === 1 && colspan === 1) || (_y === y && _x === x),
                    originPath: path,
                };
                if (!insertPosition && cell.key === startKey) {
                    insertPosition = gridTable[_y][_x];
                    gridTable[_y][_x].isInsertPosition = true;
                }
            }
        }
    }
    const getCol = (match) => {
        const result = [];
        gridTable.forEach(row => {
            row.forEach((col) => {
                if (match && match(col)) {
                    result.push(col);
                }
            });
        });
        return result;
    };
    return {
        gridTable,
        tableDepth,
        getCol,
    };
};
function addSelection(editor, table, startPath, endPath) {
    removeSelection(editor);
    // addSelectionStyle();
    if (!table)
        return [];
    const { gridTable, getCol } = exports.splitedTable(editor, table);
    if (!getCol || !gridTable)
        return [];
    let [head] = getCol((n) => slate_1.Path.equals(slate_1.Editor.path(editor, n.originPath), startPath) && n.isReal);
    let [tail] = getCol((n) => slate_1.Path.equals(slate_1.Editor.path(editor, n.originPath), endPath) && n.isReal);
    if (!tail || !head)
        return [];
    const { path: tailPath } = tail;
    const { path: headPath } = head;
    headPath.forEach((item, index) => {
        headPath[index] = Math.min(item, tailPath[index]);
        tailPath[index] = Math.max(item, tailPath[index]);
    });
    const coverCols = [];
    gridTable.forEach((row) => {
        row.forEach((col) => {
            const { path } = col;
            const isOver = path.findIndex((item, index) => {
                if (item < headPath[index] || item > tailPath[index]) {
                    return true;
                }
                return false;
            });
            if (isOver < 0) {
                coverCols.push(col);
            }
        });
    });
    coverCols.forEach(({ originPath }) => {
        slate_1.Transforms.setNodes(editor, {
            selectedCell: true,
        }, {
            at: originPath,
            match: n => n.type === 'table-cell',
        });
    });
    return coverCols;
}
exports.addSelection = addSelection;
function removeSelection(editor) {
    slate_1.Transforms.unsetNodes(editor, 'selectedCell', {
        at: [],
        match: n => !!n.selectedCell,
    });
}
exports.removeSelection = removeSelection;
// export function removeSelectionStyle() {
//   const style = document.querySelector(`style#${insertStyleId}`);
//   if (style) {
//     const head = document.getElementsByTagName('head');
//     const first = head && head.item(0);
//     first && first.removeChild(style);
//   }
// }
// export function addSelectionStyle() {
//   // HACK: Add ::selection style when greater than 1 cells selected.
//   if (!document.querySelector(`style#${insertStyleId}`)) {
//     const style = document.createElement('style');
//     style.type = 'text/css';
//     style.id = insertStyleId;
//     const head = document.getElementsByTagName('head');
//     const first = head && head.item(0);
//     if (first) {
//       first.appendChild(style);
//       const stylesheet = style.sheet;
//       if (stylesheet) {
//         (stylesheet as CSSStyleSheet).insertRule(
//           `table *::selection { background: none; }`,
//           (stylesheet as CSSStyleSheet).cssRules.length
//         );
//       }
//     }
//   }
// }
//# sourceMappingURL=selection.js.map