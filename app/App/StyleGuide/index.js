/*
  Title: Style Guide
  Description: Not for production mode, this module is just for development purposes
  Last Modified by: Brian Smith
*/
// External Dependencies
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { remote } from 'electron';

// Internal Dependencies
import Icon from 'components/Icon';
import styles from './style.css';
import ContextMenuBuilder from 'contextmenu';

// Images
import developerIcon from 'images/developer.sprite.svg';

/**
 * Style Page
 *
 * @export
 * @class StyleGuide
 * @extends {Component}
 */
export default class   extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
  }
  // React Method (Life cycle hook)
  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  // Class Methods
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  // Mandatory React method
  render() {
    return (
      <div id="styleguide" className="animated fadeIn">
        <h2>
          <Icon icon={developerIcon} className="hdr-img" />
          Style Guide
        </h2>

        <div className="panel">
          <div className="grid-container">
            <section id="colors">
              <h3>Colors</h3>

              <input type="checkbox" className="toggle" id="toggle-colors" />
              <label className="toggle" htmlFor="toggle-colors" />

              <div className="panel">
                <ul>
                  <li>
                    <div className="swatch" />
                  </li>

                  <li>
                    <div className="swatch" />
                  </li>

                  <li>
                    <div className="swatch" />
                  </li>

                  <li>
                    <div className="swatch" />
                  </li>

                  <li>
                    <div className="swatch" />
                  </li>
                </ul>
              </div>

              <pre className="code-example">
                <code>
                  {`
				.example {
					color: var(--color-1);
					background-color: var(--color-2);
				}
				`}
                </code>
              </pre>
            </section>

            <section id="headers">
              <h3>Headers</h3>

              <input type="checkbox" className="toggle" id="toggle-headers" />
              <label className="toggle" htmlFor="toggle-headers" />

              <div className="panel">
                <ul>
                  <li>
                    <div className="example">
                      <h1>Aa</h1>
                    </div>
                  </li>

                  <li>
                    <div className="example">
                      <h2>Aa</h2>
                    </div>
                  </li>

                  <li>
                    <div className="example">
                      <h3>Aa</h3>
                    </div>
                  </li>

                  <li>
                    <div className="example">
                      <h4>Aa</h4>
                    </div>
                  </li>
                </ul>
              </div>

              <pre className="code-example">
                <code>
                  {`
					&lt;h1&gt;Aa&lt;/h1&gt;
					&lt;h2&gt;Aa&lt;/h2&gt;
				&lt;h3&gt;Aa&lt;/h3&gt;
				&lt;h4&gt;Aa&lt;/h4&gt;
				`}{' '}
                </code>
              </pre>
            </section>

            <section id="block-text">
              <h3>Block Text</h3>

              <input
                type="checkbox"
                className="toggle"
                id="toggle-block-text"
              />
              <label className="toggle" htmlFor="toggle-block-text" />

              <div className="panel">
                <div className="example">
                  <h1>Aa - Header</h1>
                  <p>
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit,
                    sed diam nonummy nibh euismod tincidunt ut laoreet dolore
                    magna aliquam erat volutpat. Ut wisi enim ad minim veniam,
                    quis nostrud exerci tation ullamcorper suscipit lobortis
                    nisl ut aliquip ex ea commodo consequat.
                  </p>
                </div>
              </div>

              <pre className="code-example">
                <code>
                  &lt;h1&gt;Aa - Header&lt;/h1&gt; &lt;p&gt; Lorem ipsum ...
                  &lt;/p&gt;
                </code>
              </pre>
            </section>

            <section id="inline-text">
              <h3>Inline Text</h3>

              <input
                type="checkbox"
                className="toggle"
                id="toggle-inline-text"
              />
              <label className="toggle" htmlFor="toggle-inline-text" />

              <div className="panel">
                <div className="example">
                  <p className="fifty-percent">
                    <a href="#">anchor link</a>
                    <br />
                    <abbr title="abbreviation title">abbreviation</abbr>
                    <br />
                    <b>bold text</b>
                    <br />
                    <cite>citation</cite>
                    <br />
                    <code>.code {`{color: red;}`}</code>
                    <br />
                    <del>deleted text</del>
                    <br />
                    <dfn title="definition term title">definition term</dfn>
                    <br />
                    <em>emphasisted text</em>
                    <br />
                    <i>alternate voice</i>
                    <br />
                    <ins>inserted text</ins>
                    <br />
                    <kbd>keyboard input text</kbd>
                    <br />
                  </p>

                  <p className="fifty-percent">
                    <mark>marked text</mark>
                    <br />
                    <q>
                      short <q>quotation</q>
                      inside of another quotation
                    </q>
                    <br />
                    <s>incorrect text</s>
                    <br />
                    <samp>sample text</samp>
                    <br />
                    <small>small text</small>
                    <br />
                    <span>span text</span>
                    <br />
                    <strong>strong text</strong>
                    <br />
                    <sub>subscript text</sub>
                    <br />
                    <sup>superscript text</sup>
                    <br />
                    <u>underlined text</u>
                    <br />
                    <var>variable</var>
                  </p>

                  <div className="clear-both" />
                </div>
              </div>

              <pre className="code-example">
                <code>
                  &lt;p&gt; &lt;a href="#"&gt;anchor link&lt;/a&gt;&lt;br&gt;
                  &lt;abbr title="abbreviation title"&gt; abbreviation
                  &lt;/abbr&gt;&lt;br&gt; &lt;b&gt;bold text&lt;/b&gt;&lt;br&gt;
                  &lt;cite&gt;citation&lt;/cite&gt;&lt;br&gt; &lt;code&gt;.code{' '}
                  {`{color: red;}`}
                  &lt;/code&gt;&lt;br&gt; &lt;del&gt;deleted
                  text&lt;/del&gt;&lt;br&gt; &lt;dfn title="definition term
                  title"&gt; definition term &lt;/dfn&gt;&lt;br&gt;
                  &lt;em&gt;emphasisted text&lt;/em&gt;&lt;br&gt;
                  &lt;i&gt;alternate voice&lt;/i&gt;&lt;br&gt;
                  &lt;ins&gt;inserted text&lt;/ins&gt;&lt;br&gt;
                  &lt;kbd&gt;keyboard input text&lt;/kbd&gt;&lt;br&gt;
                  &lt;mark&gt;marked text&lt;/mark&gt;&lt;br&gt; &lt;q&gt; short
                  &lt;q&gt;quotation&lt;/q&gt; inside of another quotation
                  &lt;/q&gt;&lt;br&gt; &lt;s&gt;incorrect
                  text&lt;/s&gt;&lt;br&gt; &lt;samp&gt;sample
                  text&lt;/samp&gt;&lt;br&gt; &lt;small&gt;small
                  text&lt;/small&gt;&lt;br&gt; &lt;span&gt;span
                  text&lt;/span&gt;&lt;br&gt; &lt;strong&gt;strong
                  text&lt;/strong&gt;&lt;br&gt; &lt;sub&gt;subscript
                  text&lt;/sub&gt;&lt;br&gt; &lt;sup&gt;superscript
                  text&lt;/sup&gt;&lt;br&gt; &lt;u&gt;underlined
                  text&lt;/u&gt;&lt;br&gt; &lt;var&gt;variable&lt;/var&gt;
                  &lt;/p&gt;
                </code>
              </pre>
            </section>

            <section id="preformatted">
              <h3>Preformatted</h3>

              <input
                type="checkbox"
                className="toggle"
                id="toggle-preformatted-text"
              />
              <label className="toggle" htmlFor="toggle-preformatted-text" />

              <div className="panel">
                <div className="example">
                  <pre>
                    Lorem ipsum dolor sit amet consectetuer adipiscing elit
                  </pre>
                  <pre>
                    <code>{`
				code {
					text-align: left;
					background: #eee;
					color: #000;
					text-shadow: none;
					border: 1px solid #fff;
				}
				`}</code>
                  </pre>
                </div>
              </div>

              <pre className="code-example">
                <code>
                  &lt;pre&gt;Lorem ipsum dolor sit amet consectetuer adipiscing
                  elit &lt;/pre&gt; &lt;pre&gt;&lt;code&gt;code{' '}
                  {`{
					text-align: left;
					background: #eee;
					color: #000;
					text-shadow: none;
					border: 1px solid #fff;
				}`}
                  &lt;/code&gt;&lt;/pre&gt;
                </code>
              </pre>
            </section>

            <section id="blockquotes">
              <h3>Block Quotes</h3>

              <input
                type="checkbox"
                className="toggle"
                id="toggle-blockquotes"
              />
              <label className="toggle" htmlFor="toggle-blockquotes" />

              <div className="panel">
                <div className="example">
                  <p>A quick quote from lorem ipsum:</p>
                  <blockquote>
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit,
                    sed diam nonummy nibh euismod tincidunt ut laoreet dolore
                    magna aliquam erat volutpat. Ut wisi enim ad minim veniam,
                    quis nostrud exerci tation ullamcorper suscipit lobortis
                    nisl ut aliquip ex ea commodo consequat.
                  </blockquote>
                  <p>Now that we're done with that lets move on.</p>
                </div>
              </div>

              <pre className="code-example">
                <code>
                  &lt;p&gt; A quick quote from lorem ipsum: &lt;/p&gt;
                  &lt;blockquote&gt; Lorem ipsum ... &lt;/blockquote&gt;
                  &lt;p&gt; Now that we're done with that lets move on.
                  &lt;/p&gt;
                </code>
              </pre>
            </section>

            <section id="unordered-list">
              <h3>Unordered Lists</h3>

              <input
                type="checkbox"
                className="toggle"
                id="toggle-unordered-list"
              />
              <label className="toggle" htmlFor="toggle-unordered-list" />

              <div className="panel">
                <div className="example">
                  <ul>
                    <li>List Item 1</li>
                    <li>
                      List Item 1
                      <ul>
                        <li>List Item 2</li>
                        <li>
                          List Item 2
                          <ul>
                            <li>List Item 3</li>
                            <li>List Item 3</li>
                          </ul>
                        </li>
                        <li>List Item 2</li>
                        <li>List Item 2</li>
                      </ul>
                    </li>
                    <li>List Item 1</li>
                    <li>List Item 1</li>
                  </ul>
                </div>
              </div>

              <pre className="code-example">
                <code>
                  &lt;ul&gt; &lt;li&gt;List Item 1&lt;/li&gt; &lt;li&gt; List
                  Item 1 &lt;ul&gt; &lt;li&gt;List Item 2&lt;/li&gt;
                  &lt;li&gt;List Item 2 &lt;ul&gt; &lt;li&gt;List Item
                  3&lt;/li&gt; &lt;li&gt;List Item 3&lt;/li&gt; &lt;/ul&gt;
                  &lt;/li&gt; &lt;li&gt;List Item 2&lt;/li&gt; &lt;li&gt;List
                  Item 2&lt;/li&gt; &lt;/ul&gt; &lt;/li&gt; &lt;li&gt;List Item
                  1&lt;/li&gt; &lt;li&gt;List Item 1&lt;/li&gt; &lt;/ul&gt;
                </code>
              </pre>
            </section>

            <section id="ordered-list">
              <h3>Ordered Lists</h3>

              <input
                type="checkbox"
                className="toggle"
                id="toggle-ordered-list"
              />
              <label className="toggle" htmlFor="toggle-ordered-list" />

              <div className="panel">
                <div className="example">
                  <ol>
                    <li>List Item 1</li>
                    <li>
                      List Item 1
                      <ol>
                        <li>List Item 2</li>
                        <li>
                          List Item 2
                          <ol>
                            <li>List Item 3</li>
                            <li>List Item 3</li>
                          </ol>
                        </li>
                        <li>List Item 2</li>
                        <li>List Item 2</li>
                      </ol>
                    </li>
                    <li>List Item 1</li>
                    <li>List Item 1</li>
                  </ol>
                </div>
              </div>

              <pre className="code-example">
                <code>
                  &lt;ol&gt; &lt;li&gt;List Item 1&lt;/li&gt; &lt;li&gt; List
                  Item 1 &lt;ol&gt; &lt;li&gt;List Item 2&lt;/li&gt;
                  &lt;li&gt;List Item 2 &lt;ol&gt; &lt;li&gt;List Item
                  3&lt;/li&gt; &lt;li&gt;List Item 3&lt;/li&gt; &lt;/ol&gt;
                  &lt;/li&gt; &lt;li&gt;List Item 2&lt;/li&gt; &lt;li&gt;List
                  Item 2&lt;/li&gt; &lt;/ol&gt; &lt;/li&gt; &lt;li&gt;List Item
                  1&lt;/li&gt; &lt;li&gt;List Item 1&lt;/li&gt; &lt;/ol&gt;
                </code>
              </pre>
            </section>

            <section id="definition-list">
              <h3>Definition Lists</h3>

              <input
                type="checkbox"
                className="toggle"
                id="toggle-definition-list"
              />
              <label className="toggle" htmlFor="toggle-definition-list" />

              <div className="panel">
                <div className="example">
                  <dl>
                    <dt>Definition term</dt>
                    <dd>Definition description</dd>

                    <dt>Definition term</dt>
                    <dd>Definition description</dd>
                    <dd>Definition description</dd>

                    <dt>Definition term</dt>
                    <dt>Definition term</dt>
                    <dd>Definition description</dd>
                  </dl>
                </div>
              </div>

              <pre className="code-example">
                <code>
                  &lt;dl&gt; &lt;dt&gt;Definition term&lt;/dt&gt;
                  &lt;dd&gt;Definition description&lt;/dd&gt;
                  &lt;dt&gt;Definition term&lt;/dt&gt; &lt;dd&gt;Definition
                  description&lt;/dd&gt; &lt;dd&gt;Definition
                  description&lt;/dd&gt; &lt;dt&gt;Definition term&lt;/dt&gt;
                  &lt;dt&gt;Definition term&lt;/dt&gt; &lt;dd&gt;Definition
                  description&lt;/dd&gt; &lt;/dl&gt;
                </code>
              </pre>
            </section>

            <section id="table">
              <h3>Tables</h3>

              <input type="checkbox" className="toggle" id="toggle-table" />
              <label className="toggle" htmlFor="toggle-table" />

              <div className="panel">
                <div className="example">
                  <table className="bordered padded striped">
                    <thead>
                      <tr>
                        <th>Team</th>
                        <th>Description</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td>Bears</td>
                        <td>Football team from Chicago</td>
                      </tr>
                      <tr>
                        <td>Diamondbacks</td>
                        <td>Baseball team from Arizona</td>
                      </tr>
                      <tr>
                        <td>Flyers</td>
                        <td>Hockey team from Philadelphia</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <pre className="code-example">
                <code>
                  &lt;table class="bordered padded striped"&gt; &lt;thead&gt;
                  &lt;tr&gt; &lt;th style="width: 25%"&gt;Team&lt;/th&gt;
                  &lt;th&gt;Description&lt;/th&gt; &lt;/tr&gt; &lt;/thead&gt;
                  &lt;tbody&gt; &lt;tr&gt; &lt;td&gt;Bears&lt;/td&gt;
                  &lt;td&gt;Football team from Chicago&lt;/td&gt; &lt;/tr&gt;
                  &lt;tr&gt; &lt;td&gt;Diamondbacks&lt;/td&gt;
                  &lt;td&gt;Baseball team from Arizona&lt;/td&gt; &lt;/tr&gt;
                  &lt;tr&gt; &lt;td&gt;Flyers&lt;/td&gt; &lt;td&gt;Hockey team
                  from Philadelphia&lt;/td&gt; &lt;/tr&gt; &lt;/tbody&gt;
                  &lt;/table&gt;
                </code>
              </pre>
            </section>

            <section id="forms-default">
              <h3>Default Form</h3>

              <input
                type="checkbox"
                className="toggle"
                id="toggle-forms-default"
              />
              <label className="toggle" htmlFor="toggle-forms-default" />

              <div className="panel">
                <div className="example">
                  <form>
                    <fieldset>
                      <legend>Account Information</legend>

                      <div className="field">
                        <label>Email:</label>
                        <input
                          type="email"
                          placeholder="user@domain.com"
                          required
                        />
                        <span className="hint">
                          Email address is required and must be in the format:
                          user@@domain.com
                        </span>
                      </div>

                      <div className="field">
                        <label>Password:</label>
                        <input
                          type="password"
                          placeholder="Password"
                          required
                        />
                        <span className="hint">Password is required</span>
                      </div>
                    </fieldset>

                    <p>
                      <input type="submit" className="button primary" />{' '}
                      <input type="reset" value="Reset" className="button" />
                    </p>
                  </form>
                </div>
              </div>

              <pre className="code-example">
                <code>
                  &lt;form&gt; &lt;fieldset&gt; &lt;legend&gt;Account
                  Information&lt;/legend&gt; &lt;div class="field"&gt;
                  &lt;label&gt;Email:&lt;/label&gt; &lt;input type="email"
                  placeholder="user@domain.com" required /&gt; &lt;span
                  class="hint"&gt; Email address is required &lt;/span&gt;
                  &lt;/div&gt; &lt;div class="field"&gt;
                  &lt;label&gt;Password:&lt;/label&gt; &lt;input type="password"
                  placeholder="Password" required /&gt; &lt;span
                  class="hint"&gt; Password is required &lt;/span&gt;
                  &lt;/div&gt; &lt;/fieldset&gt; &lt;p&gt; &lt;input
                  type="submit" class="button primary"/&gt; &lt;input
                  type="reset" value="Reset" class="button" /&gt; &lt;/p&gt;
                  &lt;/form&gt;
                </code>
              </pre>
            </section>

            <section id="forms-inline">
              <h3>Inline Form</h3>

              <input
                type="checkbox"
                className="toggle"
                id="toggle-forms-inline"
              />
              <label className="toggle" htmlFor="toggle-forms-inline" />

              <div className="panel">
                <div className="example">
                  <form className="inline">
                    <fieldset>
                      <legend>Account Information</legend>

                      <div className="field">
                        <label>Email:</label>
                        <input
                          type="email"
                          placeholder="user@domain.com"
                          required
                        />
                        <span className="hint">Email address is required</span>
                      </div>

                      <div className="field">
                        <label>Password:</label>
                        <input
                          type="password"
                          placeholder="Password"
                          required
                        />
                        <span className="hint">Password is required</span>
                      </div>
                    </fieldset>

                    <p>
                      <input type="submit" className="button primary" />{' '}
                      <input type="reset" value="Reset" className="button" />
                    </p>
                  </form>
                </div>
              </div>

              <pre className="code-example">
                <code>
                  &lt;form class="inline"&gt; &lt;fieldset&gt;
                  &lt;legend&gt;Account Information&lt;/legend&gt; &lt;div
                  class="field"&gt; &lt;label&gt;Email:&lt;/label&gt; &lt;input
                  type="email" placeholder="user@domain.com" required /&gt;
                  &lt;span class="hint"&gt; Email address is required
                  &lt;/span&gt; &lt;/div&gt; &lt;div class="field"&gt;
                  &lt;label&gt;Password:&lt;/label&gt; &lt;input type="password"
                  placeholder="Password" required /&gt; &lt;span
                  class="hint"&gt; Password is required &lt;/span&gt;
                  &lt;/div&gt; &lt;/fieldset&gt; &lt;p&gt; &lt;input
                  type="submit" class="button primary"/&gt; &lt;input
                  type="reset" value="Reset" class="button" /&gt; &lt;/p&gt;
                  &lt;/form&gt;
                </code>
              </pre>
            </section>

            <section id="forms-aligned">
              <h3>Aligned Form</h3>

              <input
                type="checkbox"
                className="toggle"
                id="toggle-forms-aligned"
              />
              <label className="toggle" htmlFor="toggle-forms-aligned" />

              <div className="panel">
                <div className="example">
                  <form className="aligned">
                    <fieldset>
                      <legend>Account Information</legend>

                      <div className="field">
                        <label>Email:</label>
                        <input
                          type="email"
                          placeholder="user@domain.com"
                          required
                        />
                        <span className="hint">Email address is required</span>
                      </div>

                      <div className="field">
                        <label>Password:</label>
                        <input
                          type="password"
                          placeholder="Password"
                          required
                        />
                        <span className="hint">Password is required</span>
                      </div>
                    </fieldset>

                    <p>
                      <input type="submit" className="button primary" />{' '}
                      <input type="reset" value="Reset" className="button" />
                    </p>
                  </form>
                </div>
              </div>

              <pre className="code-example">
                <code>
                  &lt;form class="aligned"&gt; &lt;fieldset&gt;
                  &lt;legend&gt;Account Information&lt;/legend&gt; &lt;div
                  class="field"&gt; &lt;label&gt;Email:&lt;/label&gt; &lt;input
                  type="email" placeholder="user@domain.com" required /&gt;
                  &lt;span class="hint"&gt; Email address is required
                  &lt;/span&gt; &lt;/div&gt; &lt;div class="field"&gt;
                  &lt;label&gt;Password:&lt;/label&gt; &lt;input type="password"
                  placeholder="Password" required /&gt; &lt;span
                  class="hint"&gt; Password is required &lt;/span&gt;
                  &lt;/div&gt; &lt;/fieldset&gt; &lt;p&gt; &lt;input
                  type="submit" class="button primary"/&gt; &lt;input
                  type="reset" value="Reset" class="button" /&gt; &lt;/p&gt;
                  &lt;/form&gt;
                </code>
              </pre>
            </section>

            <section id="buttons">
              <h3>Buttons</h3>

              <input type="checkbox" className="toggle" id="toggle-buttons" />
              <label className="toggle" htmlFor="toggle-buttons" />

              <div className="panel">
                <div className="example">
                  <button className="button">Default</button>
                  <button className="button primary">Primary</button>
                  <button className="button positive">Positive</button>
                  <button className="button warning">Warning</button>
                  <button className="button negative">Negative</button>
                  <button className="button ghost">Ghost</button>
                </div>
              </div>

              <pre className="code-example">
                <code>
                  &lt;button class="button"&gt;Default&lt;/button&gt; &lt;button
                  class="button primary"&gt;Primary&lt;/button&gt; &lt;button
                  class="button positive"&gt;Positive&lt;/button&gt; &lt;button
                  class="button warning"&gt;Warning&lt;/button&gt; &lt;button
                  class="button negative"&gt;Negative&lt;/button&gt; &lt;button
                  class="button ghost"&gt;Ghost&lt;/button&gt;
                </code>
              </pre>
            </section>

            <section id="button-sizes">
              <h3>Button Sizes</h3>

              <input
                type="checkbox"
                className="toggle"
                id="toggle-button-sizes"
              />
              <label className="toggle" htmlFor="toggle-button-sizes" />

              <div className="panel">
                <div className="example">
                  <button className="button hero">Hero</button>
                  <button className="button large">Large</button>
                  <button className="button small">Small</button>
                </div>
              </div>

              <pre className="code-example">
                <code>
                  &lt;button class="button hero"&gt;Hero&lt;/button&gt;
                  &lt;button class="button large"&gt;Large&lt;/button&gt;
                  &lt;button class="button small"&gt;Small&lt;/button&gt;
                </code>
              </pre>
            </section>

            <section id="switches">
              <h3>Switches</h3>

              <input type="checkbox" className="toggle" id="toggle-switches" />
              <label className="toggle" htmlFor="toggle-switches" />

              <div className="panel">
                <div className="example">
                  <form className="aligned">
                    <div className="field">
                      <label>Default Switch:</label>
                      <input type="checkbox" className="switch" />
                    </div>

                    <div className="field">
                      <label>Checked Switch:</label>
                      <input
                        type="checkbox"
                        className="switch"
                        defaultChecked
                      />
                    </div>

                    <div className="field">
                      <label>Disabled Switch:</label>
                      <input type="checkbox" className="switch" disabled />
                    </div>

                    <div className="field">
                      <label>Disabled Checked Switch:</label>
                      <input
                        type="checkbox"
                        className="switch"
                        defaultChecked
                        disabled
                      />
                    </div>
                  </form>
                </div>
              </div>

              <pre className="code-example">
                <code>
                  &lt;input type="checkbox" class="switch"&gt; &lt;input
                  type="checkbox" class="switch" checked&gt; &lt;input
                  type="checkbox" class="switch" disabled&gt; &lt;input
                  type="checkbox" class="switch" checked disabled&gt;
                </code>
              </pre>
            </section>
          </div>
        </div>
      </div>
    );
  }
}
