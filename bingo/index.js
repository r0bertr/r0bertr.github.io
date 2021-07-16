$(function () {
  model = null
  volforce = 0
  team = 'rasis'

  function computeScore(scores, levels, teams) {
    var total = _.sum(scores)
    var vfInt = parseInt(volforce)
    var handicap = 1.0
    if (_.max(levels) > vfInt) {
      handicap += ((_.max(levels) - vfInt) * 2 - 1 ) * 0.001
    } else if (_.max(levels) < vfInt) {
      handicap -= ((vfInt - _.max(levels) + 1) * 2 - 1) * 0.001
    }
    var nOtherTeam = 0
    for (var i = 0; i < teams.length; i++) {
      if (teams[i] != team) {
        nOtherTeam++
      }
    }
    var bonus = 1 + (nOtherTeam * 2 - 1) * 0.001
    return total * bonus * handicap
  }

  function compute() {
    var row = 0, col = 0, i = 0
    var levels = [], arrange = []
    var results = []
    // rows
    for (row = 0; row < 3; row++) {
      levels = []
      arrange = []
      for (col = 0; col < 3; col++) {
        levels.push(model[row][col]['level'])
        arrange.push({row: row, col: col})
      }
      for (i = 0; i < 8; i++) {
        var scores = []
        var teams = []
        if (i & 1) {
          scores.push(model[row][0]['grace_score'])
          teams.push('grace')
        } else {
          scores.push(model[row][0]['rasis_score'])
          teams.push('rasis')
        }
        if ((i >> 1) & 1) {
          scores.push(model[row][1]['grace_score'])
          teams.push('grace')
        } else {
          scores.push(model[row][1]['rasis_score'])
          teams.push('rasis')
        }
        if ((i >> 2) & 1) {
          scores.push(model[row][2]['grace_score'])
          teams.push('grace')
        } else {
          scores.push(model[row][2]['rasis_score'])
          teams.push('rasis')
        }
        results.push({
          arrange: arrange,
          teams: teams,
          score: computeScore(scores, levels, teams)
        })
      }
    }
    // cols
    for (col = 0; col < 3; col++) {
      levels = []
      arrange = []
      for (row = 0; row < 3; row++) {
        levels.push(model[row][col]['level'])
        arrange.push({row: row, col: col})
      }
      for (i = 0; i < 8; i++) {
        var scores = []
        var teams = []
        if (i & 1) {
          scores.push(model[0][col]['grace_score'])
          teams.push('grace')
        } else {
          scores.push(model[0][col]['rasis_score'])
          teams.push('rasis')
        }
        if ((i >> 1) & 1) {
          scores.push(model[1][col]['grace_score'])
          teams.push('grace')
        } else {
          scores.push(model[1][col]['rasis_score'])
          teams.push('rasis')
        }
        if ((i >> 2) & 1) {
          scores.push(model[2][col]['grace_score'])
          teams.push('grace')
        } else {
          scores.push(model[2][col]['rasis_score'])
          teams.push('rasis')
        }
        results.push({
          arrange: arrange,
          teams: teams,
          score: computeScore(scores, levels, teams)
        })
      }
    }
    // diag
    levels = []
    arrange = []
    for (i = 0; i < 3; i++) {
      levels.push(model[i][i]['level'])
      arrange.push({row: i, col: i})
    }
    for (i = 0; i < 8; i++) {
      var scores = []
      var teams = []
      if (i & 1) {
        scores.push(model[0][0]['grace_score'])
        teams.push('grace')
      } else {
        scores.push(model[0][0]['rasis_score'])
        teams.push('rasis')
      }
      if ((i >> 1) & 1) {
        scores.push(model[1][1]['grace_score'])
        teams.push('grace')
      } else {
        scores.push(model[1][1]['rasis_score'])
        teams.push('rasis')
      }
      if ((i >> 2) & 1) {
        scores.push(model[2][2]['grace_score'])
        teams.push('grace')
      } else {
        scores.push(model[2][2]['rasis_score'])
        teams.push('rasis')
      }
      results.push({
        arrange: arrange,
        teams: teams,
        score: computeScore(scores, levels, teams)
      })
    }
    levels = []
    arrange = []
    for (i = 0; i < 3; i++) {
      levels.push(model[2 - i][i]['level'])
      arrange.push({row: 2 - i, col: i})
    }
    for (i = 0; i < 8; i++) {
      var scores = []
      var teams = []
      if (i & 1) {
        scores.push(model[2][0]['grace_score'])
        teams.push('grace')
      } else {
        scores.push(model[2][0]['rasis_score'])
        teams.push('rasis')
      }
      if ((i >> 1) & 1) {
        scores.push(model[1][1]['grace_score'])
        teams.push('grace')
      } else {
        scores.push(model[1][1]['rasis_score'])
        teams.push('rasis')
      }
      if ((i >> 2) & 1) {
        scores.push(model[0][2]['grace_score'])
        teams.push('grace')
      } else {
        scores.push(model[0][2]['rasis_score'])
        teams.push('rasis')
      }
      results.push({
        arrange: arrange,
        teams: teams,
        score: computeScore(scores, levels, teams)
      })
    }
    results = _.sortBy(results, ['score']).reverse()
    return results
  }

  function showResults(results) {
    $('#results').empty()
    for (var i = 0; i < results.length; i++) {
      var arrangeText = '(' + results[i].arrange[0].row + ', ' +
      results[i].arrange[0].col + '), (' + results[i].arrange[1].row + ', ' +
      results[i].arrange[1].col + '), (' + results[i].arrange[2].row + ', ' +
      results[i].arrange[2].col + ')'
      $('#results').append(
        '<tr>' +
          '<td>' + results[i].score + '</td>' +
          '<td>' + arrangeText + '</td>' +
          '<td>' + results[i].teams + '</td>' +
        '</tr>'
      )
      $('#results tr:last-child').mouseenter((function (i) {
        return function () {
          for (var j = 0; j < results[i].arrange.length; j++) {
            var row = results[i].arrange[j].row
            var col = results[i].arrange[j].col
            if (results[i].teams[j] == 'rasis') {
              $('#bingo-cell-' + row + '-' + col + ' .rasis').css('background-color', '#fdcfe4')
            } else {
              $('#bingo-cell-' + row + '-' + col + ' .grace').css('background-color', '#c0e9fa')
            }
          }
        }
      })(i))
      $('#results tr:last-child').mouseout((function (i) {
        return function () {
          for (var j = 0; j < results[i].arrange.length; j++) {
            var row = results[i].arrange[j].row
            var col = results[i].arrange[j].col
            if (results[i].teams[j] == 'rasis') {
              $('#bingo-cell-' + row + '-' + col + ' .rasis').css('background-color', '#fff4f9')
            } else {
              $('#bingo-cell-' + row + '-' + col + ' .grace').css('background-color', '#f1fbff')
            }
          }
        }
      })(i))
    }
  }

  function initCells() {
    model = [[{
          'rasis_tune': '666(MXM)',
          'level': 20,
          'rasis_score': 10000000,
          'grace_tune': 'ΣgØ(MXM)',
          'grace_score': 10000000
        }, {
          'rasis_tune': 'Thank you for your playing music(MXM)',
          'level': 18,
          'rasis_score': 10000000,
          'grace_tune': 'Nhelv(MXM)',
          'grace_score': 10000000
        }, {
          'level': 17,
          'rasis_tune': 'Daisycutter(EXH)',
          'rasis_score': 10000000,
          'grace_tune': 'Booths of Fighters(EXH)',
          'grace_score': 10000000
        }], [{
          'level': 19,
          'rasis_tune': 'Innocent Tempest(VVD)',
          'rasis_score': 10000000,
          'grace_tune': 'Calamity Tempest(MXM)',
          'grace_score': 10000000
        }, {
          'level': 18,
          'rasis_tune': '月光乱舞(EXH)',
          'rasis_score': 10000000,
          'grace_tune': 'crossing blue(MXM)',
          'grace_score': 10000000,
        }, {
          'level': 18,
          'rasis_tune': 'LegenD.(EXH)',
          'rasis_score': 10000000,
          'grace_tune': 'Nexta(GRV)',
          'grace_score': 10000000
        }], [{
          'level': 17,
          'rasis_tune': 'FREEDOM DiVE(EXH)',
          'rasis_score': 10000000,
          'grace_tune': 'HAELEQUIN(EXH)',
          'grace_score': 10000000
        }, {
          'level': 18,
          'rasis_tune': 'Sayonara Planet Wars(EXH)',
          'rasis_score': 10000000,
          'grace_tune': 'INF-B《L-aste-R》(EXH)',
          'grace_score': 10000000
        }, {
          'level': 19,
          'rasis_tune': 'Xronial Xero(MXM)',
          'rasis_score': 10000000,
          'grace_tune': 'BELEBOG(MXM)',
          'grace_score': 10000000
        }]]
    for (var row = 0; row < 3; row++) {
      for (var col = 0; col < 3; col++) {
        $('#bingo-cell-' + row + '-' + col).html(
          '<div class="rasis">' +
            '<h2 class="tune-title">' + model[row][col]['rasis_tune'] + '</h2>' +
            '<input type="number" class="tune-score" value="' + model[row][col]['rasis_score'] + '"/>' + 
          '</div>' +
          '<div class="grace">' +
            '<h2 class="tune-title">' + model[row][col]['grace_tune'] + '</h2>' +
            '<input type="number" class="tune-score" value="' + model[row][col]['grace_score'] + '"/>' + 
          '</div>'
        )
      }
    }
    $('button#btn-run').click(function () {
      for (var row = 0; row < 3; row++) {
        for (var col = 0; col < 3; col++) {
          model[row][col]['rasis_score'] = parseInt($('#bingo-cell-' + row + '-' + col + ' .rasis input').val())
          model[row][col]['grace_score'] = parseInt($('#bingo-cell-' + row + '-' + col + ' .grace input').val())
        }
      }
      volforce = parseFloat($('#input-vf').val())
      team = $('#input-team').val()
      showResults(compute())
    })
  }

  initCells()
})
