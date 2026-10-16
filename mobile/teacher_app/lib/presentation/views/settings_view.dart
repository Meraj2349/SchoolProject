import 'package:flutter/material.dart';

import '../../app/di.dart';
import '../../domain/entities/teacher.dart';
import '../../l10n/app_localizations.dart';
import '../format.dart';
import '../theme/admin_theme.dart';
import '../viewmodels/settings_view_model.dart';
import '../widgets/admin_box.dart';
import '../widgets/content_header.dart';
import '../widgets/view_model_builder.dart';

/// Account, language, password and signing out, each in its own box.
class SettingsView extends StatelessWidget {
  const SettingsView({super.key, required this.deps, required this.teacher, required this.waiting});

  final AppDependencies deps;
  final Teacher? teacher;

  /// Days not sent yet: signing out deletes them, so the teacher is warned.
  final int waiting;

  Future<void> _signOut(BuildContext context, SettingsViewModel vm) async {
    final t = AppLocalizations.of(context);
    final navigator = Navigator.of(context);
    final sure = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(t.signOutConfirm),
        content: Text(waiting > 0 ? t.signOutPending(formatCount(waiting, vm.language)) : t.signOutHint),
        actions: [
          OutlinedButton(onPressed: () => Navigator.pop(context, false), child: Text(t.cancel)),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AdminColors.danger, minimumSize: const Size(0, 40)),
            onPressed: () => Navigator.pop(context, true),
            child: Text(t.signOut),
          ),
        ],
      ),
    );
    if (sure != true) return;
    await vm.signOut();
    navigator.popUntil((route) => route.isFirst);
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return ViewModelBuilder<SettingsViewModel>(
      create: deps.settingsViewModel,
      builder: (context, vm) => Scaffold(
        appBar: AppBar(title: Text(t.settingsTitle)),
        body: ListView(
          padding: const EdgeInsets.all(14),
          children: [
            ContentHeader(title: t.settingsTitle, subtitle: t.settingsSubtitle),
            if (teacher != null)
              AdminBox(
                title: t.account,
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: AdminColors.primary,
                      child: const Icon(Icons.person, color: Colors.white),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(teacher!.fullName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                          Text(teacher!.phone, style: const TextStyle(color: AdminColors.textMuted)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            AdminBox(
              title: t.language,
              tone: Tone.info,
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: RadioGroup<String>(
                groupValue: vm.language,
                onChanged: (code) => vm.setLanguage(code!),
                child: Column(children: [
                  RadioListTile<String>(value: 'bn', title: Text(t.bangla)),
                  RadioListTile<String>(value: 'en', title: Text(t.english)),
                ]),
              ),
            ),
            AdminBox(
              title: t.security,
              tone: Tone.warning,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(minimumSize: const Size(0, 44)),
                    onPressed: () => showDialog<void>(context: context, builder: (_) => _ChangePasswordDialog(viewModel: vm)),
                    icon: const Icon(Icons.lock_outline),
                    label: Text(t.changePassword),
                  ),
                  const SizedBox(height: 10),
                  FilledButton.icon(
                    style: FilledButton.styleFrom(
                      backgroundColor: AdminColors.danger,
                      shape: const RoundedRectangleBorder(borderRadius: adminRadius, side: BorderSide(color: Color(0xFFD73925))),
                    ),
                    onPressed: () => _signOut(context, vm),
                    icon: const Icon(Icons.logout),
                    label: Text(t.signOut),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ChangePasswordDialog extends StatefulWidget {
  const _ChangePasswordDialog({required this.viewModel});

  final SettingsViewModel viewModel;

  @override
  State<_ChangePasswordDialog> createState() => _ChangePasswordDialogState();
}

class _ChangePasswordDialogState extends State<_ChangePasswordDialog> {
  final _current = TextEditingController();
  final _next = TextEditingController();
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _current.dispose();
    _next.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final t = AppLocalizations.of(context);
    setState(() {
      _busy = true;
      _error = null;
    });
    final outcome = await widget.viewModel.changePassword(current: _current.text, next: _next.text);
    if (!mounted) return;
    if (outcome is PasswordChanged) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(t.passwordChanged)));
      Navigator.pop(context);
      return;
    }
    setState(() {
      _busy = false;
      _error = switch (outcome) {
        PasswordRefused(:final message) => message,
        PasswordTooShort() => t.passwordTooShort,
        PasswordOffline() => t.offlineSignIn,
        PasswordChanged() => null,
      };
    });
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return AlertDialog(
      title: Text(t.changePassword),
      content: Column(mainAxisSize: MainAxisSize.min, children: [
        TextField(controller: _current, obscureText: true, decoration: InputDecoration(labelText: t.currentPassword)),
        const SizedBox(height: 12),
        TextField(controller: _next, obscureText: true, decoration: InputDecoration(labelText: t.newPassword)),
        if (_error != null) ...[
          const SizedBox(height: 12),
          Text(_error!, style: const TextStyle(color: AdminColors.danger)),
        ],
      ]),
      actions: [
        OutlinedButton(onPressed: _busy ? null : () => Navigator.pop(context), child: Text(t.cancel)),
        FilledButton(style: FilledButton.styleFrom(minimumSize: const Size(0, 40)), onPressed: _busy ? null : _submit, child: Text(t.save)),
      ],
    );
  }
}
