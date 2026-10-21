/// A branch (শাখা) of the school family; each teacher belongs to one.
class Branch {
  const Branch({required this.id, required this.nameBn, required this.nameEn});

  final int id;
  final String nameBn;
  final String nameEn;

  /// The name in [languageCode] ('bn' or 'en'), else the other one.
  String nameIn(String languageCode) {
    final (wanted, other) = languageCode == 'en' ? (nameEn, nameBn) : (nameBn, nameEn);
    return wanted.trim().isNotEmpty ? wanted : other;
  }

  @override
  bool operator ==(Object other) => other is Branch && other.id == id && other.nameBn == nameBn && other.nameEn == nameEn;

  @override
  int get hashCode => Object.hash(id, nameBn, nameEn);
}

class Teacher {
  const Teacher({required this.id, required this.firstName, required this.lastName, required this.phone, this.branch});

  final int id;
  final String firstName;
  final String lastName;
  final String phone;

  /// Null from older servers and from profiles kept on the phone before branches.
  final Branch? branch;

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
