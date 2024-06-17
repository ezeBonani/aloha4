const context = { root: {} };
var currentDir = "root";

process.stdin.resume();
process.stdin.setEncoding("ascii");

var input = "";

process.stdin.on("data", function (chunk) {
  input += chunk;
});

process.stdin.on("end", function () {
  // now we can read/parse input
  const parsedInput = input.split(/\r?\n/); //parseo input

  for (let i = 0; i < parsedInput.length; i++) {
    const [commandName, ...args] = parsedInput[i].split(" ");
    const factory = commandFactory();
    const command = factory.createCommand(commandName, args);
    if (command) {
      command();
    }
  }
});

// Fábrica de comandos
function commandFactory() {
  return {
    createCommand: (commandName, args) => {
      switch (commandName) {
        case "pwd":
          return pwdCommand(args);
        case "touch":
          return touchCommand(args);
        case "mkdir":
          return mkdirCommand(args);
        case "cd":
          return cdCommand(args);
        case "ls":
          return lsCommand(args);
        case "quit":
          return quitCommand();
        default:
          process.stdout.write(`Command "${commandName}" not found.`);
          return null;
      }
    },
  };
}

// Comandos
// comando pwd
function pwdCommand(args) {
  if (args.length > 0) {
    process.stdout.write("Invalid Command error\n");
    return;
  }
  return () => {
    process.stdout.write("/" + currentDir);
  };
}

//comando touch
function touchCommand(args) {
  if (args.length > 1) {
    process.stdout.write("Invalid Command error\n");
    return;
  }
  const filename = args[0];
  if (filename.length > 100) {
    process.stdout.write("Invalid File or Folder Name\n");
    return;
  }
  const { currentContext } = getCurrentContext();
  return () => {
    if (filename.length > 100) {
      process.stdout.write("Invalid File or Folder Name\n");
      return;
    }
    currentContext[filename] = { type: "file" };
  };
}

//comando mkdir
function mkdirCommand(args) {
  if (args.length > 1) {
    process.stdout.write("Invalid Command error\n");
    return;
  }
  const folderName = args[0];
  if (folderName.length > 100) {
    process.stdout.write("Invalid File or Folder Name\n");
    return;
  }
  const { currentContext } = getCurrentContext();
  return () => {
    currentContext[folderName] = {};
  };
}

//comando ls
function lsCommand(args) {
  if (args.length > 1) {
    process.stdout.write("Invalid Command error\n");
    return;
  }
  const { currentContext } = getCurrentContext();
  return () => {
    switch (args[0]) {
      case "-r": {
        process.stdout.write("/" + currentDir + "\n");
        listRecursive(currentContext);
      }
      case undefined: {
        Object.keys(currentContext).forEach((key) => {
          process.stdout.write(key + "\n");
        });
        break;
      }
      default: {
        process.stdout.write("Unrecognized command error\n");
      }
    }
  };
}

//comando cd
function cdCommand(args) {
  if (args.length > 1) {
    process.stdout.write("Invalid Command error\n");
    return;
  }
  const { currentDirArray, currentContext } = getCurrentContext();
  return () => {
    switch (args[0]) {
      case "..": {
        if (currentDirArray.length > 1) {
          currentDir = currentDirArray
            .slice(0, currentDirArray.length - 1)
            .join("/");
        } else {
          return;
        }
        break;
      }
      default: {
        if (args[0].length > 100) {
          process.stdout.write("Invalid File or Folder Name\n");
          return;
        }

        if (currentContext[args]) {
          currentDir = currentDir + "/" + args;
        } else {
          process.stdout.write(`Folder "${args}" does not exist!\n`);
        }
      }
    }
  };
}

//comando quit
function quitCommand() {
  return () => {
    process.exit(0);
  };
}

//funciones auxiliares

function getCurrentContext() {
  const currentDirArray = currentDir.split("/");
  let currentContext = context;
  currentDirArray.forEach((dir) => {
    currentContext = currentContext[dir];
  });
  return { currentContext, currentDirArray };
}

// lista -r recursividad del currentContext
function listRecursive(currentContext) {
  for (let key in currentContext) {
    if (typeof currentContext[key] === "object") {
      Object.keys(currentContext[key]).forEach((key) => {
        if (key !== "type") {
          console.log(key);
        }
      });
      listRecursive(currentContext[key]);
    }
  }
}
