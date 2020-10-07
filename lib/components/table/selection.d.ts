import { Editor, NodeEntry, Path } from 'slate';
import { Cell } from './creator';
export declare const splitedTable: (editor: Editor, table: NodeEntry, startKey?: string | undefined) => {
    tableDepth?: number;
    gridTable: Col[][];
    getCol: (match?: (node: Col) => boolean) => Col[];
};
export declare type Col = {
    cell: Cell;
    isReal: boolean;
    path: Path;
    originPath: Path;
    isInsertPosition?: boolean;
};
export declare function addSelection(editor: Editor, table: NodeEntry | null, startPath: Path, endPath: Path): Col[];
export declare function removeSelection(editor: Editor): void;
//# sourceMappingURL=selection.d.ts.map