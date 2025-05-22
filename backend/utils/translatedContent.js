const { Language } = require("../models");
const ErrorHandler = require("./errorHandler");
const mongoose = require("mongoose");

exports.translatedContent = async (language, content) => {
  // Fetch available languages
  const languages = await Language.find();

  // Extract language keys
  const languageKeys = languages.map((lang) => lang.key);

  // Prepare the response contents
  const responseContents = content.map((data) => {
    const translatedContent = data[language] || {};

    // Remove language-specific fields
    languageKeys.forEach((key) => {
      delete data[key];
    });

    // Merge translated content with the other fields
    return { ...translatedContent, ...data };
  });
  return responseContents;
};

exports.singleTranslation = async (language, content) => {
  // Fetch available languages
  const languages = await Language.find();

  // Convert document to a plain object
  const dataObject = content.toObject();

  // Build the translated content dynamically based on the selected language
  const translatedContent = dataObject[language] || {};

  // Remove all language-specific fields from the main config object
  Object.keys(dataObject).forEach((key) => {
    if (languages.map((lang) => lang.key).includes(key)) {
      delete dataObject[key];
    }
  });

  // Merge the translated content with the other fields
  return { ...dataObject, ...translatedContent };
};

// Translation and cleanup function
exports.translateNestedContent = async (language, content) => {
  const languages = await Language.find();
  const languageKeys = languages.map((lang) => lang.key);

  // Helper function to convert ObjectId to strings dynamically
  const convertObjectIds = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (mongoose.Types.ObjectId.isValid(obj[key])) {
          obj[key] = obj[key].toString(); // Convert ObjectId to string
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          // Recursively check nested objects and arrays
          obj[key] = convertObjectIds(obj[key]);
        }
      }
    }
    return obj;
  };

  const translateAndClean = (obj, depth = 0, visited = new WeakSet()) => {
    if (depth > 20) {
      return obj;
    }

    if (obj && typeof obj === "object") {
      if (visited.has(obj)) {
        return obj;
      }

      visited.add(obj);

      if (Array.isArray(obj)) {
        return obj.map((item) => translateAndClean(item, depth + 1, visited));
      } else {
        // Convert all ObjectId fields dynamically to strings
        obj = convertObjectIds(obj);

        // Handle translation
        const translatedContent = obj[language] || {};

        // Remove all language-specific keys (like 'vi', 'en')
        languageKeys.forEach((key) => {
          delete obj[key];
        });

        // Recursively process nested objects
        for (const key in obj) {
          if (obj.hasOwnProperty(key) && typeof obj[key] === "object") {
            obj[key] = translateAndClean(obj[key], depth + 1, visited);
          }
        }

        return { ...translatedContent, ...obj };
      }
    } else {
      return obj;
    }
  };

  if (Array.isArray(content)) {
    return content.map((data) => translateAndClean(data));
  } else if (content && typeof content === "object") {
    return translateAndClean(content);
  } else {
    throw new ErrorHandler("Content is neither an object nor an array");
  }
};
