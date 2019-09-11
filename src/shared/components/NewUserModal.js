import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';
import { connect } from 'react-redux';

import { apiPost } from 'lib/tritiumApi';
import Modal from 'components/Modal';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import Link from 'components/Link';
import LoginModal from 'components/LoginModal';
import { showNotification, openModal, removeModal } from 'actions/overlays';
import { getUserStatus } from 'actions/core';
import { errorHandler, numericOnly } from 'utils/form';

const Buttons = styled.div({
  marginTop: '1.5em',
});

const ExtraSection = styled.div({
  marginTop: '2em',
  display: 'flex',
  justifyContent: 'space-between',
  opacity: 0.9,
});

/**
 *  NewUserModal Form
 *
 * @class NewUserModal
 * @extends {Component}
 */
@connect(
  ({ enableMining, enableStaking }) => ({ enableMining, enableStaking }),
  { showNotification, openModal, removeModal, getUserStatus }
)
@reduxForm({
  form: 'new_user',
  destroyOnUnmount: true,
  initialValues: {
    username: '',
    password: '',
    passwordConfirm: '',
    pin: '',
    pinConfirm: '',
  },
  validate: (
    { username, password, passwordConfirm, pin, pinConfirm },
    props
  ) => {
    const errors = {};

    if (!username) {
      errors.username = __('Username is required');
    } else {
      if (username.length < 3) {
        errors.username = __('Username must be at least 3 characters');
      }
    }

    if (!password) {
      errors.password = __('Password is required');
    } else {
      if (password.length < 8) {
        errors.password = __('Password must be at least 8 characters');
      }
    }

    if (passwordConfirm !== password) {
      errors.passwordConfirm = __('Password does not match');
    }

    if (!pin) {
      errors.pin = __('PIN is required');
    } else {
      if (pin.length < 4) {
        errors.pin = __('PIN must be at least 4 characters');
      }
    }

    if (pinConfirm !== pin) {
      errors.pinConfirm = __('PIN does not match');
    }

    return errors;
  },
  onSubmit: async ({ username, password, pin }, dispatch, props) => {
    const result = await apiPost('users/create/user', {
      username,
      password,
      pin,
    });
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    const { username, password, pin } = props.values;
    props.removeModal(props.modalId);
    props.reset();
    props.showNotification(
      __('New user %{username} has been created', {
        username,
      }),
      'success'
    );

    await apiPost('users/login/user', {
      username,
      password,
      pin,
    });
    await apiPost('users/unlock/user', {
      pin,
      notifications: true,
      mining: !!props.enableMining,
      staking: !!props.enableStaking,
    });
    props.getUserStatus();
  },
  onSubmitFail: errorHandler(__('Error creating user')),
})
class NewUserModal extends Component {
  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof NewUserModal
   */
  render() {
    const { handleSubmit, submitting, openModal } = this.props;

    return (
      <Modal
        style={{ maxWidth: 500 }}
        assignClose={closeModal => (this.closeModal = closeModal)}
      >
        <Modal.Header>{__('Create new user')}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <FormField
              connectLabel
              label={__('Username')}
              style={{ marginTop: 0 }}
            >
              <Field
                component={TextField.RF}
                name="username"
                placeholder={__('A globally unique username')}
              />
            </FormField>

            <FormField connectLabel label={__('Password')}>
              <Field
                component={TextField.RF}
                name="password"
                type="password"
                placeholder={__('Enter your password')}
              />
            </FormField>

            <FormField connectLabel label={__('Confirm password')}>
              <Field
                component={TextField.RF}
                name="passwordConfirm"
                type="password"
                placeholder={__('Re-enter your password')}
              />
            </FormField>

            <FormField connectLabel label={__('PIN')}>
              <Field
                component={TextField.RF}
                name="pin"
                type="password"
                normalize={numericOnly}
                placeholder={__('Enter your PIN number')}
              />
            </FormField>

            <FormField connectLabel label={__('Confirm PIN')}>
              <Field
                component={TextField.RF}
                name="pinConfirm"
                type="password"
                normalize={numericOnly}
                placeholder={__('Re-enter your PIN number')}
              />
            </FormField>

            <Buttons>
              <Button
                type="submit"
                wide
                uppercase
                skin="primary"
                disabled={submitting}
              >
                {__('Create user')}
              </Button>
            </Buttons>

            <ExtraSection>
              <Link as="a" href="javascript:;">
                {__('Switch to Legacy Mode')}
              </Link>
              <Link
                as="a"
                href="javascript:;"
                onClick={() => {
                  this.closeModal();
                  openModal(LoginModal);
                }}
              >
                {__('Log in')}
              </Link>
            </ExtraSection>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default NewUserModal;

/*

/// Below are items for the recovery functionality of a user. This feature has NOT yet been implemented by the core yet.
/// This will be shown to the user after their account has been created. 
/// These were made in modals but should be brought out to a compoenent and mereged with New User Creation

const ShowRecModalComponent = styled(Modal)({
  padding: '1px',
  WebkitUserSelect: 'none',
  WebkitUserDrag: 'none',
});

const WordBox = styled.div({
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: 'auto auto auto auto',
  gridTemplateRows: 'auto',
  gridGap: '1em .5em',
  padding: '2em',
});

const Word = styled.div({
  background: 'black',
  textAlign: 'center',
  color: 'white',
  fontWeight: 'bold',
});

class ShowRecoveryComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      twentyWords: [],
    };
  }

  componentDidMount() {
    this.setState({
      twentyWords: [
        'one',
        'two',
        'three',
        'four',
        'five',
        'six',
        'seven',
        'eight',
        'nine',
        'ten',
        'eleven',
        'twelve',
        'thirteen',
        'forteen',
        'fifteen',
        'sixteen',
        'seventeen',
        'eighteen',
        'nineteen',
        'twnety',
      ],
    });
  }

  returnWords() {
    return this.state.twentyWords.map(e => {
      return <Word key={e}>{e}</Word>;
    });
  }

  print() {}

  askToContinue = () => {
    openConfirmDialog({
      question:
        'Are you sure you want to continue? You will not be shown these words again.',
      skinYes: 'danger',
      callbackYes: () => {
        this.props.onCloseBack();
        this.closeModal();
      },
    });
  };

  render() {
    return (
      <ShowRecModalComponent
        fullScreen
        assignClose={close => {
          this.closeModal = close;
        }}
        {...this.props}
        oncopy={'return false'}
        onpaste={'return false'}
      >
        <Modal.Header>Recovery</Modal.Header>
        <Modal.Body>
          <Panel title={'Show Recovery'}>
            <div> {'Instructions'}</div>
            <WordBox>{this.returnWords()}</WordBox>
            <Button
              skin="primary"
              onClick={this.askToContinue}
              style={{ fontSize: 17, padding: '5px' }}
            >
              Continue
            </Button>
            {<ReactToPrint
              trigger={() => (
                <Button
                  skin="primary"
                  onClick={() => this.print()}
                  style={{ fontSize: 17, padding: '5px' }}
                >
                  Print
                </Button>
              )}
              content={() => this.printRef}
              />}{' '}
            {In order to print we print the whole compoenent, this component is styled for printing and is hidden}
            {Change style to display: hidden , must be done as a parent, if you display hidden PrintRecovery the print is blank*
            <div style={{ display: 'block' }}>
              <PrintRecovery
                twentyWords={this.state.twentyWords}
                ref={e => (this.printRef = e)}
                {...this.props}
              />
            </div>
          </Panel>
        </Modal.Body>
      </ShowRecModalComponent>
    );
  }
}

export default ShowRecoveryComponent;


import logoFull from '../Header/logo-full-beta.sprite.svg';
import Icon from 'components/Icon';

const Logo = styled(Icon)(({ theme }) => ({
  display: 'block',
  height: 50,
  width: 'auto',
  marginLeft: 'auto',
  marginRight: 'auto',
  fill: 'blue',
}));

const Instructions = styled.div({
  textAlign: 'center',
  marginLeft: '10%',
  marginRight: '10%',
  color: 'black',
  fontWeight: 'bold',
});

const WordBox = styled.div({
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: 'auto auto auto auto',
  gridTemplateRows: 'auto',
  gridGap: '1em .5em',
});

const Word = styled.div({
  background: 'black',
  textAlign: 'center',
  fontWeight: 'bold',
  color: 'white',
});

class PrintRecovery extends React.Component {
  returnWords() {
    return this.props.twentyWords.map(e => {
      return <Word key={e}>{e}</Word>;
    });
  }

  returnInstrcutions() {
    return 'These are your 20 words that make up your recovery password, DO NOT LOSE THESE. These will never be shown again, if you misplace these your normal password is the only way to get into your wallet. Keep these safe!';
  }

  render() {
    return (
      <div style={{ margin: '10%', background: 'white' }}>
        <Logo icon={logoFull} />
        <Instructions>{this.returnInstrcutions()}</Instructions>
        <WordBox>{this.returnWords()}</WordBox>
      </div>
    );
  }
}

export default PrintRecovery; */
