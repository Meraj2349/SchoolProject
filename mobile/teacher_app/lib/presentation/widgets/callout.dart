import 'package:flutter/material.dart';

import '../theme/admin_theme.dart';

/// The classic admin "callout": a note with a thick coloured left edge.
class Callout extends StatelessWidget {
  const Callout({super.key, required this.tone, required this.text, this.title, this.icon, this.action});

  final Tone tone;
  final String text;
  final String? title;
  final IconData? icon;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final color = toneColor(tone);
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.fromLTRB(12, 10, 8, 10),
      decoration: BoxDecoration(
        color: Color.alphaBlend(color.withValues(alpha: 0.08), Colors.white),
        borderRadius: adminRadius,
        border: Border(left: BorderSide(color: color, width: 5)),
      ),
      child: Row(
        children: [
          if (icon != null) ...[Icon(icon, color: color, size: 22), const SizedBox(width: 10)],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (title != null)
                  Text(title!, style: TextStyle(fontWeight: FontWeight.w700, color: Color.lerp(color, Colors.black, 0.35))),
                Text(text, style: const TextStyle(color: AdminColors.text)),
              ],
            ),
          ),
          ?action,
        ],
      ),
    );
  }
}
