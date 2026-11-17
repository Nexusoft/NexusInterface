import AutoLaunch from 'auto-launch';

const nexusAutoLaunch = new AutoLaunch({
  name: 'Nexus Wallet',
});

export async function setOpenOnStart(enabled) {
  if (enabled) {
    await nexusAutoLaunch.enable();
  } else {
    await nexusAutoLaunch.disable();
  }
}
