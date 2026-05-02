# Database Models Relations (SYS-SCHOOL)

Below is an Entity-Relationship (ER) diagram representing the MongoDB collections and their references in the School Management System.

```mermaid
erDiagram
    User ||--o| Student : "is a (1:1)"
    User ||--o| Teacher : "is a (1:1)"
    
    Teacher ||--o{ Class : "homeroomTeacher for"
    Teacher ||--o{ Module : "teaches"
    Teacher ||--o{ Attendance : "records (optional)"
    Teacher ||--o{ TimetableEntry : "scheduled with (optional)"
    
    Class ||--o{ Student : "contains"
    Class ||--o{ Module : "has"
    Class ||--o{ Exam : "taken by"
    Class ||--o{ Attendance : "attendance taken for"
    Class ||--o{ TimetableEntry : "scheduled for"

    Module ||--o{ Exam : "tested in"
    Module ||--o{ Attendance : "attendance taken for (optional)"
    Module ||--o{ TimetableEntry : "scheduled for"
    
    Student ||--o{ Grade : "receives"
    Student ||--o{ AttendanceRecord : "tracked in"
    
    Exam ||--o{ Grade : "has grades"
    
    Attendance ||--|{ AttendanceRecord : "contains records"
    
    User ||--o{ Exam : "createdBy"
    User ||--o{ Grade : "createdBy"
    User ||--o{ Attendance : "createdBy"
    User ||--o{ Report : "createdBy"
    User ||--o{ Invoice : "createdBy"
    User ||--o{ Payment : "createdBy"
    User ||--o{ Lesson : "createdBy"
    User ||--o{ Assignment : "createdBy"
    User ||--o{ Event : "createdBy"
    User ||--o{ Document : "createdBy"
    User ||--o{ Notification : "recipient"

    Student ||--o{ Invoice : "billed"
    Student ||--o{ Payment : "pays"
    Student ||--o{ Submission : "submits"
    
    Invoice ||--o{ Payment : "has"
    
    Module ||--o{ Lesson : "contains"
    Module ||--o{ Assignment : "has"
    
    Assignment ||--o{ Submission : "tracked in"

    User {
        ObjectId _id
        String name
        String email
        String role
        Boolean isActive
    }
    
    Student {
        ObjectId _id
        ObjectId user FK
        String studentId
        ObjectId class FK
        Date dateOfBirth
    }

    Teacher {
        ObjectId _id
        ObjectId user FK
        String teacherId
        String department
    }

    Class {
        ObjectId _id
        String name
        String level
        String academicYear
        ObjectId homeroomTeacher FK
    }

    Module {
        ObjectId _id
        String code
        String name
        ObjectId class FK
        ObjectId teacher FK
    }

    Exam {
        ObjectId _id
        String title
        ObjectId module FK
        ObjectId class FK
        Date date
        ObjectId createdBy FK
    }

    Grade {
        ObjectId _id
        ObjectId student FK
        ObjectId exam FK
        Number score
        ObjectId createdBy FK
    }

    Attendance {
        ObjectId _id
        Date date
        ObjectId class FK
        ObjectId module FK
        ObjectId teacher FK
        ObjectId createdBy FK
    }

    AttendanceRecord {
        ObjectId student FK
        String status
        String note
    }

    TimetableEntry {
        ObjectId _id
        ObjectId class FK
        ObjectId module FK
        ObjectId teacher FK
        Number dayOfWeek
        String startTime
        String endTime
    }
    
    Report {
        ObjectId _id
        String title
        String type
        Date periodStart
        Date periodEnd
        ObjectId createdBy FK
    }
```

## Relationships Breakdown

1. **User Role Specialization**:
   - The `User` model acts as the base authentication entity.
   - `Student` and `Teacher` models reference `User` (1-to-1) for their specific profiles.

2. **Academics**:
   - A `Class` can have many `Student`s and many `Module`s.
   - A `Class` has an optional `homeroomTeacher` reference to `Teacher`.
   - A `Module` is linked to a `Class` and taught by a `Teacher`.

3. **Evaluation**:
   - An `Exam` is defined for a `Class` and a `Module`.
   - A `Grade` is an association between a `Student` and an `Exam` with a `score`.

4. **Scheduling & Attendance**:
   - `TimetableEntry` links a `Class`, `Module`, and `Teacher` to a specific time slot.
   - `Attendance` records the daily/module presence for a `Class` on a specific `date`.
   - `Attendance` contains subdocuments (`AttendanceRecord`) linking individual `Student`s to their presence `status`.

5. **Financials**:
   - `Invoice` is created for a `Student`.
   - `Payment` tracks the transaction for an `Invoice`.

6. **E-Learning**:
   - `Lesson` and `Assignment` are linked to a `Module`.
   - `Submission` maps a `Student`'s response to an `Assignment`.

7. **Communication & Events**:
   - `Event` is a global or role-targeted calendar entry.
   - `Notification` tracks real-time alerts for a `recipient`.

8. **Auditing**:
   - Almost all entities are tracked by a `createdBy` reference to the `User`.
