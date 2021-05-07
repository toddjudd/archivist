const fs = require('fs');
const path = require('path');
const { fdir } = require('fdir');
const logUpdate = require('log-update');
const chalk = require('chalk');
require('log-timestamp')('ARCHIVIST');
// const ftp = '//slcprodftp01/ftp/';
// const ftp = '/app';
// const ftp = './';
// const regEx = new RegExp(/archive$/);
// const ftp = process.env.target || '/target';
const ftp = process.env.target || '\\\\slcbartender01\\printToBartender';
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

console.log('Begining Archive Process');

const crawler = new fdir().withBasePath().withDirs().withMaxDepth(4);
const archives = crawler
  .crawl(ftp)
  .sync()
  .filter((path) => {
    return path.match(regEx);
  });

console.log(chalk.cyan(`got ${archives.length} archive folders`));

archives.forEach((archive, i) => {
  //only act on folders, where the folder containes files
  console.log('forEach');
  //filter to folders
  console.log('archive');
  console.log(archive);

  let files = fs
    .readdirSync(archive, { withFileTypes: true })
    .filter((file) => file.isFile());
  console.log(chalk.cyan(`found ${files.length} in archive ${i + 1} folder`));

  //limit to folders with files
  if (files.length == 0) return;
  //identify file dates
  console.log('Getting File Stats...');
  let fileStats = files.map((file, i) => {
    logUpdate(`Reading file: ${i}`);
    let stat = fs.statSync(path.join(archive, file.name));
    let date = {
      day: stat.birthtime.getDate().toString(),
      month: months[stat.birthtime.getMonth()],
      year: stat.birthtime.getFullYear().toString(),
    };
    return { file, stat, date };
  });
  console.log('Got File Stats');
  console.log('Reducing Dates...');
  let dates = fileStats.reduce((dates, file, i, stats) => {
    const { date } = file;
    prevDate = dates.find((d) => {
      return (
        d.day === date.day && d.month === date.month && d.year === date.year
      );
    });
    if (prevDate) return dates;

    dates.push(date);
    return dates;
  }, []);
  //create file date folders if not exists
  console.log('checking for date folders');
  dates.forEach((date) => {
    let year = path.join(archive, date.year);
    let month = path.join(archive, date.year, date.month);
    let day = path.join(archive, date.year, date.month, date.day);
    if (!fs.existsSync(year)) {
      fs.mkdirSync(year);
      console.log(chalk.red(`creating folder ${year}`));
    }
    if (!fs.existsSync(month)) {
      fs.mkdirSync(month);
      console.log(chalk.yellow(`creating folder ${month}`));
    }
    if (!fs.existsSync(day)) {
      fs.mkdirSync(day);
      console.log(chalk.green(`creating folder ${day}`));
    }
  });
  //move each file to the proper archive folder
  console.log('Begining File Move...');

  fileStats.forEach((fileStat, i) => {
    logUpdate(`Moving File: ${i}`);
    let { file, date, stat } = fileStat;
    fs.renameSync(
      path.join(archive, file.name),
      path.join(archive, date.year, date.month, date.day, file.name)
    );
  });
  console.log('Finished File Move');
});
