import * as React from 'react';
export declare type Props = {
    children: React.ReactNode;
    onClick?: () => void;
    color?: string;
    type?: string;
    disabled?: boolean;
    dataTestId?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;
declare const Button: React.FC<Props>;
export default Button;
//# sourceMappingURL=index.d.ts.map