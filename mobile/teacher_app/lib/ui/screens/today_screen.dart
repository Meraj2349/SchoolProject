import 'package:flutter/material.dart';

import '../../domain/attendance.dart';
import '../../l10n/app_localizations.dart';
import '../app_controller.dart';
import '../format.dart';
import '../theme.dart';
import 'settings_screen.dart';
import 'take_attendance_screen.dart';

/// Today's date, the teacher's classes and whether each is taken, plus the
/// days saved on the phone that are still to be sent.
class TodayScreen extends StatelessWidget {
  const TodayScreen({super.key, required this.controller});

  final AppController controller;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final locale = controller.language;
    final profile = controller.profile;

    return Scaffold(
      appBar: AppBar(
        title: Text(t.appTitle),
        actions: [
          IconButton(
            tooltip: t.settingsTitle,
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute<void>(builder: (_) => SettingsScreen(controller: controller)),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: controller.refresh,
        child: ListView(
          padding: const EdgeInsets.all(16),
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            if (profile == null)
              const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
            else ...[
              Text(t.greeting(profile.teacher.fullName),
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(color: schoolNavy, fontWeight: FontWeight.w700)),
              Text(t.todayIs(formatSchoolDay(profile.today, locale)), style: const TextStyle(color: schoolInk)),
              const SizedBox(height: 12),
              if (!controller.online) _Banner(icon: Icons.cloud_off, text: t.offlineBanner, color: Colors.orange.shade800),
              _PendingBanner(controller: controller),
              for (final day in controller.pending.where((d) => d.isRefused)) _RefusedDay(controller: controller, day: day),
              if (profile.classes.isEmpty)
                Padding(padding: const EdgeInsets.only(top: 24), child: Text(t.noClasses, textAlign: TextAlign.center)),
              for (final cls in profile.classes) _ClassCard(controller: controller, schoolClass: cls, today: profile.today),
            ],
          ],
        ),
      ),
    );
  }
}

class _Banner extends StatelessWidget {
  const _Banner({required this.icon, required this.text, required this.color, this.action});

  final IconData icon;
  final String text;
  final Color color;
  final Widget? action;

  @override
  Widget build(BuildContext context) => Card(
        color: color.withValues(alpha: 0.08),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            children: [
              Icon(icon, color: color),
              const SizedBox(width: 12),
              Expanded(child: Text(text, style: TextStyle(color: color, fontWeight: FontWeight.w600))),
              ?action,
            ],
          ),
        ),
      );
}

class _PendingBanner extends StatelessWidget {
  const _PendingBanner({required this.controller});

  final AppController controller;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final waiting = controller.pending.where((d) => !d.isRefused).length;
    if (waiting == 0) return const SizedBox.shrink();
    return _Banner(
      icon: Icons.schedule_send,
      text: t.pendingBanner(formatCount(waiting, controller.language)),
      color: schoolNavy,
      action: controller.syncing
          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
          : TextButton(
              onPressed: () async {
                // This banner is gone once everything is sent, so take the messenger first.
                final messenger = ScaffoldMessenger.of(context);
                final sent = await controller.sync();
                if (sent > 0) {
                  messenger
                    ..hideCurrentSnackBar()
                    ..showSnackBar(SnackBar(content: Text(t.synced(formatCount(sent, controller.language)))));
                }
              },
              child: Text(t.syncNow),
            ),
    );
  }
}

class _RefusedDay extends StatelessWidget {
  const _RefusedDay({required this.controller, required this.day});

  final AppController controller;
  final PendingDay day;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Card(
      color: Colors.red.shade50,
      child: ListTile(
        leading: Icon(Icons.error_outline, color: Colors.red.shade800),
        title: Text(t.refusedTitle('${day.className} — ${day.section}', formatSchoolDay(day.date, controller.language))),
        subtitle: Text(day.refusal ?? ''),
        trailing: TextButton(onPressed: () => controller.discard(day), child: Text(t.discard)),
      ),
    );
  }
}

class _ClassCard extends StatelessWidget {
  const _ClassCard({required this.controller, required this.schoolClass, required this.today});

  final AppController controller;
  final SchoolClass schoolClass;
  final String today;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final locale = controller.language;
    final waiting = controller.pendingFor(schoolClass.id, today);
    final (label, color, icon) = waiting != null
        ? (t.waitingToSync, Colors.orange.shade800, Icons.schedule_send)
        : schoolClass.taken
            ? (
                schoolClass.takenAt == null ? t.takenAt('') : t.takenAt(formatSchoolTime(schoolClass.takenAt!, locale)),
                statusColors[AttendanceStatus.present]!,
                Icons.check_circle
              )
            : (t.notTaken, Colors.grey.shade700, Icons.radio_button_unchecked);

    return Card(
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        title: Text('${schoolClass.name} — ${schoolClass.section}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
        subtitle: Text(t.classStudents(formatCount(schoolClass.students, locale))),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 6),
            Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w600)),
          ],
        ),
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => TakeAttendanceScreen(controller: controller, schoolClass: schoolClass, date: today),
          ),
        ),
      ),
    );
  }
}
