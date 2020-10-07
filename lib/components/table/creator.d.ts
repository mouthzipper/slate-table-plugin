import { Node, Element } from 'slate';
export declare function createTable(columns: number, rows: number): any;
export interface Row extends Element {
    type: 'table-row';
    key: string;
    data: any;
    children: Cell[];
}
export declare function createRow(columns: number): Row;
export interface Cell extends Element {
    type: 'table-cell';
    key: string;
    rowspan?: number;
    colspan?: number;
    width?: number;
    height?: number;
    selectedCell?: boolean;
    children: Node[];
}
export declare function createCell({ elements, colspan, rowspan, height, width, }?: {
    elements?: Node[];
    height?: number;
    width?: number;
    colspan?: number;
    rowspan?: number;
}): Cell;
export interface TableContent extends Element {
    type: 'table-content';
    children: Node[];
}
export declare function createContent(elements?: Node[]): TableContent;
//# sourceMappingURL=creator.d.ts.map