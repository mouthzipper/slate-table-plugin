"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck @ts-ignore
const react_1 = __importStar(require("react"));
const slate_react_1 = require("slate-react");
const slate_1 = require("slate");
const selection_1 = require("./selection");
const options_1 = require("./options");
const creator_1 = require("./creator");
const ui_1 = require("./ui");
const classnames_1 = __importDefault(require("classnames"));
const utils_1 = require("./utils");
require("./table.css");
exports.withTable = (editor) => {
    const { addMark, removeMark, deleteBackward, deleteFragment } = editor;
    editor.addMark = (key, value) => {
        if (editor.selection) {
            const lastSelection = editor.selection;
            const selectedCells = slate_1.Editor.nodes(editor, {
                match: n => n.selectedCell,
                at: [],
            });
            let isTable = false;
            for (let cell of selectedCells) {
                if (!isTable) {
                    isTable = true;
                }
                const [content] = slate_1.Editor.nodes(editor, {
                    match: n => n.type === 'table-content',
                    at: cell[1],
                });
                if (slate_1.Editor.string(editor, content[1]) !== '') {
                    slate_1.Transforms.setSelection(editor, slate_1.Editor.range(editor, cell[1]));
                    addMark(key, value);
                }
            }
            if (isTable) {
                slate_1.Transforms.select(editor, lastSelection);
                return;
            }
        }
        addMark(key, value);
    };
    editor.removeMark = key => {
        if (editor.selection) {
            const lastSelection = editor.selection;
            const selectedCells = slate_1.Editor.nodes(editor, {
                match: n => {
                    return n.selectedCell;
                },
                at: [],
            });
            let isTable = false;
            for (let cell of selectedCells) {
                if (!isTable) {
                    isTable = true;
                }
                const [content] = slate_1.Editor.nodes(editor, {
                    match: n => n.type === 'table-content',
                    at: cell[1],
                });
                if (slate_1.Editor.string(editor, content[1]) !== '') {
                    slate_1.Transforms.setSelection(editor, slate_1.Editor.range(editor, cell[1]));
                    removeMark(key);
                }
            }
            if (isTable) {
                slate_1.Transforms.select(editor, lastSelection);
                return;
            }
        }
        removeMark(key);
    };
    editor.deleteFragment = (...args) => {
        if (editor.selection && utils_1.isInSameTable(editor)) {
            const selectedCells = slate_1.Editor.nodes(editor, {
                match: n => {
                    return n.selectedCell;
                },
            });
            for (let cell of selectedCells) {
                slate_1.Transforms.setSelection(editor, slate_1.Editor.range(editor, cell[1]));
                const [content] = slate_1.Editor.nodes(editor, {
                    match: n => n.type === 'table-content',
                });
                slate_1.Transforms.insertNodes(editor, creator_1.createContent(), { at: content[1] });
                slate_1.Transforms.removeNodes(editor, { at: slate_1.Path.next(content[1]) });
            }
            return;
        }
        slate_1.Transforms.removeNodes(editor, {
            match: n => n.type === 'table',
        });
        deleteFragment(...args);
    };
    editor.deleteBackward = (...args) => {
        const { selection } = editor;
        if (selection && slate_1.Range.isCollapsed(selection)) {
            const isInTable = slate_1.Editor.above(editor, {
                match: n => n.type === 'table',
            });
            if (isInTable) {
                const start = slate_1.Editor.start(editor, selection);
                const isStart = slate_1.Editor.isStart(editor, start, selection);
                const currCell = slate_1.Editor.above(editor, {
                    match: n => n.type === 'table-cell',
                });
                if (isStart && currCell && !slate_1.Editor.string(editor, currCell[1])) {
                    return;
                }
            }
        }
        deleteBackward(...args);
    };
    return editor;
};
exports.Table = props => {
    const { attributes, children, element } = props;
    const selected = slate_react_1.useSelected();
    const editor = slate_react_1.useEditor();
    switch (element.type) {
        case 'table': {
            let existSelectedCell = false;
            let table = null;
            if (selected && editor.selection) {
                [table] = slate_1.Editor.nodes(editor, {
                    match: n => n.type === 'table',
                    at: slate_1.Editor.path(editor, editor.selection),
                });
                if (table) {
                    const [selectedCell] = slate_1.Editor.nodes(editor, {
                        at: slate_1.Editor.range(editor, table[1]),
                        match: n => n.selectedCell,
                    });
                    if (selectedCell) {
                        existSelectedCell = true;
                    }
                }
            }
            return (react_1.default.createElement("div", { style: { position: 'relative' } },
                react_1.default.createElement(ui_1.TableCardbar, { className: classnames_1.default({ selected: selected || existSelectedCell }) }),
                react_1.default.createElement(TableComponent, Object.assign({}, props, { table: table }), children)));
        }
        case 'table-row': {
            return (react_1.default.createElement("tr", Object.assign({}, attributes, { className: "table-tr", "slate-table-element": "tr", "data-key": element.key, onDrag: e => e.preventDefault() }), children));
        }
        case 'table-cell': {
            return (react_1.default.createElement(CellComponent, Object.assign({}, props, { dataKey: element.key, node: children.props.node }), children));
        }
        case 'table-content': {
            return (react_1.default.createElement("div", { "slate-table-element": "content", className: "table-content" }, children));
        }
        default:
            return react_1.default.createElement("p", Object.assign({}, props));
    }
};
const TableComponent = props => {
    const { table, children } = props;
    const editor = slate_react_1.useSlate();
    const selected = slate_react_1.useSelected();
    const ref = react_1.useRef(null);
    const resizeTable = react_1.useCallback(() => {
        if (ref.current) {
            ref.current.querySelectorAll('td').forEach(cell => {
                slate_1.Transforms.setNodes(editor, {
                    width: cell.offsetWidth,
                    height: cell.offsetHeight,
                }, {
                    at: [],
                    match: n => n.key === cell.dataset.key,
                });
            });
        }
    }, [editor]);
    react_1.useEffect(() => {
        resizeTable();
    }, [resizeTable, selected, editor.selection]);
    react_1.useEffect(() => {
        if (!selected)
            selection_1.removeSelection(editor);
    }, [selected, editor]);
    const [startKey, setStartKey] = react_1.useState('');
    const startNode = react_1.useMemo(() => {
        const [node] = slate_1.Editor.nodes(editor, {
            match: n => n.key === startKey,
            at: [],
        });
        return node;
    }, [startKey, editor]);
    const ResizeToolbar = react_1.useMemo(() => {
        return (selected &&
            ref.current &&
            table && (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(ui_1.HorizontalToolbar, { table: ref.current, tableNode: table }),
            react_1.default.createElement(ui_1.VerticalToolbar, { table: ref.current, tableNode: table }))));
    }, [selected, table]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        ResizeToolbar,
        react_1.default.createElement("table", { className: "table", "slate-table-element": "table", ref: ref, style: options_1.options.tableStyle, onDragStart: e => e.preventDefault(), onMouseDown: e => {
                const cell = e.target.closest('td');
                const key = cell?.getAttribute('data-key') || '';
                setStartKey(key);
            }, onMouseMove: e => {
                const cell = e.target.closest('td');
                if (cell && startKey) {
                    const endKey = cell.getAttribute('data-key');
                    const [endNode] = slate_1.Editor.nodes(editor, {
                        match: n => n.key === endKey,
                        at: [],
                    });
                    selection_1.addSelection(editor, table, slate_1.Editor.path(editor, startNode[1]), slate_1.Editor.path(editor, endNode[1]));
                }
            }, onMouseUp: () => {
                setStartKey('');
                resizeTable();
            }, onMouseLeave: () => {
                setStartKey('');
            } },
            react_1.default.createElement("tbody", { "slate-table-element": "tbody" }, children))));
};
const CellComponent = ({ attributes, node, dataKey, children }) => {
    const { selectedCell } = node;
    return (react_1.default.createElement("td", Object.assign({}, attributes, { className: classnames_1.default('table-td', { selectedCell }), "slate-table-element": "td", "data-key": dataKey, colSpan: node.colspan, rowSpan: node.rowspan, onDragStart: e => e.preventDefault(), style: {
            position: 'relative',
            minWidth: '50px',
            width: node.width ? `${node.width}px` : 'auto',
            height: node.width ? `${node.height}px` : 'auto',
        } }), children));
};
//# sourceMappingURL=elements.js.map