import { Asset } from 'lib/api';

export function getAssetData(asset: Asset) {
  if (!asset) return asset;
  const {
    name,
    created,
    modified,
    address,
    owner,
    ownership,
    data,
    version,
    type,
    ...customData
  } = asset;
  return customData;
}
