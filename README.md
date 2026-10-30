# SmartIsland website

A lightweight, static landing page for the [SmartIsland Android app](https://github.com/agupta07505/SmartIsland).

## Run locally

From this directory, start a static server:

```sh
python3 -m http.server 4173
```

Open `http://localhost:4173` in your browser. No build step or package installation is required. The site can also be deployed to a static host such as Vercel.

## Project structure

```text
index.html              Page content and metadata
assets/
  css/styles.css        Responsive styling and animation
  js/main.js            Navigation and island interactions
  images/               App logo, wallpaper, and sample album artwork
  fonts/                Lora fonts and their Open Font License
```

## Updating the APK

Download links are deliberately pinned to the signed GitHub release APK for **v7.6.0** (Android version code **9**). When publishing a newer version, update the release URL and the visible version details in `index.html` together. Downloads go directly to the release asset rather than a GitHub page.

## Asset notes

The app logo and Lora font files come from the [SmartIsland repository](https://github.com/agupta07505/SmartIsland). Lora is distributed under the license in `assets/fonts/OFL.txt`. The sample music artwork is from [Last.fm](https://www.last.fm/music/Sunanda+Sharma/_/Mummy+Nu+Pasand+(From+%22Jai+Mummy+Di%22)); check usage rights before commercial publication. The wallpaper is AI-generated. SmartIsland itself is licensed under GNU GPLv3; see its repository for the applicable license and project information.
