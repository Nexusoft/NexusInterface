import Button from 'components/Button';
import { updateSettings } from 'lib/settings';

import FullScreen from './FullScreen';

const acceptAgreement = () => updateSettings({ acceptedAgreement: true });

export default function LicenseAgreement() {
  return (
    <FullScreen header="License Agreement">
      <p>The MIT License (MIT)</p>
      <p>Copyright {new Date().getFullYear()} Nexus</p>
      <p>
        Permission is hereby granted, free of charge, to any person obtaining a
        copy of this software and associated documentation files (the
        "Software"), to deal in the Software without restriction, including
        without limitation the rights to use, copy, modify, merge, publish,
        distribute, sublicense, and/or sell copies of the Software, and to
        permit persons to whom the Software is furnished to do so, subject to
        the following conditions:
      </p>
      <p>
        The above copyright notice and this permission notice shall be included
        in all copies or substantial portions of the Software.
      </p>
      <p>
        <strong>
          THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
          EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
          IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
          CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
          TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
          SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        </strong>
      </p>
      <br />
      <p>
        <Button
          skin="primary"
          wide
          onClick={acceptAgreement}
          style={{ fontSize: 17 }}
        >
          I have read and Accept the Agreement
        </Button>
      </p>
    </FullScreen>
  );
}
