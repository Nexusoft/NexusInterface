/*
  Title: Login Settings
  Description: Renders the login page.
  Last Modified by: Brian Smith
*/
// External Dependencies
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'

// Internal Dependencies
import styles from './style.css'
import * as TYPE from 'actions/actiontypes'
import * as RPC from 'scripts/rpc'

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.login,
  }
}
const mapDispatchToProps = dispatch => ({
  setDate: date => dispatch({ type: TYPE.SET_DATE, payload: date }),
  setErrorMessage: message =>
    dispatch({ type: TYPE.SET_ERROR_MESSAGE, payload: message }),
  wipe: () => dispatch({ type: TYPE.WIPE_LOGIN_INFO }),
  busy: setting => dispatch({ type: TYPE.TOGGLE_BUSY_FLAG, payload: setting }),
  stake: () => dispatch({ type: TYPE.TOGGLE_STAKING_FLAG }),
  getInfo: payload => dispatch({ type: TYPE.GET_INFO_DUMP, payload: payload }),
  setTime: time => dispatch({ type: TYPE.SET_TIME, payload: time }),
  OpenModal: type => {
    dispatch({ type: TYPE.SHOW_MODAL, payload: type })
  },
  CloseModal: () => dispatch({ type: TYPE.HIDE_MODAL }),
})

class Login extends Component {
  getMinDate() {
    const today = new Date()

    let month = today.getMonth() + 1
    if (month < 10) {
      month = '0' + month
    }

    return `${today.getFullYear()}-${month}-${today.getDate()}`
  }

  handleSubmit() {
    let today = new Date()
    let unlockDate = new Date(this.props.unlockUntillDate)
    unlockDate = new Date(unlockDate.setMinutes(today.getTimezoneOffset()))
    unlockDate = new Date(
      unlockDate.setHours(this.props.unlockUntillTime.slice(0, 2))
    )
    unlockDate = new Date(
      unlockDate.setMinutes(this.props.unlockUntillTime.slice(3))
    )
    const pass = document.getElementById('pass')

    let unlockUntill = Math.round(
      (unlockDate.getTime() - today.getTime()) / 1000
    )

    // this.props.busy(true);

    if (this.props.stakingFlag) {
      RPC.PROMISE('walletpassphrase', [pass.value, unlockUntill, true])
        .then(payload => {
          this.props.wipe()
          RPC.PROMISE('getinfo', [])
            .then(payload => {
              delete payload.timestamp
              return payload
            })
            .then(payload => {
              this.props.busy(false)
              this.props.getInfo(payload)
            })
        })
        .catch(e => {
          pass.value = ''
          if (e === 'Error: The wallet passphrase entered was incorrect.') {
            this.props.busy(false)
            this.props.OpenModal('Incorrect Passsword')
            pass.focus()
          } else if (e === 'value is type null, expected int') {
            this.props.busy(false)
            this.props.OpenModal('FutureDate')
            pass.focus()
          } else {
            this.props.OpenModal(e)
          }
        })
    } else {
      if (unlockUntill !== NaN && unlockUntill > 3600) {
        RPC.PROMISE('walletpassphrase', [pass.value, unlockUntill, false])
          .then(payload => {
            this.props.wipe()
            RPC.PROMISE('getinfo', [])
              .then(payload => {
                delete payload.timestamp
                return payload
              })
              .then(payload => {
                this.props.busy(false)
                this.props.getInfo(payload)
              })
          })
          .catch(e => {
            pass.value = ''
            if (e === 'Error: The wallet passphrase entered was incorrect.') {
              this.props.busy(false)
              this.props.OpenModal('Incorrect Passsword')
              pass.focus()
            } else if (e === 'value is type null, expected int') {
              this.props.busy(false)
              this.props.OpenModal('FutureDate')
              pass.focus()
            } else {
              this.props.OpenModal(e)
            }
          })
      } else {
        this.props.OpenModal('FutureDate')
        setTimeout(() => {
          this.props.CloseModal()
        }, 3000)
      }
    }
  }
  setUnlockDate(input) {
    let today = new Date()
    let inputDate = new Date(input)
    inputDate = new Date(inputDate.setMinutes(today.getTimezoneOffset()))
    this.props.setDate(input)
  }

  // Mandatory React method
  render() {
    if (this.props.loggedIn) {
      return (
        <Redirect to={this.props.match.path.replace('/Login', '/Security')} />
      )
    }
    return (
      <div id="securitylogin">
        <form>
          <fieldset>
            <legend>Login</legend>
            <div className="field">
              <label>Unlock Until Date:</label>
              <input
                type="date"
                min={this.getMinDate()}
                value={this.props.unlockUntillDate}
                onChange={e => this.setUnlockDate(e.target.value)}
                required
              />
              <span className="hint">Unlock until date is required.</span>
            </div>
            <div className="field">
              <label>Unlock Until Time:</label>
              <input
                type="time"
                value={this.props.unlockUntillTime}
                onChange={e => this.props.setTime(e.target.value)}
                required
              />
              <span className="hint">Unlock until time is required.</span>
            </div>
            <div className="field">
              <label>Password:</label>
              <input
                type="password"
                placeholder="Password"
                id="pass"
                required
                style={{ width: '100%' }}
              />
            </div>

            {/* STAKING FLAG STUFF  TURNED OFF UNTILL WE HAVE A FLAG COMING BACK FROM THE DAEMON TELLING US THAT ITS UNLOCKED FOR STAKING ONLY */}
            <div className="field" id="checkFeild">
              <label>Staking Only:</label>
              <input
                type="checkbox"
                className="switch"
                value={this.props.stakingFlag}
                onChange={() => this.props.stake()}
              />
            </div>
          </fieldset>

          <p>
            <input
              type="submit"
              className="button primary"
              onClick={e => {
                e.preventDefault()
                this.handleSubmit()
              }}
              // disabled={this.props.busyFlag}
            />
          </p>
        </form>
      </div>
    )
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)
