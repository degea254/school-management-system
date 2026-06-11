// ===== USER MODELS =====
class User {
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

class Subject {
    constructor({ id, department, subjectName }) {
        this.id = id || Date.now();
        this.department = department.trim();
        this.subjectName = subjectName.trim();
    }

    toJSON() {
        return {
            id: this.id,
            department: this.department,
            subjectName: this.subjectName,
        };
    }
}

//========subject management app========//
class SubjectManager {
    constructor() {
        this.storageKey = "subjects_data";

        this.editMode = false;
        this.editId = null;
        this.subjects = this.loadSubjects();

        this.form = document.getElementById("subjectForm");
        this.subjectList = document.getElementById("subjectList");
        this.departmentInput = document.getElementById("department");
        this.subjectNameInput = document.getElementById("subjectName");

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    init() {
        if (!this.form || !this.subjectList) return;

        this.form.addEventListener("submit", this.handleSubmit);
        this.renderSubjects();
    }

    loadSubjects() {
        const storedSubjects =
            JSON.parse(localStorage.getItem(this.storageKey)) || [];
        return storedSubjects.map((subjectData) => new Subject(subjectData));
    }

    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.subjects));
    }


    handleSubmit(event) {
        event.preventDefault();

        const subjectData = this.getSubjectDataFromForm();

        if (this.editMode) {
            this.updateSubject(subjectData);
        } else {
            this.addSubject(subjectData);
        }

        this.saveToStorage();
        this.form.reset();
        this.renderSubjects();
    }




    addSubject(subject) {
        this.subjects.push(subject);
        this.saveToStorage();
        this.renderSubjects();
    }


    pdateSubject(updatedSubject) {
        this.subjects = this.subjects.map((subject) =>
            subject.id === this.editId ? updatedSubject : subject,
        );

        this.editMode = false;
        this.editId = null;
        this.form.querySelector("button").textContent = "Add Subject";
        this.saveToStorage();
        this.renderSubjects();
    }


    deleteSubject(id) {
        this.subjects = this.subjects.filter((subject) => subject.id !== id);
        this.saveToStorage();
        this.renderSubjects();
    }

    editSubject(id) {
        const subject = this.subjects.find((subjectItem) => subjectItem.id === id);
        if (!subject) return;

        this.editMode = true;
        this.editId = id;
        this.departmentInput.value = subject.department;
        this.subjectNameInput.value = subject.subjectName;

        this.form.querySelector("button").textContent = "Update Subject";
    }

    getSubjectDataFromForm() {
        return new Subject({
            id: this.editMode ? this.editId : Date.now(),
            department: this.departmentInput.value,
            subjectName: this.subjectNameInput.value,
        });
    }

    renderSubjects() {
        const subjectList = document.getElementById("subjectList");
        subjectList.innerHTML = "";
        this.subjects.forEach((subject) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div>
                    <strong>${subject.subjectName}</strong><br/>
                    <small>Department: ${subject.department}</small>
                </div>
                <div>
                    <button onclick="editSubject(${subject.id})">Edit</button>
                    <button onclick="deleteSubject(${subject.id})">Delete</button>
                </div>
            `;
            subjectList.appendChild(li);
        });
    }

}


class Student extends User {
    constructor({
        id,
        firstName,
        middleName,
        lastName,
        dob,
        adm,
        class: studentClass,
        subjects = [],
    }) {
        super({ id, firstName, middleName, lastName });
        this.dob = dob;
        this.adm = String(adm).trim();
        this.class = studentClass;
        this.subjects = subjects || [];
    }

    static fromStorage(studentData) {
        return new Student(studentData);
    }

    toJSON() {
        return {
            ...super.toJSON(),
            dob: this.dob,
            adm: this.adm,
            class: this.class,
            subjects: this.subjects,
        };
    }
}

class Teacher extends User {
    constructor({
        id,
        firstName,
        middleName,
        lastName,
        email,
        phone,
        joinDate,
        teacherId,
        subjects,
        classesAssigned,
        status,
        salaryGrade,
    }) {
        super({ id, firstName, middleName, lastName });

        this.email = email;
        this.phone = phone;
        this.joinDate = joinDate;
        this.teacherId = teacherId;

        this.subjects = subjects || [];
        this.classesAssigned = classesAssigned || [];
        this.status = status || "active";
        this.salaryGrade = salaryGrade;
    }

    static fromStorage(teacherData) {
        return new Teacher(teacherData);
    }

    getSalaryGradeLabel() {
        if (!this.salaryGrade) return "Not set";

        const [grade, role, salaryRange] = this.salaryGrade.split("|");
        return `${grade} - ${role} (${salaryRange})`;

        console.log(this.salaryGrade);
    }

    toJSON() {
        return {
            ...super.toJSON(),
            email: this.email,
            phone: this.phone,
            joinDate: this.joinDate,
            teacherId: this.teacherId,
            subjects: this.subjects,
            classesAssigned: this.classesAssigned,
            status: this.status,
            salaryGrade: this.salaryGrade,
        };
    }
}

// ===== TEACHER MANAGEMENT APP =====
class TeacherManager {
    constructor() {
        this.storageKey = "teachers_data";
        this.editMode = false;
        this.editId = null;
        this.teachers = this.loadTeachers();

        this.form = document.getElementById("teacherForm");
        this.teacherList = document.getElementById("teacherList");
        this.firstNameInput = document.getElementById("teacherFirstName");
        this.middleNameInput = document.getElementById("teacherMiddleName");
        this.lastNameInput = document.getElementById("teacherLastName");
        this.emailInput = document.getElementById("email");
        this.phoneInput = document.getElementById("phone");
        this.joinDateInput = document.getElementById("joinDate");
        this.teacherIdInput = document.getElementById("teacherId");
        this.salaryGradeInput = document.getElementById("salaryGrade");

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    init() {
        if (!this.form || !this.teacherList) return;

        this.form.addEventListener("submit", this.handleSubmit);
        this.renderTeachers();
    }

    loadTeachers() {
        const storedTeachers =
            JSON.parse(localStorage.getItem(this.storageKey)) || [];
        return storedTeachers.map((teacherData) =>
            Teacher.fromStorage(teacherData),
        );
    }

    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.teachers));
    }

    handleSubmit(event) {
        event.preventDefault();

        const teacherData = this.getTeacherDataFromForm();

        if (teacherData.subjects.length === 0) {
            alert("Please select at least one subject.");
            return;
        }

        if (teacherData.classesAssigned.length === 0) {
            alert("Please select at least one assigned class.");
            return;
        }

        if (
            !this.editMode &&
            this.hasDuplicateTeacherId(teacherData.teacherId)
        ) {
            alert("A teacher with this ID number already exists.");
            return;
        }

        if (this.editMode) {
            this.updateTeacher(teacherData);
        } else {
            this.addTeacher(teacherData);
        }

        this.saveToStorage();
        this.form.reset();
        this.renderTeachers();
    }

    getTeacherDataFromForm() {
        return new Teacher({
            id: this.editMode ? this.editId : Date.now(),
            firstName: this.firstNameInput.value,
            middleName: this.middleNameInput.value,
            lastName: this.lastNameInput.value,
            email: this.emailInput.value,
            phone: this.phoneInput.value,
            joinDate: this.joinDateInput.value,
            teacherId: String(this.teacherIdInput.value).trim(),
            subjects: this.getCheckedValues("subjects"),
            classesAssigned: this.getCheckedValues("classesAssigned"),
            status: this.form.querySelector('input[name="status"]:checked').value,
            salaryGrade: this.salaryGradeInput.value,
        });
    }

    getCheckedValues(name) {
        return [...this.form.querySelectorAll(`input[name="${name}"]:checked`)]
            .map((input) => input.value);
    }

    hasDuplicateTeacherId(teacherId) {
        return this.teachers.some((teacher) => teacher.teacherId === teacherId);
    }

    addTeacher(teacher) {
        this.teachers.push(teacher);
    }

    updateTeacher(updatedTeacher) {
        this.teachers = this.teachers.map((teacher) =>
            teacher.id === this.editId ? updatedTeacher : teacher,
        );

        this.editMode = false;
        this.editId = null;
        this.form.querySelector("button").textContent = "Add Teacher";

        this.saveToStorage();
        this.renderTeachers();

    }

    deleteTeacher(id) {
        this.teachers = this.teachers.filter((teacher) => teacher.id !== id);
        this.saveToStorage();
        this.renderTeachers();
    }

    editTeacher(id) {
        const teacher = this.teachers.find((teacherItem) => teacherItem.id === id);
        if (!teacher) return;

        this.firstNameInput.value = teacher.firstName;
        this.middleNameInput.value = teacher.middleName;
        this.lastNameInput.value = teacher.lastName;
        this.emailInput.value = teacher.email;
        this.phoneInput.value = teacher.phone;
        this.joinDateInput.value = teacher.joinDate;
        this.teacherIdInput.value = teacher.teacherId;
        this.salaryGradeInput.value = teacher.salaryGrade;
        this.setCheckedValues("subjects", teacher.subjects);
        this.setCheckedValues("classesAssigned", teacher.classesAssigned);
        this.form.querySelector(
            `input[name="status"][value="${teacher.status}"]`,
        ).checked = true;

        this.editMode = true;
        this.editId = id;
        this.form.querySelector("button").textContent = "Update Teacher";
    }

    setCheckedValues(name, values) {
        const selectedValues = values || [];

        this.form.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
            input.checked = selectedValues.includes(input.value);
        });
    }

    renderTeachers() {
        this.teacherList.innerHTML = "";

        this.teachers.forEach((teacher) => {
            const li = document.createElement("li");

            li.innerHTML = `
                <div>
                    <strong>${teacher.getFullName()}</strong><br/>
                    <small>Email: ${teacher.email} |<br/> Phone: ${teacher.phone} |<br/> ID: ${teacher.teacherId}</small><br/>
                    <small>Subjects: ${teacher.subjects.join(", ")}</small><br/>
                    <small>Classes: ${teacher.classesAssigned.join(", ")}</small><br/>
                    <small>Status: ${teacher.status} | Salary: ${teacher.getSalaryGradeLabel()}</small>
                </div>

                <div>
                    <button onclick="editTeacher(${teacher.id})">Edit</button>
                    <button onclick="deleteTeacher(${teacher.id})">Delete</button>
                </div>
            `;

            this.teacherList.appendChild(li);
        });
    }
}

// ===== STUDENT MANAGEMENT APP =====
class StudentManager {
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
        this.dobInput = document.getElementById("dob");
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
        const storedStudents =
            JSON.parse(localStorage.getItem(this.storageKey)) || [];
        return storedStudents.map((studentData) =>
            Student.fromStorage(studentData),
        );
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
            dob: this.dobInput.value,
            adm: this.admInput.value,
            class: this.classInput.value,
            subjects: this.getCheckedValues("studentSubjects"),
        });
    }

    hasDuplicateAdm(adm) {
        return this.students.some((student) => student.adm === adm);
    }

    getCheckedValues(name) {
        return [...this.form.querySelectorAll(`input[name="${name}"]:checked`)].map(
            (input) => input.value,
        );
    }

    setCheckedValues(name, values) {
        const selectedValues = values || [];
        this.form.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
            input.checked = selectedValues.includes(input.value);
        });
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
        this.dobInput.value = student.dob;
        this.admInput.value = student.adm;
        this.classInput.value = student.class;
        this.setCheckedValues("studentSubjects", student.subjects);

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
                    <small>DOB: ${student.dob} | ADM: ${student.adm} | Class: ${student.class}</small><br/>
                    <small>Subjects: ${student.subjects.length ? student.subjects.join(", ") : "None"}</small>
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

        const admissionNumbers = this.students.map((student) =>
            Number(student.adm),
        );
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

const teacherManager = new TeacherManager();
teacherManager.init();

const subjectManager = new SubjectManager();
subjectManager.init();

// Keep the existing inline HTML button capabilities working.
function editStudent(id) {
    studentManager.editStudent(id);
}

function deleteStudent(id) {
    studentManager.deleteStudent(id);
}

function editTeacher(id) {
    teacherManager.editTeacher(id);
}

function deleteTeacher(id) {
    teacherManager.deleteTeacher(id);
}

function editSubject(id) {
    subjectManager.editSubject(id);
}

function deleteSubject(id) {
    subjectManager.deleteSubject(id);
}
