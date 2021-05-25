function noteNumberToString(raw) {

    num = raw - 36;

    const oct = Math.floor((num) / 12)
    const noteNum = num - (oct % 12) * 12;

    let noteLetter = 'ERROR'

    switch (noteNum) {
        case 0: noteLetter = 'c'; break;
        case 1: noteLetter = 'c#'; break;
        case 2: noteLetter = 'd'; break;
        case 3: noteLetter = 'd#'; break;
        case 4: noteLetter = 'e'; break;
        case 5: noteLetter = 'f'; break;
        case 6: noteLetter = 'f#'; break;
        case 7: noteLetter = 'g'; break;
        case 8: noteLetter = 'g#'; break;
        case 9: noteLetter = 'a'; break;
        case 10: noteLetter = 'a#'; break;
        case 11: noteLetter = 'b'; break;
    }

    return noteLetter + '' + oct;

}

function noteStringToNumber(string) {

    const noteNames = [
        'c',
        'c#',
        'd',
        'd#',
        'e',
        'f',
        'f#',
        'g',
        'g#',
        'a',
        'a#',
        'b',
    ]

    let result = 0

    noteNames.forEach((notename, index) => {
        if (string.toLowerCase().startsWith(notename)) {
            const rest = string.slice(notename.length)
            const oct = parseInt(rest, 10)
            result = 12 * oct + index + 36
        }
    })

    return result;

}

function encodeNumber(value, bytes = 4) {

    const result = Array.from({ length: bytes }, it => 0)

    var byte = 0;

    while (byte < bytes) {

        result[byte] = value % 256;

        value = Math.floor(value / 256);

        byte++;
    }

    return result;
}

function decodeBytes(data, bytes = 4) {

    var result = 0;
    var mul = 1;

    var byte = 0;

    while (byte < bytes) {

        result += mul * data[byte];
        mul *= 256;

        byte++;
    }

    return result;
}

module.exports = {
    noteNumberToString,
    noteStringToNumber,
    encodeNumber,
    decodeBytes
}