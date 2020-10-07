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
const React = __importStar(require("react"));
const button_style_1 = __importDefault(require("./button.style"));
const Button = ({ children, onClick = () => { }, disabled = false, type = 'submit', color = '', dataTestId = 'button' }) => {
    const classes = button_style_1.default({ color });
    const handleClick = () => {
        if (!disabled && onClick)
            onClick();
    };
    const rootProps = {
        className: classes.root,
        type,
        onClick: handleClick,
        disabled,
        'data-testid': dataTestId
    };
    return (React.createElement("button", Object.assign({}, rootProps),
        React.createElement("span", { className: classes.label }, children)));
};
exports.default = Button;
//# sourceMappingURL=index.js.map