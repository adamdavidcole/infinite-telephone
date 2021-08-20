import stem from "wink-porter2-stemmer";
import mostCommonWords from "./most-common-words.json";
import { isEmpty, isUndefined } from "lodash";

//
/**
 * DATA STORE SHAPE:
 * {
 *   [id]: {
 *      id: string,
 *      text: string,
 *      filename: string,
 *      duration: number,
 *      nextAudioId: string,
 *      prevAudioId: string,
 *
 *      wordCounts: Record<string, number>,
 *      wordsInCommon: string[],
 *      consecutiveWordCounts: Record<sring, number>
 *   }
 *   sortedIds: string[],
 * }
 */
const dataStore = {
  sortedIds: [],
};
const mostCommonWordsMap = {};

export function getOrderedIds() {
  return [...dataStore.sortedIds];
}

export function getAudioFilenameById(id) {
  return dataStore?.[id]?.processedFilename;
}

export function getWordCountsById(id) {
  return dataStore?.[id]?.wordCounts;
}

export function getWordsInCommonById(id) {
  return dataStore?.[id]?.wordsInCommon;
}

export function getConsecutiveWordCounts(id) {
  return dataStore?.[id]?.consecutiveWordCounts;
}

export function getDurationById(id) {
  return dataStore?.[id]?.duration;
}

export function getNextId(id) {
  return dataStore?.[id]?.nextAudioId;
}

export function getPrevId(id) {
  return dataStore?.[id]?.prevAudioId;
}

function isCommonWord(word) {
  if (isEmpty(mostCommonWordsMap)) {
    mostCommonWords.forEach((word) => {
      const normalizedWord = stem(word).toLowerCase();
      mostCommonWordsMap[normalizedWord] = true;
    });
  }

  if (!word) return false;
  return !!mostCommonWordsMap[word];
}

function getNormalizedWords(text) {
  const words = text
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
    .replace(/\s{2,}/g, " ")
    .toLowerCase()
    .split(" ")
    .map(stem);

  return words;
}

function sanitizeData(data) {
  if (!data) return [];

  return data.filter((dataEntry) => {
    const { id, processedFilename, transcript } = dataEntry || {};

    return (
      !isUndefined(id) &&
      !isUndefined(processedFilename) &&
      !isUndefined(transcript)
    );
  });
}

export function processData(allAudioData) {
  // strip invalid entires
  const sanitizedData = sanitizeData(allAudioData);

  // process basic raw data
  for (let i = 0; i < sanitizedData.length; i++) {
    const prevAudioData = i > 0 ? sanitizedData[i - 1] : null;
    const nextAudioData =
      i < sanitizedData.length - 1 ? sanitizedData[i + 1] : null;

    const prevAudioId = prevAudioData?.id;
    const nextAudioId = nextAudioData?.id;
    const audioData = sanitizedData[i];
    dataStore[audioData.id] = {
      ...audioData,
      prevAudioId,
      nextAudioId,
    };

    dataStore.sortedIds.push(audioData.id);
  }

  // process word counts per audio clip
  const wordCountData = sanitizedData.map((audioData) => {
    const normalizedWords = getNormalizedWords(audioData.transcript);
    const wordCounts = {};

    normalizedWords.forEach((word) => {
      const prevWordCount = wordCounts[word] || 0;
      wordCounts[word] = prevWordCount + 1;
    });

    dataStore[audioData.id].wordCounts = wordCounts;
    return { id: audioData.id, wordCounts };
  });

  // process words in common with previous clip per audio clip
  const allWordsInCommonData = [];
  for (let i = 0; i < wordCountData.length; i++) {
    if (i === 0) {
      const id = wordCountData[0].id;
      allWordsInCommonData.push({ id, wordsInCommon: [] });
      dataStore[id].wordsInCommon = [];
      continue;
    }

    const prevWordCountData = wordCountData[i - 1];
    const nextWordCountData = wordCountData[i];

    const wordsInCommon = [];
    const prevWordCounts = prevWordCountData.wordCounts;
    const nextWordCounts = nextWordCountData.wordCounts;

    Object.keys(nextWordCounts).forEach((word) => {
      if (isCommonWord(word)) return;

      if (prevWordCounts[word]) {
        wordsInCommon.push(word);
      }
    });

    const id = nextWordCountData.id;
    dataStore[id].wordsInCommon = wordsInCommon;
    allWordsInCommonData.push({ id, wordsInCommon });
  }

  // process consecutive common word counts per audio clip
  let cumulativeCounts = {};
  for (let i = 0; i < allWordsInCommonData.length; i++) {
    const nextCumulativeCounts = {};
    const { id, wordsInCommon } = allWordsInCommonData[i];
    // eslint-disable-next-line no-loop-func
    wordsInCommon.forEach((word) => {
      const cumulativeCount = cumulativeCounts[word] || 0;
      nextCumulativeCounts[word] = 1 + cumulativeCount;
    });

    dataStore[id].consecutiveWordCounts = nextCumulativeCounts;
    cumulativeCounts = nextCumulativeCounts;
  }
}
