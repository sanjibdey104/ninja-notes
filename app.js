const noteForm = document.querySelector(".note-form");
let submitBtn = noteForm.querySelector(".submit-btn");
let title = noteForm.querySelector("#title");
let content = noteForm.querySelector("#content");
const notesList = document.querySelector(".notes-list");
const bookmark = document.querySelector("#bookmark");

//----------------------------------- Syncing DOM with localstorage

let notesArr = []; // array to track notes

fetchNotes(); // runs at the very beginning to fetch notes if already available in localstorage

function fetchNotes() {
  let notesJsonData = localStorage.getItem("notesData");
  let notesObjData = JSON.parse(notesJsonData);

  if (notesObjData === null) {
    // if no there were notes in storage
    notesArr = [];
  } else {
    notesArr = notesObjData;
    for (note of notesArr) {
      createNewNote(note);
    }
  }
}

//------------------------------------------------ Creating a new note

// color themes
const colorThemes = ["#ffe97f", "#d6e592", "#ffccd5", "#ade8f4"];

// ninja badges
const ninjaBadgeSrc = [
  "./assets/svgs/random-ninjas/ninja-one.svg",
  "./assets/svgs/random-ninjas/ninja-two.svg",
  "./assets/svgs/random-ninjas/ninja-three.svg",
  "./assets/svgs/random-ninjas/ninja-four.svg",
  "./assets/svgs/random-ninjas/ninja-five.svg",
];

// note form config
noteForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Since we are using the same button for submitting later updating a note
  // So we are validating the current state of the button using custom "data" property "data-btn-type"
  // if "update" then it will trigger the "updateNote" function, else carry on with usual note submission

  if (submitBtn.getAttribute("data-btn-type") === "update") {
    updateNote();
    noteForm.reset();
  } else {
    // make sure user inputs both value
    if (title.value && content.value) {
      let randomThemeIndex = Math.floor(Math.random() * colorThemes.length);
      let noteTheme = colorThemes[randomThemeIndex];

      let randomBadgeIndex = Math.floor(Math.random() * ninjaBadgeSrc.length);
      let noteBadgeSrc = ninjaBadgeSrc[randomBadgeIndex];

      // defining the new note object structure and properties
      let newNoteObj = {
        id: notesArr.length,
        title: title.value,
        content: content.value,
        theme: noteTheme,
        badgeSrc: noteBadgeSrc,
        isMarked: false,
      };

      notesArr.push(newNoteObj);
      updateLocalStorage(notesArr);
      createNewNote(newNoteObj);
      noteForm.reset();
    }
  }
});

// updating localstorage for all cases alike ("create","delete", "update")
function updateLocalStorage(arr) {
  let newNoteJson = JSON.stringify(arr);
  localStorage.setItem("notesData", newNoteJson);
}

//------------------------------------------ Creating a new note card and manipulating DOM

function createNewNote(noteObj) {
  const { theme, badgeSrc } = noteObj;

  let newNoteCard = document.createElement("div");
  newNoteCard.classList.add("note-card");
  newNoteCard.style.backgroundColor = theme;

  // attaching the "id" to the noteCard so we can refer to it later while "deleting" or "updating" a note
  newNoteCard.id = noteObj.id;
  newNoteCard.innerHTML = `
    <h3 class="note-title">${noteObj.title}</h3>
    <img class="user-badge" src="${badgeSrc}" alt="ninja badge">
    <p class="note-content">${noteObj.content}</p>
    <div class="buttons">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
    </div>
    <i id="bookmark" class="fa fa-bookmark" aria-label="bookmark"></i>`;

  if (noteObj.isMarked) {
    newNoteCard.classList.add("marked");
    notesList.appendChild(newNoteCard);
  } else {
    notesList.appendChild(newNoteCard);
  }
}

//----------------------------------------------- Altering a note (Delete or Update)

notesList.addEventListener("click", (e) => {
  let targetbtn = e.target;
  let targetNote = targetbtn.parentElement.parentElement; // selecting the parent "note card"

  if (targetbtn.classList[0] === "delete-btn") {
    deleteTheNote(targetNote);
  } else if (targetbtn.classList[0] === "edit-btn") {
    initializeEdit(targetNote);
  } else if (targetbtn.id === "bookmark") {
    markTheNote(targetbtn.parentElement);
  }
});

//------------------------------- Deleting the note and updating localstorage
function deleteTheNote(target) {
  target.remove();
  let id = Number(target.id);
  notesArr = notesArr.filter((item) => item.id !== id);
  updateLocalStorage(notesArr);
}

//------------------------------- Initialize note editing mode
function initializeEdit(target) {
  let id = Number(target.id);
  let [noteToEdit] = notesArr.filter((item) => item.id === id);

  // fetching the target note values in the form itself, so we can easily update
  title.value = noteToEdit.title;
  content.value = noteToEdit.content;

  // altering the "note submit button" to behave like a "note update button"
  submitBtn.innerText = "Update";
  submitBtn.setAttribute("data-btn-type", "update");
  submitBtn.setAttribute("data-ref-id", noteToEdit.id);
}

//-------------------- Finally updating the changes and reflecting the changes on note card and localstorage
function updateNote() {
  let id = submitBtn.getAttribute("data-ref-id");

  // fetching the list of notes under notesList
  // since it will be a "HTMLCollection" which is a "pseudo array"
  // so coverting it to an "actual array" for ease of work
  let arrayRef = Array.from(notesList.children);

  for (item of arrayRef) {
    if (item.id === id) {
      item.children[0].innerText = title.value; // updating the title
      item.children[2].innerText = content.value; // updating the content

      // matching the "note id" with that in array
      // if matched then updating the corresponding array values
      for (note of notesArr) {
        if (note.id === Number(id)) {
          note.title = title.value;
          note.content = content.value;
        } else console.log("oops");
      }
      updateLocalStorage(notesArr); // pushing the fresh array with "updated note" to locastorage
    } else {
      console.log("nothing");
    }
  }

  // resetting the button to a "note submit button"
  submitBtn.innerText = "Submit";
  submitBtn.removeAttribute("data-btn-type");
  submitBtn.removeAttribute("data-ref-id");
}

function markTheNote(targetNote) {
  targetNote.classList.toggle("marked");
  let id = Number(targetNote.id);

  for (note of notesArr) {
    if (note.id === id && targetNote.classList[1] === "marked") {
      note.isMarked = true;
    } else if (note.id === id && targetNote.classList[1] !== "marked") {
      note.isMarked = false;
    }
  }
  updateLocalStorage(notesArr);
  // -- Validate that changes has reflected in the "notesArr" as well and no page re-load is required
}
