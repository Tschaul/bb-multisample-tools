const yargs = require('yargs');
const fs = require('fs');
const path = require('path');
const riffChunks = require("riff-chunks");
const process = require("child_process");

const { noteNumberToString, decodeBytes, encodeNumber, noteStringToNumber } = require('./helper');








const mapping = {

  0: 21,
  1: 23,
  2: 25,
  3: 27,
  4: 29,
  5: 31,
  6: 33,
  7: 35,
  8: 37,
  9: 39,
  10: 41,
  11: 43,
  12: 45,
  13: 47,
  14: 49,
  15: 51,
  16: 53,
  17: 55,
  18: 57,
  19: 59,
  20: 61,
  21: 63,
  22: 65,
  23: 67,
  24: 69,
  25: 71,
  26: 73,
  27: 75,
  28: 77,
  29: 79,
  30: 81,
  31: 83,
  32: 85,
  33: 87,
  34: 89,
  35: 91,
  36: 93,
  37: 95,
  38: 97,
  39: 99,
  40: 101,
  41: 103,
  42: 105,
  43: 107,
  44: 108,

}

const argv = yargs
  .command('transfer', 'transfer INST and SMPL chunks', {
    dir: {
      description: 'the directory to scan for files',
      alias: 'd',
      type: 'string',
    },
    target: {
      description: 'the directory to store the result',
      alias: 't',
      type: 'string',
    }
  })
  .command('inspect', 'inspect INST chunk of file', {
    file: {
      description: 'the file to read',
      alias: 'f',
      type: 'string',
    }
  })
  .command('encode', 'add INST and SMPL chunks', {
    pattern: {
      description: 'the directory to scan for files',
      alias: 'p',
      type: 'string',
    },
    target: {
      description: 'the directory to store the result',
      alias: 't',
      type: 'string',
    },
    volume: {
      description: 'volume adjustment in dB',
      alias: 'v',
      type: 'number',
    }
  })
  .argv;

if (argv._.includes('transfer')) {
  const dirs = fs.readdirSync(argv.dir)
  console.log(dirs)
  if (!fs.existsSync(argv.target)) {
    fs.mkdirSync(argv.target, {
      recursive: true
    })
  }
  dirs.forEach(entry => {
    if (!entry.endsWith("output.wav") && entry.endsWith(".wav")) {
      const rawFile = fs.readFileSync(argv.dir + "/" + entry);
      const leveledFile = fs.readFileSync(argv.dir + "/" + entry.replace(".wav", ".output.wav"))
      console.log(riffChunks)
      let rawChunks = riffChunks.read(rawFile);
      let leveledChunks = riffChunks.read(leveledFile);

      const instChunk = rawChunks.subChunks.find(it => it.chunkId === "inst")
      leveledChunks.subChunks.push(instChunk)

      const smplChunk = rawChunks.subChunks.find(it => it.chunkId === "smpl")
      leveledChunks.subChunks.push(smplChunk)
      console.log(leveledChunks)
      fs.writeFileSync(argv.target + "/" + entry, riffChunks.write(leveledChunks))
    }
  })
}

if (argv._.includes('inspect')) {

  const rawFile = fs.readFileSync(argv.file);

  let rawChunks = riffChunks.read(rawFile);

  const dataChunk = rawChunks.subChunks.find(it => it.chunkId === "data")

  const fmtChunk = rawChunks.subChunks.find(it => it.chunkId === "fmt ")

  const instChunk = rawChunks.subChunks.find(it => it.chunkId === "inst")

  const smplChunk = rawChunks.subChunks.find(it => it.chunkId === "smpl")

  console.log(rawChunks.subChunks.map(it => it.chunkId))

  console.log(JSON.stringify(fmtChunk, null, 2))

  const data = instChunk.chunkData;

  console.log(JSON.stringify({
    unshiftedNote: noteNumberToString(data[0]),
    fineTune: data[1],
    gain: data[2],
    lowNote: noteNumberToString(data[3]),
    highNote: noteNumberToString(data[4]),
    lowVelocity: data[5],
    highVelocity: data[6],
    sampleRate: decodeBytes(fmtChunk.chunkData.slice(4, 8)),
    samplePeriod: decodeBytes(smplChunk.chunkData.slice(8, 12))
  }, null, 2))

  // Note length in seconds = (data -> chunkSize) / (fmt -> Average bytes per second)
  // smpl -> Sample Period = 1,000,000,000 / (fmt -> Sample rate)
}

if (argv._.includes('encode')) {

  const fullPattern = argv.pattern;

  const dir = path.dirname(fullPattern)

  const dirs = fs.readdirSync(dir)

  const pattern = fullPattern
    .slice(dir.length + 1)
    .replace(".", "\\.")
    .replace("#{NN}", "(?<notenumber>\\d+)")
    .replace("#{NS}", "(?<notestring>[a-zA-Z]{1,2}\\d+)")
    .replace("*", "(\\S+)")

  //

  const regex = new RegExp(pattern, "mg")

  console.log(pattern)

  if (!fs.existsSync(argv.target)) {
    fs.mkdirSync(argv.target, {
      recursive: true
    })
  }

  var entries = [];

  dirs.forEach(fileName => {

    let tempMatch = null
    let match = null

    while((tempMatch = regex.exec(fileName)) != null) {
      match = tempMatch
    }

    if (match) {

      const noteNumber = match.groups.notestring
        ? noteStringToNumber(match.groups.notestring)
        : parseInt(match.groups.notenumber)

      entries.push({
        file: fileName,
        noteNumber
      })

    }
  })

  entries = entries.sort((a, b) => a.noteNumber - b.noteNumber);

  console.log(entries)


  entries.forEach((entry, index) => {

    const rawFileLocation = dir + "/" + entry.file;

    let rawFile

    if (argv.volume) {

      const tempFileName = `temp-${Math.floor(Math.random()*10000000)}.wav`

      process.execSync(`\"C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe\" -i \"${rawFileLocation}\"  -af "volume=${argv.volume}dB" ${tempFileName}`)
  
      rawFile = fs.readFileSync(tempFileName, {});

      fs.unlinkSync(tempFileName)
    } else {
      rawFile = fs.readFileSync(rawFileLocation, {});
    }

    // console.log(p.toString('utf8'))

    let rawChunks = riffChunks.read(rawFile);

    function middle(a, b) {
      return Math.round((a + b) * 0.5)
    }

    const lowNote = entries[index - 1] ? middle(entries[index - 1].noteNumber, entry.noteNumber) : 0
    const highNote = entries[index + 1] ? (middle(entries[index + 1].noteNumber, entry.noteNumber) - 1) : 127

    const instChunk = {
      "chunkId": "inst",
      "chunkSize": 7,
      "chunkData": [
        entry.noteNumber,
        0, // fine tune
        0, // gain
        lowNote,
        highNote,
        1,
        127,
        0
      ]
    }

    const fmtChunk = rawChunks.subChunks.find(it => it.chunkId === "fmt ")

    const samplePeriod = Math.floor(1000000000 / decodeBytes(fmtChunk.chunkData.slice(4, 8)))

    const smplChunk = {
      "chunkId": "smpl",
      "chunkSize": 36,
      "chunkData": [
        0, 0, 0, 0, // manufacturer
        0, 0, 0, 0, // product
        ...encodeNumber(samplePeriod), // sample period
        ...encodeNumber(entry.noteNumber), // note number
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ]
    }

    console.log({
      file: entry.file,
      noteNumber: entry.noteNumber,
      lowNote,
      highNote,
    })

    rawChunks.subChunks.push(smplChunk)
    rawChunks.subChunks.push(instChunk)

    fs.writeFileSync(argv.target + "/" + entry.file, riffChunks.write(rawChunks))
  })
}









