var all_matches = {
  "match1" : [ "team1", 4, "team2", 0 ],
  "match2" : [ "team3", 1, "team4", 2 ],
  "match3" : [ "team1", 2, "team3", 2 ],
  "match4" : [ "team4", 2, "team2", 2 ],
  "match5" : [ "team4", 0, "team1", 0 ],
  "match6" : [ "team2", 1, "team3", 0 ],
};

var team_names = {
  "team1" : "Germany",
  "team2" : "Portugal",
  "team3" : "Ghana",
  "team4" : "United States",
};

var team_imgs = {
  "team1" : "http://upload.wikimedia.org/wikipedia/en/thumb/b/ba/Flag_of_Germany.svg/23px-Flag_of_Germany.svg.png",
  "team2" : "http://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Flag_of_Portugal.svg/23px-Flag_of_Portugal.svg.png",
  "team3" : "http://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/23px-Flag_of_Ghana.svg.png",
  "team4" : "http://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/23px-Flag_of_the_United_States.svg.png",
}

var map = {};
var match5 = all_matches['match5'];
var match6 = all_matches['match6'];
for (var code in team_names) {
  if (code == match5[0]) {
    map[code] = ["match5", 1];
  } else if (code == match5[2]) {
    map[code] = ["match5", 3];
  } else if (code == match6[0]) {
    map[code] = ["match6", 1];
  } else {
    map[code] = ["match6", 3];
  }
}

function initialize_record(code) {
  return {
    "code" : code,
    "rank" : 0,
    "name" : team_names[code],
    "pld" : 0,
    "w" : 0,
    "l" : 0,
    "d" : 0,
    "gf" : 0,
    "ga" : 0,
    "gd" : 0,
    "pts" : 0,
  };
}

function calculate_table(matches) {
  var table = {};
  for (var i = 0; i < matches.length; i++) {
    var match_details = matches[i];
    var first_team = match_details[0];
    var first_score = match_details[1];
    var second_team = match_details[2];
    var second_score = match_details[3];
    if (!(first_team in table)) {
      table[first_team] = initialize_record(first_team);
    }
    if (!(second_team in table)) {
      table[second_team] = initialize_record(second_team);
    }
    table[first_team]['pld'] += 1;
    table[first_team]['gf'] += first_score;
    table[first_team]['ga'] += second_score;
    table[first_team]['gd'] += (first_score - second_score);
    table[second_team]['pld'] += 1;
    table[second_team]['gf'] += second_score;
    table[second_team]['ga'] += first_score;
    table[second_team]['gd'] += (second_score - first_score);
    if (first_score > second_score) {
      table[first_team]['w'] += 1;
      table[first_team]['pts'] += 3;
      table[second_team]['l'] += 1;
    } else if (second_score > first_score) {
      table[second_team]['w'] += 1;
      table[second_team]['pts'] += 3;
      table[first_team]['l'] += 1;
    } else {
      table[first_team]['d'] += 1;
      table[first_team]['pts'] += 1;
      table[second_team]['d'] += 1;
      table[second_team]['pts'] += 1;
    }
  }
  return table;
}

function sort_table(table) {
  var records_arr = [];
  for (var code in table) {
    var record = table[code];
    records_arr.push(record);
  }
  records_arr.sort(function (a, b) {
    if (b.pts != a.pts) {
      return b.pts - a.pts;
    } else if (b.gd != a.gd) {
      return b.gd - a.gd;
    } else {
      return b.gf - a.gf;
    }
  });
  var new_table = {};
  var prev_record = null;
  var rank = 1;
  for (var i = 0; i < records_arr.length; i++) {
    var record = records_arr[i];
    if (!prev_record) {
      prev_record = record;
      record['rank'] = rank;
    } else {
      if (prev_record['pts'] == record['pts'] && prev_record['gd'] == record['gd'] && prev_record['gf'] == record['gf']) {
        record['rank'] = prev_record['rank'];
      } else {
        record['rank'] = rank;
      }
      prev_record = record;
    }
    rank++;
    new_table[record['code']] = record;
  }
  return new_table;
}

function detect_ties(table) {
  var prev_record = null;
  var tied_records = [];
  var tied_teams = [];
  for (var code in table) {
    var record = table[code];
    if (!prev_record) {
      prev_record = record;
      continue;
    }
    if (prev_record['pts'] == record['pts'] && prev_record['gd'] == record['gd'] && prev_record['gf'] == record['gf']) {
      if (tied_records.length > 0) {
        if (tied_records[0]['pts'] != record['pts']) {

        } else {
          tied_records.push(record);
          tied_teams.push(record['code']);
        }
      } else {
        tied_records.push(prev_record);
        tied_records.push(record);
        tied_teams.push(prev_record['code']);
        tied_teams.push(record['code']);
      }
    }
    prev_record = record;
  }
  tied_teams.sort();
  return tied_teams;
}

function is_same_array(a, b) {
  if (a.length != b.length) {
    return false;
  }
  for (var i = 0; i < a.length; i++) {
    if (a[i] != b[i]) {
      return false;
    }
  }
  return true;
}

function extract_relevant_matches(matches, teams) {
  var relevant_matches = [];
  for (var i = 0; i < matches.length; i++) {
    var match_details = matches[i];
    var involved_teams = [match_details[0], match_details[2]];
    involved_teams.sort();
    if (is_same_array(involved_teams, teams)) {
      relevant_matches.push(match_details);
    }
  }
  return relevant_matches;
}

function get_rank(table, rank) {
  var s = "";
  var draw_lots = false
  for (var code in table) {
    if (table[code]['rank'] == rank) {
      if (s) {
        s = s+', '+team_names[code];
        draw_lots = true;
      } else {
        s = team_names[code];
      }
    }
  }
  if (draw_lots) {
    s = s+' (drawing lots)';
  }
  return s;
}

function print_table(table) {
  $("#group_table tbody").empty();
  for (var code in table) {
    var record = table[code];
    var tr = $("<tr/>", {
      "id" : "tr_"+code,
    });
    var keys = ['rank', 'name', 'pld', 'w', 'd', 'l', 'gf', 'ga', 'gd', 'pts'];
    for (var i = 0; i < keys.length; i++) {
      var attrs = {
        "id" : code+i,
        "class" : "cell",
        "text" : record[keys[i]]+' ',
      };
      if (record['rank'] < 3) {
        attrs['class'] = "cell green";
      }
      var td = $("<td/>", attrs);
      td.appendTo(tr);
      if (keys[i] == 'name') {
        td.append($("<img/>", {
          "src" : team_imgs[code],
        }));
      }
    }
    tr.appendTo($("#group_table"));
  }
}

function print_result(table, code) {
  $("#first_"+code).text(get_rank(table, 1));
  $("#second_"+code).text(get_rank(table, 2));
  $("."+code).text(team_names[code]+' ').append($("<img/>", { "src" : team_imgs[code] }));
}

function main(matches) {
  var table = calculate_table(matches);
  table = sort_table(table);
  var tied_teams = detect_ties(table);
  if (tied_teams.length > 0) {
    var relevant_matches = extract_relevant_matches(matches, tied_teams);
    if (matches.length == relevant_matches.length) {
      return table;
    }
    if (relevant_matches.length > 0) {
      var mini_table = main(relevant_matches);
      var new_table = {};
      for (var code in table) {
        if (code in new_table) {

        } else if (tied_teams.indexOf(code) < 0) {
          new_table[code] = table[code];
        } else {
          for (var code_in_mini_table in mini_table) {
            var record = table[code_in_mini_table];
            record['rank'] = record['rank'] + mini_table[code_in_mini_table]['rank'] - 1;
            new_table[code_in_mini_table] = record;
          }
        }
      }
      return new_table;
    }
  }
  return table;
}

function print_current(table, matches) {
  $("#match5_0").text(team_names[all_matches["match5"][0]]+' ').append($("<img/>", { "src" : team_imgs[all_matches["match5"][0]]}));
  $("#match5_1").text(all_matches["match5"][1]);
  $("#match5_2").text(team_names[all_matches["match5"][2]]+' ').append($("<img/>", { "src" : team_imgs[all_matches["match5"][2]]}));
  $("#match5_3").text(all_matches["match5"][3]);
  $("#match6_0").text(team_names[all_matches["match6"][0]]+' ').append($("<img/>", { "src" : team_imgs[all_matches["match6"][0]]}));
  $("#match6_1").text(all_matches["match6"][1]);
  $("#match6_2").text(team_names[all_matches["match6"][2]]+' ').append($("<img/>", { "src" : team_imgs[all_matches["match6"][2]]}));
  $("#match6_3").text(all_matches["match6"][3]);
  $("#first").text(get_rank(table, 1));
  $("#second").text(get_rank(table, 2));
}

function recalculate() {
  var matches = [];
  for (var match_name in all_matches) {
    var match_details = all_matches[match_name];
    matches.push(match_details);
  }
  var table = main(matches);
  print_table(table);
  print_current(table, all_matches);

  for (var code in team_names) {
    var all_matches_copy = {};
    for (var match_name in all_matches) {
      var match_details = [];
      for (var i = 0; i < all_matches[match_name].length; i++) {
        match_details.push(all_matches[match_name][i]);
      }
      all_matches_copy[match_name] = match_details;
    }
    all_matches_copy[map[code][0]][map[code][1]] = all_matches_copy[map[code][0]][map[code][1]] + 1;
    matches = [];
    for (var match_name in all_matches_copy) {
      var match_details = all_matches_copy[match_name];
      matches.push(match_details);
    }
    table = main(matches);
    print_result(table, code);
  }

}

$(document).ready(function () {
  for (var code in team_names) {
    $("#btn_"+code).on('click', function (event) {
      code = $(this).attr('rel');
      all_matches[map[code][0]][map[code][1]] = all_matches[map[code][0]][map[code][1]] + 1;
      recalculate();
    });
  }
  $("#reload").on('click', function (event) {
    location.reload();
  });
  recalculate();
});
