// External
import React, { Component } from 'react';
import styled from '@emotion/styled';

//Internal
import { timing } from 'styles';
import { color, newUID } from 'utils';

const OptionButton = styled.button(
    ({ theme }) => ({
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        padding: '0 1em',
        height: '2.8em',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        transitionProperty: 'border-color, color',
        transitionDuration: timing.normal,
        color: theme.foreground,

        '&:disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
        },
        transition: `background-color ${timing.normal}`,

        '&:hover': {
            background: theme.background,
        },
    }),
    ({ selected, theme }) =>
        selected && {
            '&, &:hover': {
                background: color.darken(theme.primary, 0.2),
                color: theme.background,
            },
        }
);


/**
 * Theme Picker Element
 *
 * @class ThemePicker
 * @extends {Component}
 */
class ThemePicker extends Component {
    state = {
        themeOn: 0
    }
    componentDidMount() {
        this.props.handleOnSetCustom(() => { this.setToCustomTheme() });
        this.props.handleSetSelector((selectorIndex) => { this.setSelector(selectorIndex) });
    }

    /**
     * Set to Custom Theme
     *
     * @memberof ThemePicker
     */
    setToCustomTheme() {
        console.log("Set To Custom");
        this.setState({ themeOn: 2 }, () => { console.log(this); });
    }

    /**
     * Set the Theme button selector
     *
     * @param {*} selectorIndex
     * @memberof ThemePicker
     */
    setSelector(selectorIndex) {
        this.setState({ themeOn: selectorIndex });
    }

    /**
     * React Render
     *
     * @returns
     * @memberof ThemePicker
     */
    render() {
        return (
            <div>
                <OptionButton
                    selected={this.state.themeOn == 0 ? true : false}
                    onClick={() => {
                        if (this.state.themeOn == 2) {
                            this.props.saveCustomCallback();
                        }
                        this.setState({ themeOn: 0 });
                        this.props.darkCallback();
                    }}
                >
                    Dark
            </OptionButton>
                <OptionButton
                    selected={this.state.themeOn == 1 ? true : false}
                    onClick={() => {
                        if (this.state.themeOn == 2) {
                            this.props.saveCustomCallback();
                        }
                        this.setState({ themeOn: 1 });
                        this.props.lightCallback();
                    }}
                >
                    Light
            </OptionButton>
                <OptionButton
                    selected={this.state.themeOn == 2 ? true : false}
                    onClick={() => {
                        this.setState({ themeOn: 2 });
                        this.props.customCallback();
                    }}
                >
                    Custom
            </OptionButton>
                <OptionButton
                    selected={this.state.themeOn == 3 ? true : false}
                    onClick={() => {
                        if (this.state.themeOn == 2) {
                            this.props.saveCustomCallback();
                        }
                        this.setState({ themeOn: 3 });
                        this.props.resetCallback();
                    }}
                >
                    Reset
            </OptionButton>

            </div>
        );
    }
}

export default ThemePicker;