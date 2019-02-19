import * as TYPE from 'actions/actiontypes';

const initialState = {
  addressbook: [],
  modalType: '',
  prototypeName: '',
  prototypeAddress: '',
  prototypeNotes: '',
  prototypeTimezone: 0,
  prototypePhoneNumber: '',
  prototypeAddressLabel: '',
  selected: 0,
  save: false,
  myAccounts: [],
  editAddressLabel: '',
  editNotes: false,
  editPhone: false,
  editAddress: false,
  editName: false,
  editTZ: false,
  actionItem: '',
  hoveredOver: '',
  createAddress: false,
  searchQuery: '',
  selectedContactIndex: -1, // nothing selected
};

const compareNames = (a, b) => {
  let nameA = a.name.toUpperCase();
  let nameB = b.name.toUpperCase();
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.ADD_NEW_CONTACT:
      return {
        ...state,
        addressbook: [...state.addressbook, action.payload].sort(compareNames),
      };

    case TYPE.CONTACT_SEARCH:
      return {
        ...state,
        searchQuery: action.payload,
      };

    case TYPE.SELECT_CONTACT:
      return {
        ...state,
        selectedContactIndex: action.payload,
      };

    case TYPE.UPDATE_CONTACT:
      const index = state.addressbook.findIndex(
        c => c.name === action.payload.name
      );
      if (index === -1) {
        return state;
      } else {
        const addressbook = [...state.addressbook];
        addressbook.splice(index, 1, action.payload.contact);
        return {
          ...state,
          addressbook,
        };
      }

    case TYPE.CONTACT_IMAGE:
      return {
        ...state,
        addressbook: state.addressbook.map((ele, i) => {
          if (i === action.payload.contact) {
            return {
              ...state.addressbook[action.payload.contact],
              imgSrc: action.payload.path,
            };
          } else {
            return ele;
          }
        }),
        save: true,
      };
      break;
    case TYPE.MY_ACCOUNTS_LIST:
      return {
        ...state,
        myAccounts: action.payload,
      };
      break;
    case TYPE.SET_MODAL_TYPE:
      return {
        ...state,
        modalType: action.payload,
      };
      break;
    case TYPE.CLEAR_PROTOTYPE:
      return {
        ...state,
        prototypeName: '',
        prototypeAddress: '',
        prototypeNotes: '',
        prototypeTimezone: 0,
        prototypePhoneNumber: '',
      };
      break;
    // dispatch 2
    case TYPE.EDIT_ADDRESS:
      return {
        ...state,
        prototypeAddress: action.payload,
      };
      break;
    case TYPE.ADD_NEW_ADDRESS:
      if (action.payload.newAddress.ismine) {
        if (
          state.addressbook[action.payload.index].mine.findIndex(ele => {
            if (ele.address === action.payload.newAddress.address) {
              return ele;
            }
          }) === -1
        ) {
          return {
            ...state,
            addressbook: state.addressbook.map((ele, i) => {
              if (i === action.payload.index) {
                return {
                  ...state.addressbook[action.payload.index],
                  mine: [
                    ...state.addressbook[action.payload.index].mine,
                    { ...action.payload.newAddress },
                  ],
                };
              } else {
                return ele;
              }
            }),
            save: true,
          };
        } else return state;
      } else {
        if (
          state.addressbook[action.payload.index].notMine.findIndex(ele => {
            if (ele.address === action.payload.newAddress.address) {
              return ele;
            }
          }) === -1
        ) {
          return {
            ...state,
            addressbook: state.addressbook.map((ele, i) => {
              if (i === action.payload.index) {
                return {
                  ...state.addressbook[action.payload.index],
                  notMine: [
                    ...state.addressbook[action.payload.index].notMine,
                    { ...action.payload.newAddress },
                  ],
                };
              } else {
                return ele;
              }
            }),
            save: true,
          };
        } else return state;
      }
      break;
    case TYPE.EDIT_PHONE:
      return {
        ...state,
        prototypePhoneNumber: action.payload,
      };
      break;

    case TYPE.EDIT_NOTES:
      return {
        ...state,
        prototypeNotes: action.payload,
      };
      break;

    case TYPE.EDIT_NAME:
      return {
        ...state,
        prototypeName: action.payload,
      };
      break;

    case TYPE.TOGGLE_ADDRESS_LABEL_EDIT:
      return {
        ...state,
        prototypeAddressLabel: action.payload.label,
        editAddressLabel: action.payload.address,
      };
      break;
    case TYPE.SAVE_ADDRESS_LABEL:
      if (action.payload.ismine) {
        let MIndex = state.addressbook[action.payload.index].mine.findIndex(
          ele => {
            if (ele.address === action.payload.address) {
              return ele;
            }
          }
        );
        if (MIndex !== -1) {
          return {
            ...state,
            addressbook: state.addressbook.map((ele, i) => {
              if (i === action.payload.index) {
                return {
                  ...state.addressbook[action.payload.index],
                  mine: state.addressbook[action.payload.index].mine.map(
                    (ele, i) => {
                      if (i === MIndex) {
                        return action.payload.newEntry;
                      } else {
                        return ele;
                      }
                    }
                  ),
                };
              } else {
                return ele;
              }
            }),
            prototypeAddress: '',
            prototypeAddressLabel: '',
            editAddressLabel: '',
            save: true,
          };
        }
      } else {
        let NMIndex = state.addressbook[action.payload.index].notMine.findIndex(
          ele => {
            if (ele.address === action.payload.address) {
              return ele;
            }
          }
        );

        if (NMIndex !== -1) {
          return {
            ...state,
            addressbook: state.addressbook.map((ele, i) => {
              if (i === action.payload.index) {
                return {
                  ...state.addressbook[action.payload.index],
                  notMine: state.addressbook[action.payload.index].notMine.map(
                    (ele, i) => {
                      if (i === NMIndex) {
                        return action.payload.newEntry;
                      } else {
                        return ele;
                      }
                    }
                  ),
                };
              } else {
                return ele;
              }
            }),
            prototypeAddress: '',
            prototypeAddressLabel: '',
            editAddressLabel: '',
            save: true,
          };
        } else {
          return { ...state };
        }
      }
      break;

    case TYPE.TOGGLE_NOTES_EDIT:
      return {
        ...state,
        prototypeNotes: action.payload,
        editNotes: true,
      };
      break;
    case TYPE.SAVE_NOTES:
      return {
        ...state,
        addressbook: state.addressbook.map((ele, i) => {
          if (i === action.payload.index) {
            return {
              ...state.addressbook[action.payload.index],
              notes: action.payload.notes,
            };
          } else {
            return ele;
          }
        }),
        editNotes: false,
        save: true,
      };
      break;

    case TYPE.TOGGLE_NAME_EDIT:
      return {
        ...state,
        prototypeName: action.payload,
        editName: true,
      };
      break;
    case TYPE.SAVE_NAME:
      return {
        ...state,
        addressbook: state.addressbook
          .map((ele, i) => {
            if (i === action.payload.index) {
              return {
                ...state.addressbook[action.payload.index],
                name: action.payload.name,
              };
            } else {
              return ele;
            }
          })
          .sort((a, b) => {
            let nameA = a.name.toUpperCase();
            let nameB = b.name.toUpperCase();
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0;
          }),

        editName: false,
        save: true,
      };
      break;
    case TYPE.TOGGLE_TIMEZONE_EDIT:
      return {
        ...state,
        prototypeTimezone: action.payload,
        editTZ: true,
      };
      break;
    case TYPE.SAVE_TIMEZONE:
      return {
        ...state,
        addressbook: state.addressbook.map((ele, i) => {
          if (i === action.payload.index) {
            return {
              ...state.addressbook[action.payload.index],
              timezone: action.payload.TZ,
            };
          } else {
            return ele;
          }
        }),
        editTZ: false,
        save: true,
      };
      break;
    case TYPE.TOGGLE_PHONE_EDIT:
      return {
        ...state,
        prototypePhoneNumber: action.payload,
        editPhone: true,
      };
      break;
    case TYPE.SAVE_PHONE:
      return {
        ...state,
        addressbook: state.addressbook.map((ele, i) => {
          if (i === action.payload.index) {
            return {
              ...state.addressbook[action.payload.index],
              phoneNumber: action.payload.Phone,
            };
          } else {
            return ele;
          }
        }),
        editPhone: false,
        save: true,
      };
      break;
    case TYPE.EDIT_ADDRESS_LABEL:
      return {
        ...state,
        prototypeAddressLabel: action.payload,
      };
      break;
    case TYPE.EDIT_TIMEZONE:
      return {
        ...state,
        prototypeTimezone: action.payload,
      };
      break;
    case TYPE.SET_SAVE_FLAG_FALSE:
      return {
        ...state,
        save: false,
      };
      break;
    //   dispatch 8
    case TYPE.DELETE_CONTACT:
      return {
        ...state,
        addressbook: state.addressbook.filter(
          contact => contact.name !== action.payload
        ),
      };
    //   dispatch 9
    case TYPE.DELETE_ADDRESS_FROM_CONTACT:
      return {
        ...state,
        addressbook: state.addressbook.map((ele, i) => {
          if (i === action.payload.selectedContactIndex) {
            return {
              ...state.addressbook[action.payload.selectedContactIndex],
              [action.payload.type]: state.addressbook[
                action.payload.selectedContactIndex
              ][action.payload.type].filter(
                (ele, i) => i !== action.payload.index
              ),
            };
          } else {
            return ele;
          }
        }),
        save: true,
      };
      break;
    //   dispatch 10
    case TYPE.LOAD_ADDRESS_BOOK:
      return {
        ...state,
        addressbook: [...action.payload],
      };
      break;
    case TYPE.SELECTED_CONTACT:
      return {
        ...state,
        selected: action.payload,
      };
      break;
    case TYPE.TOGGLE_CREATE_ADDRESS:
      return {
        ...state,
        createAddress: !state.createAddress,
      };
      break;
    case TYPE.SET_MOUSE_POSITION:
      return {
        ...state,
        actionItem: action.payload.actionItem,
        hoveredOver: action.payload.type,
      };
      break;
    case TYPE.IMPORT_CONTACT:
      let indexof = state.addressbook.findIndex(ele => {
        if (ele.name === action.payload.name) {
          return ele;
        }
      });
      if (indexof == -1) {
        // contact not in the addressbook, so make it!
        console.log('Not in there so make it');
      } else {
        // contact is in the address book so update it!
        console.log('contact exists update it');
      }
      return state;
    default:
      return state;
      break;
  }
};
