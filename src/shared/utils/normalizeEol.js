// Source https://github.com/gourmetjs/stream-normalize-eol

import stream from 'stream';
import { StringDecoder } from 'string_decoder';

function getDecoder() {
  var decoder = new StringDecoder('utf8');
  var prevChunk;

  return {
    write: function (chunk) {
      var idx, ch;

      if (typeof chunk !== 'string') chunk = decoder.write(chunk);

      if (prevChunk) {
        chunk = prevChunk + chunk;
        prevChunk = null;
      }

      for (idx = chunk.length - 1; idx >= 0; idx--) {
        ch = chunk[idx];
        if (ch !== '\r' && ch !== '\n') break;
      }
      idx++;

      if (idx && idx < chunk.length) {
        prevChunk = chunk.substr(idx);
        chunk = chunk.substring(0, idx);
      }

      return chunk;
    },
    end: function () {
      var chunk;

      if (typeof decoder.end === 'function') chunk = decoder.end();

      return (prevChunk || '') + (chunk || '');
    },
  };
}

// Returns a duplex stream that normalizes the end of line characters.
//
// `format` specifies the output format as follows:
//   - "\n" = Unix format (LF) / default
//   - "\r\n" = Windows format (CR/LF)
//   - "\r" = Old Mac format (CR)
//
// Internally, this stream assumes that the input data is encoded as `utf8`.
// If you supply non-`utf8` encoded multi-byte data, it will not be processed correctly.
export default function normalizeEol(format) {
  var ts = new stream.Transform({ decodeStrings: false });
  var decoder = getDecoder();
  var find;

  format = format || '\n';

  if (format === '\n') {
    find = /\r\n|\r/g;
  } else if (format === '\r\n') {
    find = /\r\n|\n|\r/g;
  } else if (format === '\r') {
    find = /\r\n|\n/g;
  } else {
    throw Error('Unknown EOL format: ' + format);
  }

  ts._transform = function (chunk, encoding, callback) {
    chunk = decoder.write(chunk);
    if (chunk) this.push(chunk.replace(find, format));
    callback();
  };

  ts._flush = function () {
    var chunk = decoder.end();
    if (chunk) this.push(chunk.replace(find, format));
    this.push(null);
  };

  return ts;
}
