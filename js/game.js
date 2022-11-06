var rhit = rhit || {};

rhit.Game = class {
    constructor() {
        this.cycles = 0;
        this.isPaused = false;
        this.begin();
    }

    updateScore() {

    }

    begin() {
        setInterval(this.runOneCycle, 250);
    }

    runOneCycle() {
        if (!this.isPaused) {
            this.cycles++;
            const Notes = document.querySelectorAll(".note");
            console.log("one game cycle");
            Notes.forEach((note) => {
                let y = parseInt(note.dataset.height);
                note.style=`top: ${y}px`;
                note.dataset.height = `${y + 10}`;
                if (y >= 500) {
                    note.remove();
                }
            })
            if (this.cycles > 25) {
                this.isPaused = true;
            }
        }
    }

    pause() {
        this.isPaused = !this.isPaused;
    }

    checkForKeyPressed() {

    }

    postToLeaderboard() {

    }

    postToPersonalStats() {

    }
}

function pressedD (event) {
    if (event.key == "d") {
        console.log("pressed the d key");
    }
    removeEventListener("keydown", pressedD)
}

function createNoteElement (noteType) {
    const note = document.createElement('img');
    note.src="img/Music_Note.png";
    note.dataset.height = "0";
    note.className = `note ${noteType}`; 
    return note; 
}

// _createCard(movieQuote) {
//     return htmlToElement(`<div class="card">
//     <div class="card-body">
//       <h5 class="card-title">${movieQuote.quote}</h5>
//       <h6 class="card-subtitle mb-2 text-muted">${movieQuote.movie}</h6>
//     </div>
//   </div>`)
// }

rhit.main = function () {
	console.log("Ready");
    const game = new rhit.Game();

    document.querySelector("#spawnLeftButton").onclick = () => {
        document.querySelector("#noteContainer").appendChild(createNoteElement("leftNote"));
    }

    document.querySelector("#spawnLeftMiddleButton").onclick = () => {
        document.querySelector("#noteContainer").appendChild(createNoteElement("leftMiddleNote"));
    }

    document.querySelector("#spawnRightMiddleButton").onclick = () => {
        document.querySelector("#noteContainer").appendChild(createNoteElement("rightMiddleNote"));
    }

    document.querySelector("#spawnRightButton").onclick = () => {
        document.querySelector("#noteContainer").appendChild(createNoteElement("rightNote"));
    }
};

rhit.main();