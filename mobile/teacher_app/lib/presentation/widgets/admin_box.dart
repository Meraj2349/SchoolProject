import 'package:flutter/material.dart';

import '../theme/admin_theme.dart';

/// The classic admin "box": a white card with a coloured top border, an
/// optional header (title + tools) and footer.
class AdminBox extends StatelessWidget {
  const AdminBox({
    super.key,
    this.title,
    this.tone = Tone.primary,
    this.tools,
    this.footer,
    this.padding = const EdgeInsets.all(12),
    required this.child,
  });

  final String? title;
  final Tone tone;
  final Widget? tools;
  final Widget? footer;
  final EdgeInsets padding;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    // A Material surface, so taps on rows inside show their ripple.
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Material(
        color: Colors.white,
        elevation: 1,
        shadowColor: const Color(0x33000000),
        borderRadius: adminRadius,
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(height: 3, color: toneColor(tone)),
            if (title != null || tools != null)
              Container(
                padding: const EdgeInsets.fromLTRB(12, 10, 8, 10),
                decoration: const BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: AdminColors.divider),
                  ),
                ),
                child: Row(
                  children: [
                    if (title != null)
                      Expanded(
                        child: Text(
                          title!,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: AdminColors.text,
                          ),
                        ),
                      ),
                    ?tools,
                  ],
                ),
              ),
            Padding(padding: padding, child: child),
            if (footer != null)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: const BoxDecoration(
                  color: Color(0xFFF9FAFB),
                  border: Border(top: BorderSide(color: AdminColors.divider)),
                ),
                child: footer,
              ),
          ],
        ),
      ),
    );
  }
}
