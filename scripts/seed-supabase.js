#!/usr/bin/env node
// Seeds the demo accounts + sample data via the service role key (bypasses
// RLS). Usage in README. Safe to re-run — matches on natural keys and
// skips anything that already exists.
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Get these from Project settings -> API in your Supabase project (the\n" +
      "service_role secret, not the anon key), then run:\n" +
      "  SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=... npm run seed"
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function upsertAuthUser(email, password) {
  const { data: page, error: listError } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (listError) throw listError;
  const existing = page.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) return existing;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  return data.user;
}

async function upsertByMatch(table, match, values) {
  const { data: existing, error: selectError } = await admin.from(table).select("*").match(match).maybeSingle();
  if (selectError) throw selectError;
  if (existing) return existing;
  const { data, error } = await admin.from(table).insert(values).select().single();
  if (error) throw error;
  return data;
}

const courseSeed = [
  { name: "Java" },
  { name: "Computer Science" },
];

const subjectSeed = [
  { name: "Core Java", courseName: "Java" },
  { name: "Advance Java", courseName: "Java" },
  { name: "Artificial Intelligence", courseName: "Computer Science" },
  { name: "Machine Learning", courseName: "Computer Science" },
];

const studentSeed = [
  { name: "Ama Boateng", courseName: "Java" },
  { name: "Kofi Asante", courseName: "Java" },
  { name: "Efua Darko", courseName: "Java" },
  { name: "Yaw Appiah", courseName: "Computer Science" },
  { name: "Abena Osei", courseName: "Computer Science" },
  { name: "Kojo Antwi", courseName: "Computer Science" },
];

const staffSeed = [
  {
    email: "grace.mensah@school.edu",
    password: "staff123",
    name: "Grace Mensah",
    contactNumber: "024-555-0101",
    subjectNames: ["Core Java", "Advance Java"],
  },
  {
    email: "kwame.owusu@school.edu",
    password: "staff123",
    name: "Kwame Owusu",
    contactNumber: "024-555-0102",
    subjectNames: ["Artificial Intelligence", "Machine Learning"],
  },
];

const slotSeed = [
  { subjectName: "Core Java", staffEmail: "grace.mensah@school.edu", dayOfWeek: "Mon", startTime: "09:00", endTime: "10:00" },
  { subjectName: "Advance Java", staffEmail: "grace.mensah@school.edu", dayOfWeek: "Wed", startTime: "11:00", endTime: "12:00" },
  { subjectName: "Artificial Intelligence", staffEmail: "kwame.owusu@school.edu", dayOfWeek: "Mon", startTime: "10:00", endTime: "11:00" },
  { subjectName: "Machine Learning", staffEmail: "kwame.owusu@school.edu", dayOfWeek: "Thu", startTime: "13:00", endTime: "14:30" },
];

async function main() {
  const adminUser = await upsertAuthUser("admin@school.edu", "admin123");
  await upsertByMatch("profiles", { id: adminUser.id }, { id: adminUser.id, role: "admin", name: "Admin" });
  console.log(`Admin ready: admin@school.edu / admin123 (id ${adminUser.id})`);

  const courseIdByName = {};
  for (const course of courseSeed) {
    const row = await upsertByMatch("courses", { name: course.name }, { name: course.name });
    courseIdByName[course.name] = row.id;
  }

  const subjectIdByName = {};
  for (const subject of subjectSeed) {
    const row = await upsertByMatch(
      "subjects",
      { name: subject.name, course_id: courseIdByName[subject.courseName] },
      { name: subject.name, course_id: courseIdByName[subject.courseName] }
    );
    subjectIdByName[subject.name] = row.id;
  }

  for (const student of studentSeed) {
    await upsertByMatch(
      "students",
      { name: student.name, course_id: courseIdByName[student.courseName] },
      { name: student.name, course_id: courseIdByName[student.courseName] }
    );
  }

  const staffIdByEmail = {};
  for (const staff of staffSeed) {
    const user = await upsertAuthUser(staff.email, staff.password);
    staffIdByEmail[staff.email] = user.id;
    await upsertByMatch(
      "staff",
      { id: user.id },
      {
        id: user.id,
        name: staff.name,
        email: staff.email,
        contact_number: staff.contactNumber,
        subject_ids: staff.subjectNames.map((subjectName) => subjectIdByName[subjectName]),
      }
    );
    await upsertByMatch("profiles", { id: user.id }, { id: user.id, role: "staff", name: staff.name });
    console.log(`Staff ready: ${staff.email} / ${staff.password} (id ${user.id})`);
  }

  for (const slot of slotSeed) {
    const staffId = staffIdByEmail[slot.staffEmail];
    await upsertByMatch(
      "slots",
      { staff_id: staffId, day_of_week: slot.dayOfWeek, start_time: slot.startTime },
      {
        subject_id: subjectIdByName[slot.subjectName],
        staff_id: staffId,
        day_of_week: slot.dayOfWeek,
        start_time: slot.startTime,
        end_time: slot.endTime,
      }
    );
  }

  console.log("\nSeed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
