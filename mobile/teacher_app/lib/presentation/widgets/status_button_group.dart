import 'package:flutter/material.dart';

import '../../domain/entities/attendance_status.dart';
import '../theme/admin_theme.dart';

/// A row of joined buttons, one per status (the classic "btn-group"). The
/// chosen one is filled with its status colour.
class StatusButtonGroup extends StatelessWidget {
  const StatusButtonGroup({
    super.key,
    required this.selected,
    required this.labelOf,
    required this.semanticsPrefix,
    this.onChanged,
  });

  final AttendanceStatus selected;
  final String Function(AttendanceStatus) labelOf;

  /// Read before each status by screen readers, e.g. the student's name.
  final String semanticsPrefix;
  final ValueChanged<AttendanceStatus>? onChanged;

  @override
  Widget build(BuildContext context) {
    const statuses = AttendanceStatus.values;
    return Row(
      children: [
        for (var i = 0; i < statuses.length; i++)
          Expanded(child: _segment(statuses[i], first: i == 0, last: i == statuses.length - 1)),
      ],
    );
  }

  Widget _segment(AttendanceStatus status, {required bool first, required bool last}) {
    final isSelected = status == selected;
    final color = toneColor(statusTone(status));
    final radius = BorderRadius.horizontal(
      left: first ? const Radius.circular(3) : Radius.zero,
      right: last ? const Radius.circular(3) : Radius.zero,
    );
    return Semantics(
      button: true,
      selected: isSelected,
      label: '$semanticsPrefix: ${labelOf(status)}',
      excludeSemantics: true,
      child: Material(
        color: isSelected ? color : AdminColors.defaultButtonBg,
        shape: RoundedRectangleBorder(
          borderRadius: radius,
          side: BorderSide(color: isSelected ? color : AdminColors.defaultButtonBorder),
        ),
        child: InkWell(
          borderRadius: radius,
          onTap: onChanged == null ? null : () => onChanged!(status),
          child: SizedBox(
            height: 44,
            child: Center(
              child: FittedBox(
                fit: BoxFit.scaleDown,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Text(
                    labelOf(status),
                    style: TextStyle(
                      color: isSelected ? Colors.white : AdminColors.defaultButtonText,
                      fontSize: 14,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
