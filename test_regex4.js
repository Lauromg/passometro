const rePalavra = '[a-zÀ-ÿ0-9]+';
const regex = new RegExp(
  '(' + rePalavra + '(?:\\s+' + rePalavra + '){0,3})' +
  '(?:\\s+[:=]?\\s*|\\s*[:=]\\s*)' +
  '(-?\\s*\\d+[.,]?\\d*)',
  'gi'
);

function test(str) {
  let match;
  regex.lastIndex = 0;
  while ((match = regex.exec(str)) !== null) {
    console.log(str, "=>", match[1], "|", match[2]);
  }
}

test("hematócrito 45");
test("pco2 40");
test("po2: 90");
test("sat=99");
test("be -2");
test("be - 2");
test("fósforo 4.5");
