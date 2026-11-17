// External Dependencies
import { useRef, useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';

// Internal Global Dependencies
import Button from 'components/Button';
import Select from 'components/Select';
import { MultilineTextField } from 'components/TextField';
import RequireCoreConnected from 'components/RequireCoreConnected';
import { callAPIByUrl } from 'lib/api';
import { openModal } from 'lib/ui';
import { updateSettings, settingsAtom } from 'lib/settings';
import documentsIcon from 'icons/documents.svg';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';

import { useConsoleTab } from './atoms';
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

function censorSecuredFields(
  cmd: string,
  { consoleCliSyntax }: { consoleCliSyntax: boolean }
) {
  const securedFields = [
    'pin',
    'password',
    'recovery',
    'new_pin',
    'new_password',
    'new_recovery',
  ];

  securedFields.forEach((field) => {
    const regexStr = consoleCliSyntax
      ? `( ${field}=)([^ ]*)( |$)`
      : `([?&]${field}=)([^&]*)(&|$)`;
    cmd = cmd.replace(
      new RegExp(regexStr, 'g'),
      (_, p1: string, _p2, p3: string) => p1 + '***' + p3
    );
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

const SyntaxSelect = styled(Select<boolean>)(({ theme }) => ({
  border: 'none',
  borderRight: `1px solid ${theme.mixer(0.125)}`,
}));

type OutputType = 'command' | 'text' | 'error';

type OutputLine = {
  type: OutputType;
  content: string;
};

export default function NexusApiConsole() {
  useConsoleTab('Console');
  const [currentCommand, setCurrentCommand] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const { consoleCliSyntax } = useAtomValue(settingsAtom);

  const prevOutput = useRef(output);
  useEffect(() => {
    if (outputRef.current && prevOutput.current !== output) {
      const { clientHeight, scrollHeight } = outputRef.current;
      outputRef.current.scrollTop = scrollHeight - clientHeight;
    }
    prevOutput.current = output;
  });

  const consoleInput =
    historyIndex === -1 ? currentCommand : commandHistory[historyIndex];

  const printCommandOutput = (cmdOutput: string[] | string) => {
    const newOutput: OutputLine[] = Array.isArray(cmdOutput)
      ? cmdOutput.map((content) => ({
          type: 'text',
          content,
        }))
      : [{ type: 'text', content: cmdOutput }];
    setOutput((output) => [...output, ...newOutput]);
  };

  const printCommandError = (cmdError: string) => {
    setOutput((output) => [...output, { type: 'error', content: cmdError }]);
  };

  const resetConsole = () => {
    setOutput([]);
    setCommandHistory([]);
    setHistoryIndex(-1);
  };

  const execute = async () => {
    if (!currentCommand || !currentCommand.trim()) return;

    const cmd = currentCommand.trim();
    const censoredCmd = censorSecuredFields(cmd, { consoleCliSyntax });
    setHistoryIndex(-1);
    setCurrentCommand('');
    setCommandHistory((commandHistory) => [censoredCmd, ...commandHistory]);
    setOutput((output) => [
      ...output,
      { type: 'command', content: censoredCmd },
    ]);

    let result = undefined;
    try {
      if (consoleCliSyntax) {
        result = await window.nexusElectron.core.executeConsoleCommand(cmd);
      } else {
        result = await callAPIByUrl(cmd);
      }
    } catch (err: any) {
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
      const output: string[] = [];
      const traverseOutput = (obj: object, depth: number) => {
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

  return (
    <RequireCoreConnected>
      <TerminalContent>
        <Console>
          <ConsoleInput>
            <MultilineTextField
              autoFocus
              ref={inputRef}
              skin="filled-inverted"
              value={consoleInput}
              rows={1}
              inputStyle={{ resize: 'none' }}
              placeholder={
                consoleCliSyntax
                  ? 'api/verb/noun param1=value1 param2=value2'
                  : 'api/verb/noun?param1=value1&param2=value2'
              }
              onChange={(e) => {
                setCurrentCommand(e.target.value);
                setHistoryIndex(-1);
              }}
              onKeyDown={(e) => {
                switch (e.key) {
                  case 'ArrowDown':
                    e.preventDefault();
                    if (historyIndex > -1) {
                      setHistoryIndex((historyIndex) => historyIndex - 1);
                      setCurrentCommand(commandHistory[historyIndex - 1] || '');
                    }
                    break;
                  case 'ArrowUp':
                    e.preventDefault();
                    if (historyIndex < commandHistory.length - 1) {
                      setHistoryIndex((historyIndex) => historyIndex + 1);
                      setCurrentCommand(commandHistory[historyIndex + 1] || '');
                    }
                    break;
                  case 'Enter':
                    e.preventDefault();
                    execute();
                    break;
                }
              }}
              left={
                <SyntaxSelect
                  skin="filled-inverted"
                  options={syntaxOptions}
                  value={consoleCliSyntax}
                  onChange={(v) => {
                    updateSettings({ consoleCliSyntax: v });
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
