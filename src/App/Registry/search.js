export default function matchesRecord(record, query) {
  const search = query.trim().toLocaleLowerCase();
  return !search || ['name', 'namespace', 'ticker', 'address'].some(
    (key) => typeof record[key] === 'string' && record[key].toLocaleLowerCase().includes(search)
  );
}
