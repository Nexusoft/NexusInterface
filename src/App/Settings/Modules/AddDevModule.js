import styled from '@emotion/styled';
import { fade } from 'utils/color';
import { ipcRenderer } from 'electron';

import Button from 'components/Button';
import { addDevModule } from 'lib/modules';

__ = __context('Settings.Modules');

const Wrapper = styled.div(({ theme }) => ({
  margin: '1em 0',
  color: theme.mixer(0.75),
  textAlign: 'center',
  fontSize: '.9em',
  ...(theme.modern && {
    padding: '14px 18px', margin: '0 0 16px', borderRadius: 12,
    border: `1px solid ${fade(theme.primary, 0.82)}`, background: fade(theme.background, 0.25),
    fontSize: 12, lineHeight: 1.6,
    'button': { height: 34, padding: '0 12px', borderRadius: 8, fontSize: 12 },
  }),
}));

async function handleClick() {
  const paths = await ipcRenderer.invoke('show-open-dialog', {
    title: __('Select development module directory'),
    properties: ['openDirectory'],
  });
  const dirPath = paths && paths[0];
  if (!dirPath) return;

  await addDevModule(dirPath);
}

export default function AddDevModule() {
  return (
    <Wrapper>
      {__(
        'Your module is still in development? <link>Add a development module</link>',
        null,
        {
          link: (txt) => (
            <Button skin="hyperlink" onClick={handleClick}>
              {txt}
            </Button>
          ),
        }
      )}
    </Wrapper>
  );
}
