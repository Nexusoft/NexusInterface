import styled from '@emotion/styled';
import { formatDateTime } from 'lib/intl';

export const RecordField = styled.span({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 6,
  minWidth: 0,
  '&.identity-field': { flex: '1 1 220px' },
  '&.created-field': { flex: '0 1 180px' },
});

export const RecordLabel = styled.span(({ theme }) => ({
  fontSize: 11,
  fontWeight: 500,
  color: theme.mixer(0.65),
  lineHeight: 1.4,
}));

const dateOptions = { year: 'numeric', month: 'short', day: '2-digit' };

export function RecordCreated({ created, label, unavailable }) {
  const timestamp = Number(created) * 1000;
  const valid = timestamp > 0 && Number.isFinite(new Date(timestamp).getTime());
  return (
    <RecordField className="created-field">
      <RecordLabel>{label}</RecordLabel>
      {valid ? (
        <time dateTime={new Date(timestamp).toISOString()}>
          {formatDateTime(timestamp, dateOptions)}
        </time>
      ) : <span>{unavailable}</span>}
    </RecordField>
  );
}
