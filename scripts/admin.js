// ===== ELEMENTS =====
const form = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");

const firstNameInput = document.getElementById("firstName");
const middleNameInput = document.getElementById("middleName");
const lastNameInput = document.getElementById("lastName");
const admInput = document.getElementById("adm");
const classInput = document.getElementById("studentClass");

// ===== UPDATE STATE =====
let editMode = false;
let editId = null;

// ===== DATA STORE =====

const STORAGE_KEY = "students_data";

let students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

console.log("Loaded students:", students);

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

// ===== SUBMIT (ADD OR UPDATE) =====
form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!admInput.value) {
        alert("Admission number is required");
        return;
    }

    const studentData = {
        id: editMode ? editId : Date.now(),
        firstName: firstNameInput.value.trim(),
        middleName: middleNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        adm: admInput.value.trim(),
        class: classInput.value,
    };

    // 2. CHECK DUPLICATE (ONLY FOR NEW STUDENTS)
    if (!editMode) {
        const isDuplicate = students.some(
            (student) => student.adm === admInput.value.trim(),
        );

        if (isDuplicate) {
            alert("A student with this admission number already exists.");
            return;
        }
    }

    if (editMode) {
        // UPDATE EXISTING STUDENT
        students = students.map((student) =>
            student.id === editId ? studentData : student,
        );

        editMode = false;
        editId = null;

        form.querySelector("button").textContent = "add Student";
    } else {
        // ADD NEW STUDENT
        students.push(studentData);
    }

    saveToStorage();
    form.reset();
    renderStudents();
    updateAdmSuggestion();
});

// ===== RENDER LIST =====
function renderStudents() {
    studentList.innerHTML = "";

    students.forEach((student) => {
        const li = document.createElement("li");

        li.innerHTML = `
            <div>
                <strong>
                    ${student.firstName} ${student.middleName} ${student.lastName}
                </strong><br/>
                <small>
                    ADM: ${student.adm} | Class: ${student.class}
                </small>
            </div>

            <div>
                <button onclick="editStudent(${student.id})">Edit</button>
                <button onclick="deleteStudent(${student.id})">Delete</button>
            </div>
        `;

        studentList.appendChild(li);
    });
}

// ===== DELETE =====
function deleteStudent(id) {
    students = students.filter((student) => student.id !== id);

    saveToStorage();
    renderStudents();
}

// ===== EDIT MODE =====
function editStudent(id) {
    const student = students.find((s) => s.id === id);

    // fill form with existing data
    firstNameInput.value = student.firstName;
    middleNameInput.value = student.middleName;
    lastNameInput.value = student.lastName;
    admInput.value = student.adm;
    classInput.value = student.class;

    // switch to edit mode
    editMode = true;
    editId = id;

    // change button text (optional polish)
    form.querySelector("button").textContent = "Update Student";
}

//helper functions
function getNextAdmNumber() {
    if (students.length === 0) return 1;

    const maxAdm = Math.max(...students.map((student) => Number(student.adm)));

    return maxAdm + 1;
}

function updateAdmSuggestion() {
    if (editMode) return; // don’t override when editing

    admInput.value = getNextAdmNumber();
}

admInput.placeholder = "Next ADM: " + getNextAdmNumber();

// ===== INITIAL RENDER =====
renderStudents();
updateAdmSuggestion();
