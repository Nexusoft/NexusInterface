// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

//Internal Dependencies
import Modal from 'components/Modal';
import styled from '@emotion/styled';
import Button from 'components/Button';

const ModalInternal = styled(Modal)({});

class InvoiceDetailModal extends Component {
  componentDidMount() {}

  render() {
    console.log(this.props);
    const {
      timestamp,
      reference,
      accountPayable,
      receipiant,
      status,
    } = this.props.invoice;
    return (
      <ModalInternal>
        <div>{timestamp}</div>
        <div>{reference}</div>
        <div>{accountPayable}</div>
        <div>{receipiant}</div>
        <div>{status}</div>
        <Button>{'Pay'}</Button>
        <Button>{'Reject'}</Button>
      </ModalInternal>
    );
  }
}

export default InvoiceDetailModal;
