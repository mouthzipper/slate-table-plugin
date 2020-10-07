import * as React from 'react';

import useStyles from './button.style';

export type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
  type?: string;
  disabled?: boolean;
  dataTestId?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<Props> = ({
  children,
  onClick = () => {},
  disabled = false,
  type = 'submit',
  color = '',
  dataTestId = 'button'
}) => {
  const classes = useStyles({ color });

  const handleClick = () => {
    if (!disabled && onClick) onClick();
  };

  const rootProps = {
    className: classes.root,
    type,
    onClick: handleClick,
    disabled,
    'data-testid': dataTestId
  };

  return (
    <button {...rootProps}>
      <span className={classes.label}>{children}</span>
    </button>
  );
};

export default Button;
