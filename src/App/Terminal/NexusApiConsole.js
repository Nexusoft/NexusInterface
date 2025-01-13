// External Dependencies
import { useSelector } from 'react-redux';
import { useRef, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';
import { ipcRenderer } from 'electron';
import UT from 'lib/usageTracking';
import memoize from 'utils/memoize';

// Internal Global Dependencies
import Button from 'components/Button';
import Select from 'components/Select';
import TextField from 'components/TextField';
import RequireCoreConnected from 'components/RequireCoreConnected';
import { callAPIByUrl } from 'lib/api';
import {
  switchConsoleTab,
  updateConsoleInput,
  commandHistoryUp,
  commandHistoryDown,
  executeCommand,
  printCommandOutput,
  printCommandError,
  resetConsole,
  openModal,
} from 'lib/ui';
import { updateSettings, settingsAtom } from 'lib/settings';
import documentsIcon from 'icons/documents.svg';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';

import APIDocModal from './APIDocs/ApiDocModal';

__ = __context('Console.NexusAPI');

const syntaxOptions = [
  {
    value: true,
    display: __('CLI syntax'),
  },
  {
    value: false,
    display: __('URL syntax'),
  },
];
const tab = ' '.repeat(2);

const consoleInputSelector = memoize(
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

function censorSecuredFields(cmd, { consoleCliSyntax }) {
  const securedFields = [
    'pin',
    'password',
    'recovery',
    'new_pin',
    'new_password',
    'new_recovery',
  ];
  const replacer = (match, p1, p2, p3) => p1 + '***' + p3;

  securedFields.forEach((field) => {
    const regexStr = consoleCliSyntax
      ? `( ${field}=)([^ ]*)( |$)`
      : `([?&]${field}=)([^&]*)(&|$)`;
    cmd = cmd.replace(new RegExp(regexStr, 'g'), replacer);
  });
  return cmd;
}

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
  display: 'grid',
  gridTemplateColumns: '1fr min-content',
  columnGap: '1em',
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

const HelpButton = styled(Button)(({ theme }) => ({
  border: `1px solid ${theme.mixer(0.125)}`,
}));

const SyntaxSelect = styled(Select)(({ theme }) => ({
  border: 'none',
  borderRight: `1px solid ${theme.mixer(0.125)}`,
}));

export default function NexusApiConsole() {
  const inputRef = useRef();
  const outputRef = useRef();
  const consoleInput = useSelector(consoleInputSelector);
  const {
    manualDaemon,
    manualDaemonApiUser,
    manualDaemonApiPassword,
    consoleCliSyntax,
  } = useAtomValue(settingsAtom);
  const apiUser = useSelector((state) =>
    manualDaemon ? manualDaemonApiUser : state.core.config?.apiUser
  );
  const apiPassword = useSelector((state) =>
    manualDaemon ? manualDaemonApiPassword : state.core.config?.apiPassword
  );
  const currentCommand = useSelector(
    (state) => state.ui.console.console.currentCommand
  );
  const output = useSelector((state) => state.ui.console.console.output);

  useEffect(() => {
    switchConsoleTab('Console');
  }, []);

  const prevOutput = useRef(output);
  useEffect(() => {
    if (outputRef.current && prevOutput.current !== output) {
      const { clientHeight, scrollHeight } = outputRef.current;
      outputRef.current.scrollTop = scrollHeight - clientHeight;
    }
    prevOutput.current = output;
  });

  const execute = async () => {
    if (!currentCommand || !currentCommand.trim()) return;

    const cmd = currentCommand.trim();
    executeCommand(censorSecuredFields(cmd, { consoleCliSyntax }));

    let result = undefined;
    try {
      if (consoleCliSyntax) {
        result = await ipcRenderer.invoke(
          'execute-core-command',
          `-apiuser=${apiUser} -apipassword=${apiPassword} ${cmd}`
        );
      } else {
        result = await callAPIByUrl(cmd);
      }
    } catch (err) {
      console.error(err);
      if (err.message !== undefined) {
        printCommandError(tab + `Error: ${err.message}(errorcode ${err.code})`);
      } else {
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
      printCommandOutput(tab + result.data);
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
        e.preventDefault();
        execute();
        break;
    }
  };

  return (
    <RequireCoreConnected>
      <TerminalContent>
        <Console>
          <ConsoleInput>
            <TextField
              autoFocus
              ref={inputRef}
              skin="filled-inverted"
              value={consoleInput}
              multiline
              rows={1}
              inputStyle={{ resize: 'none' }}
              placeholder={
                consoleCliSyntax
                  ? 'api/verb/noun param1=value1 param2=value2'
                  : 'api/verb/noun?param1=value1&param2=value2'
              }
              onChange={(e) => {
                updateConsoleInput(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              left={
                <SyntaxSelect
                  skin="filled-inverted"
                  options={syntaxOptions}
                  value={consoleCliSyntax}
                  onChange={(v) => {
                    updateSettings('consoleCliSyntax', v);
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }}
                />
              }
              right={
                <ExecuteButton
                  skin="filled-inverted"
                  fitHeight
                  grouped="right"
                  onClick={execute}
                >
                  {__('Execute')}
                </ExecuteButton>
              }
            />

            <Tooltip.Trigger tooltip={__('API Documentation')}>
              <HelpButton
                skin="filled-inverted"
                fitHeight
                onClick={() => openModal(APIDocModal)}
              >
                <Icon icon={documentsIcon} />
              </HelpButton>
            </Tooltip.Trigger>
          </ConsoleInput>

          <ConsoleOutput ref={outputRef}>
            {output.map(({ type, content }, i) => {
              switch (type) {
                case 'command':
                  return (
                    <div key={i}>
                      <span>
                        <span style={{ color: '#0ca4fb' }}>Nexus-API</span>
                        <span style={{ color: '#00d850' }}>$ </span>
                        {content}
                        <span style={{ color: '#0ca4fb' }}> ►</span>
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
            {__('Clear')}
          </Button>
        </Console>
      </TerminalContent>
    </RequireCoreConnected>
  );
}
