console.log("Spotify Clone");
console.log("Spotify Clone");
let currentsong = new Audio();
let currentSongIndex = 0;

function formatTime(seconds) {
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
    .time{
    color: black;
    }  

    @keyframes moveBg {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;

  // Prevent duplicate insertion
  if (document.getElementById("player-animation-style")) return;

  const style = document.createElement("style");
  style.id = "player-animation-style";  // IMPORTANT → unique ID
  style.textContent = cssCode;
  document.head.appendChild(style);
}


function removePlayerAnimationCSS() {
  const styleTag = document.getElementById("player-animation-style");
  if (styleTag) {
    styleTag.remove();
  }
}











// async function getsongs() {
//   let a = await fetch("http://127.0.0.1:3000/web%20development%20sigma%20series/Spotify%20Clone/songs/");
//   let html = await a.text();
// //   console.log(html);
//   let div = document.createElement("div");
//   div.innerHTML = html;
//   let as = div.getElementsByTagName("a")

//   let songs = [];

//   for (let i = 0; i < as.length; i++) {

//     const a = as[i];
//     if (a.href.endsWith(".mp3")) {
//         songs.push(a.href)
//     }
//     }
//     return songs;
//     console.log(songs);


// }
// async function main() {
//     let songs = await getsongs();
//     console.log(songs);
//     var audio = new Audio(songs[0]);

//     audio.play();
// }
// main();
songs = [];
let currfolder;

async function getSongs(folder) {

  currfolder = folder;
  // same origin, same port as your page
  const res = await fetch(`http://127.0.0.1:3000/web%20development%20sigma%20series/Spotify%20Clone/${folder}`);     // <-- NOT http://127.0.0.1:60047/... etc.
  const html = await res.text();

  const div = document.createElement('div');
  div.innerHTML = html;

  // Grab anchors from the server directory listing
  const anchors = Array.from(div.querySelectorAll('a'));

  const songs = anchors
    .map(a => a.getAttribute('href') || '')      // raw href as written in HTML
    .filter(href => /\.mp3$/i.test(href))
    .map(href => {
      // 1) turn backslashes into forward slashes
      href = href.replace(/%5C/gi, '/').replace(/\\/g, '/');

      // 2) keep only the part from /songs/ onward
      const i = href.toLowerCase().lastIndexOf('/currfolder/');
      if (i !== -1) href = href.slice(i);        // e.g. "/songs/Track.mp3"

      // 3) make it absolute (same origin) to be safe
      return new URL(href, location.origin).toString();
    });


  // Populate the library playlist
  let songul = document.getElementsByClassName("lpconatiner")[0];
  songul.innerHTML = ""; // Clear existing entries

  for (const [i, song] of songs.entries()) {
    let parts = song.split(`/${currfolder}/`);
    parts = parts[1].split(".mp3");
    let songName = parts[0].includes("%20") ? parts[0].replace(/%20/g, " ") : parts[0];
    var a = Math.random().toString(36).substring(7);
    songul.innerHTML += `
    <div class="localplaylist flex" data-song="${parts[0]}.mp3" data-index="${i}">
      <span class="songimg flex justify-center"><img class="img-invert" style="width: 20px;" src="img2/music-note-03-stroke-rounded.svg" alt=""></span>
      <span class="songinfo">
        <div class="songname">${songName}</div>
        <div class="songartist">Unknown</div>
      </span>
      <span>
        <div class="playsvg ${a} flex justify-center">
          <button class="btn play play-lib" aria-label="Play" data-index="${i}">
            <svg viewBox="0 0 24 24">
              <polygon points="8,5 20,12 8,19"></polygon>
            </svg>
          </button>
        </div>
        <div class="happy">Play Now</div>
      </span>
    </div>`;
  }

  // Remove old event listeners by replacing the node
  let newSongul = songul.cloneNode(true);
  songul.parentNode.replaceChild(newSongul, songul);
  newSongul.addEventListener('click', function (e) {
    let btn = e.target.closest('.play-lib');
    if (btn) {
      let index = parseInt(btn.getAttribute('data-index'));
      let songDiv = btn.closest('.localplaylist');
      let songFile = songDiv.getAttribute('data-song');
      if (currentsong.src.endsWith(songFile) && !currentsong.paused) {
        currentsong.pause();
        updateAllPlayButtons();
        updateMainPlayButton();
      } else {
        playMusic(songFile, index);
      }
      updateMainTitle(songFile);
    }
  });


  return songs;
}











const playMusic = (track, index) => {
  currentsong.src = `http://127.0.0.1:3000/web%20development%20sigma%20series/Spotify%20Clone/${currfolder}/` + track;
  currentSongIndex = index;
  updateMainTitle(track);
  currentsong.play().then(() => {
    updateAllPlayButtons();
    updateMainPlayButton();
    updateMainTitle(track);
  }).catch(() => {
    updateAllPlayButtons();
    updateMainPlayButton();
    updateMainTitle(track);
  });
}
// Helper to update the main player song title
function updateMainTitle(track) {
  // track is like 'SongName.mp3' or may have URL encoding
  let name = track.split(".mp3")[0];
  name = name.replace(/%20/g, " ").replace(/_/g, " ");
  // Remove any leading slashes
  name = name.replace(/^\/+/, "");
  const titleDiv = document.querySelector('.title');
  if (titleDiv) {
    titleDiv.textContent = name;
  }
}


async function main() {
  // songs = await getSongs("songs/old");
  console.log('Cleaned song URLs:', songs);

  async function displayAlbums() {
    let a = await fetch("http://127.0.0.1:3000/web%20development%20sigma%20series/Spotify%20Clone/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    console.log(div);


    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".card-container");

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
      
      if (e.href.includes("songs")) {

        let folder = e.href.split("%5C").slice(-1)[0];
        folder = folder.replace("/", "");

        console.log(folder);

        // Get the metadata of the folder
        let a = await fetch(`http://127.0.0.1:3000/web%20development%20sigma%20series/Spotify%20Clone/songs/${folder}/info.json`);
        let response = await a.json();

        console.log(response);

        cardContainer.innerHTML =
          cardContainer.innerHTML +
          `
                <div data-folder="${folder}" class="cards">
                        <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="36" cy="36" r="36" fill="#1DB954" />
                            <polygon points="28,22 50,36 28,50" fill="#000" />
                        </svg>

                        <img src="http://127.0.0.1:3000/web%20development%20sigma%20series/Spotify%20Clone/songs/${folder}/cover.jpg" alt="">
                        <h3>${response.Title}</h3>
                        <p>${response.Description}</p>
                    </div>
                `;
      }
      
    }
  }
  displayAlbums();


  // Don’t autoplay – wait for a click
  const playBtn = document.querySelector('#playFirst');

  playBtn.addEventListener('click', () => {
    if (!songs.length) return alert('No songs found');
    // If no song loaded, start first song
    if (!currentsong.src) {
      let currentTrack = songs[currentSongIndex] || songs[0];
      let parts = currentTrack.split(`/${currfolder}/`);
      let file = parts[1];
      playMusic(file, currentSongIndex);
    } else if (currentsong.paused) {
      currentsong.play();
    } else {
      currentsong.pause();
    }
    updateAllPlayButtons();
    updateMainPlayButton();
    // Also update the main title to current song
    let currentTrack = songs[currentSongIndex];
    let parts = currentTrack.split(`/${currfolder}/`);
    let file = parts[1];
    updateMainTitle(file);
  });

  // function getsongnames(songurl) {
  //   let parts = songurl.split("/songs/");
  //   parts = parts[1].split(".mp3");
  //   console.log(parts[0]);
  //   if (parts[0].includes("%20")) {
  //     let part = parts[0].replace(/%20/g, " ");
  //     return part;


  //   }
  //   return parts[0];
  // }






  // Helper to reset all play buttons to play icon

  function updateAllPlayButtons() {
    document.querySelectorAll('.play-lib').forEach((b, idx) => {
      if (idx === currentSongIndex && !currentsong.paused) {
        b.innerHTML = `<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>`;
      } else {
        b.innerHTML = `<svg viewBox="0 0 24 24"><polygon points="8,5 20,12 8,19"></polygon></svg>`;
      }
    });
  }

  function updateMainPlayButton() {
    if (!currentsong.paused) {
      playBtn.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>`;
    } else {
      playBtn.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24"><polygon points="8,5 20,12 8,19"></polygon></svg>`;
    }
  }



  // When the song ends, reset all play buttons and main play button, and stop color change now ists auto playing next song
  currentsong.addEventListener('ended', () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length; // go to next, loop to start
    let nextSong = songs[currentSongIndex];
    let parts = nextSong.split(`/${currfolder}/`);
    let file = parts[1];
    playMusic(file, currentSongIndex);
  });

  // On play, update buttons and start color change
  currentsong.addEventListener('play', () => {
    updateAllPlayButtons();
    updateMainPlayButton();
    addPlayerAnimationCSS();


  });
  // On pause, update buttons and stop color change
  currentsong.addEventListener('pause', () => {
    updateAllPlayButtons();
    updateMainPlayButton();
    removePlayerAnimationCSS();


  });





  // Next/Previous button functionality
  const nextBtn = document.querySelector('#next');
  const prevBtn = document.querySelector('#previous');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (!songs.length) return;
      currentSongIndex = (currentSongIndex + 1) % songs.length;
      let nextSong = songs[currentSongIndex];
      let parts = nextSong.split(`/${currfolder}/`);
      let file = parts[1];
      playMusic(file, currentSongIndex);
      updateAllPlayButtons();
      updateMainPlayButton();
      updateMainTitle(file);
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (!songs.length) return;
      currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
      let prevSong = songs[currentSongIndex];
      let parts = prevSong.split(`/${currfolder}/`);
      let file = parts[1];
      playMusic(file, currentSongIndex);
      updateAllPlayButtons();
      updateMainPlayButton();
      updateMainTitle(file);
    });
  }
  // add event listeners for timreupdate to update time display

  currentsong.addEventListener('timeupdate', () => {

    document.querySelector(".time--current").innerText = formatTime(currentsong.currentTime);
    document.querySelector(".time--duration").innerText = formatTime(currentsong.duration);
    document.querySelector(".thumb").style.left = ((currentsong.currentTime / currentsong.duration) * 100) + "%";
    document.querySelector(".fill").style.width = ((currentsong.currentTime / currentsong.duration) * 100) + "%";
  });
  // add an event listener for seek bar click
  document.querySelector(".bar").addEventListener("click", (e) => {
    document.querySelector(".thumb").style.left = ((e.offsetX / e.currentTarget.clientWidth) * 100) + "%";
    document.querySelector(".fill").style.width = ((e.offsetX / e.currentTarget.clientWidth) * 100) + "%";
    currentsong.currentTime = (e.offsetX / e.currentTarget.clientWidth) * currentsong.duration;
  });

  document.querySelector(".close").addEventListener('click', (e) => {
    document.querySelector(".left").style.left = "-120%";
    document.querySelector(".left").style.transition = "left 1.5s ease 0.05s";
  });
  document.querySelector(".hamburger").addEventListener('click', (e) => {
    document.querySelector(".left").style.left = "0%";
    document.querySelector(".left").style.transition = "left 0.75s ease 0.05s";
  });
  document.querySelector("ul li:first-child").addEventListener('click', (e) => {
    document.querySelector(".left").style.left = "-120%";
    document.querySelector(".left").style.transition = "left 0.75s ease 0.05s";
  });
  document.querySelector(".range input").addEventListener('input', (e) => {
    // console.log(e.target.value);
    currentsong.volume = e.target.value / 100;
  });
  // Array.from(document.getElementsByClassName("cards")).forEach(cards => {
  //   cards.addEventListener('click', async (e) => {
  //     console.log(e.currentTarget.dataset.folder);
  //     let abc = e.currentTarget.dataset.folder;
  //     console.log(abc);
  //     songs = await getSongs(`songs/${abc}`);
  //     // console.log(e.currentTarget.dataset.folder);
  //   });
  // });
  document.querySelector('.card-container').addEventListener('click', async (e) => {
    document.querySelector(".left").style.left = "0%";
    document.querySelector(".left").style.transition = "left 0.75s ease 0.05s";
    const card = e.target.closest('.cards');
    if (card && card.dataset.folder) {
      let abc = card.dataset.folder;
      songs = await getSongs(`songs/${abc}`);
      currentSongIndex = 0; // reset to first song in new playlist
      updateAllPlayButtons();
      updateMainPlayButton();
      

      // update play buttons, etc.
    }
  });
//   // Add an event to volume
// document.querySelector(".range").getElementsByTagName("input")[0]
//   .addEventListener("change", (e) => {
//     console.log("Setting volume to", e.target.value, "/ 100");
//     currentSong.volume = parseInt(e.target.value) / 100;
// });

// Add event listener to mute the track
document.querySelector(".volume").addEventListener("click", (e) => {
  if (e.target.src.includes("volume.svg")) {
    e.target.src = e.target.src.replace("volume.svg", "mute.svg");
    currentsong.volume = 0;
    document.querySelector(".range input").value = 0;
  } else {
    e.target.src = e.target.src.replace("mute.svg", "volume.svg");
    currentsong.volume = 1.0;
    document.querySelector(".range ").getElementsByTagName("input")[0].value = 100;
  }
});





}
main();





