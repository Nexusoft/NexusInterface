//////////////////////////////////////////////////////
//
// Configuration Manager
//
//////////////////////////////////////////////////////

// External
import fs from 'fs';
import path from 'path';
import { walletDataDir } from 'consts/paths';
/**
 *  Configuration Class
 *
 **/
const configuration = {
  /**
   * Check To see if this file excists in the App Data Directory
   *
   * @param {string} filename File Name plus extention
   * @returns {boolean} If exsits or not
   */
  Exists(filename) {
    try {
      fs.accessSync(path.join(walletDataDir, filename));
      return true;
    } catch (err) {
      return false;
    }
  },

  /**
   * Reads a file then returns the contents, has a catch but use Exists method first
   *
   * @param {string} filename File Name plus extention
   * @returns {object}
   */
  Read(filename) {
    try {
      return fs.readFileSync(path.join(walletDataDir, filename));
    } catch (err) {
      console.log('Error reading file: ' + filename + ' => ' + err);

      return undefined;
    }
  },

  /**
   * Read a json configuration file and return a json object
   *
   * @param {string} filename File name plus extention
   * @returns {object}
   */
  ReadJson(filename) {
    // TODO: Is utf-8 required here?
    var json = configuration.Read(filename);
    if (!json) return {};
    return JSON.parse(json);
  },

  /**
   * Update a configuration file with provided content
   *
   * @param {string} filename File name plus extention
   * @param {object} content Object to write
   * @returns {boolean} Did write succeed
   */
  Write(filename, content) {
    try {
      fs.writeFileSync(path.join(walletDataDir, filename), content);

      return true;
    } catch (err) {
      console.log('Error writing file: ' + filename + ' => ' + err);

      return false;
    }
  },

  /**
   * Update a json configuration file with provided json object
   *
   * @param {string} filename File name
   * @param {json} json Json object to write
   * @returns  {boolean} Did write succeed
   */
  WriteJson(filename, json) {
    // TODO: Is utf-8 required here?
    return configuration.Write(filename, JSON.stringify(json, null, 2)); // pretty print the json so it is human readable
  },

  /**
   * Delete the configuration file
   *
   * @param {string} filename File Name
   * @returns {boolean} Did succeed
   */
  Delete(filename) {
    try {
      fs.unlink(path.join(walletDataDir, filename));

      return true;
    } catch (err) {
      console.log('Error deleting file: ' + filename + ' => ' + err);

      return false;
    }
  },

  /**
   * Rename a configuration file
   *
   * @param {string} oldFilename Old file name
   * @param {string} newFilename New file name
   * @returns {boolean} did succeed
   */
  Rename(oldFilename, newFilename) {
    try {
      fs.renameSync(
        path.join(walletDataDir, oldFilename),
        path.join(walletDataDir, newFilename)
      );

      return true;
    } catch (err) {
      console.log('Error renaming file: ' + filename + ' => ' + err);

      return false;
    }
  },
};

export default configuration;
