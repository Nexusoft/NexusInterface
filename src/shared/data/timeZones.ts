type TimeZone = {
  value: number;
  offset: string;
  description: string;
};

const timeZones: TimeZone[] = [
  { value: 0, offset: 'UTC+0.00', description: 'London, Casablanca, Accra' },
  {
    value: -60,
    offset: 'UTC-1.00',
    description: 'Cabo Verde, Ittoqqortoormiit, Azores Islands',
  },
  {
    value: -120,
    offset: 'UTC-2.00',
    description: 'Fernando de Noronha, South Sandwich Islands',
  },
  {
    value: -180,
    offset: 'UTC-3.00',
    description: 'Buenos Aires, Montevideo, São Paulo',
  },
  {
    value: -210,
    offset: 'UTC-3.50',
    description: "St. John's, Labrador, Newfoundland",
  },
  {
    value: -240,
    offset: 'UTC-4.00',
    description: 'Santiago, La Paz, Halifax',
  },
  { value: -300, offset: 'UTC-5.00', description: 'New York, Lima, Toronto' },
  {
    value: -360,
    offset: 'UTC-6.00',
    description: 'Chicago, Guatemala City, Mexico City',
  },
  {
    value: -420,
    offset: 'UTC-7.00',
    description: 'Phoenix, Calgary, Ciudad Juárez',
  },
  {
    value: -480,
    offset: 'UTC-8.00',
    description: 'Los Angeles, Vancouver, Tijuana',
  },
  { value: -540, offset: 'UTC-9.00', description: 'Anchorage' },
  { value: -570, offset: 'UTC-9.50', description: 'Marquesas Islands' },
  { value: -600, offset: 'UTC-10.00', description: 'Papeete, Honolulu' },
  {
    value: -660,
    offset: 'UTC-11.00',
    description: 'Niue, Jarvis Island, American Samoa',
  },
  {
    value: -720,
    offset: 'UTC-12.00',
    description: 'Baker Island, Howland Island',
  },
  { value: 840, offset: 'UTC+14.00', description: 'Line Islands' },
  { value: 780, offset: 'UTC+13.00', description: 'Apia, Nukuʻalofa' },
  { value: 765, offset: 'UTC+12.75', description: 'Chatham Islands' },
  { value: 720, offset: 'UTC+12.00', description: 'Auckland, Suva' },
  {
    value: 660,
    offset: 'UTC+11.00',
    description: 'Noumea, Federated States of Micronesia',
  },
  { value: 630, offset: 'UTC+10.50', description: 'Lord Howe Island' },
  {
    value: 600,
    offset: 'UTC+10.00',
    description: 'Port Moresby, Sydney, Vladivostok',
  },
  { value: 570, offset: 'UTC+9.50', description: 'Adelaide' },
  { value: 540, offset: 'UTC+9.00', description: 'Seoul, Tokyo, Yakutsk' },
  { value: 525, offset: 'UTC+8.75', description: 'Eucla' },
  { value: 510, offset: 'UTC+8.50', description: 'Pyongyang' },
  {
    value: 480,
    offset: 'UTC+8.00',
    description: 'Beijing, Singapore, Manila',
  },
  {
    value: 420,
    offset: 'UTC+7.00',
    description: 'Bangkok, Hanoi, Jakarta',
  },
  { value: 390, offset: 'UTC+6.50', description: 'Yangon' },
  { value: 360, offset: 'UTC+6.00', description: 'Almaty, Dhaka, Omsk' },
  { value: 345, offset: 'UTC+5.75', description: 'Kathmandu' },
  { value: 330, offset: 'UTC+5.50', description: 'Delhi, Colombo' },
  {
    value: 300,
    offset: 'UTC+5.00',
    description: 'Karachi, Tashkent, Yekaterinburg',
  },
  { value: 270, offset: 'UTC+4.50', description: 'Kabul' },
  { value: 240, offset: 'UTC+4.00', description: 'Baku, Dubai, Samara' },
  { value: 210, offset: 'UTC+3.50', description: 'Tehran' },
  {
    value: 180,
    offset: 'UTC+3.00',
    description: 'Istanbul, Moscow, Nairobi',
  },
  {
    value: 120,
    offset: 'UTC+2.00',
    description: 'Athens, Cairo, Johannesburg',
  },
  { value: 60, offset: 'UTC+1.00', description: 'Berlin, Lagos, Madrid' },
];

export default timeZones;
