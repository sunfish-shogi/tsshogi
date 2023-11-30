/* eslint-disable no-console */
import fs from "fs";

const dir = process.argv[2];
const ext = process.argv[3];

if (!dir || !ext) {
  console.error("Usage: node fix-dist-extension.mjs <dir> <ext>");
  process.exit(1);
}

if (!ext.startsWith(".")) {
  console.error("Extension must start with a dot");
  process.exit(1);
}

function update(dir, ext) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const path = `${dir}/${file}`;
    if (fs.statSync(path).isDirectory()) {
      update(path, ext);
    } else if (file.endsWith(".js")) {
      const data = fs.readFileSync(path, "utf8");
      switch (ext) {
        case ".mjs":
          fs.writeFileSync(
            path,
            data.replace(/(^|\n)(import|export) ([^"]+) "\.\/([^"]+)";/g, '$1$2 $3 "./$4.mjs";'),
          );
          break;
        case ".cjs":
          fs.writeFileSync(
            path,
            data.replace(/(^|[^A-Za-z0-9_])require\("\.\/([^"]*)"\)/g, `$1require("./$2${ext}")`),
          );
          break;
      }
      fs.renameSync(path, `${path.substring(0, path.length - 3)}${ext}`);
    }
  }
}

update(dir, ext);
