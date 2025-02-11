// External Dependencies
import { useRef, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';

// Internal Global Dependencies
import { settingsAtom } from 'lib/settings';
import {
  coreOutputAtom,
  coreOutputPausedAtom,
  togglePaused,
} from 'lib/coreOutput';
import Button from 'components/Button';
import { useConsoleTab } from './atoms';

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
  useConsoleTab('Core');
  const outputRef = useRef();
  const { manualDaemon } = useAtomValue(settingsAtom);
  const output = useAtomValue(coreOutputAtom);
  const paused = useAtomValue(coreOutputPausedAtom);

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
              onClick={togglePaused}
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
