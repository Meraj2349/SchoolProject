import 'package:flutter/material.dart';

import '../../app/di.dart';
import '../../domain/entities/pending_day.dart';
import '../../domain/entities/day_overview.dart';
import '../../l10n/app_localizations.dart';
import '../format.dart';
import '../theme/admin_theme.dart';
import '../viewmodels/today_view_model.dart';
import '../widgets/admin_badge.dart';
import '../widgets/admin_box.dart';
import '../widgets/admin_sidebar.dart';
import '../widgets/callout.dart';
import '../widgets/content_header.dart';
import '../widgets/info_box.dart';
import 'settings_view.dart';
import 'take_attendance_view.dart';

/// The teacher's dashboard: today's date, counts, the classes and their state,
/// and the days still to be sent.
class TodayView extends StatefulWidget {
  const TodayView({super.key, required this.deps, required this.viewModel});

  final AppDependencies deps;
  final TodayViewModel viewModel;

  @override
  State<TodayView> createState() => _TodayViewState();
}

class _TodayViewState extends State<TodayView> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  /// Back in the app (perhaps the next morning): reload the day and send what waits.
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) widget.viewModel.load();
  }

  Future<void> _sync() async {
    final t = AppLocalizations.of(context);
    final messenger = ScaffoldMessenger.of(context);
    final sent = await widget.viewModel.sync();
    if (sent > 0) {
      messenger
        ..hideCurrentSnackBar()
        ..showSnackBar(SnackBar(content: Text(t.synced(formatCount(sent, widget.deps.app.language)))));
    }
  }

  Future<void> _openClass(ClassToday cls, String date) async {
    await Navigator.of(context).push(MaterialPageRoute<void>(
      builder: (_) => TakeAttendanceView(deps: widget.deps, schoolClass: cls.schoolClass, date: date),
    ));
    await widget.viewModel.load();
  }

  void _openSettings() {
    final teacher = widget.viewModel.overview?.profile.teacher;
    Navigator.of(context).push(MaterialPageRoute<void>(
      builder: (_) => SettingsView(deps: widget.deps, teacher: teacher, waiting: widget.viewModel.overview?.waiting ?? 0),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final vm = widget.viewModel;
    final overview = vm.overview;
    final locale = widget.deps.app.language;
    return Scaffold(
      appBar: AppBar(title: Text(t.appTitle)),
      drawer: AdminSidebar(
        teacherName: overview?.profile.teacher.fullName ?? '',
        online: vm.online,
        current: SidebarItem.today,
        onSelected: (item) {
          Navigator.of(context).pop();
          if (item == SidebarItem.settings) _openSettings();
        },
      ),
      body: RefreshIndicator(
        onRefresh: vm.load,
        child: ListView(
          padding: const EdgeInsets.all(14),
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            ContentHeader(
              title: t.navToday,
              subtitle: overview == null ? null : t.todayIs(formatSchoolDay(overview.today, locale)),
            ),
            if (overview == null && vm.loading) const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator())),
            if (overview == null && vm.offlineWithoutCopy) Callout(tone: Tone.warning, icon: Icons.cloud_off, text: t.offlineSignIn),
            if (overview != null) ..._dashboard(context, t, overview, locale),
          ],
        ),
      ),
    );
  }

  List<Widget> _dashboard(BuildContext context, AppLocalizations t, TodayOverview overview, String locale) {
    final vm = widget.viewModel;
    String n(int v) => formatCount(v, locale);
    int count(ClassDayState s) => overview.classes.where((c) => c.state == s).length;
    return [
      if (!overview.online) Callout(tone: Tone.warning, icon: Icons.cloud_off, text: t.offlineBanner),
      for (final day in overview.refused) _refusedCallout(t, day, locale),
      GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 2.3,
        children: [
          InfoBox(icon: Icons.class_outlined, label: t.statClasses, value: n(overview.classes.length)),
          InfoBox(icon: Icons.check_circle_outline, label: t.statTaken, value: n(count(ClassDayState.taken)), tone: Tone.success),
          InfoBox(icon: Icons.pending_actions, label: t.statNotTaken, value: n(count(ClassDayState.notTaken)), tone: Tone.danger),
          InfoBox(icon: Icons.schedule_send, label: t.statWaiting, value: n(overview.waiting), tone: Tone.warning),
        ],
      ),
      const SizedBox(height: 16),
      if (overview.waiting > 0)
        Callout(
          tone: Tone.info,
          icon: Icons.schedule_send,
          text: t.pendingBanner(n(overview.waiting)),
          action: vm.syncing
              ? Padding(padding: const EdgeInsets.all(8), child: Text(t.sending))
              : FilledButton(
                  style: FilledButton.styleFrom(minimumSize: const Size(0, 36)),
                  onPressed: _sync,
                  child: Text(t.syncNow),
                ),
        ),
      AdminBox(
        title: t.myClasses,
        padding: EdgeInsets.zero,
        child: overview.classes.isEmpty
            ? Padding(padding: const EdgeInsets.all(14), child: Text(t.noClasses))
            : Column(
                children: [
                  for (final (i, cls) in overview.classes.indexed) ...[
                    if (i > 0) const Divider(height: 1),
                    _classRow(t, cls, overview.today, locale),
                  ],
                ],
              ),
      ),
    ];
  }

  Widget _classRow(AppLocalizations t, ClassToday cls, String today, String locale) {
    final badge = switch (cls.state) {
      ClassDayState.taken => AdminBadge(
          tone: Tone.success,
          icon: Icons.check,
          label: cls.takenAt == null ? t.statTaken : formatSchoolTime(cls.takenAt!, locale),
        ),
      ClassDayState.waiting => AdminBadge(tone: Tone.warning, icon: Icons.schedule_send, label: t.waitingToSync),
      ClassDayState.notTaken => AdminBadge(tone: Tone.danger, label: t.notTaken),
    };
    return InkWell(
      onTap: () => _openClass(cls, today),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: const BoxDecoration(color: AdminColors.primary, borderRadius: adminRadius),
              child: const Icon(Icons.groups_outlined, color: Colors.white),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(cls.schoolClass.label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AdminColors.text)),
                  const SizedBox(height: 3),
                  Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      badge,
                      Text(t.classStudents(formatCount(cls.schoolClass.students, locale)),
                          style: const TextStyle(color: AdminColors.textMuted, fontSize: 13)),
                    ],
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AdminColors.textMuted),
          ],
        ),
      ),
    );
  }

  Widget _refusedCallout(AppLocalizations t, PendingDay day, String locale) => Callout(
        tone: Tone.danger,
        icon: Icons.error_outline,
        title: t.refusedTitle('${day.className} — ${day.section}', formatSchoolDay(day.date, locale)),
        text: day.refusal ?? '',
        action: TextButton(onPressed: () => widget.viewModel.discard(day), child: Text(t.discard)),
      );
}
