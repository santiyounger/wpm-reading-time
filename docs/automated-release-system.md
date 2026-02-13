# Automated Release System for Obsidian Plugins

## Overview

This guide explains how to implement an automated GitHub Actions workflow that releases your Obsidian plugin whenever you update the version number in `manifest.json`. This system eliminates the need to manually create tags and releases.

## How It Works

### Basic Flow

1. You update the `version` field in `manifest.json` (e.g., from `1.1.4` to `1.1.5`)
2. You commit and push the change to the `master` branch
3. GitHub Actions automatically:
   - Reads the new version from `manifest.json`
   - Compares it with the latest GitHub release
   - If the version is newer, it:
     - Creates a git tag with the version number
     - Builds the plugin (`npm ci` → `npm run build`)
     - Generates release notes from recent commits
     - Creates a GitHub release with the built files attached

### Key Benefits

- **No manual tagging**: The workflow creates tags automatically
- **Version-driven**: The single source of truth is `manifest.json`
- **Automatic release notes**: Generated from commit history
- **Non-draft releases**: Published immediately (not drafts)
- **Safe**: Only releases when the manifest version is newer than the latest release

---

## Implementation Guide

### Step 1: Create the Workflow File

Create the directory structure and workflow file:

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/release.yml` with the following content:

```yaml
name: Tag, build and release on manifest version change

on:
  push:
    branches: [ master ]

jobs:
  tag-build-release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Read version from manifest.json
        id: ver
        run: |
          VERSION=$(jq -r '.version' manifest.json)
          NAME=$(jq -r '.name' manifest.json)
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          echo "name=$NAME" >> $GITHUB_OUTPUT

      - name: Get latest GitHub release tag
        id: latest
        uses: actions/github-script@v7
        with:
          result-encoding: string
          script: |
            const { owner, repo } = context.repo;
            try {
              const rel = await github.rest.repos.getLatestRelease({ owner, repo });
              return rel.data.tag_name || '';
            } catch (e) {
              if (e.status === 404) {
                return '';
              }
              throw e;
            }

      - name: Compare manifest version with latest release
        id: vercmp
        run: |
          LATEST='${{ steps.latest.outputs.result }}'
          CUR='${{ steps.ver.outputs.version }}'
          parse_semver() {
            IFS='.' read -r MAJ MIN PAT <<< "$1"
            echo "${MAJ:-0} ${MIN:-0} ${PAT:-0}"
          }
          cmp_versions() {
            # returns 0 if $1 > $2, else 1
            read -r A1 A2 A3 <<< "$(parse_semver "$1")"
            read -r B1 B2 B3 <<< "$(parse_semver "$2")"
            if [ "$A1" -gt "$B1" ]; then return 0; fi
            if [ "$A1" -lt "$B1" ]; then return 1; fi
            if [ "$A2" -gt "$B2" ]; then return 0; fi
            if [ "$A2" -lt "$B2" ]; then return 1; fi
            if [ "$A3" -gt "$B3" ]; then return 0; fi
            return 1
          }
          if [ -z "$LATEST" ]; then
            echo "should_release=true" >> $GITHUB_OUTPUT
          else
            if cmp_versions "$CUR" "$LATEST"; then
              echo "should_release=true" >> $GITHUB_OUTPUT
            else
              echo "should_release=false" >> $GITHUB_OUTPUT
            fi
          fi

      - name: Determine if tag already exists
        id: tag_check
        run: |
          if git rev-parse -q --verify "refs/tags/${{ steps.ver.outputs.version }}"; then
            echo "exists=true" >> $GITHUB_OUTPUT
          else
            echo "exists=false" >> $GITHUB_OUTPUT
          fi

      - name: Generate release notes body
        if: steps.vercmp.outputs.should_release == 'true'
        id: notes
        uses: actions/github-script@v7
        with:
          result-encoding: string
          script: |
            const { owner, repo } = context.repo;
            const current = process.env.CURRENT;
            const previous = process.env.PREVIOUS;
            let notes = '';
            try {
              const res = await github.rest.repos.generateReleaseNotes({
                owner, repo,
                tag_name: current,
                previous_tag_name: previous || undefined,
              });
              notes = res.data.body || '';
              // Remove any default "Full Changelog:" lines GitHub may include
              notes = notes
                .split('\n')
                .filter(line => !/^\*\*Full Changelog\*\*:/i.test(line.trim()))
                .join('\n')
                .trim();
            } catch (e) {
              // Fallback to empty notes
              notes = '';
            }
            if (previous) {
              const url = `https://github.com/${owner}/${repo}/compare/${previous}...${current}?diff=split&w=1`;
              notes += `${notes ? '\n\n' : ''}[Here's a List of What Has Changed Since the Last Version of This Plugin](${url})`;
            }
            return notes;
        env:
          CURRENT: ${{ steps.ver.outputs.version }}
          PREVIOUS: ${{ steps.latest.outputs.result }}

      - name: Create and push tag
        if: steps.tag_check.outputs.exists == 'false' && steps.vercmp.outputs.should_release == 'true'
        run: |
          git tag ${{ steps.ver.outputs.version }}
          git push origin ${{ steps.ver.outputs.version }}

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build plugin
        if: steps.vercmp.outputs.should_release == 'true'
        run: npm run build

      - name: Prepare release artifacts
        if: steps.vercmp.outputs.should_release == 'true'
        id: artifacts
        run: |
          # Ensure required files exist
          test -f main.js
          test -f manifest.json
          # styles.css is optional
          if [ -f styles.css ]; then echo "has_css=true" >> $GITHUB_OUTPUT; else echo "has_css=false" >> $GITHUB_OUTPUT; fi

      - name: Create GitHub release and upload assets
        if: steps.vercmp.outputs.should_release == 'true'
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ steps.ver.outputs.version }}
          name: YourPluginName ${{ steps.ver.outputs.version }}
          draft: false
          prerelease: false
          body: ${{ steps.notes.outputs.result }}
          files: |
            main.js
            manifest.json
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload styles.css if exists
        if: steps.vercmp.outputs.should_release == 'true' && steps.artifacts.outputs.has_css == 'true'
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ steps.ver.outputs.version }}
          files: styles.css
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Step 2: Customize for Your Plugin

Update the release name on line 155:

```yaml
name: YourPluginName ${{ steps.ver.outputs.version }}
```

Change `YourPluginName` to match your plugin's display name.

### Step 3: Configure Repository Permissions

1. Go to your GitHub repository
2. Click **Settings** tab
3. In the left sidebar, expand **Actions**
4. Click **General**
5. Scroll to **Workflow permissions**
6. Select **Read and write permissions**
7. Click **Save**

This allows the workflow to create tags and releases.

### Step 4: Commit and Push

```bash
git add .github/workflows/release.yml
git commit -m "Add automated release workflow"
git push origin master
```

### Step 5: Test the System

1. Update the version in `manifest.json`:
   ```json
   {
     "version": "1.0.1"
   }
   ```

2. Commit and push:
   ```bash
   git add manifest.json
   git commit -m "Bump version to 1.0.1"
   git push origin master
   ```

3. Monitor the workflow:
   - Go to your repository on GitHub
   - Click the **Actions** tab
   - Watch the workflow run
   - After completion, check the **Releases** section

---

## Understanding the Workflow Steps

### 1. Checkout Code
```yaml
- name: Checkout
  uses: actions/checkout@v4
  with:
    fetch-depth: 0
```
Fetches the entire repository history (`fetch-depth: 0`) so the workflow can access all tags.

### 2. Read Version from manifest.json
```yaml
- name: Read version from manifest.json
  id: ver
  run: |
    VERSION=$(jq -r '.version' manifest.json)
    NAME=$(jq -r '.name' manifest.json)
    echo "version=$VERSION" >> $GITHUB_OUTPUT
    echo "name=$NAME" >> $GITHUB_OUTPUT
```
Extracts the version number using `jq` (JSON processor) and stores it for later steps.

### 3. Get Latest Release
```yaml
- name: Get latest GitHub release tag
  id: latest
  uses: actions/github-script@v7
```
Queries GitHub API to find the most recent release. Returns empty string if no releases exist.

### 4. Version Comparison
```yaml
- name: Compare manifest version with latest release
  id: vercmp
```
Uses semantic versioning comparison to determine if the manifest version is newer. Sets `should_release=true` if:
- No previous releases exist, OR
- The manifest version is greater than the latest release

### 5. Tag Check
```yaml
- name: Determine if tag already exists
  id: tag_check
```
Prevents errors by checking if a tag with this version already exists.

### 6. Generate Release Notes
```yaml
- name: Generate release notes body
  id: notes
  uses: actions/github-script@v7
```
Automatically generates release notes from commit messages between releases and adds a comparison link.

### 7. Create and Push Tag
```yaml
- name: Create and push tag
  if: steps.tag_check.outputs.exists == 'false' && steps.vercmp.outputs.should_release == 'true'
```
Creates the version tag and pushes it to GitHub, but only if it doesn't already exist and a release is needed.

### 8. Build Plugin
```yaml
- name: Setup Node
- name: Install dependencies
- name: Build plugin
```
Sets up Node.js, installs dependencies with `npm ci`, and builds the plugin using your `npm run build` script.

### 9. Create Release
```yaml
- name: Create GitHub release and upload assets
  uses: softprops/action-gh-release@v2
```
Creates a published (non-draft) release and uploads `main.js`, `manifest.json`, and optionally `styles.css`.

---

## Key Differences from Manual Workflow

### Traditional Manual Approach
1. Manually update `manifest.json`
2. Manually create and push a git tag
3. Wait for workflow to build
4. Manually edit and publish the draft release

### This Automated Approach
1. Update `manifest.json` only
2. Push to master
3. Everything else happens automatically

---

## Conditional Logic Explained

The workflow uses several conditional checks to ensure safe operation:

### When Does a Release Happen?

A release is created ONLY when ALL of these are true:

1. **Version is newer**: `steps.vercmp.outputs.should_release == 'true'`
   - The manifest.json version is higher than the latest GitHub release

2. **Tag doesn't exist**: `steps.tag_check.outputs.exists == 'false'`
   - Prevents duplicate tag errors

### Skipping Unnecessary Work

Steps that build or release are skipped if no release is needed. For example, if you push unrelated changes without bumping the version, the workflow runs but doesn't create a release.

---

## Required Files

Your repository must have:

1. **manifest.json** - Must contain a `version` field
2. **package.json** - Must have a `build` script
3. **Build output** - `npm run build` must produce `main.js`
4. **styles.css** - Optional, auto-detected

---

## Troubleshooting

### Workflow Fails with "Permission denied"

**Solution**: Enable "Read and write permissions" in repository settings (see Step 3).

### Release Not Created After Push

**Possible causes**:
1. Version in manifest.json wasn't actually increased
2. A release with that version already exists
3. The tag already exists

**Debug**: Check the Actions tab to see which step failed and why.

### Build Fails

**Solution**: Ensure your `npm run build` script works locally:
```bash
npm ci
npm run build
```

### Missing styles.css in Release

This is normal if your plugin doesn't have a `styles.css` file. The workflow handles this gracefully.

---

## Maintenance and Updates

### Changing Node Version

Update line 129:
```yaml
node-version: '18'  # Change to desired version
```

### Adding Additional Files to Release

Update the files section around line 159:
```yaml
files: |
  main.js
  manifest.json
  README.md  # Add additional files
```

### Changing to Draft Releases

Change line 156:
```yaml
draft: true  # Change from false to true
```

---

## Version Numbering Best Practices

This workflow uses **semantic versioning** (semver):

- **Major**: `1.0.0` → `2.0.0` (breaking changes)
- **Minor**: `1.0.0` → `1.1.0` (new features, backwards compatible)
- **Patch**: `1.0.0` → `1.0.1` (bug fixes)

Always increment only one part:
- ✅ `1.2.3` → `1.2.4` (patch bump)
- ✅ `1.2.3` → `1.3.0` (minor bump, reset patch to 0)
- ✅ `1.2.3` → `2.0.0` (major bump, reset minor and patch to 0)
- ❌ `1.2.3` → `1.2.5` (skipping versions)

---

## Alternative: Tag-Based Approach

If you prefer the traditional approach where you manually create tags:

<details>
<summary>Click to see alternative workflow</summary>

```yaml
name: Release Obsidian plugin

on:
  push:
    tags:
      - "*"

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18.x"

      - name: Build plugin
        run: |
          npm install
          npm run build

      - name: Create release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          tag="${GITHUB_REF#refs/tags/}"

          gh release create "$tag" \
            --title="$tag" \
            --draft \
            main.js manifest.json styles.css
```

Then release manually:
```bash
git tag -a 1.0.1 -m "1.0.1"
git push origin 1.0.1
```

</details>

---

## Summary

This automated workflow provides a streamlined release process where:

1. The version in `manifest.json` is the single source of truth
2. Pushing version changes automatically creates releases
3. Tags, builds, and release notes are generated automatically
4. No manual steps are required after updating the version

This saves time, reduces errors, and ensures consistent releases for your Obsidian plugin.
