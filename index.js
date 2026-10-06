// 1. Select the HTML elements we need.
const form = document.getElementById("subject-form");
const nameInput = document.getElementById("subject-name");
const marksInput = document.getElementById("subject-marks");
const subjectList = document.getElementById("subject-list");
const errorMessage = document.getElementById("error-message");
const storageMessage = document.getElementById("storage-message");

const countOutput = document.getElementById("subject-count");
const totalOutput = document.getElementById("total-marks");
const averageOutput = document.getElementById("average-marks");
const gradeOutput = document.getElementById("overall-grade");
const highestOutput = document.getElementById("highest-marks");
const lowestOutput = document.getElementById("lowest-marks");

const STORAGE_KEY = "studentMarksSubjects";

// Each subject will be an object inside this array.
let subjects = [];


// 2. Return a grade based on a mark or average.
function getGrade(mark) {
  if (mark >= 80) {
    return "A";
  } else if (mark >= 70) {
    return "B";
  } else if (mark >= 60) {
    return "C";
  } else if (mark >= 50) {
    return "D";
  } else {
    return "E";
  }
}


// 3. Save the array to the browser.
function saveSubjects() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(subjects)
    );

    storageMessage.textContent = "";
  } catch (error) {
    storageMessage.textContent =
      "Your browser could not save the subjects. " +
      "You can still use the app, but changes may be lost after refreshing.";
  }
}


// 4. Load previously saved subjects.
function loadSubjects() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);

    // If nothing has been saved, keep the empty array.
    if (savedData === null) {
      return;
    }

    const savedSubjects = JSON.parse(savedData);

    // Check the saved data before using it.
    const isValid =
      Array.isArray(savedSubjects) &&
      savedSubjects.every(function (subject) {
        return (
          subject !== null &&
          typeof subject === "object" &&
          typeof subject.name === "string" &&
          subject.name.trim() !== "" &&
          Number.isFinite(subject.marks) &&
          subject.marks >= 0 &&
          subject.marks <= 100
        );
      });

    if (!isValid) {
      throw new Error("Invalid saved subjects");
    }

    subjects = savedSubjects;
  } catch (error) {
    subjects = [];
    storageMessage.textContent =
      "Saved subjects could not be loaded. Starting with an empty list.";
  }
}


// 5. Display the subjects in the table.
function renderSubjects() {
  // Clear the old rows before rebuilding the table.
  subjectList.replaceChildren();

  subjects.forEach(function (subject, index) {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = subject.name;

    const marksCell = document.createElement("td");
    marksCell.textContent = subject.marks;

    const gradeCell = document.createElement("td");
    gradeCell.textContent = getGrade(subject.marks);

    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-button";
    deleteButton.setAttribute(
      "aria-label",
      `Delete ${subject.name}`
    );

    deleteButton.addEventListener("click", function () {
      deleteSubject(index);
    });

    actionCell.appendChild(deleteButton);

    row.append(nameCell, marksCell, gradeCell, actionCell);
    subjectList.appendChild(row);
  });
}


// 6. Calculate and display the results.
function updateResults() {
  countOutput.textContent = subjects.length;

  // An empty list has no average, grade, highest, or lowest.
  if (subjects.length === 0) {
    totalOutput.textContent = "0";
    averageOutput.textContent = "—";
    gradeOutput.textContent = "—";
    highestOutput.textContent = "—";
    lowestOutput.textContent = "—";
    return;
  }

  let total = 0;
  let highest = subjects[0].marks;
  let lowest = subjects[0].marks;

  for (const subject of subjects) {
    total += subject.marks;

    if (subject.marks > highest) {
      highest = subject.marks;
    }

    if (subject.marks < lowest) {
      lowest = subject.marks;
    }
  }

  const average = total / subjects.length;

  totalOutput.textContent = total.toFixed(2);
  averageOutput.textContent = average.toFixed(2);
  gradeOutput.textContent = getGrade(average);
  highestOutput.textContent = highest;
  lowestOutput.textContent = lowest;
}


// 7. Delete one subject and refresh the app.
function deleteSubject(index) {
  subjects.splice(index, 1);

  saveSubjects();
  renderSubjects();
  updateResults();
}


// 8. Handle the form submission.
form.addEventListener("submit", function (event) {
  // Stop the form from refreshing the page.
  event.preventDefault();

  errorMessage.textContent = "";

  const name = nameInput.value.trim();
  const marksText = marksInput.value.trim();

  // Check empty inputs BEFORE converting marks to a number.
  if (name === "" || marksText === "") {
    errorMessage.textContent =
      "Please enter both a subject name and marks.";
    return;
  }

  const marks = Number(marksText);

  if (!Number.isFinite(marks) || marks < 0 || marks > 100) {
    errorMessage.textContent =
      "Marks must be a valid number between 0 and 100.";
    return;
  }

  // Create an object and add it to the array.
  const subject = {
    name: name,
    marks: marks
  };

  subjects.push(subject);

  saveSubjects();
  renderSubjects();
  updateResults();

  form.reset();
  nameInput.focus();
});


// 9. Restore saved data when the app starts.
loadSubjects();
renderSubjects();
updateResults();