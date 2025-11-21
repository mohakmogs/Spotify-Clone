console.log("Spotify Clone (adapted for GitHub Pages / relative paths)");

let currentsong = new Audio();
let currentSongIndex = 0;
let songs = [];
let currfolder = "";

// ===== Helpers =====
function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

// Function to add CSS for player background animation
function addPlayerAnimationCSS() {
  const cssCode = `
    .player {
      background: linear-gradient(90deg, #ff7a7ad0, #7a9bffd0, #b4ff7ad0);
      background-size: 300% 100%;
      animation: moveBg 10s linear infinite;
    }
    .time {
      color: black;
    }
    @keyframes moveBg {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;
  if (document.getElementById("player-animation-style")) return;
  const style = document.createElement("style");
  style.id = "player-animation-style";
  style.textContent = cssCode;
  document.head.appendChild(style);
}

function removePlayerAnimationCSS() {
  const styleTag = document.getElementById("player-animation-style");
  if (styleTag) styleTag.remove();
}

function updateMainTitle(track) {
  if (!track) return;
  let name = track.split(".mp3")[0];
  name = name.replace(/%20/g, " ").replace(/_/g, " ");
  name = name.replace(/^\/+/, "");
  const titleDiv = document.querySelector('.title');
  if (titleDiv) titleDiv.textContent = name;
}

function updateAllPlayButtons() {
  document.querySelectorAll('.play-lib').forEach((b, idx) => {
    if (idx === currentSongIndex && !currentsong.paused) {
      b.innerHTML = `<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>`;
    } else {
      b.innerHTML = `<svg viewBox="0 0 24 24"><polygon points="8,5 20,12 8,19"></polygon></svg>`;
    }
  });
}

function updateMainPlayButton(playBtn) {
  if (!playBtn) return;
  if (!currentsong.paused) {
    playBtn.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>`;
  } else {
    playBtn.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24"><polygon points="8,5 20,12 8,19"></polygon></svg>`;
  }
}

// ===== Loading songs (robust for GitHub Pages) =====
// folder should be like "songs/myAlbum" (no leading slash)
async function getSongs(folder) {
  currfolder = folder;
  songs = [];

  // 1) Try to read an info.json inside the folder which may contain track list:
  //    expected format: { "Tracks": ["01 - Song.mp3", "02 - Another.mp3"], ... }
  try {
    const infoResp = await fetch(`./${folder}/info.json`, { cache: "no-store" });
    if (infoResp.ok) {
      const info = await infoResp.json();
      if (Array.isArray(info.Tracks) && info.Tracks.length) {
        songs = info.Tracks.map(t => {
          const path = `./${folder}/${encodeURI(t)}`;
          return new URL(path, location.href).toString();
        });
        populateLibraryUI(songs);
        console.log("Loaded songs from info.json:", songs);
        return songs;
      }
    }
  } catch (err) {
    // proceed to next strategy
    console.warn("No usable info.json or failed to parse it:", err);
  }

  // 2) Fallback: attempt to fetch the directory listing (works on local dev servers)
  try {
    const res = await fetch(`./${folder}/`, { cache: "no-store" });
    if (res.ok) {
      const html = await res.text();
      const div = document.createElement('div');
      div.innerHTML = html;
      const anchors = Array.from(div.querySelectorAll('a'));
      const found = anchors
        .map(a => a.getAttribute('href') || '')
        .filter(href => /\.mp3$/i.test(href))
        .map(href => {
          href = href.replace(/%5C/gi, '/').replace(/\\/g, '/');
          // make it absolute relative to folder
          return new URL(href, location.href).toString();
        });
      if (found.length) {
        songs = found;
        populateLibraryUI(songs);
        console.log("Loaded songs from directory listing:", songs);
        return songs;
      }
    }
  } catch (err) {
    console.warn("Directory listing fetch failed (expected on GH Pages):", err);
  }

  // 3) Final fallback: try to look for tracks declared in parent songs/info.json (rare)
  try {
    const rootInfo = await fetch("./songs/info.json", { cache: "no-store" });
    if (rootInfo.ok) {
      const root = await rootInfo.json();
      // if root has mapping by folder, use it
      if (root.Albums && root.Albums[folder] && Array.isArray(root.Albums[folder].Tracks)) {
        songs = root.Albums[folder].Tracks.map(t => new URL(`./${folder}/${encodeURI(t)}`, location.href).toString());
        populateLibraryUI(songs);
        console.log("Loaded songs from root songs/info.json manifest:", songs);
        return songs;
      }
    }
  } catch (err) {
    // ignore
  }

  // Nothing found
  alert(`No songs found in folder "${folder}".\nIf you're deploying to GitHub Pages, include a tracks list in ${folder}/info.json as {"Tracks": ["song1.mp3","song2.mp3"]}.`);
  populateLibraryUI([]); // clear UI
  return songs;
}

// Populate the left playlist UI
function populateLibraryUI(songUrls) {
  // Keep the same class the original used (lpconatiner)
  const songul = document.getElementsByClassName("lpconatiner")[0];
  if (!songul) return;

  songul.innerHTML = ""; // Clear existing entries

  for (const [i, song] of songUrls.entries()) {
    // derive file name: last part after folder/
    const parts = song.split('/').pop().split('.mp3');
    const fileNameRaw = parts[0];
    const songName = decodeURIComponent(fileNameRaw).replace(/_/g, ' ');

    const randClass = Math.random().toString(36).substring(7);
    songul.innerHTML += `
      <div class="localplaylist flex" data-song="${fileNameRaw}.mp3" data-index="${i}">
        <span class="songimg flex justify-center">
          <img class="img-invert" style="width: 20px;" src="img2/music-note-03-stroke-rounded.svg" alt="">
        </span>
        <span class="songinfo">
          <div class="songname">${songName}</div>
          <div class="songartist">Unknown</div>
        </span>
        <span>
          <div class="playsvg ${randClass} flex justify-center">
            <button class="btn play play-lib" aria-label="Play" data-index="${i}">
              <svg viewBox="0 0 24 24"><polygon points="8,5 20,12 8,19"></polygon></svg>
            </button>
          </div>
          <div class="happy">Play Now</div>
        </span>
      </div>
    `;
  }

  // Replace node to remove old listeners (as your original code did)
  const newSongul = songul.cloneNode(true);
  songul.parentNode.replaceChild(newSongul, songul);

  // Click handler for play buttons inside library
  newSongul.addEventListener('click', function (e) {
    const btn = e.target.closest('.play-lib');
    if (!btn) return;
    const index = parseInt(btn.getAttribute('data-index'));
    const songDiv = btn.closest('.localplaylist');
    const songFile = songDiv ? songDiv.getAttribute('data-song') : null;
    if (!songFile) return;
    if (currentsong.src.endsWith(songFile) && !currentsong.paused) {
      currentsong.pause();
      updateAllPlayButtons();
      const mainPlay = document.querySelector('#playFirst');
      updateMainPlayButton(mainPlay);
    } else {
      playMusic(songFile, index);
    }
    updateMainTitle(songFile);
  });
}

// ===== Playback =====
const playMusic = (track, index) => {
  // track should be filename (e.g. "01 - Song.mp3")
  // construct relative path to current folder
  const trackUrl = `./${currfolder}/${encodeURI(track)}`;
  currentsong.src = new URL(trackUrl, location.href).toString();
  currentSongIndex = index;
  updateMainTitle(track);
  currentsong.play().then(() => {
    updateAllPlayButtons();
    updateMainPlayButton(document.querySelector('#playFirst'));
    updateMainTitle(track);
  }).catch((err) => {
    console.warn("play failed:", err);
    updateAllPlayButtons();
    updateMainPlayButton(document.querySelector('#playFirst'));
    updateMainTitle(track);
  });
};

// ===== Main init flow =====
document.addEventListener('DOMContentLoaded', () => {
  // Use a safer main similar to your original main()
  async function main() {
    console.log('Player ready. Current songs:', songs);

    // Display albums/cards - adapted to use relative paths
    async function displayAlbums() {
      try {
        const a = await fetch("./songs/", { cache: "no-store" });
        const responseText = await a.text();
        const div = document.createElement("div");
        div.innerHTML = responseText;
        const anchors = Array.from(div.getElementsByTagName("a"));
        const cardContainer = document.querySelector(".card-container");
        if (!cardContainer) return;

        for (const e of anchors) {
          if (e.href && e.href.toLowerCase().includes("songs")) {
            // derive folder name
            let folder = e.href.split("/").slice(-1)[0];
            folder = folder.replace("/", "").replace("%5C", "");
            if (!folder) continue;

            // attempt to fetch metadata from folder/info.json (relative)
            try {
              const metaResp = await fetch(`./songs/${folder}/info.json`, { cache: "no-store" });
              if (!metaResp.ok) continue;
              const response = await metaResp.json();
              const coverUrl = `./songs/${folder}/cover.jpg`;
              cardContainer.innerHTML += `
                <div data-folder="${folder}" class="cards">
                  <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="36" cy="36" r="36" fill="#1DB954" />
                    <polygon points="28,22 50,36 28,50" fill="#000" />
                  </svg>
                  <img src="${coverUrl}" alt="">
                  <h3>${response.Title || folder}</h3>
                  <p>${response.Description || ""}</p>
                </div>
              `;
            } catch (err) {
              console.warn("Failed to fetch album info for", folder, err);
            }
          }
        }
      } catch (err) {
        console.warn("displayAlbums fetch failed (likely no directory listing on GH Pages):", err);
      }
    }
    displayAlbums();

    // Play button
    const playBtn = document.querySelector('#playFirst');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (!songs.length) return alert('No songs found');
        if (!currentsong.src) {
          const currentTrack = songs[currentSongIndex] || songs[0];
          const parts = currentTrack.split(`/${currfolder}/`);
          const file = parts.length > 1 ? parts[1] : currentTrack.split('/').pop();
          playMusic(file, currentSongIndex);
        } else if (currentsong.paused) {
          currentsong.play();
        } else {
          currentsong.pause();
        }
        updateAllPlayButtons();
        updateMainPlayButton(playBtn);
        const currentTrack = songs[currentSongIndex];
        if (currentTrack) {
          const parts = currentTrack.split(`/${currfolder}/`);
          const file = parts.length > 1 ? parts[1] : currentTrack.split('/').pop();
          updateMainTitle(file);
        }
      });
    }

    // Next / Prev
    const nextBtn = document.querySelector('#next');
    const prevBtn = document.querySelector('#previous');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (!songs.length) return;
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        const nextSong = songs[currentSongIndex];
        const file = nextSong.split('/').pop();
        playMusic(file, currentSongIndex);
        updateAllPlayButtons();
        updateMainPlayButton(document.querySelector('#playFirst'));
        updateMainTitle(file);
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (!songs.length) return;
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        const prevSong = songs[currentSongIndex];
        const file = prevSong.split('/').pop();
        playMusic(file, currentSongIndex);
        updateAllPlayButtons();
        updateMainPlayButton(document.querySelector('#playFirst'));
        updateMainTitle(file);
      });
    }

    // Playback end -> autoplay next
    currentsong.addEventListener('ended', () => {
      if (!songs.length) return;
      currentSongIndex = (currentSongIndex + 1) % songs.length;
      const nextSong = songs[currentSongIndex];
      const file = nextSong.split('/').pop();
      playMusic(file, currentSongIndex);
    });

    // On play/pause change UI and animation
    currentsong.addEventListener('play', () => {
      updateAllPlayButtons();
      updateMainPlayButton(document.querySelector('#playFirst'));
      addPlayerAnimationCSS();
    });
    currentsong.addEventListener('pause', () => {
      updateAllPlayButtons();
      updateMainPlayButton(document.querySelector('#playFirst'));
      removePlayerAnimationCSS();
    });

    // timeupdate -> update progress and times
    currentsong.addEventListener('timeupdate', () => {
      const curEl = document.querySelector(".time--current");
      const durEl = document.querySelector(".time--duration");
      const thumb = document.querySelector(".thumb");
      const fill = document.querySelector(".fill");
      if (curEl) curEl.innerText = formatTime(currentsong.currentTime);
      if (durEl) durEl.innerText = formatTime(currentsong.duration);
      if (thumb && fill && currentsong.duration && isFinite(currentsong.duration) && currentsong.duration > 0) {
        const pct = (currentsong.currentTime / currentsong.duration) * 100;
        thumb.style.left = `${pct}%`;
        fill.style.width = `${pct}%`;
      }
    });

    // Seek bar click
    const bar = document.querySelector(".bar");
    if (bar) {
      bar.addEventListener("click", (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const pct = offsetX / e.currentTarget.clientWidth;
        const thumb = document.querySelector(".thumb");
        const fill = document.querySelector(".fill");
        if (thumb && fill) {
          thumb.style.left = `${pct * 100}%`;
          fill.style.width = `${pct * 100}%`;
        }
        if (currentsong.duration && isFinite(currentsong.duration)) {
          currentsong.currentTime = pct * currentsong.duration;
        }
      });
    }

    // UI: close / hamburger / first li
    const closeEl = document.querySelector(".close");
    if (closeEl) {
      closeEl.addEventListener('click', () => {
        const left = document.querySelector(".left");
        if (left) {
          left.style.left = "-120%";
          left.style.transition = "left 1.5s ease 0.05s";
        }
      });
    }
    const hamburger = document.querySelector(".hamburger");
    if (hamburger) {
      hamburger.addEventListener('click', () => {
        const left = document.querySelector(".left");
        if (left) {
          left.style.left = "0%";
          left.style.transition = "left 0.75s ease 0.05s";
        }
      });
    }
    const firstLi = document.querySelector("ul li:first-child");
    if (firstLi) {
      firstLi.addEventListener('click', () => {
        const left = document.querySelector(".left");
        if (left) {
          left.style.left = "-120%";
          left.style.transition = "left 0.75s ease 0.05s";
        }
      });
    }

    // Volume range
    const volRange = document.querySelector(".range input");
    if (volRange) {
      volRange.addEventListener('input', (e) => {
        currentsong.volume = e.target.value / 100;
      });
    }

    // Volume button (mute/unmute)
    const volBtn = document.querySelector(".volume img, .volume");
    if (volBtn) {
      document.querySelector(".volume").addEventListener("click", (e) => {
        const targetImg = e.target.tagName.toLowerCase() === 'img' ? e.target : e.currentTarget.querySelector('img');
        if (!targetImg) return;
        if ((targetImg.src || "").includes("volume.svg")) {
          targetImg.src = targetImg.src.replace("volume.svg", "mute.svg");
          currentsong.volume = 0;
          if (volRange) volRange.value = 0;
        } else {
          targetImg.src = targetImg.src.replace("mute.svg", "volume.svg");
          currentsong.volume = 1.0;
          if (volRange) volRange.value = 100;
        }
      });
    }

    // Click on album card -> open left and load album
    const cardContainer = document.querySelector('.card-container');
    if (cardContainer) {
      cardContainer.addEventListener('click', async (e) => {
        const left = document.querySelector(".left");
        if (left) {
          left.style.left = "0%";
          left.style.transition = "left 0.75s ease 0.05s";
        }
        const card = e.target.closest('.cards');
        if (card && card.dataset.folder) {
          const abc = card.dataset.folder;
          songs = await getSongs(`songs/${abc}`);
          currentSongIndex = 0;
          updateAllPlayButtons();
          updateMainPlayButton(document.querySelector('#playFirst'));
        }
      });
    }
  } // end main()

  main().catch(err => console.error("Main init failed:", err));
}); // DOMContentLoaded end
