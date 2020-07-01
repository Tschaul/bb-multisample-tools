const yargs = require('yargs');
const fs = require('fs');
const riffChunks = require("riff-chunks");

const argv = yargs
  .command('transfer', 'Tells whether an year is leap year or not', {
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