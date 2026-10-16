import 'package:flutter/material.dart';

import '../theme/admin_theme.dart';

/// The classic admin "info box": a coloured icon square, a label and a big number.
class InfoBox extends StatelessWidget {
  const InfoBox({super.key, required this.icon, required this.label, required this.value, this.tone = Tone.primary});

  final IconData icon;
  final String label;
  final String value;
  final Tone tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 72,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: adminRadius,
        boxShadow: [BoxShadow(color: Color(0x1A000000), blurRadius: 1, offset: Offset(0, 1))],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            width: 64,
            decoration: BoxDecoration(
              color: toneColor(tone),
              borderRadius: const BorderRadius.horizontal(left: Radius.circular(3)),
            ),
            child: Icon(icon, color: Colors.white, size: 32),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 12, color: AdminColors.textMuted, fontWeight: FontWeight.w600)),
                  Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AdminColors.text)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// A small solid tile with a number over its label: the day's counts.
class CountTile extends StatelessWidget {
  const CountTile({super.key, required this.label, required this.value, required this.tone});

  final String label;
  final String value;
  final Tone tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
      decoration: BoxDecoration(color: toneColor(tone), borderRadius: adminRadius),
      child: Column(
        children: [
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700, height: 1.1)),
          Text(label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
