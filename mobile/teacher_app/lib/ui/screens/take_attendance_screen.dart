import 'package:flutter/material.dart';

import '../../data/attendance_repository.dart';
import '../../data/teacher_api.dart';
import '../../domain/attendance.dart';
import '../../l10n/app_localizations.dart';
import '../app_controller.dart';
import '../format.dart';
import '../theme.dart';

/// One row per student with one tap per status. Everyone starts Present (or
/// as saved); Save works without a connection too.
class TakeAttendanceScreen extends StatefulWidget {
  const TakeAttendanceScreen({super.key, required this.controller, required this.schoolClass, required this.date});

  final AppController controller;
  final SchoolClass schoolClass;
  final String date;

  @override
  State<TakeAttendanceScreen> createState() => _TakeAttendanceScreenState();
}

class _TakeAttendanceScreenState extends State<TakeAttendanceScreen> {
  Loaded<Roster>? _roster;
  final _statuses = <int, AttendanceStatus>{};
  bool _loading = true;
  bool _noCopy = false;
  bool _failed = false;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _noCopy = false;
      _failed = false;
    });
    try {
      final loaded = await widget.controller.roster(widget.schoolClass.id, widget.date);
      _statuses
        ..clear()
        ..addAll({for (final s in loaded.value.students) s.id: s.status ?? AttendanceStatus.present});
      final waiting = widget.controller.pendingFor(widget.schoolClass.id, widget.date);
      if (waiting != null) _statuses.addAll(waiting.entries);
      _roster = loaded;
    } on OfflineException {
      _noCopy = true;
    } on SignedOutException {
      if (mounted) Navigator.of(context).popUntil((route) => route.isFirst);
      return;
    } catch (_) {
      _failed = true;
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _save() async {
    final t = AppLocalizations.of(context);
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);
    setState(() => _saving = true);
    try {
      final result = await widget.controller.saveDay(_roster!.value, Map.of(_statuses));
      final kept = result.kept.length;
      messenger.showSnackBar(SnackBar(
        content: Text(result.synced
            ? (kept > 0 ? '${t.savedOnline}. ${t.keptNewer(formatCount(kept, widget.controller.language))}' : t.savedOnline)
            : t.savedOffline),
      ));
      navigator.pop();
    } on ApiException catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(e.message)));
      if (mounted) setState(() => _saving = false);
    } on SignedOutException {
      navigator.popUntil((route) => route.isFirst);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final cls = widget.schoolClass;
    final roster = _roster?.value;
    final editable = roster?.editable ?? false;

    Widget body;
    if (_loading) {
      body = const Center(child: CircularProgressIndicator());
    } else if (_noCopy || _failed || roster == null) {
      body = _Message(
        text: _noCopy ? t.noRosterOffline : t.errorGeneric,
        action: OutlinedButton(onPressed: _load, child: Text(t.retry)),
      );
    } else if (roster.students.isEmpty) {
      body = _Message(text: t.noStudents);
    } else {
      body = Column(
        children: [
          _Summary(controller: widget.controller, roster: roster, statuses: _statuses, fresh: _roster!.fresh),
          if (!editable) Padding(padding: const EdgeInsets.all(12), child: Text(t.lockedDay, style: const TextStyle(color: Colors.red))),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.only(bottom: 96),
              itemCount: roster.students.length,
              separatorBuilder: (_, _) => const Divider(height: 1),
              itemBuilder: (context, i) {
                final student = roster.students[i];
                return _StudentRow(
                  student: student,
                  status: _statuses[student.id]!,
                  enabled: editable && !_saving,
                  onChanged: (status) => setState(() => _statuses[student.id] = status),
                );
              },
            ),
          ),
        ],
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(t.takeTitle(cls.name, cls.section)),
        actions: [
          if (editable && roster != null && roster.students.isNotEmpty)
            TextButton(
              onPressed: _saving
                  ? null
                  : () => setState(() {
                        for (final s in roster.students) {
                          _statuses[s.id] = AttendanceStatus.present;
                        }
                      }),
              child: Text(t.allPresent, style: const TextStyle(color: schoolGoldSoft)),
            ),
        ],
      ),
      body: body,
      bottomNavigationBar: editable && roster != null && roster.students.isNotEmpty
          ? SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: FilledButton.icon(
                  onPressed: _saving ? null : _save,
                  icon: _saving
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.save),
                  label: Text(t.save),
                ),
              ),
            )
          : null,
    );
  }
}

class _Message extends StatelessWidget {
  const _Message({required this.text, this.action});

  final String text;
  final Widget? action;

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text(text, textAlign: TextAlign.center),
            if (action != null) ...[const SizedBox(height: 12), action!],
          ]),
        ),
      );
}

class _Summary extends StatelessWidget {
  const _Summary({required this.controller, required this.roster, required this.statuses, required this.fresh});

  final AppController controller;
  final Roster roster;
  final Map<int, AttendanceStatus> statuses;
  final bool fresh;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final locale = controller.language;
    final counts = DayCounts.of(statuses.values);
    String n(int v) => formatCount(v, locale);
    return Container(
      width: double.infinity,
      color: schoolNavyDeep,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(formatSchoolDay(roster.date, locale), style: const TextStyle(color: schoolGoldSoft, fontWeight: FontWeight.w600)),
          Text(t.counts(n(counts.present), n(counts.absent), n(counts.late), n(counts.leave)),
              style: const TextStyle(color: Colors.white, fontSize: 16)),
          if (roster.takenAt != null)
            Text(t.takenBy(roster.takenByName ?? '', formatSchoolTime(roster.takenAt!, locale)),
                style: const TextStyle(color: Colors.white70)),
          if (!fresh) Text(t.rosterOffline, style: const TextStyle(color: schoolGoldSoft)),
        ],
      ),
    );
  }
}

class _StudentRow extends StatelessWidget {
  const _StudentRow({required this.student, required this.status, required this.enabled, required this.onChanged});

  final RosterStudent student;
  final AttendanceStatus status;
  final bool enabled;
  final ValueChanged<AttendanceStatus> onChanged;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    // Name on its own line (names can be long), the four statuses below it, full width.
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: schoolNavy,
                foregroundColor: Colors.white,
                child: Text(student.roll, style: const TextStyle(fontWeight: FontWeight.w700)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(student.fullName,
                    maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              for (final option in AttendanceStatus.values)
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 3),
                    child: Semantics(
                      button: true,
                      selected: option == status,
                      label: '${student.fullName}: ${statusLabel(t, option)}',
                      excludeSemantics: true,
                      child: _StatusButton(
                        label: statusLabel(t, option),
                        color: statusColors[option]!,
                        selected: option == status,
                        onTap: enabled ? () => onChanged(option) : null,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatusButton extends StatelessWidget {
  const _StatusButton({required this.label, required this.color, required this.selected, required this.onTap});

  final String label;
  final Color color;
  final bool selected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) => Material(
        color: selected ? color : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10), side: BorderSide(color: color, width: 1.5)),
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: onTap,
          child: SizedBox(
            height: 48,
            child: Center(
              child: FittedBox(
                fit: BoxFit.scaleDown,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Text(label, style: TextStyle(color: selected ? Colors.white : color, fontSize: 15, fontWeight: FontWeight.w700)),
                ),
              ),
            ),
          ),
        ),
      );
}
