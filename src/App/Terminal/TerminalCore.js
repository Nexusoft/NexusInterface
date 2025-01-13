// External Dependencies
import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';

// Internal Global Dependencies
import 'lib/coreOutput';
import { switchConsoleTab, pauseCoreOutput, unpauseCoreOutput } from 'lib/ui';
import { settingAtoms } from 'lib/settings';
import Button from 'components/Button';

__ = __context('Console.CoreOutput');

const TerminalContent = styled.div({
  gridArea: 'content',
  overflow: 'hidden',
});

const TerminalCoreComponent = styled.div(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${theme.mixer(0.125)}`,
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
  }),
  ({ reverse }) => ({
    flexDirection: reverse ? 'column-reverse' : 'column',
  })
);

const OutputLine = styled.code(({ theme }) => ({
  background: theme.background,
  borderColor: theme.background,
}));

export default function TerminalCore() {
  const outputRef = useRef();
  const manualDaemon = useAtomValue(settingAtoms.manualDaemon);
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
        {manualDaemon ? (
          <div className="dim">{__('Core is in Manual Mode')}</div>
        ) : (
          <>
            <Output
              ref={outputRef}
              reverse={!manualDaemon}
              // onScroll={handleScroll}
            >
              {output.map((d, i) => (
                <OutputLine key={i}>{d}</OutputLine>
              ))}
            </Output>
            <Button
              skin="filled-inverted"
              fullWidth
              onClick={paused ? unpauseCoreOutput : pauseCoreOutput}
              style={{ flexShrink: 0 }}
            >
              {paused ? 'Unpause' : 'Pause'}
            </Button>
          </>
        )}
      </TerminalCoreComponent>
    </TerminalContent>
  );
}
