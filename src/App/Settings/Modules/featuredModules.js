import chartIcon from 'icons/chart.svg';
import invoiceIcon from 'icons/invoice.svg';

export default [
  {
    name: 'nexus_interface_invoice_module',
    displayName: 'Nexus Invoice System',
    version: '1.1.0',
    targetWalletVersion: '3.1.0',
    description: 'Use Case for the Invoice System',
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
    name: 'market-data-module',
    displayName: 'Market Data',
    description: 'Market Data of Nexus trading on major exchanges',
    type: 'app',
    version: '1.0.0',
    targetWalletVersion: '2.2.0',
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
