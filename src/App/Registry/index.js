import { moduleLayout, modulePanel, moduleAction, moduleTabs, moduleTab } from 'utils/moduleStyles';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { useRef } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';
import { fade, mix } from 'utils/color';

import Panel from 'components/Panel';
import ExternalLink from 'components/ExternalLink';
import RequireLoggedIn from 'components/RequireLoggedIn';
import GridTracers, { modernGridBackground } from 'components/GridTracers';
import registryIcon from 'icons/token.svg';
import Tokens, { CreateTokenButton, LookupTokenButton } from './Tokens';
import Names, { CreateNameButton } from './Names';
import Namespaces, { CreateNamespaceButton } from './Namespaces';
import Assets, { CreateAssetButton } from './Assets';
import RegistryIcon from './RegistryIcon';

__ = __context('User');

const Surface = styled.section(({ theme }) => ({
  width: '100%', height: '100%', minWidth: 0, minHeight: 0,
  position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden',
  ...modernGridBackground(theme),
  color: theme.foreground,
}));

const Content = styled.div({
  position: 'relative', zIndex: 1, flex: 1, minHeight: 0, overflow: 'auto',
  display: 'flex', flexDirection: 'column',
  padding: moduleLayout.pagePadding,
});

const Workspace = styled.div(({ theme }) => ({
  maxWidth: 1600, margin: '0 auto',
  '.intro': { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 24, padding: 'clamp(22px, 3vw, 36px)', borderRadius: 20, border: `1px solid ${theme.mixer(0.14)}`, borderLeft: `3px solid ${theme.primary}`, background: `linear-gradient(135deg, ${theme.mixer(0.055)}, ${theme.background})` },
  '.intro h2': { margin: '0 0 8px', fontSize: 24, fontWeight: 500 },
  '.registry-heading': { display: 'flex', alignItems: 'center', gap: 14 },
  p: { margin: 0, color: theme.mixer(0.65), fontSize: 13, lineHeight: 1.7 },
  '.explorer-link': { display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 16px', border: `1px solid ${fade(theme.primary, 0.75)}`, borderRadius: 12, color: theme.primary, fontSize: 13, textDecoration: 'none', '&:hover': { background: fade(theme.primary, 0.92) }, '&:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: 3 } },
  '.registry-tabs': { display: 'flex', gap: 8, padding: 8, marginBottom: 14, overflowX: 'auto', borderRadius: 16, border: `1px solid ${fade(theme.primary, 0.82)}`, background: `linear-gradient(135deg, ${mix(theme.background, theme.primary, 0.055)}, ${theme.background})` },
  '.registry-tab': { flex: '1 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 18px', borderRadius: 10, border: '1px solid transparent', background: 'transparent', color: theme.mixer(0.75), font: 'inherit', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { background: fade(theme.primary, 0.95) }, '&[aria-selected="true"]': { color: theme.primary, borderColor: fade(theme.primary, 0.7), background: fade(theme.primary, 0.88) }, '&:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: -2 } },
  '.collection': { minWidth: 0, border: `1px solid ${theme.mixer(0.14)}`, borderRadius: 20, background: `linear-gradient(135deg, ${theme.mixer(0.035)}, ${theme.background})`, overflow: 'hidden', boxShadow: `inset 0 1px ${theme.mixer(0.08)}, 0 12px 30px rgba(0,0,0,0.08)` },
  '.collection-header': { display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', padding: '22px 24px', borderBottom: `1px solid ${theme.mixer(0.12)}`, background: theme.mixer(0.025) },
  '.collection-header h3': { margin: '0 0 4px', fontSize: 18, fontWeight: 500 },
  '.collection-actions': { marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' },
  '.collection-mark': { display: 'grid', placeItems: 'center', width: 44, height: 44, flexShrink: 0, borderRadius: 12, background: theme.mixer(0.07), color: theme.primary, fontSize: 21, fontWeight: 500 },
  '.collection-body': { padding: 24, '> div': { maxWidth: 'none', width: '100%', paddingTop: 0 }, button: { minHeight: 40, borderRadius: 10 }, '> div > .flex': { flexWrap: 'wrap', gap: 12 } },
  '.registry-empty': { padding: '36px 20px', textAlign: 'center', border: `1px dashed ${theme.mixer(0.18)}`, borderRadius: 14, marginTop: 20, color: theme.mixer(0.65), fontSize: 13, fontStyle: 'normal', lineHeight: 1.8, background: theme.mixer(0.02) },
  '@media (max-width: 600px)': { '.collection-header, .collection-body': { padding: 18 } },
}), ({ theme }) => theme.modern && ({
  width: '100%', maxWidth: 'none', margin: 0,
  flex: '1 0 auto', display: 'flex', flexDirection: 'column',
  '.intro, .registry-tabs': { flexShrink: 0 },
  '.collection': { flex: '1 0 auto', display: 'flex', flexDirection: 'column' },
  '.intro, .collection': modulePanel(theme),
  '.registry-tabs': { ...moduleTabs(theme), flexWrap: 'nowrap', marginBottom: moduleLayout.gap },
  '.registry-tab': moduleTab(theme),
  '.intro': { padding: moduleLayout.compactPadding, gap: 16, marginBottom: 14 },
  '.intro h2': { margin: 0, fontSize: moduleLayout.titleSize, fontWeight: 600, lineHeight: 1.3 },
  '.registry-heading p': { margin: '4px 0 0', color: theme.mixer(0.7), fontSize: 12, lineHeight: 1.5 },
  p: { fontSize: 12, lineHeight: 1.5 },
  '.intro > div': { flex: '1 1 320px', minWidth: 0 },
  '.collection-header': { flexShrink: 0, padding: moduleLayout.compactPadding, gap: 12, borderColor: fade(theme.primary, 0.85), background: 'transparent' },
  '.collection-header > div': { minWidth: 0 },
  '.collection-header h3': { fontSize: moduleLayout.sectionTitleSize, fontWeight: 600, letterSpacing: 0, color: theme.primary },
  '.collection-header p': { fontSize: 11 },
  '.collection-mark': { width: 34, height: 34, borderRadius: 10, fontSize: 17, background: fade(theme.primary, 0.9) },
  '.collection-body': { padding: moduleLayout.compactPadding },
  '.collection-body button': moduleAction,
  '.collection-body button:focus-visible, .collection-body [role="button"]:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: 3 },
  '.collection-body .registry-record': { padding: '12px 14px', marginTop: 10, borderRadius: 10, fontSize: 13, borderColor: fade(theme.primary, 0.85), background: fade(theme.background, 0.25) },
  '.collection-body .registry-record:hover': { borderColor: fade(theme.primary, 0.55), background: fade(theme.primary, 0.95) },
  '.collection-body .registry-asset': { padding: 0 },
  '.registry-empty': { marginTop: 16, padding: '24px 16px', borderRadius: 10, borderColor: fade(theme.primary, 0.85), background: fade(theme.background, 0.25), fontSize: 12, lineHeight: 1.5 },
  '@media (max-width: 600px)': { '.intro, .collection-header, .collection-body': { padding: 14 } },
}));

function Collection({ id, title, description, actions, children }) {
  return <section className="collection" role="tabpanel" id={`registry-panel-${id}`} aria-labelledby={`registry-tab-${id}`} tabIndex={0}>
    <header className="collection-header"><span className="collection-mark" aria-hidden="true"><RegistryIcon section={id} size={22} /></span><div><h3>{title}</h3><p>{description}</p></div><div className="collection-actions">{actions}</div></header>
    <div className="collection-body">
      {children}
    </div>
  </section>;
}

function RegistryContent() {
  const tabRefs = useRef([]);
  const navigate = useNavigate();
  const match = useMatch('/Registry/:section');
  const tabs = [
    { id: 'Names', title: __('Names'), description: __('Readable names linked to your registers.'), Component: Names },
    { id: 'Namespaces', title: __('Namespaces'), description: __('Your spaces for organizing names on the network.'), Component: Namespaces },
    { id: 'Assets', title: __('Assets'), description: __('Digital records and assets you own.'), Component: Assets },
    { id: 'Tokens', title: __('Tokens'), description: __('Tokens you created or hold in your accounts.'), Component: Tokens },
  ];
  const active = tabs.find((tab) => tab.id.toLowerCase() === match?.params.section?.toLowerCase()) || tabs[0];
  const ActiveCollection = active.Component;
  const CreateButton = { Assets: CreateAssetButton, Names: CreateNameButton, Namespaces: CreateNamespaceButton, Tokens: CreateTokenButton }[active.id];
  const selectTab = (index) => {
    navigate(`/Registry/${tabs[index].id}`);
    tabRefs.current[index]?.focus();
  };
  const handleTabKey = (event, index) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectTab(next); }
  };
  return <RequireLoggedIn><Workspace>
    <div className="intro">
      <div className="registry-heading"><div><h2>{__('Registry')}</h2><p>{__('Create and manage your tokens, names, namespaces, and assets.')}</p></div></div>
      <ExternalLink className="explorer-link" href="https://explorer.nexus.io" title={__('Open Nexus Explorer in your browser')}>{__('Nexus Explorer')}<span aria-hidden="true">&#8599;</span></ExternalLink>
    </div>
    <div className="registry-tabs" role="tablist" aria-label={__('Registry sections')}>
      {tabs.map((tab, index) => <button key={tab.id} ref={(element) => { tabRefs.current[index] = element; }} type="button" role="tab" className="registry-tab" id={`registry-tab-${tab.id}`} aria-selected={active.id === tab.id} aria-controls={`registry-panel-${tab.id}`} tabIndex={active.id === tab.id ? 0 : -1} onClick={() => selectTab(index)} onKeyDown={(event) => handleTabKey(event, index)}><RegistryIcon section={tab.id} />{tab.title}</button>)}
    </div>
    <Collection id={active.id} title={active.title} description={active.description} actions={<>{active.id === 'Tokens' && <LookupTokenButton />}{CreateButton && <CreateButton />}</>}>
      <ActiveCollection key={active.id} hideCreate={!!CreateButton} hideLookup={active.id === 'Tokens'} />
    </Collection>
  </Workspace></RequireLoggedIn>;
}

export default function Registry() {
  const { modern } = useTheme();
  return modern ? (
    <Surface>
      <GridTracers />
      <Content>
        <RegistryContent />
      </Content>
    </Surface>
  ) : (
    <Panel icon={registryIcon} title={__('Registry')}>
      <RegistryContent />
    </Panel>
  );
}
