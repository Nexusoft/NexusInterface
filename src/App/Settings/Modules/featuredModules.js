import chartIcon from 'icons/chart.svg';
import invoiceIcon from 'icons/invoice.svg';
import histoyryIcon from 'icons/history.svg';

export default [
  {
    name: 'nexus_interface_invoice_module',
    displayName: 'Nexus Invoice System',
    description: 'Send, pay, and manage invoices on Nexus blockchain',
    type: 'app',
    icon: invoiceIcon,
    repoInfo: {
      owner: 'Nexusoft',
      repo: 'Nexus-Interface-Invoice-Module',
    },
    author: {
      name: 'Nexus Team',
      email: 'developer@nexus.io',
    },
  },
  {
    name: 'market_data',
    displayName: 'Market Data',
    description: 'Market Data of Nexus trading on major exchanges',
    type: 'app',
    icon: chartIcon,
    repoInfo: {
      owner: 'Nexusoft',
      repo: 'market-data-module',
    },
    author: {
      name: 'Krysto',
      email: 'quy.hoang@nexus.io',
    },
  },
  {
    name: 'nexus_interface_history_module',
    displayName: 'History Module',

    description: 'Loads and Saves history data for your Nexus Account',
    type: 'app',
    icon: histoyryIcon,
    repoInfo: {
      owner: 'Nexusoft',
      repo: 'nexus-interface-history-module',
    },
    author: {
      name: 'Kendal Cormany',
      email: 'kendal.cormany@nexus.io',
    },
  },
];
