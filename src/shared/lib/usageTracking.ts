import { trackEvent } from '@aptabase/electron/renderer';
import { ipcRenderer } from 'electron';

interface UsageTracker {
  active: boolean;
  SendScreen(screenTitle: string): void;
  LogIn(): void;
  LogOut(): void;
  CreateUserAccount(): void;
  RecoveredUserAccount(): void;
  RecoverPhrase(hadRecoverPhrase: boolean): void;
  UpdateCredentials(): void;
  Send(tokenType: string): void;
  InstallModule(moduleName: string): void;
  UninstallModule(moduleName: string): void;
  StartStake(): void;
  StopStake(): void;
  AdjustStake(direction: string): void;
  AddAddressBookEntry(isEdit: boolean): void;
  CreateNewItem(itemType: string): void;
  ExportAddressBook(): void;
  RenameAccount(): void;
  Exception(error: string): void;
  // SendEvent(category: string, action: string, label?: string, value?: number): void;
  DisableAnalytics(): void;
  EnableAnalytics(): void;
  StartAnalytics(): void;
}

const UT: UsageTracker = {
  active: false,

  SendScreen(_screenTitle: string): void {
    return; // right now lets not push too many events
    // if (!UT.active) return;
    // const params = {
    //   screen_name: screenTitle,
    // };
    // trackEvent('screen_view', params);
  },

  LogIn(): void {
    if (!UT.active) return;
    trackEvent('login');
  },

  LogOut(): void {
    if (!UT.active) return;
    trackEvent('logout');
  },

  CreateUserAccount(): void {
    if (!UT.active) return;
    trackEvent('create_user_account');
  },

  RecoveredUserAccount(): void {
    if (!UT.active) return;
    trackEvent('recovered_user_account');
  },

  RecoverPhrase(hadRecoverPhrase: boolean): void {
    if (!UT.active) return;
    const params = {
      had_recover_phrase: hadRecoverPhrase,
    };
    trackEvent('recover_phrase', params);
  },

  UpdateCredentials(): void {
    if (!UT.active) return;
    trackEvent('update_credentials');
  },

  Send(tokenType: string): void {
    if (!UT.active) return;
    const params = {
      token_type: tokenType,
    };
    trackEvent('send', params);
  },

  InstallModule(moduleName: string): void {
    if (!UT.active) return;
    const params = {
      module_name: moduleName,
    };
    trackEvent('install_module', params);
  },

  UninstallModule(moduleName: string): void {
    if (!UT.active) return;
    const params = {
      module_name: moduleName,
    };
    trackEvent('uninstall_module', params);
  },

  StartStake(): void {
    if (!UT.active) return;
    trackEvent('start_stake');
  },

  StopStake(): void {
    if (!UT.active) return;
    trackEvent('stop_stake');
  },

  AdjustStake(direction: string): void {
    if (!UT.active) return;
    const params = {
      direction: direction,
    };
    trackEvent('adjust_stake', params);
  },

  AddAddressBookEntry(isEdit: boolean): void {
    if (!UT.active) return;
    const params = {
      is_edit: isEdit,
    };
    trackEvent('add_address_book_entry', params);
  },

  CreateNewItem(itemType: string): void {
    if (!UT.active) return;
    const params = {
      item_type: itemType,
    };
    trackEvent('create_new_item', params);
  },

  ExportAddressBook(): void {
    if (!UT.active) return;
    trackEvent('export_address_book');
  },

  RenameAccount(): void {
    if (!UT.active) return;
    trackEvent('rename_account');
  },

  Exception(error: string): void {
    if (!UT.active) return;
    try {
      const messageSplit = error.split(':');
      const typeSplit = messageSplit[0].split(' ');
      const errorType = typeSplit[typeSplit.length - 1];
      const params = {
        type: errorType,
        message: messageSplit[1],
      };
      trackEvent('error_exception', params);
    } catch (error) {
      // If this fails just move on.
    }
  },

  // SendEvent(category: string, action: string, label?: string, value?: number): void {
  //   // GA.visitor.event(category, action, label, value).send();
  // },

  DisableAnalytics(): void {
    UT.active = false;
  },

  EnableAnalytics(): void {
    UT.StartAnalytics();
  },

  StartAnalytics(): void {
    UT.active = true;
    ipcRenderer.on('usage-tracking-error-relay', (_event, message: string) => {
      UT.Exception(message);
    });
    trackEvent('app_started');
  },
};

export default UT;
