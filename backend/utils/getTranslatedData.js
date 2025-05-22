const { Language } = require("../models");

// Function to filter data based on the selected language
const getTranslatedData = async (data, language) => {
  // Fetch available languages from the database
  const languages = await Language.find();
  const availableLanguages = languages.map((lang) => lang.key);

  // If requested language is not available, fallback to English
  const selectedLanguage = availableLanguages.includes(language)
    ? language
    : "en";

  // Function to filter and translate objects
  const translateObject = (obj) => {
    if (typeof obj !== "object" || obj === null) {
      return obj; // Return primitive types as is
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => translateObject(item)); // Handle arrays
    }

    const translatedContent = {};

    // Extract the translated content for the selected language
    if (obj[selectedLanguage]) {
      Object.assign(translatedContent, obj[selectedLanguage]);
    }

    // Remove all other language keys
    Object.keys(obj).forEach((key) => {
      if (
        key !== selectedLanguage &&
        typeof obj[key] === "object" &&
        obj[key] !== null
      ) {
        const filteredNested = translateObject(obj[key]);
        if (Object.keys(filteredNested).length > 0) {
          translatedContent[key] = filteredNested;
        }
      }
    });

    return translatedContent;
  };

  // Handle arrays of objects or single object
  return Array.isArray(data)
    ? data.map((item) => translateObject(item)) // Handle arrays
    : translateObject(data); // Handle single object
};

module.exports = getTranslatedData;
