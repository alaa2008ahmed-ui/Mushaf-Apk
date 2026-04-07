const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/quran-uthmani.json', 'utf8'));
const surah = data.data.surahs.find(s => s.number === 17);
const ayah = surah.ayahs.find(a => a.numberInSurah === 108);
console.log(ayah.text);
for (let i = 0; i < ayah.text.length; i++) {
  console.log(ayah.text[i], ayah.text.charCodeAt(i).toString(16));
}
