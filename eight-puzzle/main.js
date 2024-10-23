$(function() {
  class Node {
    constructor(state, g, hFunc, parent) {
      this.state = _.cloneDeep(state);
      this.g = g;
      this.h = hFunc(this.state);
      this.f = this.g + this.h;
      this.parent = parent;
    }
  }

  const goalState = [1, 2, 3, 8, 0, 4, 7, 6, 5];
  const dirs = ['up', 'down', 'left', 'right'];
  const hFuncs = [h1, h2];
  const problems = [
    [0, 1, 7, 4, 3, 8, 6, 2, 5],
  ];
  var playground = [1, 2, 3, 8, 0, 4, 7, 6, 5];
  var btnShuffle = $('#ed-btn-shuffle');
  var btnSolve = $('#ed-btn-solve');
  var inputHFunc = $('#ed-input-hFunc');
  var inputProblem = $('#ed-input-problem');
  var infoOpen = $('#ed-info-open');
  var infoClose = $('#ed-info-close');
  var infoState = $('#ed-info-state');
  var infoTotal = $('#ed-info-total');
  var infoBest = $('#ed-info-best');
  var infoPath = $('#ed-path');

  btnShuffle.click(onShuffle);
  btnSolve.click(onSolve);

  function onSolve() {
    infoState.text('Searching...');
    hFunc = hFuncs[parseInt(inputHFunc.val())];
    var open = [new Node(playground, 0, hFunc, null)];
    var close = [];
    var intervalID = setInterval(function() {
      if (open.length == 0) {
        clearInterval(intervalID);
      }
      var cur = _.minBy(open, function(o) { return o.f; });
      infoOpen.text(open.length);
      infoClose.text(close.length);
      infoTotal.text(open.length + close.length);
      infoBest.text('[' + cur.state.toString() + '](' + cur.f + ')');
      if (_.isEqual(cur.state, goalState)) {
        infoState.text('Search complete!');
        restoreBy(cur);
        clearInterval(intervalID);
      }
      _.remove(open, function(o) { return o == cur });
      close.push(cur);
      for (var i = 0; i < dirs.length; i++) {
        var state = move(dirs[i], cur.state);
        if (!state) continue;
        var node = new Node(state, cur.g + 1, hFunc, cur);
        var openIndex = _.findIndex(open,
          function(o) { return _.isEqual(o.state, node.state); });
        if (openIndex > -1 && node.f < open[openIndex].f) {
          open[openIndex].parent = node.parent;
          open[openIndex].g = node.g;
          open[openIndex].h = node.h;
          open[openIndex].f = node.f;
          continue;
        }
        var closeIndex = _.findIndex(close,
          function(o) { return _.isEqual(o.state, node.state); });
        if (closeIndex > -1 && node.f < close[closeIndex].f) {
          var tmp = close[closeIndex];
          tmp.parent = node.parent;
          tmp.g = node.g;
          tmp.h = node.h;
          tmp.f = node.f;
          open.push(tmp);
          close.splice(closeIndex, 1);
          continue;
        }
        if (openIndex == -1 && closeIndex == -1)
          open.push(node);
      }
    }, 1);
  }

  function restoreBy(node) {
    var path = [];
    var n = node;
    while (n) {
      path.push(n);
      n = n.parent;
    }
    var i = path.length - 1;
    var intervalID = setInterval(function() {
      apply(path[i].state);
      infoPath.append(
        '<tr>' + 
          '<td>[' + path[i].state.toString() + ']</td>' +
          '<td>' + path[i].g + '</td>' +
          '<td>' + path[i].h + '</td>' +
          '<td>' + path[i].f + '</td>' +
        '</tr>'
      );
      i--;
      if (i < 0) {
        clearInterval(intervalID);
      }
    }, 250);
  }

  function onShuffle() {
    infoState.text('Ready...');
    infoOpen.text('1');
    infoClose.text('0');
    infoBest.text('');
    infoPath.empty();
    var problem = parseInt(inputProblem.val());
    if (problem == -1) {
      var state = _.cloneDeep(playground);
      do {
        state = knuthShuffle(state);
      } while (!valid(state))
    } else {
      state = _.cloneDeep(problems[problem]);
    }
    apply(state);
  }

  function h1(state) {
    var sum = 0;
    for (var i = 0; i < state.length; i++) {
      if (state[i] != goalState[i] && state[i] != 0) sum++;
    }
    return sum;
  }

  function h2(state) {
    var sum = 0;
    for (var i = 0; i < state.length; i++) {
      if (state[i] == 0)
        continue;
      var pos = 0;
      for (var j = 0; j < goalState.length; j++) {
        if (goalState[j] == state[i]) {
          pos = j;
          break;
        }
      }
      var rowX = parseInt(i / 3), colX = i % 3;
      var rowY = parseInt(pos / 3), colY = pos % 3;
      sum += Math.abs(rowX - rowY) + Math.abs(colX - colY);
    }
    return sum;
  }

  function move(direction, arr) {
    var ret = _.cloneDeep(arr);
    var pos = _.indexOf(ret, 0);
    var otherPos = pos;
    switch (direction) {
    case 'up':
      otherPos = pos - 3 >= 0 ? pos - 3 : pos;
      break;
    case 'down':
      otherPos = pos + 3 < 9 ? pos + 3 : pos;
      break;
    case 'left':
      otherPos = parseInt((pos - 1) / 3) == parseInt(pos / 3) && pos - 1 >= 0 ? 
        pos - 1 : pos;
      break;
    case 'right':
      otherPos = parseInt((pos + 1) / 3) == parseInt(pos / 3) ? pos + 1 : pos;
      break;
    default:
      return null;
    }
    if (otherPos == pos) {
      return null;
    }
    var tmp = ret[otherPos];
    ret[otherPos] = ret[pos];
    ret[pos] = tmp;
    return ret;
  }

  function valid(arr) {
    var sum = 0;
    for (var i = 1; i < arr.length; i++) {
      if (arr[i] == 0)
        continue;
      for (var j = 0; j < i; j++) {
        if (arr[j] > arr[i]) {
          sum++;
        }
      }
    }
    return sum % 2 == 1;
  }

  function knuthShuffle(arr) {
    var ret = _.cloneDeep(arr);
    for (var i = 0; i < ret.length - 1; i++) {
      var pos = parseInt(Math.random() * ret.length - i - 2 + i + 1);
      var tmp = ret[i];
      ret[i] = ret[pos];
      ret[pos] = tmp;
    }
    return ret;
  }

  function apply(state) {
    for (var i = 0; i < state.length; i++) {
      var row = parseInt(i / 3), col = parseInt(i % 3) + 1;
      $('#ed-row-'+row+' div:nth-child('+col+')').replaceWith(
        '<div id="ed-cell-'+state[i]+'" class="ed-cell">'+state[i]+'</div>'
      );
    }
    playground = state;
  }
});
