'use strict';

import './popup.css';
import moment from 'moment';
(async function () {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions

<<<<<<< HEAD
  document
    .getElementById('exportBtn')
    .addEventListener('click', async function () {
      const start = document.getElementById('start').value
        ? document.getElementById('start').value
        : moment().startOf('month').format('YYYY-MM-DD');
      const end = document.getElementById('end').value
        ? document.getElementById('end').value
        : moment().endOf('month').format('YYYY-MM-DD');

      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        console.log(tabs[0].url);
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            type: 'exportCalendar',
            payload: {
              start: start,
              end: end,
            },
            sw:
              tabs[0].url ==
              'https://crew-sg-prod.roiscloud.com/it/portal/page/roster'
                ? true
                : false,
          },
          function (response) {
            console.log('Response received');
          }
        );
      });
=======

  document.getElementById('exportBtn').addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: 'exportCalendar' },
        function (response) {
          console.log('Response received');
        }
      );
>>>>>>> e13901c7b61fa98e1da04df552c21f4441b6e227
    });
})();
