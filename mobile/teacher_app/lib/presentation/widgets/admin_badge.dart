import 'package:flutter/material.dart';

import '../theme/admin_theme.dart';

/// A small square-cornered label, as on the website ("label label-success").
class AdminBadge extends StatelessWidget {
  const AdminBadge({super.key, required this.label, this.tone = Tone.muted, this.icon});

  final String label;
  final Tone tone;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(color: toneColor(tone), borderRadius: const BorderRadius.all(Radius.circular(2))),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[Icon(icon, size: 13, color: Colors.white), const SizedBox(width: 4)],
          Text(label, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700, height: 1.2)),
        ],
      ),
    );
  }
}
