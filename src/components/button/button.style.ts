import { createUseStyles } from 'react-jss';

export default createUseStyles((theme: any) => ({
  root: {
    color: (props: { color: string }) => props.color || theme.colorPrimary,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: (props: { color: string }) =>
      props.color || theme.colorPrimary,
    padding: '15px 32px',
    transition: 'all 250ms',
    '&:not([disabled])&:hover': {
      color: 'white',
      backgroundColor: (props: { color: string }) =>
        props.color || theme.colorPrimary
    },
    '&:focus': {
      outline: 'none'
    },
    '&[disabled]': {
      opacity: 0.3,
      cursor: 'unset'
    }
  },
  label: {
    fontWeight: 'bold'
  }
}));
