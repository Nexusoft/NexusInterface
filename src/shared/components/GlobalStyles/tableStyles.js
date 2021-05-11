/**
 * Migrated from react-table
 */
import { css } from '@emotion/react';
import { consts } from 'styles';

const paddingHorizontal = 0.5 * consts.lineHeight + 'em';
const paddingVertical = 0.375 * consts.lineHeight + 'em';

export default (theme) => css`
  .ReactTable {
    position: relative;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    /* custom styles */
    overscroll-behavior: contain;

    .rt-table {
      -webkit-box-flex: 1;
      -ms-flex: auto 1;
      flex: auto 1;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -ms-flex-direction: column;
      flex-direction: column;
      -webkit-box-align: stretch;
      -ms-flex-align: stretch;
      align-items: stretch;
      width: 100%;
      border-collapse: collapse;
      overflow: auto;

      /* custom styles */
      border: 1px solid ${theme.background};
      border-radius: 0.125em;
    }

    .rt-thead {
      -webkit-box-flex: 1;
      -ms-flex: 1 0 auto;
      flex: 1 0 auto;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -ms-flex-direction: column;
      flex-direction: column;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    .rt-thead.-headerGroups {
      background: rgba(0, 0, 0, 0.03);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .rt-thead.-filters {
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .rt-thead.-filters input,
    .rt-thead.-filters select {
      border: 1px solid rgba(0, 0, 0, 0.1);
      background: #fff;
      padding: 5px 7px;
      font-size: inherit;
      border-radius: 3px;
      font-weight: normal;
      outline: none;
    }

    .rt-thead.-filters .rt-th {
      border-right: 1px solid rgba(0, 0, 0, 0.02);
    }

    .rt-thead .rt-tr {
      text-align: left;
      font-size: 0.8125em;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .rt-thead .rt-th,
    .rt-thead .rt-td {
      line-height: normal;
      position: relative;
      background-color: ${theme.background};

      padding-top: ${paddingVertical};
      padding-bottom: ${paddingVertical};
      padding-left: ${paddingHorizontal};
      padding-right: ${paddingHorizontal};
      border-left: 1px solid ${theme.background};
    }

    .rt-thead .rt-th.-sort-asc,
    .rt-thead .rt-td.-sort-asc {
      box-shadow: inset 0 3px 0 0 ${theme.primary};
    }
    .rt-thead .rt-th.-sort-desc,
    .rt-thead .rt-td.-sort-desc {
      box-shadow: inset 0 -3px 0 0 ${theme.primary};
    }

    .rt-thead .rt-th.-cursor-pointer,
    .rt-thead .rt-td.-cursor-pointer {
      cursor: pointer;
      outline: none;
    }

    .rt-thead .rt-th:last-child,
    .rt-thead .rt-td:last-child {
      border-right: 0;
    }

    .rt-thead .rt-resizable-header {
      overflow: visible;
    }

    .rt-thead .rt-resizable-header:last-child {
      overflow: hidden;
    }

    .rt-thead .rt-resizable-header-content {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .rt-thead .rt-header-pivot {
      border-right-color: #f7f7f7;
    }

    .rt-thead .rt-header-pivot:after,
    .rt-thead .rt-header-pivot:before {
      left: 100%;
      top: 50%;
      border: solid transparent;
      content: ' ';
      height: 0;
      width: 0;
      position: absolute;
      pointer-events: none;
    }

    .rt-thead .rt-header-pivot:after {
      border-color: rgba(243, 170, 170, 0.342);
      border-left-color: #fff;
      border-width: 8px;
      margin-top: -8px;
    }

    .rt-thead .rt-header-pivot:before {
      border-color: rgba(255, 175, 175, 0.65);
      border-left-color: #f7f7f7;
      border-width: 10px;
      margin-top: -10px;
    }

    .rt-tbody {
      -webkit-box-flex: 99999;
      -ms-flex: 99999 1 auto;
      flex: 99999 1 auto;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -ms-flex-direction: column;
      flex-direction: column;
      overflow: auto;
    }

    .rt-tbody .rt-tr-group {
      border-bottom: 1px solid ${theme.background};
      max-height: 2.75em;
    }

    .rt-tbody .rt-tr-group:last-child {
      border-bottom: 0;
    }

    .rt-tbody .rt-td {
      padding-top: ${paddingVertical};
      padding-bottom: ${paddingVertical};
      padding-left: ${paddingHorizontal};
      padding-right: ${paddingHorizontal};
      border-left: 1px solid ${theme.background};
    }

    .rt-tbody .rt-td:first-of-type {
      border-left: 0;
    }

    /* .rt-tbody .rt-td:last-child {
  border-right: 0;
} */

    .rt-tbody .rt-expandable {
      cursor: pointer;
      text-overflow: clip;
    }

    .rt-tr-group {
      -webkit-box-flex: 1;
      -ms-flex: 1 0 auto;
      flex: 1 0 auto;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -ms-flex-direction: column;
      flex-direction: column;
      -webkit-box-align: stretch;
      -ms-flex-align: stretch;
      align-items: stretch;
    }

    .rt-tr {
      -webkit-box-flex: 1;
      -ms-flex: 1 0 auto;
      flex: 1 0 auto;
      display: -webkit-inline-box;
      display: -ms-inline-flexbox;
      display: inline-flex;
    }

    .rt-th,
    .rt-td {
      -webkit-box-flex: 1;
      -ms-flex: 1 0 0px;
      flex: 1 0 0;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding: 7px 5px;
      overflow: hidden;
      transition: 0.3s ease;
      transition-property: width, min-width, padding, opacity;
    }

    .rt-th.-hidden,
    .rt-td.-hidden {
      width: 0 !important;
      min-width: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      opacity: 0 !important;
    }

    .rt-expander {
      display: inline-block;
      position: relative;
      margin: 0;
      color: transparent;
      margin: 0 10px;
    }

    .rt-expander:after {
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      top: 50%;
      left: 50%;
      -webkit-transform: translate(-50%, -50%) rotate(-90deg);
      transform: translate(-50%, -50%) rotate(-90deg);
      border-left: 5.04px solid transparent;
      border-right: 5.04px solid transparent;
      border-top: 7px solid rgba(0, 0, 0, 0.8);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: pointer;
    }

    .rt-expander.-open:after {
      -webkit-transform: translate(-50%, -50%) rotate(0);
      transform: translate(-50%, -50%) rotate(0);
    }

    .rt-resizer {
      display: inline-block;
      position: absolute;
      width: 36px;
      top: 0;
      bottom: 0;
      right: -18px;
      cursor: col-resize;
      z-index: 10;
    }
    .rt-tfoot {
      -webkit-box-flex: 1;
      -ms-flex: 1 0 auto;
      flex: 1 0 auto;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -ms-flex-direction: column;
      flex-direction: column;
      box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.15);
    }
    .rt-tfoot .rt-td {
      border-right: 1px solid rgba(0, 0, 0, 0.05);
    }
    .rt-tfoot .rt-td:last-child {
      border-right: 0;
    }
    &.-striped .rt-tr.-odd {
      background: rgba(0, 0, 0, 0.1);
    }
    &.-highlight .rt-tbody .rt-tr:not(.-padRow):hover {
      background: rgba(255, 255, 255, 0.05);
    }
    .-pagination {
      z-index: 1;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-pack: justify;
      -ms-flex-pack: justify;
      justify-content: space-between;
      -webkit-box-align: stretch;
      -ms-flex-align: stretch;
      align-items: stretch;
      -ms-flex-wrap: wrap;
      flex-wrap: wrap;
      /* padding: 3px; */
      margin-top: 0.5em;
      box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.1);
      border-top: 2px solid rgba(0, 0, 0, 0.1);
    }
    .-pagination input,
    .-pagination select {
      border: 1px solid rgba(0, 0, 0, 0.1);
      background: rgba(255, 255, 255, 0);
      padding: 5px 7px;
      font-size: inherit;
      color: ${theme.foreground};
      border-radius: 3px;
      font-weight: normal;
      outline: none;
    }

    .-pagination span::after {
      content: '';
      display: block;
      position: absolute;
      bottom: 4px;
      height: 2px;
      width: 100px;
      background: ${theme.background};
    }
    .-pagination option {
      background: ${theme.background};
      background-blend-mode: difference;
      filter: invert(1);
      font-weight: normal;
      outline: none;
    }
    .-pagination .-btn {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      display: block;
      width: 100%;
      height: 100%;
      border: 0;
      border-radius: 3px;
      padding: 6px;
      font-size: 1em;
      color: ${theme.foreground};
      background: rgba(255, 255, 255, 0.1);
      transition: all 0.1s ease;
      cursor: pointer;
      outline: none;
    }
    .-pagination .-btn[disabled] {
      opacity: 0.5;
      background: rgba(0, 0, 0, 0.1);
      cursor: default;
    }
    .-pagination .-btn:not([disabled]):hover {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
    }
    .-pagination .-previous,
    .-pagination .-next {
      -webkit-box-flex: 1;
      -ms-flex: 1;
      flex: 1;
      text-align: center;
    }
    .-pagination .-center {
      -webkit-box-flex: 1.5;
      -ms-flex: 1.5;
      flex: 1.5;
      text-align: center;
      margin-bottom: 0;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-orient: horizontal;
      -webkit-box-direction: normal;
      -ms-flex-direction: row;
      flex-direction: row;
      -ms-flex-wrap: wrap;
      flex-wrap: wrap;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      -ms-flex-pack: distribute;
      justify-content: space-around;
    }
    .-pagination .-pageInfo {
      display: inline-block;
      margin: 3px 10px;
      white-space: nowrap;
    }
    .-pagination .-pageJump {
      display: inline-block;
    }
    .-pagination .-pageJump input {
      width: 3.5em;
      text-align: center;
    }
    .-pagination .-pageSizeOptions {
      margin: 3px 10px;
      color: ${theme.background};
      background: rgba(0, 0, 0, 0.02);
    }
    .rt-noData {
      display: block;
      position: absolute;
      left: 50%;
      top: 50%;
      -webkit-transform: translate(-50%, -50%);
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 0.8);
      transition: all 0.3s ease;
      z-index: 1;
      pointer-events: none;
      padding: 20px;
      color: rgba(0, 0, 0, 0.5);
    }
    .-loading {
      display: block;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      transition: all 0.3s ease;
      z-index: -1;
      opacity: 0;
      pointer-events: none;
    }
    .-loading > div {
      position: absolute;
      display: block;
      text-align: center;
      width: 100%;
      top: 50%;
      left: 0;
      font-size: 15px;
      color: rgba(0, 0, 0, 0.6);
      -webkit-transform: translateY(-52%);
      transform: translateY(-52%);
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .-loading.-active {
      opacity: 1;
      z-index: 2;
      pointer-events: all;
    }
    .-loading.-active > div {
      -webkit-transform: translateY(50%);
      transform: translateY(50%);
    }
    .rt-resizing .rt-th,
    .rt-resizing .rt-td {
      transition: none !important;
      cursor: col-resize;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  }
`;
