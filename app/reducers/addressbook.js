import * as TYPE from "../actions/actiontypes";

const initialState = {
  addressbook: {},
  showModal: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    // dispatch 1
    // case TYPE.ADD_NEW_ADDRESS:
    //     return {
    //         ...state,
    //         addressbook: { ...state.addressbook,
    //             [action.payload.contact]: {
    //                 ...state[action.payload.contact],
    //                 thaddresses: [...state.addressbook.[action.payload.contact].thaddresses,
    //                     {
    //                         label: action.payload.label,
    //                         address: action.payload.address
    //                     }
    //                 ]
    //             }
    //         }
    //     };
    // break;
    // // dispatch 2
    // case TYPE.EDIT_ADDRESS:
    //     let index = state.addressbook.[action.payload.contact].thaddresses.findIndex((thaddelem)=> { thaddelem.label === action.payload.label})
    //     return {
    //         ...state,
    //         addressbook: { ...state.addressbook,
    //             [action.payload.contact]: {
    //                 ...state[action.payload.contact],
    //                 thaddresses: [...state.addressbook.[action.payload.contact].thaddresses,
    //                 state.addressbook.[action.payload.contact].thaddresses[index]:   {
    //                     ...state.addressbook.[action.payload.contact].thaddresses[index],
    //                         address: action.payload.newaddress
    //                     }
    //                 ]
    //             }
    //         }
    //     };
    // break;
    // // dispatch 3
    // case TYPE.EDIT_PHONE:
    //     return {
    //         ...state,
    //         addressbook: { ...state.addressbook,
    //             [action.payload.contact]: {
    //                 ...state[action.payload.contact],
    //                 phone:action.payload.phone
    //             }
    //         }
    //     };
    //   break;
    // // dispatch 4
    // case TYPE.EDIT_NOTES:
    //     return {
    //         ...state,
    //         addressbook: { ...state.addressbook,
    //             [action.payload.contact]: {
    //                 ...state[action.payload.contact],
    //                 notes:action.payload.notes
    //             }
    //         }
    //     };
    //     break;
    //   // Not MVP
    // // //   dispatch 5
    // // case TYPE.EDIT_NAME:
    // //     return {
    // //         ...state,
    // //         addressbook: { ...state.addressbook,
    // //             [action.payload.contact]: {
    // //                 ...state[action.payload.contact],
    // //                 notes:action.payload.notes
    // //             }
    // //         }
    // //     };
    // //   break;

    // //   dispatch 6 - like dispatch 2
    // case TYPE.EDIT_ADDRESS_LABEL:
    //     let index = state.addressbook.[action.payload.contact].thaddresses.findIndex((thaddelem)=> { thaddelem.address === action.payload.address})
    //     return {
    //         ...state,
    //         addressbook: { ...state.addressbook,
    //             [action.payload.contact]: {
    //                 ...state[action.payload.contact],
    //                 thaddresses: [...state.addressbook.[action.payload.contact].thaddresses,
    //                 state.addressbook.[action.payload.contact].thaddresses[index]:   {
    //                     ...state.addressbook.[action.payload.contact].thaddresses[index],
    //                         label: action.payload.label
    //                     }
    //                 ]
    //             }
    //         }
    //     };
    //   break;
    // //   dispatch 7
    // case TYPE.EDIT_TIMEZONE:
    //     return {
    //         ...state,
    //         addressbook: { ...state.addressbook,
    //             [action.payload.contact]: {
    //                 ...state[action.payload.contact],
    //                 timezone:action.payload.timezone
    //             }
    //         }
    //     };
    //   break;
    // //   dispatch 8
    // case TYPE.DELETE_CONTACT:
    //     let temp = state.addressbook;
    //     delete temp[action.payload.contact]
    //     return {
    //         ...state,
    //         addressbook: temp
    //     };
    //   break;
    // //   dispatch 9
    // case TYPE.DELETE_ADDRESS_FROM_CONTACT:
    //     let index = state.addressbook.[action.payload.contact].thaddresses.findIndex((thaddelem)=> { thaddelem.label === action.payload.label})
    //     let temp = state.addressbook;
    //     delete temp.[action.payload.contact].thaddresses[index];
    //     return {
    //         ...state,
    //         addressbook: temp
    //     };
    //     break;
    // //   dispatch 10
    case TYPE.LOAD_ADDRESS_BOOK:
      // Could wire up the json reducer
      return {
        ...state,
        addressbook: { ...action.payload }
      };
      break;
    default:
      return state;
      break;
  }
};
