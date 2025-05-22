const fs = require("fs");
const path = require("path");
const url = require("url");
const cloudinary = require("cloudinary").v2;
const { v4: uuidv4 } = require("uuid");
const ErrorHandler = require("./errorHandler");
const multer = require("multer");

// Ensure upload directory exists
const ensureUploadDirectory = (uploadDir) => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

// Generate a unique file name
const generateUniqueFileName = (originalName) => {
  const extension = path.extname(originalName);
  const filename = `${
    new Date().toISOString().split("T")[0]
  }-${uuidv4()}${extension}`;
  return filename;
};

// Upload file to Cloudinary
const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder });
    return {
      file_name: result.public_id,
      file_full_url: result.secure_url,
    };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Save file locally
const saveLocally = (file, uploadDir, schemaFolder = "") => {
  return new Promise((resolve, reject) => {
    ensureUploadDirectory(uploadDir);

    const filename = generateUniqueFileName(file.originalname);
    const fileDir = path.join(uploadDir, schemaFolder);
    ensureUploadDirectory(fileDir);

    const fullFilePath = path.join(fileDir, filename);

    fs.rename(file.path, fullFilePath, (err) => {
      if (err) return reject(err);
      const fileFullUrl = `${
        process.env.BASE_URL || `http://localhost:${process.env.PORT}`
      }/public/uploads/${schemaFolder}/${filename}`.replace(/\\/g, "/");
      resolve({
        file_name: filename,
        file_full_url: fileFullUrl,
      });
    });
  });
};

// Main function to handle file upload
const handleFileUpload = async (file, folder = "", schemaFolder = "") => {
  if (!file) throw new Error("No file provided");

  const uploadDir = "public/uploads";
  const fileFolder = folder ? folder : schemaFolder;

  if (process.env.CLOUDINARY_CLOUD_NAME) {
    return await uploadToCloudinary(file.path, fileFolder);
  } else {
    return await saveLocally(file, uploadDir, fileFolder);
  }
};

// Exported async function for single file
exports.uploadFile = async (file, folder = "", schemaFolder = "", callback) => {
  try {
    const uploadResult = await handleFileUpload(file, folder, schemaFolder);
    if (callback) callback(null, uploadResult);
  } catch (error) {
    if (callback) callback(error);
  }
};

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../public/uploads");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${new Date().toISOString().split("T")[0]}-${uuidv4()}.${
      file.mimetype.split("/")[1]
    }`;
    cb(null, uniqueName);
  },
});

// Exported async function for multiple files
exports.uploadMultipleFiles = async (files, folderName) => {
  try {
    const uploadPromises = files.map(async (file) => {
      const file_name = `${
        new Date().toISOString().split("T")[0]
      }-${uuidv4()}.${file.mimetype.split("/")[1]}`;

      const file_full_url = `/public/uploads/${folderName}/${file_name}`;

      const file_path = path.join(
        __dirname,
        `../public/uploads/${folderName}`,
        file_name
      );

      // Ensure the directory exists
      await fs.promises.mkdir(path.dirname(file_path), { recursive: true });

      // Move the file using fs.rename
      await fs.promises.rename(file.path, file_path);

      return {
        file_name,
        file_full_url,
      };
    });

    return Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
};

// Convert URL to file system path
const urlToFilePath = (fileUrl) => {
  const parsedUrl = url.parse(fileUrl);
  return path.join(__dirname, "..", parsedUrl.pathname);
};

// Delete a file from the local server
exports.deleteLocalFile = async (fileFullUrl, callback) => {
  try {
    const filePath = urlToFilePath(fileFullUrl); // Convert URL to file path
    fs.unlink(filePath, (err) => {
      if (err) {
        if (callback) callback(err, false);
      } else {
        if (callback) callback(null, true);
      }
    });
  } catch (error) {
    if (callback) callback(error, false);
  }
};

// Delete a file from Cloudinary
exports.deleteCloudinaryFile = async (fileName, callback) => {
  try {
    const result = await cloudinary.uploader.destroy(fileName);
    if (result.result !== "ok") {
      if (callback)
        callback(new Error("Cloudinary file deletion failed"), false);
    } else {
      if (callback) callback(null, true);
    }
  } catch (error) {
    if (callback) callback(error, false);
  }
};

exports.fileUploadPromises = async (
  req,
  res,
  next,
  fieldsToUpload,
  FolderName
) => {
  const fileUploadPromises = [];

  // Function to handle file update with deletion of old file
  const handleFileUpload = (newFile, folder, fieldName) => {
    return new Promise(async (resolve, reject) => {
      // Directly upload the new file
      await this.uploadFile(newFile, folder, fieldName, (err, uploadResult) => {
        if (err) {
          reject(new ErrorHandler("File upload failed: " + err.message, 500));
        } else {
          resolve({
            file_name: uploadResult.file_name,
            file_full_url: uploadResult.file_full_url,
            fieldName: fieldName,
          });
        }
      });
    });
  };

  // Function to loop through each field and create upload promises
  const uploadingFile = (fieldsToUpload, folder) => {
    fieldsToUpload.forEach((field) => {
      if (req.files && req.files[field]) {
        // Handle the case where multiple files are uploaded for a field
        const newFile = req.files[field][0];
        fileUploadPromises.push(handleFileUpload(newFile, folder, field));
      }
    });
  };

  // Execute the upload function for the provided fields
  uploadingFile(fieldsToUpload, FolderName);

  // Wait for all file uploads to finish
  const uploadResults = await Promise.all(fileUploadPromises);

  // Assign uploaded files to req.body
  uploadResults.forEach((result) => {
    req.body[result.fieldName] = result.file_name;
    req.body[`${result.fieldName}_full_url`] = result.file_full_url;
  });

  return req.body; // Return the modified request body
};

exports.fileUpdatePromises = async (
  req,
  res,
  next,
  fieldsToUpload,
  FolderName,
  model
) => {
  const fileUploadPromises = [];

  // Function to handle file update with deletion of old file
  const handleFileUpdate = (
    newFile,
    folder,
    fieldName,
    existingFileName,
    existingFileUrl
  ) => {
    return new Promise(async (resolve, reject) => {
      const deleteCallback = (err) => {
        if (err) {
          return next(
            new ErrorHandler("File removal failed: " + err.message, 404)
          );
        } else {
          // Proceed with the new file upload after deletion
          this.uploadFile(newFile, folder, fieldName, (err, uploadResult) => {
            if (err) {
              return next(
                reject(
                  new ErrorHandler("File upload failed: " + err.message, 500)
                )
              );
            } else {
              resolve({
                file_name: uploadResult.file_name,
                file_full_url: uploadResult.file_full_url,
                fieldName: fieldName,
              });
            }
          });
        }
      };

      // If there's an existing file, delete it first, then upload the new file
      if (existingFileName) {
        if (process.env.CLOUDINARY_CLOUD_NAME) {
          this.deleteCloudinaryFile(existingFileName, deleteCallback);
        } else {
          this.deleteLocalFile(existingFileUrl, deleteCallback);
        }
      } else {
        // Directly upload the new file
        await this.uploadFile(
          newFile,
          folder,
          fieldName,
          (err, uploadResult) => {
            if (err) {
              reject(
                new ErrorHandler("File upload failed: " + err.message, 500)
              );
            } else {
              resolve({
                file_name: uploadResult.file_name,
                file_full_url: uploadResult.file_full_url,
                fieldName: fieldName,
              });
            }
          }
        );
      }
    });
  };

  // Function to loop through each field and create upload promises
  const uploadingFile = (fieldsToUpload, folder, model) => {
    fieldsToUpload.forEach((field) => {
      if (req.files && req.files[field]) {
        // Handle the case where multiple files are uploaded for a field
        const newFile = req.files[field][0];
        fileUploadPromises.push(
          handleFileUpdate(
            newFile,
            folder,
            field,
            model[field], // old file name (if any)
            model[`${field}_full_url`] // old file URL (if any)
          )
        );
      }
    });
  };

  // Execute the upload function for the provided fields
  uploadingFile(fieldsToUpload, FolderName, model);

  // Wait for all file uploads to finish
  const uploadResults = await Promise.all(fileUploadPromises);

  // Assign uploaded files to req.body
  uploadResults.forEach((result) => {
    req.body[result.fieldName] = result.file_name;
    req.body[`${result.fieldName}_full_url`] = result.file_full_url;
  });

  return req.body; // Return the modified request body
};

exports.filesUpdatePromises = async (
  req,
  res,
  next,
  fieldsToUpload,
  folderName
) => {
  const filesUploadPromises = [];

  // Iterate over each field to upload
  fieldsToUpload.forEach((field) => {
    if (req.files?.[field]) {
      const multipleFiles = this.uploadMultipleFiles(
        req.files[field],
        folderName
      );
      filesUploadPromises.push(multipleFiles);
    }
  });

  // Wait for all file uploads to complete
  const filesResults = await Promise.all(filesUploadPromises);

  // Attach uploaded files to the corresponding fields in req.body
  fieldsToUpload.forEach((field, index) => {
    if (Array.isArray(filesResults[index])) {
      // For single image fields (like 'image'), only use the first file
      if (field === "image") {
        const firstFile = filesResults[index][0];
        req.body[field] = firstFile.file_name;
        req.body[`${field}_full_url`] = firstFile.file_full_url;
      } else {
        // For multiple image fields (like 'images'), use the array of objects
        const newFiles = filesResults[index].map((r) => ({
          file: r.file_name,
          file_full_url: r.file_full_url,
        }));

        // Handle existing files in req.body
        let existingFiles = [];
        if (req.body[field]) {
          try {
            // If it's a string (from form-data), try to parse it
            existingFiles =
              typeof req.body[field] === "string"
                ? JSON.parse(req.body[field])
                : req.body[field];
          } catch (error) {
            console.error(`Error parsing existing files for ${field}:`, error);
            existingFiles = [];
          }
        }

        // Ensure existingFiles is an array
        if (!Array.isArray(existingFiles)) {
          existingFiles = [];
        }

        // Combine existing and new files
        req.body[field] = [...existingFiles, ...newFiles];
      }
    }
  });

  return req.body;
};

// New function specifically for handling file updates
exports.filesUpdateWithExisting = async (
  req,
  fieldsToUpload,
  folderName,
  existingData
) => {
  const filesUploadPromises = [];

  // Iterate over each field to upload
  fieldsToUpload.forEach((field) => {
    if (req.files?.[field]) {
      const multipleFiles = this.uploadMultipleFiles(
        req.files[field],
        folderName
      );
      filesUploadPromises.push(multipleFiles);
    }
  });

  // Wait for all file uploads to complete
  const filesResults = await Promise.all(filesUploadPromises);

  // Attach uploaded files to the corresponding fields in req.body
  fieldsToUpload.forEach((field, index) => {
    if (Array.isArray(filesResults[index])) {
      // For single image fields (like 'image'), only use the first file
      if (field === "image") {
        const firstFile = filesResults[index][0];
        req.body[field] = firstFile.file_name;
        req.body[`${field}_full_url`] = firstFile.file_full_url;
      } else {
        // For multiple image fields (like 'images'), use the array of objects
        const newFiles = filesResults[index].map((r) => ({
          file: r.file_name,
          file_full_url: r.file_full_url,
        }));

        // Get existing files from the database
        let existingFiles = existingData[field] || [];

        // If existingFiles is a string, try to parse it
        if (typeof existingFiles === "string") {
          try {
            existingFiles = JSON.parse(existingFiles);
          } catch (error) {
            console.error(`Error parsing existing files for ${field}:`, error);
            existingFiles = [];
          }
        }

        // Ensure existingFiles is an array
        if (!Array.isArray(existingFiles)) {
          existingFiles = [];
        }

        // Combine existing and new files
        req.body[field] = [...existingFiles, ...newFiles];
      }
    }
  });

  return req.body;
};

// Delete multiple files by their URLs
exports.deleteFilesByUrls = async (files) => {
  try {
    const deletePromises = files.map(async (file) => {
      if (typeof file === "string") {
        // If file is a string (URL), delete it directly
        return this.deleteLocalFile(file);
      } else if (file.file_full_url) {
        // If file is an object with file_full_url
        return this.deleteLocalFile(file.file_full_url);
      }
    });

    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error("Error deleting files:", error);
    throw error;
  }
};

// Delete a single file by its URL
exports.deleteFileByUrl = async (fileUrl) => {
  try {
    if (!fileUrl) {
      throw new Error("File URL is required");
    }

    // Convert URL to file system path
    const filePath = urlToFilePath(fileUrl);

    // Delete the file
    await fs.promises.unlink(filePath);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

// Delete files based on field names
exports.deleteFilesByFields = async (data, fieldsToDelete) => {
  try {
    const filesToDelete = [];

    fieldsToDelete.forEach((field) => {
      // Handle single file fields (like 'image')
      if (typeof data[field] === "string" && data[`${field}_full_url`]) {
        filesToDelete.push(data[`${field}_full_url`]);
      }

      // Handle array of files (like 'images')
      if (Array.isArray(data[field])) {
        data[field].forEach((file) => {
          if (file.file_full_url) {
            filesToDelete.push(file.file_full_url);
          }
        });
      }
    });

    // Delete all collected files
    if (filesToDelete.length > 0) {
      await this.deleteFilesByUrls(filesToDelete);
    }

    return true;
  } catch (error) {
    console.error("Error deleting files by fields:", error);
    throw error;
  }
};
