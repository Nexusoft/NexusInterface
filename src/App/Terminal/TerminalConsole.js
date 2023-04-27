// External Dependencies
import { useSelector } from 'react-redux';
import { useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import GA from 'lib/googleAnalytics';
import memoize from 'utils/memoize';

// Internal Global Dependencies
import Button from 'components/Button';
import AutoSuggest from 'components/AutoSuggest';
import RequireCoreConnected from 'components/RequireCoreConnected';
import rpc from 'lib/rpc';
import {
  switchConsoleTab,
  updateConsoleInput,
  setCommandList,
  commandHistoryUp,
  commandHistoryDown,
  executeCommand,
  printCommandOutput,
  printCommandError,
  resetConsole,
} from 'lib/ui';

__ = __context('Console.Console');

const filterCommands = memoize((commandList, inputValue) => {
  if (!commandList || !inputValue) return [];
  return commandList.filter(
    (cmd) =>
      !!cmd && cmd.value.toLowerCase().startsWith(inputValue.toLowerCase())
  );
});

const selectConsoleInput = memoize(
  (currentCommand, commandHistory, historyIndex) =>
    historyIndex === -1 ? currentCommand : commandHistory[historyIndex],
  ({
    ui: {
      console: {
        console: { currentCommand, commandHistory, historyIndex },
      },
    },
  }) => [currentCommand, commandHistory, historyIndex]
);

const TerminalContent = styled.div({
  gridArea: 'content',
  overflow: 'visible',
});

const Console = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

const ConsoleInput = styled.div({
  marginBottom: '1em',
  position: 'relative',
});

const ConsoleOutput = styled.code(({ theme }) => ({
  flexGrow: 1,
  flexBasis: 0,
  fontSize: '75%',
  overflow: 'auto',
  wordBreak: 'break-all',
  whiteSpace: 'pre-wrap',
  background: theme.background,
  border: `1px solid ${theme.mixer(0.125)}`,
}));

const ExecuteButton = styled(Button)(({ theme }) => ({
  borderLeft: `1px solid ${theme.mixer(0.125)}`,
}));

export default function TerminalConsole() {
  const inputRef = useRef();
  const outputRef = useRef();
  const consoleInput = useSelector(selectConsoleInput);
  const commandList = useSelector(
    (state) => state.ui.console.console.commandList
  );
  const output = useSelector((state) => state.ui.console.console.output);

  const loadCommandList = async () => {
    const result = await rpc('help', []);
    const commandList = result
      .split('\n')
      .filter(
        (c) =>
          c &&
          typeof c === 'string' &&
          c !== 'please enable -richlist to use this command' &&
          !c.startsWith(' ')
      ) // Tritium added some extra comments that are not commands so filter them out
      .map((c) => ({
        display: c,
        value: c.split(' ')[0],
      }));
    setCommandList(commandList);
  };

  useEffect(() => {
    switchConsoleTab('Console');
    if (!commandList.length) {
      loadCommandList();
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom
    if (outputRef.current) {
      const { clientHeight, scrollHeight } = outputRef.current;
      outputRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [output]);

  const execute = async () => {
    if (!consoleInput || !consoleInput.trim()) return;

    const [cmd, ...chunks] = consoleInput.split(' ');
    executeCommand(consoleInput);
    GA.SendEvent('Terminal', 'Console', 'UseCommand', 1);
    if (!commandList.some((c) => c.value.includes(cmd))) {
      printCommandError(`\`${cmd}\` is not a valid command`);
      return;
    }

    const args = chunks
      .filter((arg) => arg)
      .map((arg) => (isNaN(Number(arg)) ? arg : Number(arg)));

    // inputRef.inputRef.current.blur();

    const tab = ' '.repeat(2);
    let result = null;
    try {
      result = await rpc(cmd, args);
    } catch (err) {
      console.error(err);
      if (err.message !== undefined) {
        printCommandError(`Error: ${err.message}(errorcode ${err.code})`);
      } else {
        // This is the error if the rpc is unavailable
        try {
          printCommandError(tab + err.err.message);
        } catch (e) {
          printCommandError(tab + err);
        }
      }
      return;
    }

    if (typeof result === 'object') {
      const output = [];
      const traverseOutput = (obj, depth) => {
        const tabs = tab.repeat(depth);
        Object.entries(obj).forEach(([key, value]) => {
          if (typeof value === 'object') {
            output.push(`${tabs}${key}:`);
            traverseOutput(value, depth + 1);
          } else {
            output.push(`${tabs}${key}: ${value}`);
          }
        });
      };

      traverseOutput(result, 1);
      printCommandOutput(output);
    } else if (typeof result === 'string') {
      printCommandOutput(
        result
          .split('\n')
          .map(
            (text) => tab + (text.startsWith(' ') ? text : '> ' + text + '\n')
          )
      );
    } else {
      printCommandOutput(tab + result);
    }
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        commandHistoryDown();
        break;
      case 'ArrowUp':
        e.preventDefault();
        commandHistoryUp();
        break;
      case 'Enter':
        execute();
        break;
    }
  };

  const formatAutoSuggest = (e) => {
    updateConsoleInput(e);
  };

  return (
    <RequireCoreConnected>
      <TerminalContent>
        <Console>
          <ConsoleInput>
            <AutoSuggest
              suggestions={commandList}
              filterSuggestions={filterCommands}
              onSelect={formatAutoSuggest}
              keyControl={false}
              suggestOn="change"
              inputRef={inputRef}
              inputProps={{
                autoFocus: true,
                skin: 'filled-inverted',
                value: consoleInput,
                placeholder: __(
                  'Enter console commands here (ex: getinfo, help)'
                ),
                onChange: (e) => {
                  updateConsoleInput(e.target.value);
                },
                onKeyDown: handleKeyDown,
                right: (
                  <ExecuteButton
                    skin="filled-inverted"
                    fitHeight
                    grouped="right"
                    onClick={execute}
                  >
                    {__('Execute')}
                  </ExecuteButton>
                ),
              }}
            />
          </ConsoleInput>

          <ConsoleOutput ref={outputRef}>
            {output.map(({ type, content }, i) => {
              switch (type) {
                case 'command':
                  return (
                    <div key={i}>
                      <span>
                        <span style={{ color: '#0ca4fb' }}>Nexus-Core</span>
                        <span style={{ color: '#00d850' }}>$ </span>
                        {content}
                        <span style={{ color: '#0ca4fb' }}> &gt;</span>
                      </span>
                    </div>
                  );
                case 'text':
                  return <div key={i}>{content}</div>;
                case 'error':
                  return (
                    <div key={i} className="error">
                      {content}
                    </div>
                  );
              }
            })}
          </ConsoleOutput>

          <Button
            skin="filled-inverted"
            grouped="bottom"
            onClick={resetConsole}
          >
            {__('Clear console')}
          </Button>
        </Console>
      </TerminalContent>
    </RequireCoreConnected>
  );
}
