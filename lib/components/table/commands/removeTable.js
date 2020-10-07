"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const slate_1 = require("slate");
function removeTable(table, editor) {
    if (editor && table) {
        slate_1.Transforms.removeNodes(editor, {
            match: n => n.type === 'table',
            at: table[1],
        });
    }
}
exports.removeTable = removeTable;
//# sourceMappingURL=removeTable.js.map