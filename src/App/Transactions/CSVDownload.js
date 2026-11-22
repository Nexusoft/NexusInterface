import { useEffect, useId, useRef } from 'react';
import styled from '@emotion/styled';
import Dropdown from 'components/Dropdown';
import Tooltip from 'components/Tooltip';
import Button from 'components/Button';
import Icon from 'components/Icon';
import downloadIcon from 'icons/download.svg';

__ = __context('Transactions');

const Option = styled(Dropdown.MenuItem)(({ theme }) => ({
  width: '100%', border: 0, background: 'transparent', color: theme.foreground,
  textAlign: 'left', fontFamily: 'inherit', display: 'block',
  '.description': { display: 'block', marginTop: 3, fontSize: 11, color: theme.mixer(0.65) },
  '&:disabled': { opacity: 0.45, cursor: 'default' },
}));

function Options({ close, currentDisabled, downloadCurrent, downloadAll }) {
  const menuRef = useRef();
  useEffect(() => { menuRef.current?.querySelector('button:not(:disabled)')?.focus(); }, []);
  return <div ref={menuRef} role="menu" aria-label={__('Download as CSV')} style={{ width: 260, maxWidth: '100%' }} onKeyDown={(event) => {
    if (event.key === 'Escape' || event.key === 'Tab') {
      event.preventDefault();
      close();
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const buttons = [...menuRef.current.querySelectorAll('button:not(:disabled)')];
      const index = buttons.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next]?.focus();
    }
  }}>
    <Option as="button" type="button" role="menuitem" disabled={currentDisabled} onClick={() => { close(); downloadCurrent(); }}>
      {__('Download current page')}
      <span className="description">{__('Export the records shown on this page.')}</span>
    </Option>
    <Dropdown.Separator />
    <Option as="button" type="button" role="menuitem" onClick={() => { close(); downloadAll(); }}>
      {__('Download all records')}
      <span className="description">{__('Export all records matching your filters.')}</span>
    </Option>
  </div>;
}

export default function CSVDownload({ exporting, disabled, currentDisabled, downloadCurrent, downloadAll }) {
  const id = useId();
  return <Dropdown dropdown={({ closeDropdown }) => <Options
    close={() => { closeDropdown(); document.getElementById(id)?.focus(); }}
    {...{ currentDisabled, downloadCurrent, downloadAll }}
  />}>
    {({ open, openDropdown }) => <span style={{ display: 'inline-flex' }}>
      <Tooltip.Trigger tooltip={open || exporting ? null : __('Download as CSV')} align="end">
        <Button id={id} skin="plain" aria-label={__('Download as CSV')} aria-haspopup="menu" aria-expanded={open} waiting={exporting} disabled={disabled || exporting} onClick={openDropdown}>
          <Icon icon={downloadIcon} />
        </Button>
      </Tooltip.Trigger>
    </span>}
  </Dropdown>;
}
