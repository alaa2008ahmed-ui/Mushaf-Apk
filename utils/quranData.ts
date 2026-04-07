import quranAr from '../data/quran_ar.json';
import quranMetadata from '../data/quran-metadata.json';

const combinedSurahs = quranMetadata.surahs.map((metaSurah, index) => {
  const arSurah = quranAr[index];
  return {
    ...metaSurah,
    ayahs: metaSurah.ayahs.map((metaAyah, ayahIndex) => ({
      ...metaAyah,
      text: arSurah.verses[ayahIndex].text
    }))
  };
});

export const quranData = {
  surahs: combinedSurahs
};
