import config from 'api/configuration';

export default function(state, newState) {
  if (state.addressbook.addressbook !== newState.addressbook.addressbook) {
    config.WriteJson('addressbook.json', {
      addressbook: newState.addressbook.addressbook,
    });
  }
}
