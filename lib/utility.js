module.exports = {
  flattenHash: function(obj){
    var array = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)){
        obj[key].forEach( function(entry){
          array.push(entry);
        });
      }
    }
    return array;
  },
  walkSync: function(dir, filelist) {
    var fs = fs || require('fs'),
    files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
      current_dir = dir + '/' + file
      if (fs.statSync(current_dir).isDirectory()) {
        filelist.push(current_dir)
        filelist = module.exports.walkSync(current_dir, filelist);
      }
    });
    return filelist;
  },

  /*
  grammarType(grammar_name) {
    if (grammar_name == "C"){
      return "C";
    } else if (grammar_name.indexOf("C++") != -1) {
      return "C++";
    } else {
      return undefined;
    }
  },
  */

  grammarType(grammar_name) {
    if (grammar_name == "Particle"){
      return "Particle";
    } else {
      return undefined;
    }
  },


  getValidEditor: function(editor){
    if (!editor) return undefined;
    grammar = editor.getGrammar().name;
    if (!module.exports.grammarType(grammar)) {
      return undefined;
    }
    return editor;
  },
  getCwd: function() {
    var cwd = atom.project.getPaths()[0]
    if (!cwd) {
      editor = atom.workspace.getActivePaneItem();
      if (editor) {
        temp_file = editor.buffer.file;
        if (temp_file) {
          cwd = temp_file.getParent().getPath();
        }
      }
    }
    if (cwd) {
      return cwd
    } else {
      return ""
    }
  },
  getFileDir: function() {
    var filedir;
    editor = atom.workspace.getActivePaneItem();
    if (editor) {
      temp_file = editor.buffer.file;
      if (temp_file) {
        filedir = temp_file.getParent().getPath();
      }
    }
    return filedir;
  },
  removeOutputArgument: function(argument_list){
    output_list = []
    skip_flag = false
    argument_list.forEach(function(item){
      if (item == "-o"){
        skip_flag = true
      } else if (skip_flag) {
        skip_flag = false
      } else {
        output_list.push(item)
      }
    })
    return output_list

  },
  splitStringTrim: function(str, delim, expandPaths, itemPrefix){
    var pathm = require("path");
    output = [];
    if (!str) {
      return output;
    }
    str = str.trim();
    if (str.length == 0){
      return output;
    }
    temp_arr = require("split-string")(str, delim);
    temp_arr.forEach(function(item){
      item = item.trim();
      if (item.length > 0){
        if (item.substring(0, 1) == "." && expandPaths) {
          item = pathm.join(cwd, item);
        }
        else if (item.substring(0, 1) == "-" && expandPaths) {
          item = item.substring(1, item.length);
          item = pathm.join(module.exports.getFileDir(), item);
        }
        if (item.substring(item.length-2, item.length) == '/*' && expandPaths) {
          item = item.substring(0, item.length-2)
          var list = []
          dir_list = module.exports.walkSync(item, list)
          console.log("Expanding directories")
          dir_list.forEach(function(item){
            item = itemPrefix + item
            output.push(item)
          })
        }
        item = itemPrefix + item;
        output.push(item)
      }
    });
    return output;
  },

  buildCommand: function(activeEditor, file) {
    config = require("./config");
    var path = require('path');
    var fs = require('fs')
    settings = config.settings();

    if (atom.config.get("linter-gcc.gccDebug")){
      console.log("linter-gcc config: " + JSON.stringify(settings));
    }

    args = [];

    cwd = atom.project.getPaths()[0]

    var buildParameters = require(cwd.concat("/.linter-po.json"))

    args.push(buildParameters.platform)
    args.push("build")
    args.push(cwd)

      command = "po"

      // Cross-platform $PATH expansion
      command = require("shelljs").which(command);

      if (!command) {
        atom.notifications.addError(
          "linter-gcc: Executable not found", {
            detail: "\"" + settings.execPath + "\" not found"
          }
        );
        console.log("linter-gcc: \"" + settings.execPath + "\" not found");
        return;
      }

    return {binary: command, args: args};
  }
}
