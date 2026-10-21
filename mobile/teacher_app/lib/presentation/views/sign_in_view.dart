import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';
import '../theme/admin_theme.dart';
import '../viewmodels/sign_in_view_model.dart';
import '../widgets/callout.dart';

/// The classic admin login page: the school's name above a white box.
class SignInView extends StatefulWidget {
  const SignInView({super.key, required this.viewModel});

  final SignInViewModel viewModel;

  @override
  State<SignInView> createState() => _SignInViewState();
}

class _SignInViewState extends State<SignInView> {
  final _form = GlobalKey<FormState>();
  late final _server = TextEditingController(text: widget.viewModel.serverForSignIn);
  final _phone = TextEditingController();
  final _password = TextEditingController();
  late bool _editServer = _server.text.isEmpty;

  @override
  void dispose() {
    _server.dispose();
    _phone.dispose();
    _password.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_form.currentState!.validate()) return;
    widget.viewModel.submit(server: _server.text, phone: _phone.text, password: _password.text);
  }

  String? _serverError(String? value, AppLocalizations t) =>
      widget.viewModel.isValidServer(value ?? '') ? null : t.serverInvalid;

  String _errorText(SignInError error, AppLocalizations t) => switch (error) {
        SignInRefused(:final message) => message,
        SignInOffline() => t.offlineSignIn,
        SignInBadServer() => t.serverInvalid,
        SignInUnexpected() => t.errorGeneric,
      };

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final vm = widget.viewModel;
    return Scaffold(
      backgroundColor: AdminColors.loginBg,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Image.asset('assets/images/school_logo.png', height: 84),
                  const SizedBox(height: 10),
                  Text(t.schoolName,
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w700, color: AdminColors.text)),
                  Text(t.appTitle,
                      textAlign: TextAlign.center, style: const TextStyle(fontSize: 18, color: AdminColors.textMuted)),
                  const SizedBox(height: 18),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: const BoxDecoration(color: Colors.white, borderRadius: adminRadius),
                    child: Form(
                      key: _form,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(t.signInBoxMessage,
                              textAlign: TextAlign.center, style: const TextStyle(color: AdminColors.textMuted)),
                          const SizedBox(height: 16),
                          if (vm.signedOutByServer) Callout(tone: Tone.warning, text: t.signedOutNotice),
                          if (vm.error != null) Callout(tone: Tone.danger, text: _errorText(vm.error!, t)),
                          if (_editServer) ...[
                            TextFormField(
                              controller: _server,
                              keyboardType: TextInputType.url,
                              autocorrect: false,
                              decoration: InputDecoration(
                                labelText: t.serverLabel,
                                hintText: t.serverHint,
                                suffixIcon: const Icon(Icons.dns_outlined),
                              ),
                              validator: (v) => _serverError(v, t),
                            ),
                            const SizedBox(height: 12),
                          ],
                          TextFormField(
                            controller: _phone,
                            keyboardType: TextInputType.phone,
                            autofillHints: const [AutofillHints.telephoneNumber],
                            decoration: InputDecoration(
                              labelText: t.phoneLabel,
                              hintText: '01XXXXXXXXX',
                              suffixIcon: const Icon(Icons.phone_android),
                            ),
                            validator: (v) => (v ?? '').trim().isEmpty ? t.fieldRequired : null,
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: _password,
                            obscureText: true,
                            autofillHints: const [AutofillHints.password],
                            decoration: InputDecoration(labelText: t.passwordLabel, suffixIcon: const Icon(Icons.lock_outline)),
                            validator: (v) => (v ?? '').isEmpty ? t.fieldRequired : null,
                            onFieldSubmitted: (_) => _submit(),
                          ),
                          const SizedBox(height: 16),
                          FilledButton(
                            onPressed: vm.busy ? null : _submit,
                            child: vm.busy
                                ? const SizedBox(
                                    width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                : Text(t.signInButton),
                          ),
                          if (!_editServer)
                            Align(
                              alignment: Alignment.center,
                              child: TextButton(onPressed: () => setState(() => _editServer = true), child: Text(t.changeServer)),
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
