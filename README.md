# Whitigol's FiveM TypeScript Boilerplate

## Features

- Fast build times
- Separate client and server builds
- Obfuscation support
- Easy configuration
- ... and more!

## Requirements

- Node.js
- Yarn, NPM, PNPM, or Bun

## Installation

Installation has been made easy with the use of our CLI tool. Simply run one of the following commands to install our FiveM TypeScript Boilerplate.

**Note**: PNPM is the recommended package manager for this project, as it has the best performance and disk space usage. This has not been tested with other package managers, so use them at your own risk.

```bash
# NPM
npx create-fivem-ts@latest
```

```bash
# Yarn
yarn create fivem-ts@latest
```

```bash
# PNPM
pnpm create fivem-ts@latest
```

```bash
# Bun
bun create fivem-ts@latest
```

## Configuration

The configuration for the FiveM TypeScript Boilerplate is located in the `build-config.json5` file. Not to be confused with the `config.json` file, which is meant for runtime configuration. The default configuration of the `build-config.json5` file is shown below.

```json5
{
    obfuscate: false, // Enable obfuscation for the built files
    minify: true, // Enable minification for the built files (Recommended)

    output: "./output", // The directory where the built files will be placed (absolute or relative)

    /* 
        Below are the default files/folders that are copied to the output directory. "{OUT}" is replaced with the output directory.
        **WARNING**: If "{OUT}" is not present in the "to" field, this WILL BREAK THINGS. Be careful when editing these.
        If something below does not exist, it will not be copied.
        You can add/remove files/folders as you wish, but make sure it follows the format below.
    */

    copy: [
        { from: "fxmanifest.lua", to: "{OUT}/" },
        { from: "config.json", to: "{OUT}/" },
        { from: "dist/**/*", to: "{OUT}/dist/" },
        { from: "stream/**/*", to: "{OUT}/stream/" },
        { from: "nui/**/*", to: "{OUT}/nui/" },
        { from: "data/**/*", to: "{OUT}/data/" },
    ],
}
```

## Usage

The FiveM TypeScript Boilerplate comes with a CLI tool to make your life easier. The CLI tool is used to build your client and server code, and to start your server. The commands are shown below.

```bash
# Build the client and server code
[PACKAGE_MANAGER] run build
```

```bash
# Run in development mode (watch for changes)
[PACKAGE_MANAGER] run dev
```

## Adding UI

Our boilerplate comes with UI support out of the box if chosen during installation. But, if you didn't choose UI support during installation, you can add it later easily. Simply run the following command to add UI support to your project.

```bash
# Add UI support to your project
[PACKAGE_MANAGER] run add-ui
```

---

Made with ❤️ & TypeScript by Whitigol
