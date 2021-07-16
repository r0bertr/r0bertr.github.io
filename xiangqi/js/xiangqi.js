class XiangQi {
  constructor(domID, maxDepth) {
    this.maxDepth = maxDepth;
    this.pickedPiece = null;
    this.boardID = '#' + domID;
    $(this.boardID).addClass('xq-board');
    this.width = parseFloat($(this.boardID).css('width'));
    this.height = this.width * 1.11;
    $(this.boardID).css('height', this.height + 'px');
    this.model = [
      ['bC0', 'bM0', 'bX0', 'bS0', 'bJ0', 'bS1', 'bX1', 'bM1', 'bC1'],
      ['', '', '', '', '', '', '', '', ''],
      ['', 'bP0', '', '', '', '', '', 'bP1', ''],
      ['bZ0', '', 'bZ1', '', 'bZ2', '', 'bZ3', '', 'bZ4'],
      ['', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['rZ0', '', 'rZ1', '', 'rZ2', '', 'rZ3', '', 'rZ4'],
      ['', 'rP0', '', '', '', '', '', 'rP1', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['rC0', 'rM0', 'rX0', 'rS0', 'rJ0', 'rS1', 'rX1', 'rM1', 'rC1'],
    ];
    // init the board
    for (var row = 0; row < this.model.length; row++) {
      for (var col = 0; col < this.model[row].length; col++) {
        var id = this.getPieceID(row, col);
        if (this.model[row][col] != '') {
          $(this.boardID).append(
            '<img src="img/pieces/' + this.model[row][col].slice(0, 2) + 
              '.svg" class="xq-piece" id="' + id.slice(1, id.length) + '">'
          );
          if (this.model[row][col].slice(0, 1) == 'r') {
            $(id).click({row: row, col: col, that: this}, this.onPieceClick);
            $(id).hover(this.onPieceHoverIn, this.onPieceHoverOut);
          }
        } else {
          $(this.boardID).append(
            '<div class="xq-piece" id="' + id.slice(1, id.length) + '"></div>'
          );
        }
        $(id).css('top', 10 * row + '%');
        $(id).css('left', col / 9.0 * 100 + '%');
      }
    }
    var pieceSize = this.width / 9.0;
    $('.xq-piece').css('width', pieceSize).css('height', pieceSize);
  }
  onPieceHoverIn(e) {
    this.style.cssText += 'border: 0.5px dashed yellow !important;';
  }
  onPieceHoverOut(e) {
    this.style.cssText += 'border: none !important;';
  }
  onPieceClick(e) {
    var that = e.data.that;
    // remove paths
    that.removePath(that.model);
    // set pickedPiece
    that.pickedPiece = { row: e.data.row, col: e.data.col };
    that.computePath(that.pickedPiece.row, that.pickedPiece.col, that.model, 'b');
    // apply
    that.applyModel();
  }
  onMove(e) {
    var that = e.data.that;
    var toRow = e.data.row, toCol = e.data.col;
    var fromRow = that.pickedPiece.row, fromCol = that.pickedPiece.col;
    that.removePath(that.model);
    var tmp = that.model[fromRow][fromCol];
    that.model[fromRow][fromCol] = '';
    that.model[toRow][toCol] = tmp;
    that.pickedPiece = null;
    that.applyModel();
    that.removePath(that.model);
    // black moves
    that.alphaBeta();
  }
  setMaxDepth(d) {
    this.maxDepth = d;
  }
  alphaBeta() {
    var that = this;
    class Node {
      constructor(board, typ, depth, alpha, beta, parent, son) {
        this.board = _.cloneDeep(board),
        this.alpha = alpha;
        this.beta = beta;
        this.typ = typ;
        this.depth = depth;
        this.parent = parent;
        this.son = son;
        this.garbage = false;
      }
    }

    function p(board) {
      var sum = 0;
      var rJ = false, bJ = false;
      for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
          if (board[i][j] == '') continue;
          if (board[i][j] == 'bJ0') bJ = true;
          if (board[i][j] == 'rJ0') rJ = true;
          var factor = board[i][j].slice(0, 1) == 'b' ? 1 : -1;
          switch (board[i][j].slice(1, 2)) {
          case 'C':
            sum += factor * 50;
            break;
          case 'J':
            sum += factor * 5;
            break;
          case 'M':
            sum += factor * 30;
            break;
          case 'P':
            sum += factor * 40;
            break;
          case 'S':
            sum += factor * 10;
            break;
          case 'X':
            sum += factor * 20;
            break;
          case 'Z':
            sum += factor * 25;
            break;
          }
        }
      }
      if (!rJ) {
        return Number.MAX_VALUE;
      }
      if (!bJ) {
        return -Number.MAX_VALUE;
      }
      return sum;
    }

    function genChildren(node, maxDepth) {
      var ret = [];
      var comp = 'r', turn = 'b';
      if (node.typ) {
        comp = 'b';
        turn = 'r';
      }
      for (var i = 0; i < node.board.length; i++) {
        for (var j = 0; j < node.board[i].length; j++) {
          if (node.board[i][j].slice(0, 1) == turn) {
            var mboard = _.cloneDeep(node.board);
            that.computePath(i, j, mboard, comp);
            for (var row = 0; row < mboard.length; row++) {
              for (var col = 0; col < mboard[row].length; col++) {
                if (mboard[row][col] == 'path' || mboard[row][col].slice(3, 7) == 'path') {
                  var board = _.cloneDeep(mboard);
                  that.removePath(board);
                  var tmp = board[i][j];
                  board[i][j] = '';
                  board[row][col] = tmp;
                  var newNode = new Node(board, 1 - node.typ, node.depth + 1,
                    Number.MAX_VALUE, -Number.MAX_VALUE, node, null);
                  if (node.depth + 1 == maxDepth) {
                    var est = p(board);
                    newNode.alpha = est;
                    newNode.beta = est;
                  }
                  ret.push(newNode);
                }
              }
            }
          }
        }
      }
      return ret;
    }

    var open = [], close = {}, root = new Node(this.model, 0, 0,
      Number.MAX_VALUE, -Number.MAX_VALUE, null, null);
    var maxDepth = this.maxDepth;
    open.push(root);
    while (open.length) {
      // fetch the top value
      var n = open[open.length - 1];
      open.splice(open.length - 1, 1);
      close[n.board.toString()] = true;
      if (n.parent && n.parent.garbage) {
        continue;
      }

      if (n.depth < maxDepth) {
        var children = genChildren(n, maxDepth);
        for (var i = 0; i < children.length; i++) {
          if (!close[children[i].board.toString()]) {
            if (n.depth == maxDepth - 1) {
              if (n.typ) {
                if (children[i].alpha < n.alpha || children[i].alpha == n.alpha) {
                  n.alpha = children[i].alpha;
                  n.son = children[i];
                }
                if (n.parent && n.alpha < n.parent.beta) {
                  break;
                }
              } else {
                if (children[i].alpha > n.beta || children[i].alpha == n.beta) {
                  n.beta = children[i].alpha;
                  n.son = children[i];
                }
                if (n.parent && n.beta > n.parent.alpha) {
                  break;
                }
              }
            } else {
              open.push(children[i]);
            }
          }
        }
        if (n.depth == maxDepth - 1) {
          var ptr = n.parent;
          var son = n;
          while (ptr) {
            if (ptr.typ) {
              if (son.beta < ptr.alpha || son.beta == ptr.alpha) {
                ptr.alpha = son.beta;
                ptr.son = son;
              }
              if (son.beta > ptr.alpha) {
                son.garbage = true;
              }
            } else {
              if (son.alpha > ptr.beta || son.alpha == ptr.beta) {
                ptr.beta = son.alpha;
                ptr.son = son;
              }
              if (son.alpha < ptr.beta) {
                son.garbage = true;
              }
            }
            ptr = ptr.parent;
            son = son.parent;
          }
        }
      }
    }
    this.model = root.son.board;
    this.applyModel();
  }
  removePath(board) {
    for (var row = 0; row < board.length; row++) {
      for (var col = 0; col < board[row].length; col++) {
        if (board[row][col] == 'path')
          board[row][col] = '';
        if (board[row][col].slice(3, 7) == 'path') {
          board[row][col] = board[row][col].slice(0, 3);
        }
      }
    }
  }
  computePath(row, col, board, comp) {
    var pieceType = board[row][col].slice(1, 2);
    if (comp == 'r') {
      for (var i = 0; i < board.length / 2; i++) {
        var tmp = board[i];
        board[i] = board[9 - i];
        board[9 - i] = tmp;
      }
      for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length / 2; j++) {
          var tmp = board[i][j];
          board[i][j] = board[i][8 - j];
          board[i][8 - j] = tmp;
        }
      }
      row = 9 - row;
      col = 8 - col;
    }
    switch (pieceType) {
    case 'C':
      var i = 0;
      for (i = row - 1; i > -1 && board[i][col] == ''; i--) {
        board[i][col] += 'path';
      }
      if (i > -1 && board[i][col].slice(0, 1) == comp) {
        board[i][col] += 'path';
      }
      for (i = row + 1; i < 10 && board[i][col] == ''; i++) {
        board[i][col] += 'path';
      }
      if (i < 10 && board[i][col].slice(0, 1) == comp) {
        board[i][col] += 'path';
      }
      for (i = col - 1; i > -1 && board[row][i] == ''; i--) {
        board[row][i] += 'path';
      }
      if (i > -1 && board[row][i].slice(0, 1) == comp) {
        board[row][i] += 'path';
      }
      for (i = col + 1; i < 9 && board[row][i] == ''; i++) {
        board[row][i] += 'path';
      }
      if (i < 9 && board[row][i].slice(0, 1) == comp) {
        board[row][i] += 'path';
      }
      break;
    case 'J':
      if (row + 1 < 10 && (board[row + 1][col] == '' || 
        board[row + 1][col].slice(0, 1) == comp)) {
        board[row + 1][col] += 'path';
      }
      if (row - 1 > 6 && (board[row - 1][col] == '' || 
        board[row - 1][col].slice(0, 1) == comp)) {
        board[row - 1][col] += 'path';
      }
      if (col - 1 > 2 && (board[row][col - 1] == '' ||
        board[row][col - 1].slice(0, 1) == comp)) {
        board[row][col - 1] += 'path';
      }
      if (col + 1 < 6 && (board[row][col + 1] == '' ||
        board[row][col + 1].slice(0, 1) == comp)) {
        board[row][col + 1] += 'path';
      }
      break;
    case 'M':
      if (row - 2 > -1 && board[row - 1][col] == '') {
        if (col - 1 > -1 && (board[row - 2][col - 1] == '' || 
          board[row - 2][col - 1].slice(0, 1) == comp)) {
          board[row - 2][col - 1] += 'path';
        }
        if (col + 1 < 9 && (board[row - 2][col + 1] == '' || 
          board[row - 2][col + 1].slice(0, 1) == comp)) {
          board[row - 2][col + 1] += 'path';
        }
      }
      if (row - 1 > -1) {
        if (col - 2 > -1 && board[row][col - 1] == '' &&
          (board[row - 1][col - 2] == '' || 
          board[row - 1][col - 2].slice(0, 1) == comp)) {
          board[row - 1][col - 2] += 'path';
        }
        if (col + 2 < 9 && board[row][col + 1] == '' && 
          (board[row - 1][col + 2] == '' || 
          board[row - 1][col + 2].slice(0, 1) == comp)) {
          board[row - 1][col + 2] += 'path';
        }
      }
      if (row + 2 < 10 && board[row + 1][col] == '') {
        if (col - 1 > -1 && (board[row + 2][col - 1] == '' || 
          board[row + 2][col - 1].slice(0, 1) == comp)) {
          board[row + 2][col - 1] += 'path';
        }
        if (col + 1 < 9 && (board[row + 2][col + 1] == '' || 
          board[row + 2][col + 1].slice(0, 1) == comp)) {
          board[row + 2][col + 1] += 'path';
        }
      }
      if (row + 1 < 10) {
        if (col - 2 > -1 && board[row][col - 1] == '' &&
          (board[row + 1][col - 2] == '' || 
          board[row + 1][col - 2].slice(0, 1) == comp)) {
          board[row + 1][col - 2] += 'path';
        }
        if (col + 2 < 9 && board[row][col + 1] == '' &&
          (board[row + 1][col + 2] == '' || 
          board[row + 1][col + 2].slice(0, 1) == comp)) {
          board[row + 1][col + 2] += 'path';
        }
      }
      break;
    case 'P':
      var i = 0;
      for (i = row - 1; i > -1 && board[i][col] == ''; i--) {
        board[i][col] += 'path';
      }
      for (i = i - 1; i > -1 && board[i][col] == ''; i--);
      if (i > -1 && board[i][col].slice(0, 1) == comp)
        board[i][col] += 'path';
      for (i = row + 1; i < 10 && board[i][col] == ''; i++) {
        board[i][col] += 'path';
      }
      for (i = i + 1; i < 10 && board[i][col] == ''; i++);
      if (i < 10 && board[i][col].slice(0, 1) == comp)
        board[i][col] += 'path';
      for (i = col - 1; i > -1 && board[row][i] == ''; i--) {
        board[row][i] += 'path';
      }
      for (i = i - 1; i > -1 && board[row][i] == ''; i--);
      if (i > -1 && board[row][i].slice(0, 1) == comp)
        board[row][i] += 'path';
      for (i = col + 1; i < 9 && board[row][i] == ''; i++) {
        board[row][i] += 'path';
      }
      for (i = i + 1; i < 9 && board[row][i] == ''; i++);
      if (i < 9 && board[row][i].slice(0, 1) == comp)
        board[row][i] += 'path';
      break;
    case 'S':
      if (row - 1 > 6) {
        if (col - 1 > 2 && (board[row - 1][col - 1] == '' ||
          board[row - 1][col - 1].slice(0, 1) == comp))
          board[row - 1][col - 1] += 'path';
        if (col + 1 < 6 && (board[row - 1][col + 1] == '' ||
          board[row - 1][col + 1].slice(0, 1) == comp))
          board[row - 1][col + 1] += 'path';
      }
      if (row + 1 < 10 && (board[row + 1][col] == '' ||
        board[row + 1][col].slice(0, 1) == comp))
        board[row + 1][col] += 'path';
      break;
    case 'X':
      if (row - 2 > 4) {
        if (col - 2 > -1 && board[row - 1][col - 1] == '' &&
          (board[row - 2][col - 2] == '' ||
          board[row - 2][col - 2].slice(0, 1) == comp)) {
          board[row - 2][col - 2] += 'path';
        }
        if (col + 2 < 9 && board[row - 1][col + 1] == '' &&
          (board[row - 2][col + 2] == '' ||
          board[row - 2][col + 2].slice(0, 1) == comp)) {
          board[row - 2][col + 2] += 'path';
        }
      }
      if (row + 2 < 10) {
        if (col - 2 > -1 && board[row + 1][col - 1] == '' &&
          (board[row + 2][col - 2] == '' ||
          board[row + 2][col - 2].slice(0, 1) == comp)) {
          board[row + 2][col - 2] += 'path';
        }
        if (col + 2 < 9 && board[row + 1][col + 1] == '' &&
          (board[row + 2][col + 2] == '' ||
          board[row + 2][col + 2].slice(0, 1) == comp)) {
          board[row + 2][col + 2] += 'path';
        }
      }
      break;
    case 'Z':
      if (row > 4) {
        if (board[row - 1][col] == '' ||
          board[row - 1][col].slice(0, 1) == comp)
          board[row - 1][col] += 'path';
      } else {
        if (row - 1 > -1 && (board[row - 1][col] == '' ||
          board[row - 1][col].slice(0, 1) == comp))
          board[row - 1][col] += 'path';
        if (col + 1 < 9 && (board[row][col + 1] == '' ||
          board[row][col + 1].slice(0, 1) == comp))
          board[row][col + 1] += 'path';
        if (col - 1 > -1 && (board[row][col - 1] == '' ||
          board[row][col - 1].slice(0, 1) == comp))
          board[row][col - 1] += 'path';
      }
      break;
    }
    if (comp == 'r') {
      for (var i = 0; i < board.length / 2; i++) {
        var tmp = board[i];
        board[i] = board[9 - i];
        board[9 - i] = tmp;
      }
      for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length / 2; j++) {
          var tmp = board[i][j];
          board[i][j] = board[i][8 - j];
          board[i][8 - j] = tmp;
        }
      }
      row = 9 - row;
      col = 8 - col;
    }
  }
  getPieceID(row, col) {
    return '#xq-piece-' + row + '-' + col;
  }
  applyModel() {
    for (var row = 0; row < this.model.length; row++) {
      for (var col = 0; col < this.model[row].length; col++) {
        var id = this.getPieceID(row, col);
        if (this.model[row][col] == '') {
          $(id).replaceWith(
            '<div class="xq-piece" id="' + id.slice(1, id.length) + '"></div>'
          );
        } else if (this.model[row][col] == 'path') {
          $(id).replaceWith(
            '<div class="xq-piece" id="' + id.slice(1, id.length) + '"></div>'
          );
          // $(id).css('cssText',
          //   $(id).css('cssText') + 'border: 0.5px dashed yellow !important;');
          $(id)[0].style.cssText += 'border: 0.5px dashed yellow !important;';
          $(id).click({row: row, col: col, that: this}, this.onMove);
        } else {
          $(id).replaceWith(
            '<img src="img/pieces/' + this.model[row][col].slice(0, 2) + '.svg" class="xq-piece" id="' + id.slice(1, id.length) + '">'
          );
          if (this.model[row][col].slice(0, 1) == 'r') {
            $(id).click({row: row, col: col, that: this}, this.onPieceClick);
            $(id).hover(this.onPieceHoverIn, this.onPieceHoverOut);
          }
          if (this.model[row][col].slice(3, 7) == 'path') {
            // $(id).css('cssText',
            //   $(id).css('cssText') + 'border: 0.5px dashed yellow !important;');
            $(id)[0].style.cssText += 'border: 0.5px dashed yellow !important;';
            $(id).click({row: row, col: col, that: this}, this.onMove);
          }
        }
        $(id).css('top', 10 * row + '%');
        $(id).css('left', col / 9.0 * 100 + '%');
      }
    }
    if (this.pickedPiece) {
      var id = this.getPieceID(this.pickedPiece.row, this.pickedPiece.col);
      // $(id).css('cssText',
      //   $(id).css('cssText') + 'border: 0.5px dashed yellow !important;');
      $(id)[0].style.cssText += 'border: 0.5px dashed yellow !important;';
      $(id).unbind('mouseleave');
    }
    var pieceSize = this.width / 9.0;
    $('.xq-piece').css('width', pieceSize).css('height', pieceSize);
  }
};
