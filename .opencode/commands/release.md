---
description: Create a new release — build, tag, and push.
---

# /release

Creates a new release by building the project, creating a git tag, and pushing.

## Usage

```
/release <version> [message]
```

## Process

1. Switch to the `my-react-app/` directory
2. Run `npm run build` to verify the build
3. Create a git tag with the version number
4. Push to origin
5. Create a GitHub Release via `gh release create`
