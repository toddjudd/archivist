const fs = require('fs');
const path = require('path');
const { fdir } = require('fdir');

// const ftp = '//slcprodftp01/ftp/';
// const ftp = '/app';
// const ftp = './';
// const regEx = new RegExp(/archive$/);
const ftp = process.env.target;
const regEx = new RegExp(/archive$/);

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const crawler = new fdir().withBasePath().withDirs().withMaxDepth(4);
const archives = crawler
  .crawl(ftp)
  .sync()
  .filter((path) => {
    return path.match(regEx);
  });

archives.forEach((archive) => {
  //only act on folders, where the folder containes files
  console.log('forEach');
  //filter to folders
  console.log('archive');
  console.log(archive);

  let files = fs.readdirSync(archive, { withFileTypes: true }).filter((file) => file.isFile());
  console.log('files');
  console.log(files);

  //limit to folders with files
  if (files.length == 0) return;
  //identify file dates
  let fileStats = files.map((file) => {
    let stat = fs.statSync(path.join(archive, file.name));
    let date = {
      day: stat.ctime.getDate().toString(),
      month: months[stat.ctime.getMonth()],
      year: stat.ctime.getFullYear().toString(),
    };
    return { file, stat, date };
  });
  let dates = fileStats.reduce((dates, file, i, stats) => {
    const { date } = file;
    prevDate = dates.find((d) => {
      return d.day === date.day && d.month === date.month && d.year === date.year;
    });
    if (prevDate) return dates;

    dates.push(date);
    return dates;
  }, []);
  //create file date folders if not exists
  dates.forEach((date) => {
    let year = path.join(archive, date.year);
    let month = path.join(archive, date.year, date.month);
    let day = path.join(archive, date.year, date.month, date.day);
    if (!fs.existsSync(year)) {
      fs.mkdirSync(year);
    }
    if (!fs.existsSync(month)) {
      fs.mkdirSync(month);
    }
    if (!fs.existsSync(day)) {
      fs.mkdirSync(day);
    }
  });
  //move each file to the proper archive folder
  fileStats.forEach((fileStat) => {
    let { file, date, stat } = fileStat;
    fs.renameSync(
      path.join(archive, file.name),
      path.join(archive, date.year, date.month, date.day, file.name)
    );
  });
  // console.log(fileStats);
});
