'use strict';
import moment from 'moment';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === 'parseDuties') {
    // 執行數據提取和轉換
    let icalContent = '';
    if (request.sw) {
      icalContent = createICal(request.payload.events);
    } else {
      const e = parseDuties(request.payload.events);
      icalContent = createICal(e);
    }
    // 發送回應給 popup
    sendResponse({ success: true, icalContent: icalContent });
    return true; // 必須返回 true 表示響應將是非同步的
  }
});

function parseDuties(events) {
  return events.map((e) => {
    return [
      e[0],
      formatDateTime(e[1], e[2]),
      formatDateTime(e[3], e[4]),
      e[5].replace(/\n/g, '<br>'),
      e[6],
    ];
  });
}
// 生成 iCalendar 格式的資料
function createICal(events) {
  let icalData = 'BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\n';

  events.forEach((event) => {
    icalData += 'BEGIN:VEVENT\n';
    icalData += `SUMMARY:${event[0]}\n`;
    icalData += `DTSTART;TZID=Asia/Taipei:${event[1]}\n`;
    icalData += `DTEND;TZID=Asia/Taipei:${event[2]}\n`;
    icalData += `DESCRIPTION:${event[3]}\n`;
    // icalData += `LOCATION:${event[4]}\n`;
    icalData += 'END:VEVENT\n';
  });

  icalData += 'END:VCALENDAR';
  return icalData;
}

function formatDateTime(date, time) {
  let dateStr = date.replace(' L', '');
  let timeStr = time.replace(' L', '');
  const currentYear = new Date().getFullYear();
  const fullDateStr = `${dateStr}-${currentYear} ${timeStr}`;
  const m = moment(fullDateStr);
  return `${m.format('YYYYMMDDTHHmmss')}Z`;
}
function parseLocation(location) {
  const locationMap = {
    TPE: 'TPE',
    KHH: 'KHH',
    RMQ: 'RMQ',
  };
}
