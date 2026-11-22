import { moduleLayout, modulePanel } from 'utils/moduleStyles';
// External Dependencies
import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';

// Internal Global Dependencies
import 'lib/coreOutput';
import { switchConsoleTab, pauseCoreOutput, unpauseCoreOutput } from 'lib/ui';
import Button from 'components/Button';
import { fade } from 'utils/color';

__ = __context('Console.CoreOutput');

const TerminalContent = styled.div(({ theme }) => ({
  gridArea: 'content',
  overflow: 'hidden',
  ...(theme.modern && { minHeight: 0, minWidth: 0 }),
}));

const TerminalCoreComponent = styled.div(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${theme.mixer(0.125)}`,
  ...(theme.modern && {
    minHeight: 0, minWidth: 0, border: 0,
    '> button': { alignSelf: 'flex-end', marginTop: 12, padding: '0 20px', minHeight: 40, borderRadius: 10, border: `1px solid ${fade(theme.primary, 0.75)}` },
    '> .dim': { padding: 24, borderRadius: 14, border: `1px solid ${fade(theme.primary, 0.75)}`, background: theme.background },
  }),
}));

const Output = styled.div(
  ({ theme }) => ({
    overflowY: 'auto',
    wordBreak: 'break-all',
    flexGrow: 1,
    fontSize: '75%',
    display: 'flex',
    background: theme.background,
    borderBottom: `1px solid ${theme.mixer(0.125)}`,
    padding: '.5em',
    ...(theme.modern && {
    minHeight: 0, padding: moduleLayout.panelPadding, ...modulePanel(theme),
    fontSize: 13, lineHeight: 1.7,
    }),
  }),
  ({ reverse }) => ({
    flexDirection: reverse ? 'column-reverse' : 'column',
  })
);

const OutputLine = styled.code(({ theme }) => ({
  background: theme.background,
  borderColor: theme.background,
  ...(theme.modern && { background: 'transparent', border: 0, padding: 0, color: theme.foreground, overflowWrap: 'anywhere' }),
}));

export default function TerminalCore() {
  const { modern } = useTheme();
  const outputRef = useRef();
  const settings = useSelector((state) => state.settings);
  const output = useSelector((state) => state.ui.console.core.output);
  const paused = useSelector((state) => state.ui.console.core.paused);

  useEffect(() => {
    switchConsoleTab('Core');
  }, []);

  const prevOutput = useRef(output);
  useEffect(() => {
    if (outputRef.current && output?.length != prevOutput?.length) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  });

  // const handleScroll = () => {
  //   const bottomPos =
  //     outputRef.current.scrollHeight - outputRef.current.clientHeight - 2; // found a issue where the numbers would be plus or minus this do to floating point error. Just stepped back 2 it catch it.
  //   const currentPos = parseInt(outputRef.current.scrollTop);
  //   if (currentPos >= bottomPos) {
  //     return;
  //   }
  //   if (!paused) {
  //     pauseCoreOutput(true);
  //   }
  // };

  return (
    <TerminalContent>
      <TerminalCoreComponent>
        {settings.manualDaemon ? (
          <div className="dim">{__('Core is in Manual Mode')}</div>
        ) : (
          <>
            <Output
              ref={outputRef}
              reverse={!settings.manualDaemon}
              // onScroll={handleScroll}
            >
              {output.map((d, i) => (
                <OutputLine key={i}>{d}</OutputLine>
              ))}
            </Output>
            {!modern && <Button
              skin="filled-inverted"
              fullWidth
              onClick={paused ? unpauseCoreOutput : pauseCoreOutput}
              style={{ flexShrink: 0 }}
            >
              {paused ? 'Unpause' : 'Pause'}
            </Button>}
          </>
        )}
      </TerminalCoreComponent>
    </TerminalContent>
  );
}
