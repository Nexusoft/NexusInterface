import { useTheme } from '@emotion/react';
import Form from 'components/Form';
import TextField from 'components/TextField';
import Button from 'components/Button';

function Input({ component: Component, style, ...props }) {
  const { modern } = useTheme();
  return <Component {...props} skin={modern ? 'filled-inverted' : 'underline'} style={modern ? { ...style, width: props.type === 'number' ? 100 : 280, maxWidth: '100%', minHeight: 36, borderRadius: 8, fontSize: 12 } : style} />;
}

export const CoreInput = (props) => <Input component={Form.TextField} {...props} />;
export const StaticCoreInput = (props) => <Input component={TextField} {...props} />;

export function CoreButton({ style, ...props }) {
  const { modern } = useTheme();
  return <Button {...props} style={modern ? { ...style, height: 34 } : style} />;
}
