class Teacher {
  const Teacher({required this.id, required this.firstName, required this.lastName, required this.phone});

  final int id;
  final String firstName;
  final String lastName;
  final String phone;

  String get fullName => [firstName, lastName].where((p) => p.isNotEmpty).join(' ');
}

/// A class the teacher is class teacher of, and whether today is taken.
class SchoolClass {
  const SchoolClass({
    required this.id,
    required this.name,
    required this.section,
    required this.students,
    required this.taken,
    this.takenAt,
  });

  final int id;
  final String name;
  final String section;
  final int students;
  final bool taken;
  final DateTime? takenAt;

  String get label => '$name — $section';
}

/// The signed-in teacher, their classes and the school's today.
class Profile {
  const Profile({required this.teacher, required this.today, required this.classes});

  final Teacher teacher;
  final String today;
  final List<SchoolClass> classes;

  /// This profile on [day]: the classes as not taken yet (the phone cannot
  /// know otherwise while offline).
  Profile forDay(String day) => day == today
      ? this
      : Profile(
          teacher: teacher,
          today: day,
          classes: [
            for (final c in classes)
              SchoolClass(id: c.id, name: c.name, section: c.section, students: c.students, taken: false),
          ],
        );
}
