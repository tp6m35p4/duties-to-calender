'use strict';
import moment from 'moment';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Communicate with background file by sending a message

function downloadICalFile(content, filename) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function extractEvents(rows) {
  const res = [];
  for (let i = 0; i < rows.length; i++) {
    const current = rows[i];
    let event = []; // Duty, Date, Report, Date, Release, Description, Location
    let currentTds = current.querySelectorAll('td');
    // export duty except dayoff
    const dayoffRegex = /DayOff*/i;
    if (!currentTds[2].textContent.match(dayoffRegex)) {

      event[0] = currentTds[2].textContent; // Duty
      event[1] = currentTds[1].textContent; // Report Date
      event[2] = currentTds[5].textContent; // Report Time
      event[5] = currentTds[13].textContent; // Description
      event[6] = currentTds[4].textContent; // Location
      // 判斷有無下一行comment或是跨日班
      if (i + 1 < rows.length) {
        const next = rows[i + 1];
        const nextTds = next.querySelectorAll('td');
        if (current.className == next.className) {
          // comment在下一行
          event[5] = nextTds[1].textContent; // Description
          i = i + 1;
        }
        if (currentTds[7].textContent == '-->') {
          // 跨日班
          event[3] = nextTds[1].textContent; // Release Date
          event[4] = nextTds[7].textContent; // Release Time
          i = i + 1;
        } else {
          // 非跨日班
          event[3] = currentTds[1].textContent; // Release Date
          event[4] = currentTds[7].textContent; // Release Time
        }
      }
      res.push(event);
    }
  }
  return res;
}
// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'exportCalendar') {
    const eventRows = document.querySelectorAll(
      '.roster-report tbody tr td table tbody tr:not(.separator)'
    );
    const events = extractEvents(eventRows);
    chrome.runtime.sendMessage(
      {
        type: 'parseDuties',
        payload: {
          events: events,
        },
      },
      (response) => {
        if (response.success) {
          const now = moment();
          downloadICalFile(
            response.icalContent,
            `${now.format('YYYYMMDD')}-duties.ics`
          );
        } else {
          alert('Export error.');
        }
      }
    );
  }

  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse({});
  return true;
});
