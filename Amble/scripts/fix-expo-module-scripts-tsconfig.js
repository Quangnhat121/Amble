const fs = require("fs");
const path = require("path");

const target = path.join(
  __dirname,
  "..",
  "node_modules",
  "expo-module-scripts",
  "tsconfig.base",
);
const packageJsonPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "expo-module-scripts",
  "package.json",
);
const linearGradientTsconfigPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "expo-linear-gradient",
  "tsconfig.json",
);

const content = JSON.stringify(
  {
    extends: "./tsconfig.base.json",
  },
  null,
  2,
);

try {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${content}\n`, "utf8");
  console.log("[fix-expo-module-scripts-tsconfig] shim created:", target);
} catch (error) {
  console.warn("[fix-expo-module-scripts-tsconfig] skipped:", error.message);
}

try {
  const raw = fs.readFileSync(packageJsonPath, "utf8");
  const pkg = JSON.parse(raw);
  pkg.exports = pkg.exports || {};

  if (!pkg.exports["./tsconfig.base"]) {
    pkg.exports["./tsconfig.base"] = "./tsconfig.base.json";
    fs.writeFileSync(
      packageJsonPath,
      `${JSON.stringify(pkg, null, 2)}\n`,
      "utf8",
    );
    console.log(
      "[fix-expo-module-scripts-tsconfig] package exports patched: ./tsconfig.base",
    );
  }
} catch (error) {
  console.warn(
    "[fix-expo-module-scripts-tsconfig] package patch skipped:",
    error.message,
  );
}

try {
  if (fs.existsSync(linearGradientTsconfigPath)) {
    const raw = fs.readFileSync(linearGradientTsconfigPath, "utf8");
    const next = raw.replace(
      '"extends": "expo-module-scripts/tsconfig.base",',
      '"extends": "expo-module-scripts/tsconfig.base.json",',
    );

    if (next !== raw) {
      fs.writeFileSync(linearGradientTsconfigPath, next, "utf8");
      console.log(
        "[fix-expo-module-scripts-tsconfig] patched expo-linear-gradient tsconfig extends",
      );
    }
  }
} catch (error) {
  console.warn(
    "[fix-expo-module-scripts-tsconfig] linear-gradient patch skipped:",
    error.message,
  );
}
