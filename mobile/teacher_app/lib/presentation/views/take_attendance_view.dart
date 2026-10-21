import 'package:flutter/material.dart';

import '../../app/di.dart';
import '../../domain/entities/attendance_status.dart';
import '../../domain/entities/roster.dart';
import '../../domain/entities/teacher.dart';
import '../../l10n/app_localizations.dart';
import '../format.dart';
import '../theme/admin_theme.dart';
import '../viewmodels/take_attendance_view_model.dart';
import '../widgets/admin_box.dart';
import '../widgets/callout.dart';
import '../widgets/content_header.dart';
import '../widgets/info_box.dart';
import '../widgets/status_button_group.dart';
import '../widgets/view_model_builder.dart';

/// Taking one class's day: counts on top, one row per student with a status
/// button group, and Save at the bottom.
class TakeAttendanceView extends StatelessWidget {
  const TakeAttendanceView({super.key, required this.deps, required this.schoolClass, required this.date});

  final AppDependencies deps;
  final SchoolClass schoolClass;
  final String date;

  Future<void> _save(BuildContext context, TakeAttendanceViewModel vm) async {
    final t = AppLocalizations.of(context);
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);
    final outcome = await vm.save();
    final message = switch (outcome) {
      Saved(:final kept) when kept > 0 => '${t.savedOnline}. ${t.keptNewer(formatCount(kept, deps.app.language))}',
      Saved() => t.savedOnline,
      KeptOnPhone() => t.savedOffline,
      SaveRefused(:final message) => message,
      SaveSignedOut() => null,
    };
    if (message != null) messenger.showSnackBar(SnackBar(content: Text(message)));
    if (outcome is Saved || outcome is KeptOnPhone) navigator.pop();
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return ViewModelBuilder<TakeAttendanceViewModel>(
      create: () => deps.takeAttendanceViewModel(classId: schoolClass.id, date: date),
      onReady: (vm) => vm.load(),
      builder: (context, vm) {
        final day = vm.day;
        final canSave = vm.state == ClassDayLoad.ready && vm.editable && day!.roster.students.isNotEmpty;
        return Scaffold(
          appBar: AppBar(title: Text(schoolClass.label)),
          body: switch (vm.state) {
            ClassDayLoad.loading => const Center(child: CircularProgressIndicator()),
            ClassDayLoad.noCopy => _message(t.noRosterOffline, Tone.warning, vm),
            ClassDayLoad.failed => _message(t.errorGeneric, Tone.danger, vm),
            ClassDayLoad.ready => _day(context, t, vm, day!.roster, day.fresh),
          },
          bottomNavigationBar: canSave
              ? SafeArea(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: AdminColors.border))),
                    child: FilledButton.icon(
                      onPressed: vm.saving ? null : () => _save(context, vm),
                      icon: vm.saving
                          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Icon(Icons.save),
                      label: Text(t.save),
                    ),
                  ),
                )
              : null,
        );
      },
    );
  }

  Widget _message(String text, Tone tone, TakeAttendanceViewModel vm) => Builder(
        builder: (context) => ListView(
          padding: const EdgeInsets.all(14),
          children: [
            Callout(tone: tone, text: text),
            Center(child: OutlinedButton(onPressed: vm.load, child: Text(AppLocalizations.of(context).retry))),
          ],
        ),
      );

  Widget _day(BuildContext context, AppLocalizations t, TakeAttendanceViewModel vm, Roster roster, bool fresh) {
    final locale = deps.app.language;
    final counts = vm.counts;
    String n(int v) => formatCount(v, locale);
    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        ContentHeader(title: schoolClass.label, subtitle: formatSchoolDay(roster.date, locale)),
        if (!fresh) Callout(tone: Tone.warning, icon: Icons.cloud_off, text: t.rosterOffline),
        if (!roster.editable) Callout(tone: Tone.warning, icon: Icons.lock_outline, text: t.lockedDay),
        if (roster.takenAt != null)
          Callout(
            tone: Tone.info,
            icon: Icons.history,
            text: t.takenBy(roster.takenByName ?? '', formatSchoolTime(roster.takenAt!, locale)),
          ),
        Row(
          children: [
            for (final (i, status) in AttendanceStatus.values.indexed) ...[
              if (i > 0) const SizedBox(width: 8),
              Expanded(
                child: CountTile(
                  label: statusLabel(t, status),
                  tone: statusTone(status),
                  value: n(switch (status) {
                    AttendanceStatus.present => counts.present,
                    AttendanceStatus.absent => counts.absent,
                    AttendanceStatus.late => counts.late,
                    AttendanceStatus.leave => counts.leave,
                  }),
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 16),
        AdminBox(
          title: '${t.studentsBox} (${n(roster.students.length)})',
          padding: EdgeInsets.zero,
          tools: vm.editable && roster.students.isNotEmpty
              ? OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(minimumSize: const Size(0, 34), padding: const EdgeInsets.symmetric(horizontal: 10)),
                  onPressed: vm.markAllPresent,
                  icon: const Icon(Icons.done_all, size: 18),
                  label: Text(t.allPresent),
                )
              : null,
          child: roster.students.isEmpty
              ? Padding(padding: const EdgeInsets.all(14), child: Text(t.noStudents))
              : Column(
                  children: [
                    for (final (i, student) in roster.students.indexed) ...[
                      if (i > 0) const Divider(height: 1),
                      _studentRow(t, vm, student, striped: i.isOdd),
                    ],
                  ],
                ),
        ),
      ],
    );
  }

  Widget _studentRow(AppLocalizations t, TakeAttendanceViewModel vm, RosterStudent student, {required bool striped}) {
    return Container(
      color: striped ? const Color(0xFFF9F9F9) : Colors.white,
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: const BoxDecoration(color: AdminColors.primary, borderRadius: BorderRadius.all(Radius.circular(2))),
                child: Text(student.roll, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(student.fullName,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AdminColors.text)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          StatusButtonGroup(
            selected: vm.statusOf(student.id),
            labelOf: (s) => statusLabel(t, s),
            semanticsPrefix: student.fullName,
            onChanged: vm.editable ? (s) => vm.setStatus(student.id, s) : null,
          ),
        ],
      ),
    );
  }
}
