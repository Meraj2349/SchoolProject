import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../data/teacher_api.dart';
import '../../l10n/app_localizations.dart';
import '../app_controller.dart';
import '../theme.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key, required this.controller});

  final AppController controller;

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _form = GlobalKey<FormState>();
  late final _server = TextEditingController(text: widget.controller.serverUrl ?? widget.controller.defaultServerUrl);
  final _phone = TextEditingController();
  final _password = TextEditingController();
  late bool _editServer = _server.text.isEmpty;
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _server.dispose();
    _phone.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final t = AppLocalizations.of(context);
    if (!_form.currentState!.validate()) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    String? error;
    try {
      error = await widget.controller.signIn(server: _server.text, phone: _phone.text, password: _password.text);
    } on OfflineException {
      error = t.offlineSignIn;
    } on FormatException {
      error = t.serverInvalid;
    } catch (_) {
      error = t.errorGeneric;
    }
    if (!mounted) return;
    setState(() {
      _busy = false;
      _error = error;
    });
  }

  String? _serverError(String? value, AppLocalizations t) {
    try {
      parseServerUrl(value ?? '', allowInsecure: kDebugMode);
      return null;
    } on FormatException {
      return t.serverInvalid;
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Form(
                key: _form,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Icon(Icons.fact_check_outlined, size: 56, color: schoolNavy),
                    const SizedBox(height: 8),
                    Text(t.schoolName, textAlign: TextAlign.center, style: const TextStyle(color: schoolGold, fontWeight: FontWeight.w600)),
                    Text(t.appTitle,
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: schoolNavy, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 8),
                    Text(t.signInHint, textAlign: TextAlign.center),
                    if (widget.controller.signedOutByServer) ...[
                      const SizedBox(height: 12),
                      Text(t.signedOutNotice, textAlign: TextAlign.center, style: const TextStyle(color: Colors.red)),
                    ],
                    const SizedBox(height: 24),
                    if (_editServer)
                      TextFormField(
                        controller: _server,
                        keyboardType: TextInputType.url,
                        autocorrect: false,
                        decoration: InputDecoration(labelText: t.serverLabel, hintText: t.serverHint),
                        validator: (v) => _serverError(v, t),
                      )
                    else
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(onPressed: () => setState(() => _editServer = true), child: Text(t.changeServer)),
                      ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _phone,
                      keyboardType: TextInputType.phone,
                      autofillHints: const [AutofillHints.telephoneNumber],
                      decoration: InputDecoration(labelText: t.phoneLabel, hintText: '01XXXXXXXXX'),
                      validator: (v) => (v ?? '').trim().isEmpty ? t.fieldRequired : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _password,
                      obscureText: true,
                      autofillHints: const [AutofillHints.password],
                      decoration: InputDecoration(labelText: t.passwordLabel),
                      validator: (v) => (v ?? '').isEmpty ? t.fieldRequired : null,
                      onFieldSubmitted: (_) => _submit(),
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: 12),
                      Text(_error!, style: const TextStyle(color: Colors.red), semanticsLabel: _error),
                    ],
                    const SizedBox(height: 20),
                    FilledButton(
                      onPressed: _busy ? null : _submit,
                      child: _busy
                          ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : Text(t.signInButton),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
