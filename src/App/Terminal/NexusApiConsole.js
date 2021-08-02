// External Dependencies
import { connect } from 'react-redux';
import { createRef, Component } from 'react';
import styled from '@emotion/styled';
import { ipcRenderer } from 'electron';
import GA from 'lib/googleAnalytics';
import memoize from 'utils/memoize';

// Internal Global Dependencies
import Button from 'components/Button';
import Select from 'components/Select';
import TextField from 'components/TextField';
import RequireCoreConnected from 'components/RequireCoreConnected';
import { callApiByUrl } from 'lib/tritiumApi';
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
import { updateSettings } from 'lib/settings';
import APIDocModal from './APIDocs/ApiDocModal';
import documentsIcon from 'icons/documents.svg';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';

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
    historyIndex === -1 ? currentCommand : commandHistory[historyIndex]
);

const mapStateToProps = (state) => {
  const {
    ui: {
      console: {
        console: {
          currentCommand,
          commandHistory,
          historyIndex,
          commandList,
          output,
        },
      },
    },
    settings: { consoleCliSyntax },
    core: {
      config: { apiUser, apiPassword },
    },
  } = state;
  return {
    consoleInput: consoleInputSelector(
      currentCommand,
      commandHistory,
      historyIndex
    ),
    apiUser,
    apiPassword,
    currentCommand,
    commandList,
    output,
    consoleCliSyntax,
  };
};

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

/**
 * Console Page in the Terminal Page
 *
 * @class TerminalConsole
 * @extends {Component}
 */
@connect(mapStateToProps)
class NexusApiConsole extends Component {
  inputRef = createRef();
  outputRef = createRef();

  /**
   *Creates an instance of TerminalConsole.
   * @param {*} props
   * @memberof TerminalConsole
   */
  constructor(props) {
    super(props);
    switchConsoleTab('Console');
  }

  /**
   *
   *
   * @param {*} prevProps
   * @param {*} PrevState
   * @memberof TerminalConsole
   */
  componentDidUpdate(prevProps, PrevState) {
    // Scroll to bottom
    if (this.outputRef.current && prevProps.output !== this.props.output) {
      const { clientHeight, scrollHeight } = this.outputRef.current;
      this.outputRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }

  /**
   * Handle Key Down Event
   * @param {*} e
   * @memberof TerminalConsole
   */
  handleKeyDown = (e) => {
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
        this.execute();
        break;
    }
  };

  /**
   * Execute a Command
   *
   * @memberof TerminalConsole
   */
  execute = async () => {
    const { currentCommand, consoleCliSyntax, apiUser, apiPassword } =
      this.props;
    if (!currentCommand || !currentCommand.trim()) return;

    const cmd = currentCommand.trim();
    GA.SendEvent('Terminal', 'NexusApiConsole', 'UseCommand', 1);

    executeCommand(censorSecuredFields(cmd, { consoleCliSyntax }));

    let result = undefined;
    try {
      if (consoleCliSyntax) {
        result = await ipcRenderer.invoke(
          'execute-core-command',
          `-apiuser=${apiUser} -apipassword=${apiPassword} ${cmd}`
        );
      } else {
        result = await callApiByUrl(cmd);
      }
    } catch (err) {
      console.error(err);
      if (err.message !== undefined) {
        printCommandError(tab + `Error: ${err.message}(errorcode ${err.code})`);
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
      printCommandOutput(tab + result.data);
    }
  };

  /**
   * Take the Autosuggest and updateConsoleInput
   *
   * @memberof TerminalConsole
   */
  formateAutoSuggest = (e) => {
    updateConsoleInput(e);
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof TerminalConsole
   */
  render() {
    const { consoleInput, output, consoleCliSyntax } = this.props;

    return (
      <RequireCoreConnected>
        <TerminalContent>
          <Console>
            <ConsoleInput>
              <TextField
                autoFocus
                inputRef={this.inputRef}
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
                onKeyDown={this.handleKeyDown}
                left={
                  <SyntaxSelect
                    skin="filled-inverted"
                    options={syntaxOptions}
                    value={consoleCliSyntax}
                    onChange={(v) => {
                      updateSettings({ consoleCliSyntax: v });
                      if (this.inputRef.current) {
                        this.inputRef.current.focus();
                      }
                    }}
                  />
                }
                right={
                  <ExecuteButton
                    skin="filled-inverted"
                    fitHeight
                    grouped="right"
                    onClick={this.execute}
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

            <ConsoleOutput ref={this.outputRef}>
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
}

export default NexusApiConsole;
