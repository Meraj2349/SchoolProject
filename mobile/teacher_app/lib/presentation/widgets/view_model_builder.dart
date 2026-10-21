import 'package:flutter/widgets.dart';

/// Creates a view's view model once, rebuilds the view when it changes, and
/// disposes it with the view.
class ViewModelBuilder<T extends ChangeNotifier> extends StatefulWidget {
  const ViewModelBuilder({super.key, required this.create, required this.builder, this.onReady});

  final T Function() create;
  final Widget Function(BuildContext context, T viewModel) builder;

  /// Runs once after the view model is created (e.g. to start loading).
  final void Function(T viewModel)? onReady;

  @override
  State<ViewModelBuilder<T>> createState() => _ViewModelBuilderState<T>();
}

class _ViewModelBuilderState<T extends ChangeNotifier> extends State<ViewModelBuilder<T>> {
  late final T _viewModel = widget.create();

  @override
  void initState() {
    super.initState();
    widget.onReady?.call(_viewModel);
  }

  @override
  void dispose() {
    _viewModel.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) =>
      ListenableBuilder(listenable: _viewModel, builder: (context, _) => widget.builder(context, _viewModel));
}
