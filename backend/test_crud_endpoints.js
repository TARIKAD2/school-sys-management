const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5000/api';
let token = '';
let headers = { 'Content-Type': 'application/json' };
let results = { working: [], failed: [] };

async function myFetch(url, options = {}) {
  options.headers = { ...headers, ...options.headers };
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || JSON.stringify(data) || res.statusText);
    error.response = { data, status: res.status };
    throw error;
  }
  return { data };
}

async function loginAdmin() {
  const res = await myFetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@school.com', password: 'school123' })
  });
  token = res.data.token;
  headers['Authorization'] = `Bearer ${token}`;
  console.log("Logged in as admin.");
}

async function testEndpoint(name, urlPath, createData, updateData) {
  let createdId = null;
  let status = "Working";
  let failStage = "";
  let errorMsg = "";

  try {
    failStage = "CREATE";
    const createRes = await myFetch(`${BASE_URL}${urlPath}`, {
      method: 'POST',
      body: JSON.stringify(createData)
    });
    createdId = createRes.data._id || (createRes.data.item && createRes.data.item._id) || (createRes.data.data && createRes.data.data._id) || (createRes.data.student && createRes.data.student._id) || (createRes.data.teacher && createRes.data.teacher._id) || createRes.data.id;
    if (!createdId) throw new Error("Could not extract ID from create response: " + JSON.stringify(createRes.data).substring(0, 50));

    failStage = "READ LIST";
    const listRes = await myFetch(`${BASE_URL}${urlPath}`);
    if (!listRes.data || (!Array.isArray(listRes.data) && !Array.isArray(listRes.data.items))) {
        throw new Error("List did not return array or .items");
    }

    failStage = "UPDATE";
    if (updateData) {
      await myFetch(`${BASE_URL}${urlPath}/${createdId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
    }

    failStage = "DELETE";
    await myFetch(`${BASE_URL}${urlPath}/${createdId}`, { method: 'DELETE' });

    results.working.push(name);
    console.log(`[PASS] ${name}`);
  } catch (err) {
    status = "Failed";
    errorMsg = err.response ? JSON.stringify(err.response.data) : err.message;
    console.error(`[FAIL] ${name} at ${failStage}:`, errorMsg.substring(0, 100));
    results.failed.push({ name, stage: failStage, error: errorMsg });
  } finally {
    if (createdId && status === "Failed") {
      try { await myFetch(`${BASE_URL}${urlPath}/${createdId}`, { method: 'DELETE' }); } catch(e){}
    }
  }
}

async function runTests() {
  try {
    await loginAdmin();

    const classes = await myFetch(`${BASE_URL}/classes`);
    const classId = classes.data.items[0]._id;

    const modulesData = await myFetch(`${BASE_URL}/modules`);
    const moduleId = modulesData.data.items[0]._id;

    const students = await myFetch(`${BASE_URL}/students`);
    const studentId = students.data.items[0]._id;
    const studentUserId = students.data.items[0].user._id || students.data.items[0].user;

    const teachers = await myFetch(`${BASE_URL}/teachers`);
    const teacherId = teachers.data.items[0]._id;

    console.log("Got refs for testing. Proceeding with tests...\n");

    const rndId = Date.now().toString().slice(-4);
    await testEndpoint('Students', '/students', {
      name: "Test Student XYZ", studentId: `TST${rndId}`, email: `st${rndId}@school.com`, password: "password123", class: classId
    }, { name: "Test Student XYZ Updated" });

    await testEndpoint('Teachers', '/teachers', {
      name: "Test Teacher XYZ", teacherId: `TXYZ${rndId}`, email: `tc${rndId}@school.com`, password: "password123", department: "Math"
    }, { department: "Science" });

    await testEndpoint('Classes', '/classes', {
      name: `Test Class Z${rndId}`, level: "1 BAC", academicYear: "2026/2027", homeroomTeacherId: teacherId
    }, { name: "Test Class Z Updated" });

    await testEndpoint('Modules', '/modules', {
      name: "Test Module", code: `TST-MOD${rndId}`, class: classId, teacher: teacherId
    }, { name: "Test Module Updated" });

    await testEndpoint('Lessons', '/elearning/lessons', {
      module: moduleId, title: "Test Lesson", content: "Test Content", fileType: "pdf"
    }, { title: "Test Lesson Updated" });

    await testEndpoint('Exams', '/exams', {
      title: "Test Exam", moduleId: moduleId, classId: classId, date: new Date().toISOString()
    }, { title: "Test Exam Updated" });

    const testExam = (await myFetch(`${BASE_URL}/exams`, { method: 'POST', body: JSON.stringify({ title: "Test Grade Exam", moduleId: moduleId, classId: classId, date: new Date().toISOString() }) })).data;
    const testExamId = testExam._id || testExam.item?._id;
    await testEndpoint('Grades', '/grades', {
      studentId: studentId, examId: testExamId, score: 95, comment: "Good"
    }, { score: 98 });
    await myFetch(`${BASE_URL}/exams/${testExamId}`, { method: 'DELETE' }).catch(e=>{});

    await testEndpoint('Assignments', '/elearning/assignments', {
      module: moduleId, title: "Test Assignment", instructions: "Do it", deadline: new Date().toISOString(), points: 100
    }, { title: "Test Assignment Updated" });

    // Submissions creation requires student role, bypassing for Admin test

    await testEndpoint('Attendances', '/attendance', {
      date: new Date("2030-01-01").toISOString(), classId: classId, moduleId: moduleId, records: [{ student: studentId, status: "present" }]
    }, { records: [{ student: studentId, status: "absent" }] });

    await testEndpoint('Timetable Entries', '/timetable', {
      classId: classId, moduleId: moduleId, teacherId: teacherId, dayOfWeek: 1, startTime: "08:00", endTime: "10:00"
    }, { startTime: "09:00" });

    await testEndpoint('Invoices', '/payments/invoices', {
      studentId: studentId, title: "Test Invoice", amount: 1000, dueDate: new Date().toISOString(), items: [{ description: "test fee", price: 1000 }]
    });
    
    // Check payments explicitly disabled since the payment is recorded differently maybe (has its own schema or process)
    

    await testEndpoint('Demands', '/demands', {
      student: studentId, recipientType: "student", message: "Test message from admin"
    }, { message: "Test updated" });

    await testEndpoint('Documents', '/documents', {
      title: "Test Doc", fileUrl: "http://test.com", fileType: "application/pdf"
    }, { title: "Re Doc" });

    await testEndpoint('Events', '/events', {
      title: "Test Event", startDate: new Date(), type: "meeting", targetRoles: ["teacher"]
    }, { title: "Test Event updated" });

    await testEndpoint('Notifications', '/notifications', {
      recipient: studentUserId, title: "Test Notif", message: "A test message", type: "info"
    }, { isRead: true });

    console.log("\n--- TEST REPORT ---");
    console.log(`Passed: ${results.working.length}`);
    console.log(`Failed: ${results.failed.length}`);
    results.failed.forEach(f => {
      console.log(` - ${f.name} (failed at ${f.stage}): ${f.error}`);
    });

  } catch(e) {
    console.error("Critical error during test initialization:", e.message);
  }
}

runTests();
