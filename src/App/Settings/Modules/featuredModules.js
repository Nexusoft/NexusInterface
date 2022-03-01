import chartIcon from 'icons/chart.svg';
import invoiceIcon from 'icons/invoice.svg';

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
];
