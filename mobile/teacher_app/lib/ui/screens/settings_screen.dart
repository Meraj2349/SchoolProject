import 'package:flutter/material.dart';

import '../../data/attendance_repository.dart';
import '../../data/teacher_api.dart';
import '../../l10n/app_localizations.dart';
import '../app_controller.dart';
import '../format.dart';

/// Language, password and signing out.
class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key, required this.controller});

  final AppController controller;

  Future<void> _signOut(BuildContext context) async {
    final t = AppLocalizations.of(context);
    final waiting = controller.pending.where((d) => !d.isRefused).length;
    final sure = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(t.signOutConfirm),
        content: waiting > 0 ? Text(t.signOutPending(formatCount(waiting, controller.language))) : null,
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: Text(t.cancel)),
          FilledButton(
            style: FilledButton.styleFrom(minimumSize: const Size(0, 44)),
            onPressed: () => Navigator.pop(context, true),
            child: Text(t.signOut),
          ),
        ],
      ),
    );
    if (sure != true) return;
    await controller.signOut();
    if (context.mounted) Navigator.of(context).popUntil((route) => route.isFirst);
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final teacher = controller.profile?.teacher;
    return Scaffold(
      appBar: AppBar(title: Text(t.settingsTitle)),
      body: ListenableBuilder(
        listenable: controller,
        builder: (context, _) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (teacher != null)
              ListTile(leading: const Icon(Icons.person_outline), title: Text(t.signedInAs(teacher.fullName, teacher.phone))),
            const Divider(),
            ListTile(title: Text(t.language, style: const TextStyle(fontWeight: FontWeight.w600))),
            RadioGroup<String>(
              groupValue: controller.language,
              onChanged: (code) => controller.setLanguage(code!),
              child: Column(children: [
                RadioListTile<String>(value: 'bn', title: Text(t.bangla)),
                RadioListTile<String>(value: 'en', title: Text(t.english)),
              ]),
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.lock_outline),
              title: Text(t.changePassword),
              onTap: () => showDialog<void>(context: context, builder: (_) => _ChangePasswordDialog(controller: controller)),
            ),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: Text(t.signOut, style: const TextStyle(color: Colors.red)),
              onTap: () => _signOut(context),
            ),
          ],
        ),
      ),
    );
  }
}

class _ChangePasswordDialog extends StatefulWidget {
  const _ChangePasswordDialog({required this.controller});

  final AppController controller;

  @override
  State<_ChangePasswordDialog> createState() => _ChangePasswordDialogState();
}

class _ChangePasswordDialogState extends State<_ChangePasswordDialog> {
  final _form = GlobalKey<FormState>();
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
    if (!_form.currentState!.validate()) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await widget.controller.changePassword(_current.text, _next.text);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(t.passwordChanged)));
      Navigator.pop(context);
      return;
    } on ApiException catch (e) {
      _error = e.message;
    } on OfflineException {
      _error = t.offlineSignIn;
    } on SignedOutException {
      _error = t.signedOutNotice;
    }
    if (mounted) setState(() => _busy = false);
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return AlertDialog(
      title: Text(t.changePassword),
      content: Form(
        key: _form,
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          TextFormField(
            controller: _current,
            obscureText: true,
            decoration: InputDecoration(labelText: t.currentPassword),
            validator: (v) => (v ?? '').isEmpty ? t.fieldRequired : null,
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _next,
            obscureText: true,
            decoration: InputDecoration(labelText: t.newPassword),
            validator: (v) => (v ?? '').length < 8 ? t.passwordTooShort : null,
          ),
          if (_error != null) ...[const SizedBox(height: 12), Text(_error!, style: const TextStyle(color: Colors.red))],
        ]),
      ),
      actions: [
        TextButton(onPressed: _busy ? null : () => Navigator.pop(context), child: Text(t.cancel)),
        FilledButton(
          style: FilledButton.styleFrom(minimumSize: const Size(0, 44)),
          onPressed: _busy ? null : _submit,
          child: Text(t.save),
        ),
      ],
    );
  }
}
