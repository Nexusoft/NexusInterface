// External Dependencies
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { shell } from 'electron';
import styled from '@emotion/styled';
import GA from 'lib/googleAnalytics';
import memoize from 'utils/memoize';

// Internal Global Dependencies
import WaitingMessage from 'components/WaitingMessage';
import Button from 'components/Button';
import AutoSuggest from 'components/AutoSuggest';
import { isCoreConnected } from 'selectors';
import * as Tritium from 'lib/tritiumApi';
import {
  switchConsoleTab,
  updateConsoleInput,
  setCommandList,
  commandHistoryUp,
  commandHistoryDown,
  executeCommand,
  printCommandOutput,
  printCommandError,
  resetConsoleOutput,
} from 'actions/ui';
import { openModal } from 'lib/overlays';
import APIDocModal from './APIDocs/ApiDocModal';
import questionMarkCircleIcon from 'images/question-mark-circle.sprite.svg';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';

const filterCommands = memoize((commandList, inputValue) => {
  if (!commandList || !inputValue) return [];
  return commandList.filter(
    cmd => !!cmd && cmd.value.toLowerCase().startsWith(inputValue.toLowerCase())
  );
});

const consoleInputSelector = memoize(
  (currentCommand, commandHistory, historyIndex) =>
    historyIndex === -1 ? currentCommand : commandHistory[historyIndex]
);

const mapStateToProps = state => {
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
  } = state;
  return {
    coreConnected: isCoreConnected(state),
    consoleInput: consoleInputSelector(
      currentCommand,
      commandHistory,
      historyIndex
    ),
    currentCommand,
    commandList,
    output,
  };
};

const actionCreators = {
  switchConsoleTab,
  setCommandList,
  updateConsoleInput,
  commandHistoryUp,
  commandHistoryDown,
  executeCommand,
  printCommandOutput,
  printCommandError,
  resetConsoleOutput,
};

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

const HelpButton = styled(Button)(({ theme }) => ({
  borderRight: `1px solid ${theme.mixer(0.125)}`,
}));

/**
 * Console Page in the Terminal Page
 *
 * @class TerminalConsole
 * @extends {Component}
 */
@connect(
  mapStateToProps,
  actionCreators
)
class NexusApiConsole extends Component {
  /**
   *Creates an instance of TerminalConsole.
   * @param {*} props
   * @memberof TerminalConsole
   */
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.outputRef = React.createRef();
    props.switchConsoleTab('Console');
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
  handleKeyDown = e => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.props.commandHistoryDown();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.props.commandHistoryUp();
        break;
      case 'Enter':
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
    const {
      currentCommand,
      executeCommand,
      printCommandOutput,
      printCommandError,
    } = this.props;
    if (!currentCommand || !currentCommand.trim()) return;

    const cmd = currentCommand;
    GA.SendEvent('Terminal', 'NexusApiConsole', 'UseCommand', 1);

    const cliCMDSplit = cmd.split(' ');
    let cliFormat;
    if (cliCMDSplit.length > 1) {
      cliFormat =
        cliCMDSplit.shift() +
        '?' +
        cliCMDSplit
          .map((e, i, array) => {
            if (i == array.length - 1) return e;
            //if not a param join the next elements into yourself, for spaces
            if (e.match(/(.*[a-z])=/g)) {
              const next = i + 1;
              if (array[next].match(/(.*[a-z])=/)) {
                return e;
              } else {
                let recurIndex = 0;
                let elementModified = e;
                while (!array[i + recurIndex].match(/(.*[a-z])=/g)) {
                  elementModified += ' ' + array[i + recurIndex];
                  recurIndex++;
                }
                return elementModified;
              }
            } else {
              return null;
            }
          })
          .filter(Boolean)
          .join('&');
    }

    const tab = ' '.repeat(2);
    let result = null;
    console.log(cliFormat || cmd);
    executeCommand(cmd);
    try {
      result = await Tritium.apiGet(cliFormat || cmd);
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
          .map(text => tab + (text.startsWith(' ') ? text : '> ' + text + '\n'))
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
  formateAutoSuggest = e => {
    this.props.updateConsoleInput(e);
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof TerminalConsole
   */
  render() {
    const {
      coreConnected,
      commandList,
      consoleInput,
      updateConsoleInput,
      output,
      resetConsoleOutput,
    } = this.props;
    console.log(this);

    if (!coreConnected) {
      return (
        <WaitingMessage>
          {__('Connecting to Nexus Core')}
          ...
        </WaitingMessage>
      );
    } else {
      return (
        <TerminalContent>
          <Console>
            <ConsoleInput>
              <AutoSuggest
                suggestions={[]}
                filterSuggestions={filterCommands}
                onSelect={this.formateAutoSuggest}
                keyControl={false}
                suggestOn="change"
                ref={c => (this.inputRef = c)}
                inputRef={this.inputRef}
                inputProps={{
                  autoFocus: true,
                  skin: 'filled-inverted',
                  value: consoleInput,
                  multiline: true,
                  rows: 1,
                  inputStyle: { resize: 'none' },
                  placeholder: __(
                    'Enter API here (ex: api/verb/noun?param=value&param2=2 or param=1 param2=2)'
                  ),
                  onChange: e => {
                    updateConsoleInput(e.target.value);
                  },
                  onKeyDown: this.handleKeyDown,
                  left: (
                    <Tooltip.Trigger
                      tooltip={__('API Documentation')}
                      position="top"
                    >
                      <HelpButton
                        skin="filled-inverted"
                        fitHeight
                        onClick={() => openModal(APIDocModal)}
                      >
                        <Icon icon={questionMarkCircleIcon} />
                      </HelpButton>
                    </Tooltip.Trigger>
                  ),
                  right: (
                    <ExecuteButton
                      skin="filled-inverted"
                      fitHeight
                      grouped="right"
                      onClick={this.execute}
                    >
                      {__('Execute')}
                    </ExecuteButton>
                  ),
                }}
              />
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
              onClick={resetConsoleOutput}
            >
              {__('Clear')}
            </Button>
          </Console>
        </TerminalContent>
      );
    }
  }
}

export default NexusApiConsole;
