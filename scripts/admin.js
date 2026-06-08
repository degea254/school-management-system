



// ===== USER MODELS =====
export class User {
    constructor({ id, firstName, middleName, lastName }) {
        this.id = id || Date.now();
        this.firstName = firstName.trim();
        this.middleName = middleName.trim();
        this.lastName = lastName.trim();
    }

    getFullName() {
        return `${this.firstName} ${this.middleName} ${this.lastName}`;
    }

    toJSON() {
        return {
            id: this.id,
            firstName: this.firstName,
            middleName: this.middleName,
            lastName: this.lastName,
        };
    }
}

export class Student extends User {
    constructor({ id, firstName, middleName, lastName, adm, class: studentClass }) {
        super({ id, firstName, middleName, lastName });
        this.adm = String(adm).trim();
        this.class = studentClass;
    }

    static fromStorage(studentData) {
        return new Student(studentData);
    }

    toJSON() {
        return {
            ...super.toJSON(),
            adm: this.adm,
            class: this.class,
        };
    }
}

// ===== STUDENT MANAGEMENT APP =====
export class StudentManager {
    constructor() {
        this.storageKey = "students_data";
        this.editMode = false;
        this.editId = null;
        this.students = this.loadStudents();

        this.form = document.getElementById("studentForm");
        this.studentList = document.getElementById("studentList");
        this.firstNameInput = document.getElementById("firstName");
        this.middleNameInput = document.getElementById("middleName");
        this.lastNameInput = document.getElementById("lastName");
        this.admInput = document.getElementById("adm");
        this.classInput = document.getElementById("studentClass");

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    init() {
        if (!this.form || !this.studentList) return;

        this.form.addEventListener("submit", this.handleSubmit);
        this.renderStudents();
        this.updateAdmSuggestion();
        this.updateAdmPlaceholder();
    }

    loadStudents() {
        const storedStudents = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        return storedStudents.map((studentData) => Student.fromStorage(studentData));
    }

    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.students));
    }

    handleSubmit(event) {
        event.preventDefault();

        if (!this.admInput.value) {
            alert("Admission number is required");
            return;
        }

        const studentData = this.getStudentDataFromForm();

        if (!this.editMode && this.hasDuplicateAdm(studentData.adm)) {
            alert("A student with this admission number already exists.");
            return;
        }

        if (this.editMode) {
            this.updateStudent(studentData);
        } else {
            this.addStudent(studentData);
        }

        this.saveToStorage();
        this.form.reset();
        this.renderStudents();
        this.updateAdmSuggestion();
        this.updateAdmPlaceholder();
    }

    getStudentDataFromForm() {
        return new Student({
            id: this.editMode ? this.editId : Date.now(),
            firstName: this.firstNameInput.value,
            middleName: this.middleNameInput.value,
            lastName: this.lastNameInput.value,
            adm: this.admInput.value,
            class: this.classInput.value,
        });
    }

    hasDuplicateAdm(adm) {
        return this.students.some((student) => student.adm === adm);
    }

    addStudent(student) {
        this.students.push(student);
    }

    updateStudent(updatedStudent) {
        this.students = this.students.map((student) =>
            student.id === this.editId ? updatedStudent : student,
        );

        this.editMode = false;
        this.editId = null;
        this.form.querySelector("button").textContent = "Add Student";
    }

    deleteStudent(id) {
        this.students = this.students.filter((student) => student.id !== id);
        this.saveToStorage();
        this.renderStudents();
        this.updateAdmSuggestion();
        this.updateAdmPlaceholder();
    }

    editStudent(id) {
        const student = this.students.find((studentItem) => studentItem.id === id);
        if (!student) return;

        this.firstNameInput.value = student.firstName;
        this.middleNameInput.value = student.middleName;
        this.lastNameInput.value = student.lastName;
        this.admInput.value = student.adm;
        this.classInput.value = student.class;

        this.editMode = true;
        this.editId = id;
        this.form.querySelector("button").textContent = "Update Student";
    }

    renderStudents() {
        this.studentList.innerHTML = "";

        this.students.forEach((student) => {
            const li = document.createElement("li");

            li.innerHTML = `
                <div>
                    <strong>${student.getFullName()}</strong><br/>
                    <small>ADM: ${student.adm} | Class: ${student.class}</small>
                </div>

                <div>
                    <button onclick="editStudent(${student.id})">Edit</button>
                    <button onclick="deleteStudent(${student.id})">Delete</button>
                </div>
            `;

            this.studentList.appendChild(li);
        });
    }

    getNextAdmNumber() {
        if (this.students.length === 0) return 1;

        const admissionNumbers = this.students.map((student) => Number(student.adm));
        return Math.max(...admissionNumbers) + 1;
    }

    updateAdmSuggestion() {
        if (this.editMode) return;

        this.admInput.value = this.getNextAdmNumber();
    }

    updateAdmPlaceholder() {
        this.admInput.placeholder = `Next ADM: ${this.getNextAdmNumber()}`;
    }
}

const studentManager = new StudentManager();
studentManager.init();

// Keep the existing inline HTML button capabilities working.
function editStudent(id) {
    studentManager.editStudent(id);
}

function deleteStudent(id) {
    studentManager.deleteStudent(id);
}
