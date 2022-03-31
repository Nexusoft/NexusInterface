import chartIcon from 'icons/chart.svg';
import invoiceIcon from 'icons/invoice.svg';

export default [
  {
    name: 'nexus-invoice',
    displayName: 'Nexus Invoice',
    description: 'Send, pay, and manage invoices on Nexus blockchain',
    type: 'app',
    icon: invoiceIcon,
    repoInfo: {
      owner: 'Nexusoft',
      repo: 'nexus-invoice-module',
    },
    author: {
      name: 'Nexus Team',
      email: 'developer@nexus.io',
    },
  },
  {
    name: 'nexus-market-data',
    displayName: 'Market Data',
    description: 'Market Data of Nexus trading on major exchanges',
    type: 'app',
    icon: chartIcon,
    repoInfo: {
      owner: 'Nexusoft',
      repo: 'nexus-market-data-module',
    },
    author: {
      name: 'Krysto',
      email: 'quy.hoang@nexus.io',
    },
  },
];
