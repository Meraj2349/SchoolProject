import 'package:flutter/material.dart';

import '../theme/admin_theme.dart';

/// The page title and a small subtitle above the content, as on the website.
class ContentHeader extends StatelessWidget {
  const ContentHeader({super.key, required this.title, this.subtitle});

  final String title;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 22, color: AdminColors.text, height: 1.2)),
          if (subtitle != null)
            Text(subtitle!, style: const TextStyle(fontSize: 14, color: AdminColors.textMuted)),
        ],
      ),
    );
  }
}
