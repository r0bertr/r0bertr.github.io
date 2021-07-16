$(function() {
  var inputDiff = $('#xq-diff');

  const board = new XiangQi('xq-board', parseInt(inputDiff.val()));

  inputDiff.change(function() {
    board.setMaxDepth(parseInt(inputDiff.val()));
  });
});
