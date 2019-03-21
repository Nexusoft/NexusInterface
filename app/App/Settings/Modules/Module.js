// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import ModuleIcon from 'components/ModuleIcon';
import Switch from 'components/Switch';
import Tooltip from 'components/Tooltip';

const ModuleComponent = styled.div(({ theme }) => ({
  display: 'grid',
  gridTemplateAreas: '"logo info controls"',
  gridTemplateColumns: 'min-content 1fr min-content',
  columnGap: '1em',
  alignItems: 'center',
  padding: '1em 0',
  borderBottom: `1px solid ${theme.mixer(0.125)}`,
}));

const ModuleLogo = styled.div({
  fontSize: '2em',
});

const ModuleInfo = styled.div({
  gridArea: 'info',
});

const ModuleControls = styled.div({
  gridArea: 'controls',
});

const ModuleName = styled.span(({ theme }) => ({
  color: theme.foreground,
}));

const ModuleVersion = styled.span(({ theme }) => ({
  color: theme.mixer(0.75),
  fontSize: '.9em',
  marginLeft: '.7em',
}));

const ModuleDescription = styled.div(({ theme }) => ({
  color: theme.mixer(0.75),
  fontSize: '.9em',
}));

@connect((state, props) => ({
  active: !props.module.invalid,
}))
class Module extends React.Component {
  render() {
    const { module, active } = this.props;
    return (
      <ModuleComponent>
        <ModuleLogo>
          <ModuleIcon module={module} />
        </ModuleLogo>

        <ModuleInfo>
          <div>
            <ModuleName>{module.displayName}</ModuleName>
            <ModuleVersion>v{module.version}</ModuleVersion>
          </div>
          <div>
            <ModuleDescription>{module.description}</ModuleDescription>
          </div>
        </ModuleInfo>

        <ModuleControls>
          <Tooltip.Trigger
            tooltip={active ? 'Disable module' : 'Enable module'}
          >
            <Switch checked={active} />
          </Tooltip.Trigger>
        </ModuleControls>
      </ModuleComponent>
    );
  }
}

export default Module;
