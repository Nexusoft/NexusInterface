import styled from '@emotion/styled';
import themeStyles from 'utils/themeStyles';

export default styled.div(themeStyles([({
  theme,
  maxWidth = 500
}) => ({
  maxWidth,
  margin: '0 auto',
  paddingTop: 15,
  color: theme.mixer(0.75)
})], [({
  theme,
  maxWidth = 'none'
}) => ({
  maxWidth,
  margin: '0 auto',
  width: '100%',
  paddingTop: 0,
  color: theme.mixer(0.75)
})]));
