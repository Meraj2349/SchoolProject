import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';
import '../theme/admin_theme.dart';

enum SidebarItem { today, settings }

/// The website admin's dark sidebar as the app's menu: the teacher with an
/// online/offline dot, then the pages.
class AdminSidebar extends StatelessWidget {
  const AdminSidebar({
    super.key,
    required this.teacherName,
    required this.online,
    required this.current,
    required this.onSelected,
  });

  final String teacherName;
  final bool online;
  final SidebarItem current;
  final ValueChanged<SidebarItem> onSelected;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final initials = teacherName.trim().split(RegExp(r'\s+')).where((w) => w.isNotEmpty).take(2).map((w) => w[0]).join();
    return Drawer(
      backgroundColor: AdminColors.sidebarBg,
      shape: const RoundedRectangleBorder(),
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              color: AdminColors.primaryDark,
              height: 56,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              alignment: Alignment.centerLeft,
              child: Row(
                children: [
                  Image.asset('assets/images/school_logo.png', width: 32, height: 32),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(t.schoolName,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 22,
                    backgroundColor: AdminColors.primary,
                    child: Text(initials.toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(teacherName,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                        Row(
                          children: [
                            Icon(Icons.circle, size: 10, color: online ? AdminColors.success : AdminColors.warning),
                            const SizedBox(width: 5),
                            Text(online ? t.statusOnline : t.statusOffline,
                                style: const TextStyle(color: AdminColors.sidebarText, fontSize: 12)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Container(
              color: AdminColors.sidebarUserBg,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Text(t.mainNavigation,
                  style: const TextStyle(color: AdminColors.sidebarHeading, fontSize: 12, fontWeight: FontWeight.w600)),
            ),
            _item(SidebarItem.today, Icons.fact_check_outlined, t.navToday),
            _item(SidebarItem.settings, Icons.settings_outlined, t.settingsTitle),
          ],
        ),
      ),
    );
  }

  Widget _item(SidebarItem item, IconData icon, String label) {
    final active = item == current;
    return Material(
      color: active ? AdminColors.sidebarActiveBg : Colors.transparent,
      child: InkWell(
        onTap: () => onSelected(item),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 13),
          decoration: BoxDecoration(
            border: Border(left: BorderSide(color: active ? AdminColors.primary : Colors.transparent, width: 3)),
          ),
          child: Row(
            children: [
              Icon(icon, size: 20, color: active ? Colors.white : AdminColors.sidebarText),
              const SizedBox(width: 12),
              Expanded(
                child: Text(label,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(color: active ? Colors.white : AdminColors.sidebarText, fontSize: 15)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
