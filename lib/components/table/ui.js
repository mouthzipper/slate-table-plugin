"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck @ts-ignore
const react_1 = __importStar(require("react"));
const slate_react_1 = require("slate-react");
const slate_1 = require("slate");
const selection_1 = require("./selection");
const options_1 = require("./options");
require("./ui.css");
exports.TableCardbar = props => {
    const editor = slate_react_1.useSlate();
    const [table] = Array.from(slate_1.Editor.nodes(editor, {
        match: n => n.type === 'table',
    }));
    const run = (action) => () => action(table, editor);
    return null;
    // return (
    //   <Cardbar
    //     className={cx(props.className, 'table-cardbar')}
    //     delete={run(removeTable)}
    //   >
    //     <Button
    //       icon={<InsertRowAboveOutlined />}
    //       onMouseDown={run(insertAbove)}
    //     />
    //     <Button
    //       icon={<InsertRowBelowOutlined />}
    //       onMouseDown={run(insertBelow)}
    //     />
    //     <Button icon={<InsertRowLeftOutlined />} onMouseDown={run(insertLeft)} />
    //     <Button
    //       icon={<InsertRowRightOutlined />}
    //       onMouseDown={run(insertRight)}
    //     />
    //     <Button icon={<MergeCellsOutlined />} onMouseDown={run(mergeSelection)} />
    //     <Button icon={<DeleteColumnOutlined />} onMouseDown={run(removeColumn)} />
    //     <Button icon={<DeleteRowOutlined />} onMouseDown={run(removeRow)} />
    //     <Button icon={<SplitCellsOutlined />} onMouseDown={run(splitCell)} />
    //   </Cardbar>
    // );
};
let startFromX = 0;
exports.HorizontalToolbar = ({ table, tableNode }) => {
    const ref = react_1.useRef(null);
    const editor = slate_react_1.useEditor();
    const [cols, setCols] = react_1.useState([]);
    const widthFnObject = {};
    react_1.useEffect(() => {
        const { gridTable = [] } = selection_1.splitedTable(editor, tableNode);
        if (!gridTable.length)
            return;
        const colsArray = [];
        for (let i = 0; i < gridTable[0].length; i++) {
            for (let j = 0; j < gridTable.length; j++) {
                const currCol = gridTable[j][i];
                if (!currCol)
                    continue;
                const td = table.querySelector(`[data-key=${currCol.cell.key}]`);
                if (!td)
                    continue;
                if (!colsArray[i]) {
                    colsArray[i] = {
                        width: 0,
                        el: [],
                    };
                }
                colsArray[i].width = !colsArray[i].width
                    ? td.offsetWidth + td.offsetLeft
                    : Math.min(colsArray[i].width, td.offsetWidth + td.offsetLeft);
                if (colsArray[i].el.findIndex(({ dataset }) => dataset.key === td.dataset.key) < 0) {
                    colsArray[i].el.push(td);
                }
            }
        }
        for (let i = 1; i < colsArray.length; i++) {
            const leftSumWidth = colsArray
                .slice(0, i)
                .reduce((p, c) => p + c.width, 0);
            colsArray[i].width = colsArray[i].width - leftSumWidth;
        }
        setCols(colsArray.filter(item => item.width));
    }, [editor, table, tableNode]);
    const maxWidth = react_1.useMemo(() => table.closest('div')?.offsetWidth, [table]);
    const onHandleDrag = react_1.useCallback(({ item, index }) => {
        if (widthFnObject[index]) {
            return widthFnObject[index];
        }
        const fn = function (e) {
            const changedWidth = e.clientX - startFromX;
            if (!changedWidth || !e.clientX) {
                return;
            }
            const tableWidthAfterChanged = table.offsetWidth + changedWidth;
            if (item.el && maxWidth && tableWidthAfterChanged < maxWidth) {
                const dragger = ref.current?.querySelector(`#horizontal-dragger-item-${index}`);
                if (!dragger)
                    return;
                const draggerWidth = dragger.offsetWidth;
                if (draggerWidth + changedWidth > options_1.options.defaultWidth) {
                    dragger.style.width = `${draggerWidth + changedWidth}px`;
                }
                const savedChangedWidth = [];
                let moreThanMinWidth = true;
                for (const cell of item.el) {
                    if (cell.offsetWidth + changedWidth <= options_1.options.defaultWidth) {
                        moreThanMinWidth = false;
                        break;
                    }
                    savedChangedWidth.push({
                        target: cell,
                        width: cell.offsetWidth + changedWidth,
                    });
                }
                if (moreThanMinWidth) {
                    savedChangedWidth.forEach(item => {
                        item.target.style.width = `${item.width}px`;
                    });
                }
            }
            startFromX = e.clientX;
        };
        widthFnObject[index] = fn;
        return widthFnObject[index];
    }, [maxWidth, table, widthFnObject]);
    const onHandleDragEnd = react_1.useCallback((item, index) => () => {
        if (item.el) {
            for (const cell of item.el) {
                slate_1.Transforms.setNodes(editor, {
                    width: cell.offsetWidth,
                }, {
                    at: tableNode[1],
                    match: n => n.key === cell.dataset.key,
                });
            }
            const dragger = ref.current?.querySelector(`#horizontal-dragger-item-${index}`);
            const draggerWidth = dragger.offsetWidth;
            const newCols = Array.from(cols);
            newCols[index] = {
                width: draggerWidth,
                el: item.el,
            };
            setCols(() => newCols);
        }
    }, [cols, editor, tableNode]);
    return (react_1.default.createElement("div", { contentEditable: false, className: "table-horizontal-toolbar", ref: ref }, cols.map((item, index) => (react_1.default.createElement("div", { key: index, className: "table-dragger-item", style: { width: `${item.width}px` }, id: `horizontal-dragger-item-${index}` },
        react_1.default.createElement("div", { className: "table-trigger", draggable: true, onMouseDown: e => {
                startFromX = e.clientX;
                document.body.addEventListener('dragover', onHandleDrag({ item, index }), false);
            }, onDragEnd: () => {
                document.body.removeEventListener('dragover', onHandleDrag({ item, index }));
                onHandleDragEnd(item, index);
            } }))))));
};
let startFromY = 0;
exports.VerticalToolbar = ({ table, tableNode }) => {
    const ref = react_1.useRef(null);
    const editor = slate_react_1.useEditor();
    const [rows, setRows] = react_1.useState([]);
    const heightFnObject = {};
    react_1.useEffect(() => {
        const { gridTable = [] } = selection_1.splitedTable(editor, tableNode);
        if (!gridTable.length)
            return;
        const rowsArray = [];
        for (let i = 0; i < gridTable.length; i++) {
            for (let j = 0; j < gridTable[i].length; j++) {
                const currCell = gridTable[i][j];
                const td = table.querySelector(`[data-key=${currCell.cell.key}]`);
                if (!td)
                    continue;
                if (!rowsArray[i]) {
                    rowsArray[i] = {
                        height: 0,
                        el: [],
                    };
                }
                if (currCell.isReal) {
                    rowsArray[i].height = !rowsArray[i].height
                        ? td.offsetHeight
                        : Math.min(rowsArray[i].height, td.offsetHeight);
                }
                if (rowsArray[i].el.findIndex(({ dataset }) => dataset.key === td.dataset.key) < 0) {
                    rowsArray[i].el.push(td);
                }
            }
        }
        setRows(() => rowsArray);
    }, [editor, table, tableNode]);
    const onHandleDrag = react_1.useCallback(({ item, index }) => {
        if (heightFnObject[index]) {
            return heightFnObject[index];
        }
        const fn = function (e) {
            const changedHeight = e.clientY - startFromY;
            if (!changedHeight || !e.clientY) {
                return;
            }
            if (item.el) {
                const minHeight = options_1.options.defaultHeight;
                const dragger = ref.current?.querySelector(`#vertical-dragger-item-${index}`);
                if (!dragger)
                    return;
                const draggerHeight = dragger.offsetHeight;
                if (draggerHeight + changedHeight > minHeight) {
                    dragger.style.height = `${draggerHeight + changedHeight}px`;
                }
                const savedChangedHeight = [];
                let moreThanMinHeight = true;
                for (const cell of item.el) {
                    if (cell.offsetHeight + changedHeight < minHeight) {
                        moreThanMinHeight = false;
                        break;
                    }
                    savedChangedHeight.push({
                        td: cell,
                        height: cell.offsetHeight + changedHeight,
                    });
                }
                if (moreThanMinHeight) {
                    savedChangedHeight.forEach(item => {
                        console.log(item.td.dataset.key);
                        item.td.style.height = `${item.height}px`;
                    });
                }
            }
            startFromY = e.clientY;
        };
        heightFnObject[index] = fn;
        return heightFnObject[index];
    }, [heightFnObject]);
    const onHandleDragEnd = react_1.useCallback((item, index) => {
        if (item.el) {
            for (const cell of item.el) {
                slate_1.Transforms.setNodes(editor, {
                    height: cell.offsetHeight,
                }, {
                    at: tableNode[1],
                    match: n => n.key === cell.dataset.key,
                });
            }
            const dragger = ref.current?.querySelector(`#vertical-dragger-item-${index}`);
            const draggerHeight = dragger.offsetHeight;
            const newRows = Array.from(rows);
            newRows[index] = {
                height: draggerHeight,
                el: item.el,
            };
            setRows(() => newRows);
        }
    }, [rows, editor, tableNode]);
    return (react_1.default.createElement("div", { contentEditable: false, className: "table-vertical-toolbar", ref: ref }, rows.map((item, index) => (react_1.default.createElement("div", { key: index, className: "table-dragger-item", style: { height: `${item.height}px` }, id: `vertical-dragger-item-${index}` },
        react_1.default.createElement("div", { className: "table-trigger", draggable: true, onMouseDown: e => {
                startFromY = e.clientY;
                document.body.addEventListener('dragover', onHandleDrag({ item, index }), false);
            }, onDragEnd: () => {
                console.log('drag end');
                document.body.removeEventListener('dragover', onHandleDrag({ item, index }), false);
                onHandleDragEnd(item, index);
            } }))))));
};
//# sourceMappingURL=ui.js.map