export function getAssetData(asset) {
  if (!asset) return asset;
  const { name, created, modified, address, owner, ownership, ...data } = asset;
  return data;
}
